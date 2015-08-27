//Dependency: Evoque.js, Evoque.Ajax.js, Evoque.Session.js, RongIMClient.js
var tjGlobal = (function (self) {

    self.IM = (function (im) {
        return im;
    }(self.IM || {}));
    self.IM.client = {};
    var __client = self.IM.client;

    var __appKey = '';

    var defaultCallback = {
        onSuccess: function () {},
        onFail: function () {}
    };

    var __isInited = false;
    var __isConnected = false;
    var __clientUserId = 0;

    //消息原型，注：一条消息额大小最大在0.5KB左右
    var __baseTujiaMessage = {
        messageId: 0,
        messageType: 0,
        sendTime: Date.min,
        fromUserId: 0,
        toUserId: 0,
        //内容可能是文本或者UnitId，最长100个中文字符
        content: '',
        hasRead: false
    };

    //会话列表本地缓存
    var __tujiaConversationList = [];
    //聊天消息本地缓存
    var __tujiaMessageList = [];

    var localDB = (function () {
        var dicTokenKey = {};
        var dicConversationListKey = {};
        var dicMessageListKey = {};
        var __tujiaTokenKey = 'tujia_im_token';
        //会话列表在本地storage中保存所使用的key前缀
        var __tujiaConversationListKey = 'tujia_im_conversations';
        //聊天消息在本地Session中保存所使用的key前缀
        var __tujiaMessageListKey = 'tujia_im_messages';

        return {
            get tujiaTokenKey() {
                if ($.isStringEmpty(dicTokenKey[__clientUserId])) {
                    dicTokenKey[__clientUserId] = __tujiaTokenKey + '_' + __clientUserId;
                }
                return dicTokenKey[__clientUserId];
            },
            get tujiaConversationListKey() {
                if ($.isStringEmpty(dicConversationListKey[__clientUserId])) {
                    dicConversationListKey[__clientUserId] = __tujiaConversationListKey + '_' + __clientUserId;
                }
                return dicConversationListKey[__clientUserId];
            },
            get tujiaMessageListKey() {
                if ($.isStringEmpty(dicMessageListKey[__clientUserId])) {
                    dicMessageListKey[__clientUserId] = __tujiaMessageListKey + '_' + __clientUserId;
                }
                return dicMessageListKey[__clientUserId];
            }
        };
    }());

    //连接状态的枚举定义
    __client.connectionStatus = {
        //链接成功
        CONNECTED: RongIMClient.ConnectionStatus.CONNECTED,
        //正在链接
        CONNECTING: RongIMClient.ConnectionStatus.CONNECTING,
        //重新链接
        RECONNECT: RongIMClient.ConnectionStatus.RECONNECT,
        //其他设备登陆
        OTHER_DEVICE_LOGIN: RongIMClient.ConnectionStatus.OTHER_DEVICE_LOGIN,
        //连接关闭
        CLOSURE: RongIMClient.ConnectionStatus.CLOSURE,
        //未知错误
        UNKNOWN_ERROR: RongIMClient.ConnectionStatus.UNKNOWN_ERROR,
        //登出
        LOGOUT: RongIMClient.ConnectionStatus.LOGOUT,
        //用户已被封禁
        BLOCK: RongIMClient.ConnectionStatus.BLOCK
    };

    //获取token接口URL
    var getTokenUrl = '';
    //获取全部的会话列表接口URL
    var getAllConversationListUrl = '';
    //删除指定会话历史消息接口URL
    var delHistoryMessageUrl = '';
    //获取指定会话历史消息接口URL
    var getHistoryMessageUrl = '';
    //获取用户/房东昵称和头像的接口URL
    var getUserInfoUrl = '';
    //设置消息已读状态接口URL
    var setReadStatusUrl = '';
    //发送消息接口URL
    var sendMessageUrl = '';

    /**
     * 初始化
     */
    __client.init = function () {
        // 初始化。
        RongIMClient.init(__appKey);
        // 设置连接监听状态 （ status 标识当前连接状态）
        // 连接状态
        RongIMClient.setConnectionStatusListener({
            onChanged: function (status) {
                switch (status) {
                    //链接成功
                    case __client.connectionStatus.CONNECTED:
                        console.log('链接成功');
                        __client.connectionStatusListener({
                            isOnline: true,
                            code: status
                        });
                        break;
                    //正在链接
                    case __client.connectionStatus.CONNECTING:
                    //重新链接
                    case __client.connectionStatus.RECONNECT:
                    //其他设备登陆
                    case __client.connectionStatus.OTHER_DEVICE_LOGIN:
                    //连接关闭
                    case __client.connectionStatus.CLOSURE:
                    //未知错误
                    case __client.connectionStatus.UNKNOWN_ERROR:
                    //登出
                    case __client.connectionStatus.LOGOUT:
                    //用户已被封禁
                    case __client.connectionStatus.BLOCK:
                        __client.connectionStatusListener({
                            isOnline: false,
                            code: status
                        });
                        break;
                }
            }
        });
        //建立消息监听器
        initMessageListener();

        __isInited = true;
    };

    /**
     * 连接融云服务器
     * @param clientUserId
     * @param callback
     */
    __client.connect = function (clientUserId, callback) {
        if (!__isInited) {
            throw '建立连接之前请先初始化TujiaIMClient';
        }
        if (clientUserId < 1) {
            throw '非法UserId';
        }
        __clientUserId = clientUserId;
        var $callback = $(callback);
        var onSuccess = $callback.getValueOfProperty('onSuccess', defaultCallback);
        var onFail = $callback.getValueOfProperty('onFail', defaultCallback);

        getAllConversationList({
            onSuccess: function () {
                //会话列表获取成功之后，再真正建立连接
                getToken({
                    onSuccess: function (arg) {
                        var token = arg.token;
                        //利用token登录融云服务器
                        RongIMClient.connect(token,{
                            onSuccess: function (userId) {
                                // 此处处理连接成功。
                                console.log("Login successfully." + userId);

                                __isConnected = true;
                                //调用成功回调
                                onSuccess.call(__client);
                            },
                            onError: function (errorCode) {
                                // 此处处理连接错误。
                                var info = '';
                                switch (errorCode) {
                                    case RongIMClient.callback.ErrorCode.TIMEOUT:
                                        info = '超时';
                                        break;
                                    case RongIMClient.callback.ErrorCode.UNKNOWN_ERROR:
                                        info = '未知错误';
                                        break;
                                    case RongIMClient.ConnectErrorStatus.UNACCEPTABLE_PROTOCOL_VERSION:
                                        info = '不可接受的协议版本';
                                        break;
                                    case RongIMClient.ConnectErrorStatus.IDENTIFIER_REJECTED:
                                        info = 'appkey不正确';
                                        break;
                                    case RongIMClient.ConnectErrorStatus.SERVER_UNAVAILABLE:
                                        info = '服务器不可用';
                                        break;
                                    case RongIMClient.ConnectErrorStatus.TOKEN_INCORRECT:
                                        info = 'token无效';
                                        break;
                                    case RongIMClient.ConnectErrorStatus.NOT_AUTHORIZED:
                                        info = '未认证';
                                        break;
                                    case RongIMClient.ConnectErrorStatus.REDIRECT:
                                        info = '重新获取导航';
                                        break;
                                    case RongIMClient.ConnectErrorStatus.PACKAGE_ERROR:
                                        info = '包名错误';
                                        break;
                                    case RongIMClient.ConnectErrorStatus.APP_BLOCK_OR_DELETE:
                                        info = '应用已被封禁或已被删除';
                                        break;
                                    case RongIMClient.ConnectErrorStatus.BLOCK:
                                        info = '用户被封禁';
                                        break;
                                    case RongIMClient.ConnectErrorStatus.TOKEN_EXPIRE:
                                        info = 'token已过期';
                                        break;
                                    case RongIMClient.ConnectErrorStatus.DEVICE_ERROR:
                                        info = '设备号错误';
                                        break;
                                }
                                console.log("失败:" + info);
                                //调用失败回调
                                onFail.call(__client, { message: info });
                            }
                        });
                    },
                    onFail: function (arg) {
                        console.log(arg.message);
                        //调用失败回调
                        onFail.call(__client, { message: arg.message });
                    }
                });
            },
            onFail: function (arg) {
                console.log(arg.message);
                //调用失败回调
                onFail.call(__client, { message: arg.message });
            }
        });
    };

    /**
     * 判断是否有未送达的消息
     * @param clientUserId
     * @param callback
     */
    __client.hasUnreadMessages = function (clientUserId, callback) {
        if (clientUserId < 1) {
            throw '非法UserId';
        }
        __clientUserId = clientUserId;
        var $callback = $(callback);
        var onSuccess = $callback.getValueOfProperty('onSuccess', defaultCallback);
        var onFail = $callback.getValueOfProperty('onFail', defaultCallback);
        //先判断本地存储中是否有未读的消息
        if (checkLocalHasUnread()) {
            // 本地有未读的消息
            onSuccess.call(__client, { hasUnread: true });
        }
        else {
            getToken({
                onSuccess: function (arg) {
                    var token = arg.token;
                    //此接口可独立使用，不依赖init()和connect()方法。
                    RongIMClient.hasUnreadMessages(__appKey, token,{
                        onSuccess:function(symbol){
                            if (symbol) {
                                // 有未收到的消息
                                onSuccess.call(__client, { hasUnread: true });
                            }
                            else {
                                // 没有未收到的消息
                                onSuccess.call(__client, { hasUnread: false });
                            }
                        },
                        onError:function(err){
                            //调用失败回调
                            onFail.call(__client, { error: err });
                        }
                    });
                },
                onFail: function (arg) {
                    console.log(arg.message);
                    //调用失败回调
                    onFail.call(__client, { message: arg.message });
                }
            });
        }

    };

    /**
     * 发送对话消息
     * @param targetUserId
     * @param callback
     */
    __client.sendMessage = function (targetUserId, message, callback) {
        if (!__isConnected) {
            throw '发送消息之前请先建立连接';
        }
    };

    /**
     * 游客连接状态接收接口
     * @param status: { isOnline: true/false, code: TujiaIMClient.connectionStatus }
     */
    __client.connectionStatusListener = function (status) {};

    /**
     * 接收新消息推送接口
     */
    __client.newMessageListener = function (tujiaMessage, option) {};

    /**
     * 房东/商户在线/离线状态接收接口
     */
    __client.targetStatusListener = function () {};

    __client.delHistoryMessage = function () {};

    __client.getHistoryMessage = function () {};

    function initMessageListener() {
        //同步本地聊天消息缓存和Session中的存储
        if ($.session.containsKey(localDB.tujiaMessageListKey)) {
            __tujiaMessageList = $.session.get(localDB.tujiaMessageListKey);
        }
        else {
            $.session.set(localDB.tujiaMessageListKey, __tujiaMessageList);
        }
        // 消息监听器
        RongIMClient.getInstance().setOnReceiveMessageListener({
            // 接收到的消息
            onReceived: function (message) {
                var tujiaMessage = rongMessageToTujiaMessage(message);
                var targetUserId = 0;
                if (tujiaMessage.fromUserId === __clientUserId) {
                    targetUserId = tujiaMessage.toUserId;
                }
                else if (tujiaMessage.toUserId === __clientUserId) {
                    targetUserId = tujiaMessage.fromUserId;
                }
                if (targetUserId === 0) {
                    return;
                }

                //先保存到Session中
                __tujiaMessageList.push(tujiaMessage);
                $.session.set(localDB.tujiaMessageListKey, __tujiaMessageList);
                //更新会话列表中的最新一条消息
                var needSetTop = false;
                var needSetUnread = false;
                var needUpdateContent = true;

                var uptIdx = 0;
                for (var i = 0; i < __tujiaConversationList.length; ++i) {
                    var conversation = __tujiaConversationList[i];
                    if (conversation.fromUserId === targetUserId || conversation.toUserId === targetUserId) {
                        uptIdx = i;
                        if (conversation.hasRead && !tujiaMessage.hasRead) {
                            needSetUnread = true;
                        }
                        __tujiaConversationList[i] = tujiaMessage;
                        break;
                    }
                }
                if (uptIdx > 0) {
                    needSetTop = true;
                    var moveConversation = __tujiaConversationList.splice(uptIdx, 1);
                    __tujiaConversationList.splice(0, 0, moveConversation);
                }
                $.storage.set(localDB.tujiaConversationListKey, __tujiaConversationList);
                //触发收到新消息的回调
                __client.newMessageListener(tujiaMessage, {
                    //原来的会话位置索引
                    originalConversationIndex: uptIdx,
                    //是否需要置顶操作
                    needSetTop: needSetTop,
                    //是否需要设置未读状态
                    needSetUnread: needSetUnread,
                    //是否需要更新预览消息内容
                    needUpdateContent: needUpdateContent
                });

            }
        });
    }

    function createTujiaMessage() {
        return Object.create(__baseTujiaMessage);
    }

    function rongMessageToTujiaMessage(rongMessage) {
        var tujiaMessage = null;

        // 判断消息类型
        switch(rongMessage.getMessageType()){
            case RongIMClient.MessageType.TextMessage:
                // 途家聊天消息


                break;
            case RongIMClient.MessageType.DiscussionNotificationMessage:
            case RongIMClient.MessageType.InformationNotificationMessage:
            case RongIMClient.MessageType.ContactNotificationMessage:
            case RongIMClient.MessageType.ProfileNotificationMessage:
            case RongIMClient.MessageType.CommandNotificationMessage:
            case RongIMClient.MessageType.UnknownMessage:
                // do something...
                break;
            default:
                // 自定义消息
                // do something...
                break;
        }

        return tujiaMessage;
    }

    function getToken(callback) {
        var $callback = $(callback);
        var onSuccess = $callback.getValueOfProperty('onSuccess', defaultCallback);
        var onFail = $callback.getValueOfProperty('onFail', defaultCallback);
        //先尝试从LocalStorage里面取，取不到再从后端Service中获取
        if ($.storage.containsKey(localDB.tujiaTokenKey)) {
            var token = $.storage.get(localDB.tujiaTokenKey);
            onSuccess.call(__client, { token: token });
        }
        else {
            $.ajax.get({
                url: getTokenUrl,
                parameter: {
                    customerLoginId: __clientUserId
                },
                returnType: 'json',
                onSuccess: function (returnJson) {
                    if (returnJson.isSuccess) {
                        $.storage.set(localDB.tujiaTokenKey, returnJson.token);
                        onSuccess.call(__client, { token: returnJson.token });
                    }
                    else {
                        onFail.call(__client, { message: returnJson.message });
                    }
                },
                onFail: function () {
                    onFail.call(__client, { message: '获取登录Token失败' });
                }
            });
        }
    }

    function getAllConversationList(callback) {
        var $callback = $(callback);
        var onSuccess = $callback.getValueOfProperty('onSuccess', defaultCallback);
        var onFail = $callback.getValueOfProperty('onFail', defaultCallback);
        //先尝试从LocalStorage里面取，取不到再从后端Service中获取
        if ($.storage.containsKey(localDB.tujiaConversationListKey)) {
            __tujiaConversationList = $.storage.get(localDB.tujiaConversationListKey);
            onSuccess.call(__client);
        }
        else {
            //从后端Service获取
            $.ajax.get({
                url: getAllConversationListUrl,
                parameter: {
                    customerLoginId: __clientUserId
                },
                returnType : 'json',
                onSuccess: function (returnJson) {
                    if (returnJson.isSuccess) {
                        __tujiaConversationList = returnJson.conversationList;
                        $.storage.set(localDB.tujiaConversationListKey, __tujiaConversationList);
                        onSuccess.call(__client);
                    }
                    else {
                        onFail.call(__client, { message: returnJson.message });
                    }
                },
                onFail: function () {
                    onFail.call(__client, { message: '会话列表获取失败' });
                }
            });
        }
    }

    function checkLocalHasUnread() {
        if ($.storage.containsKey(localDB.tujiaConversationListKey)) {
            var tempList = $.storage.get(localDB.tujiaConversationListKey);
            return tempList.some(function (elem, index, arr) {
                return !elem.hasRead;
            });
        }
        else {
            return false;
        }
    }

    return self;
}(tjGlobal || {}));