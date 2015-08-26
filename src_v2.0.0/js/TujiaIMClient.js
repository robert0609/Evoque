//Dependency: Evoque.js, Evoque.Cache.js, Evoque.Dialog.js, RongIMClient.js
var TujiaIMClient = (function (self) {

    var defaultCallback = {
        onSuccess: function () {},
        onFail: function () {}
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
    self.init = function (appKey) {};

    /**
     * 连接融云服务器
     * @param clientUserId
     * @param callback
     */
    self.connect = function (clientUserId, callback) {};

    /**
     * 发送对话消息
     * @param targetUserId
     * @param callback
     */
    self.sendMessage = function (targetUserId, callback) {};

    /**
     * 连接状态监听器
     */
    self.connectionStatusListener = function () {};

    /**
     * 接收新消息推送接口
     */
    self.newMessageListener = function () {};

    /**
     * 房东/商户在线/离线状态接收接口
     */
    self.targetStatusListener = function () {};


    return self;
}({}));