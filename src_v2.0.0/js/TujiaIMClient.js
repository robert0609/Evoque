//Dependency: Evoque.js, Evoque.Ajax.js, Evoque.Cache.js, Evoque.Dialog.js, RongIMClient.js
var TujiaIMClient = (function (self) {

    var defaultCallback = {
        onSuccess: function () {},
        onFail: function () {}
    };

    var __isInited = false;
    var __isConnected = false;
    var __clientUserId = 0;

    //连接状态的枚举定义
    self.connectionStatus = {
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
     * @param appKey
     */
    self.init = function (appKey) {
        // 初始化。
        RongIMClient.init(appKey);
        // 设置连接监听状态 （ status 标识当前连接状态）
        // 连接状态
        RongIMClient.setConnectionStatusListener({
            onChanged: function (status) {
                switch (status) {
                    //链接成功
                    case self.connectionStatus.CONNECTED:
                        console.log('链接成功');
                        self.connectionStatusListener({
                            isOnline: true,
                            code: status
                        });
                        break;
                    //正在链接
                    case self.connectionStatus.CONNECTING:
                    //重新链接
                    case self.connectionStatus.RECONNECT:
                    //其他设备登陆
                    case self.connectionStatus.OTHER_DEVICE_LOGIN:
                    //连接关闭
                    case self.connectionStatus.CLOSURE:
                    //未知错误
                    case self.connectionStatus.UNKNOWN_ERROR:
                    //登出
                    case self.connectionStatus.LOGOUT:
                    //用户已被封禁
                    case self.connectionStatus.BLOCK:
                        self.connectionStatusListener({
                            isOnline: false,
                            code: status
                        });
                        break;
                }
            }
        });

        __isInited = true;
    };

    /**
     * 连接融云服务器
     * @param clientUserId
     * @param callback
     */
    self.connect = function (clientUserId, callback) {
        if (!__isInited) {
            throw '建立连接之前请先初始化TujiaIMClient';
        }
        __clientUserId = clientUserId;
        var $callback = $(callback);
        var onSuccess = $callback.getValueOfProperty('onSuccess', defaultCallback);
        var onFail = $callback.getValueOfProperty('onFail', defaultCallback);

        $.dialog.showLoading('loadingImg');
        //先获取Token
        $.ajax.get({
            url : getTokenUrl,
            // json
            parameter : {
                customerLoginId: clientUserId
            },
            returnType : 'json',
            onSuccess : function (returnJson) {
                $.dialog.closeCurrentDialog();
                if (returnJson.isSuccess) {
                    var token = returnJson.token;

                    $.dialog.showLoading('loadingImg');
                    //利用token登录融云服务器
                    RongIMClient.connect(token,{
                        onSuccess: function (userId) {
                            $.dialog.closeCurrentDialog();
                            // 此处处理连接成功。
                            console.log("Login successfully." + userId);
                            //建立消息监听器


                            __isConnected = true;
                            //调用成功回调
                            onSuccess.call(self);
                        },
                        onError: function (errorCode) {
                            $.dialog.closeCurrentDialog();
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
                            onFail.call(self, { message: info });
                        }
                    });
                }
                else {
                    $.dialog.alert(returnJson.message);
                }
            },
            onFail : function () {
                $.dialog.closeCurrentDialog();
                $.dialog.alert('登录Token获取失败');
            }
        });
    };

    /**
     * 发送对话消息
     * @param targetUserId
     * @param callback
     */
    self.sendMessage = function (targetUserId, message, callback) {
        if (!__isConnected) {
            throw '发送消息之前请先建立连接';
        }
    };

    /**
     * 游客连接状态接收接口
     * @param status: { isOnline: true/false, code: TujiaIMClient.connectionStatus }
     */
    self.connectionStatusListener = function (status) {};

    /**
     * 接收新消息推送接口
     */
    self.newMessageListener = function () {};

    /**
     * 房东/商户在线/离线状态接收接口
     */
    self.targetStatusListener = function () {};

    /**
     * 获取会话列表
     */
    self.getAllConversationList = function () {

    };

    self.delHistoryMessage = function () {};

    self.getHistoryMessage = function () {};

    function initMessageListener() {
        // 消息监听器
        RongIMClient.getInstance().setOnReceiveMessageListener({
            // 接收到的消息
            onReceived: function (message) {
                // 判断消息类型
                switch(message.getMessageType()){
                    case RongIMClient.MessageType.TextMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.ImageMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.VoiceMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.RichContentMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.LocationMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.DiscussionNotificationMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.InformationNotificationMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.ContactNotificationMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.ProfileNotificationMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.CommandNotificationMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.UnknownMessage:
                        // do something...
                        break;
                    default:
                    // 自定义消息
                    // do something...
                        break;
                }
            }
        });
    }

    function tujiaConversationClass() {}

    function tujiaMessageClass() {}

    return self;
}({}));