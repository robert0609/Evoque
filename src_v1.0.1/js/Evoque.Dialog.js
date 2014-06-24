//Dependency: Evoque.js
Evoque.extend('dialog', (function (self) {

    var defaultOption = {
        //对话框标题
        title:'',
        //对话框内容，可以是文本字符串，也可以是要显示的div的id
        content:'',
        width:document.documentElement.clientWidth * 0.75,
        height:100,
        //'ok', 'cancel', 'yes', 'no', 'close' OR multiple buttons: 'yes|no'
        button:'',
        onClickOk: function(){},
        onClickCancel: function(){},
        onClickYes: function(){},
        onClickNo: function(){},
        onClickClose: function(){},
        //点击背景遮罩层会触发onQuiting事件
        onQuiting: function(){},
        // customButton example:{ caption: 'xxxx', onClick: function(){} }
        customButton: [],
        onDialogShowed: function(){},
        onDialogClosed: function(){},
        autoClose: true,
        //对话框显示出来之后的超时时间，超过指定时间自动关闭
        timeout: 0,
        onTimeout: function () {}
    };

    /**
     * 弹出2秒后自动消失的文本框，关联在全局dialog对象上
     * @param message
     * @return {*}
     */
    self.alert = function (message, onDialogClosed) {
        var ctx = getDialogContext.call(self.evoqueTarget);
        if ($.isObjectNull(ctx)) {
            return;
        }
        ctx.show({
            content: message,
            onDialogClosed: onDialogClosed
        });
    };

    /**
     * 弹出带有yes和no按钮的确认框
     * @param message
     * @param onclickyes
     * @return {*}
     */
    self.prompt = function (message, onclickyes) {
        var ctx = getDialogContext.call(self.evoqueTarget);
        if ($.isObjectNull(ctx)) {
            return;
        }
        ctx.show({
            content: message,
            button: 'no|yes',
            onClickYes: onclickyes,
            autoClose: false
        });
    };

    /**
     * 弹出表示加载中的菊花层
     * @param loadingMsg
     * @param callback
     * @return {*}
     */
    self.showLoading = function (loadingMsg, callback) {
        var ctx = getDialogContext.call(self.evoqueTarget);
        if ($.isObjectNull(ctx)) {
            return;
        }
        ctx.show({
            content: loadingMsg,
            onQuiting: function () {
                return false;
            },
            autoClose: false,
            timeout: 60,
            onTimeout: function () {
                ctx.show({
                    content: '抱歉，你的网络不太好，请稍后重新刷新页面!'
                });
            }
        }, callback);
    };

    /**
     * 弹出根据option参数的自定义设置来显示的文本框，关联在全局dialog对象上
     * @param option
     * @return {*}
     */
    self.showMessageBox = function (option) {
        var ctx = getDialogContext.call(self.evoqueTarget);
        if ($.isObjectNull(ctx)) {
            return;
        }
        ctx.show(option);
    };

    /**
     * 弹出根据option参数的自定义设置来显示的模态窗体，关联在全局dialog对象上
     * @param option
     * @return {*}
     */
    self.showModalDialog = function (option) {
        var ctx = getDialogContext.call(self.evoqueTarget);
        if ($.isObjectNull(ctx)) {
            return;
        }
        ctx.show(option);
    };

    /**
     * 关闭当前显示的文本框，关联在全局dialog对象上
     * @return {*}
     */
    self.closeCurrentDialog = function () {
        var ctx = getDialogContext.call(self.evoqueTarget);
        if ($.isObjectNull(ctx)) {
            return;
        }
        ctx.close();
    };

    /**
     * 关闭所有文本框，关联在全局$对象上
     */
    $.closeAllDialogs = function () {
        for (var pName in dialogCache) {
            dialogCache[pName].closeAll();
        }
    };

    var dialogContextProperty = '__dialogContext';
    var dialogCache = {};
    var dialogStack = [];

    function getDialogContext() {
        if (this.length === 0)
        {
            return null;
        }
        return createDialogContext.call(this[0]);
    }

    function createDialogContext() {
        var context = null;
        var key = this[dialogContextProperty];
        if ($.isStringEmpty(key))
        {
            key = $.guid();
            this[dialogContextProperty] = key;
            context = new dialogContextClass(key);
            dialogCache[key] = context;
        }
        else
        {
            context = dialogCache[key];
        }
        return context;
    }

    function dialogContextClass(contextGuid) {
        var inited = false;

        var sWidth = null;
        var sHeight = null;
        var bgObj = null;
        var bgObjWhite = null;
        var dialogObj = null;
        var titleObj = null;
        var contentObj = null;
        var buttonObj = null;
        var btnOK = null;
        var btnCancel = null;
        var btnYes = null;
        var btnNo = null;
        var btnClose = null;

        var onClickOk = null;
        var onClickCancel = null;
        var onClickYes = null;
        var onClickNo = null;
        var onClickClose = null;
        var onQuiting = null;
        var onDialogShowed = null;
        var onDialogClosed = null;
        var onTimeout = null;

        var timeoutTimeoutId;
        var enableTimeout = false;

        var contentParentCache = null;

        //消息序列
        var showContextSeq = [];
        var showContextExecuting = false;

        function exeShowContext() {
            var ctx = showContextSeq.shift();
            if ($.isObjectNull(ctx))
            {
                showContextExecuting = false;
                var delIdx = -1;
                for (var i = dialogStack.length - 1; i >= 0; --i) {
                    if (dialogStack[i].dialogContextGuid === contextGuid) {
                        delIdx = i;
                        break;
                    }
                }
                if (delIdx > -1) {
                    dialogStack.splice(delIdx, 1);
                }
                return;
            }
            innerShow(ctx.option);
            if ($.checkType(onDialogShowed) === type.eFunction)
            {
                onDialogShowed.call(window);
                //setCenter();
            }
            if ($.checkType(ctx.afterShow) === type.eFunction)
            {
                var waiting100 = window.setTimeout(function ()
                {
                    window.clearTimeout(waiting100);
                    ctx.afterShow.call();
                }, 100);
            }
        }

        function init() {
            if (inited)
            {
                return;
            }

            sWidth = document.documentElement.clientWidth;
            sHeight = document.documentElement.clientHeight;

            bgObj = document.createElement('div');
            bgObj.setAttribute('id', 'm-bgDiv_' + contextGuid);
            $(bgObj).addClass('mdialog-bg-div');
            bgObj.style.width = sWidth + 'px';
            bgObj.style.height = getbackgroundHeight() + 'px';
            //增加点击背景返回的事件处理器
            $(bgObj).click(function (event) {
                var result;
                if ($.checkType(onQuiting) === type.eFunction)
                {
                    result = onQuiting.call(this, event);
                }
                if (result == false)
                {
                    return;
                }
                reset();
            });

            bgObjWhite = document.createElement('div');
            bgObjWhite.setAttribute('id', 'm-bgDivWhite_' + contextGuid);
            $(bgObjWhite).addClass('mdialog-bg-div-white');
            bgObjWhite.style.width = sWidth + 'px';
            bgObjWhite.style.height = getbackgroundHeight() + 'px';

            dialogObj = document.createElement('div');

            titleObj = document.createElement('div');
            $(titleObj).addClass('mdialog-title-div');

            contentObj = document.createElement('div');

            buttonObj = document.createElement('div');
            $(buttonObj).addClass('mdialog-button-div');

            btnOK = createButton({ caption: '确定', onClick: function (event)
            {
                if ($.checkType(onClickOk) === type.eFunction)
                {
                    return onClickOk.call(this, event);
                }
            }
            });
            btnCancel = createButton({ caption: '取消', onClick: function (event)
            {
                if ($.checkType(onClickCancel) === type.eFunction)
                {
                    return onClickCancel.call(this, event);
                }
            }
            });
            btnYes = createButton({ caption: '是', onClick: function (event)
            {
                if ($.checkType(onClickYes) === type.eFunction)
                {
                    return onClickYes.call(this, event);
                }
            }
            });
            btnNo = createButton({ caption: '否', onClick: function (event)
            {
                if ($.checkType(onClickNo) === type.eFunction)
                {
                    return onClickNo.call(this, event);
                }
            }
            });
            btnClose = createButton({ caption: '关闭', onClick: function (event)
            {
                if ($.checkType(onClickClose) === type.eFunction)
                {
                    return onClickClose.call(this, event);
                }
            }
            });

            inited = true;
        }

        function createButton(btnOption) {
            var btn = document.createElement('input');
            btn.type = 'button';
            btn.value = btnOption.caption;
            $(btn).addClass('mdialog-button-input');
            $(btn).click(function (event) {
                var result;
                if ($.checkType(btnOption.onClick) === type.eFunction)
                {
                    result = btnOption.onClick.call(this, event);
                }
                if (result == false)
                {
                    return;
                }
                reset();
            });
            return btn;
        }

        function innerShow(option) {
            init();

            dialogObj.style.opacity = 1;
            var title = option.getValueOfProperty('title', defaultOption);
            var content = option.getValueOfProperty('content', defaultOption);
            var buttonProperty = option.getValueOfProperty('button', defaultOption);
            var customButtonProperty = option.getValueOfProperty('customButton', defaultOption);
            if (!$.isStringEmpty(title)) {
                titleObj.innerHTML = title;
                dialogObj.appendChild(titleObj);
            }
            if (!$.isStringEmpty(content))
            {
                var eContent = $('#' + content);
                if (eContent.length > 0)
                {
                    //缓存内容的父节点
                    var ele = eContent[0];
                    contentParentCache = ele.parentElement;
                    contentObj.appendChild(ele);
                    $(ele).show();
                    //判断如果显示预设按钮的情况
                    if (!$.isStringEmpty(buttonProperty) || customButtonProperty.length > 0)
                    {
                        $(dialogObj).addClass('mdialog-dg-div-white');
                    }
                    else
                    {
                        $(dialogObj).addClass('mdialog-dg-div-raw');
                    }
                    $(contentObj).addClass('mdialog-content-div-raw');
                }
                else
                {
                    $(contentObj).html(content);
                    $(dialogObj).addClass('mdialog-dg-div');
                    $(contentObj).addClass('mdialog-content-div');
                }
                dialogObj.appendChild(contentObj);
            }
            if (!$.isStringEmpty(buttonProperty) || customButtonProperty.length > 0)
            {
                if (!$.isStringEmpty(buttonProperty))
                {
                    var buttonArray = buttonProperty.split('|');
                    for (var i = 0; i < buttonArray.length; ++i)
                    {
                        var button = buttonArray[i].toLowerCase();
                        if (button == 'ok') {
                            buttonObj.appendChild(btnOK);
                            onClickOk = option.getValueOfProperty('onClickOk', defaultOption);
                        }
                        else if (button == 'cancel') {
                            buttonObj.appendChild(btnCancel);
                            onClickCancel = option.getValueOfProperty('onClickCancel', defaultOption);
                        }
                        else if (button == 'yes') {
                            buttonObj.appendChild(btnYes);
                            onClickYes = option.getValueOfProperty('onClickYes', defaultOption);
                        }
                        else if (button == 'no') {
                            buttonObj.appendChild(btnNo);
                            onClickNo = option.getValueOfProperty('onClickNo', defaultOption);
                        }
                        else if (button == 'close') {
                            buttonObj.appendChild(btnClose);
                            onClickClose = option.getValueOfProperty('onClickClose', defaultOption);
                        }
                    }
                }
                if (customButtonProperty.length > 0)
                {
                    for (var j = 0; j < customButtonProperty.length; ++j)
                    {
                        var customBtn = customButtonProperty[j];
                        if (!$.isStringEmpty(customBtn.caption))
                        {
                            buttonObj.appendChild(createButton(customBtn));
                        }
                    }
                }
                dialogObj.appendChild(buttonObj);

                document.body.appendChild(bgObj);
            }
            else
            {
                var autoClose = option.getValueOfProperty('autoClose', defaultOption);
                if (autoClose)
                {
                    document.body.appendChild(bgObjWhite);
                    // 等待2秒自动消失
                    window.setTimeout(function () {
                        disappearAnimation(dialogObj);
                    }, 2000);
                }
                else
                {
                    document.body.appendChild(bgObj);
                    // 当dialog没有任何按钮并且不自动关闭的时候，增加超时处理
                    var timeout = option.getValueOfProperty('timeout', defaultOption);
                    onTimeout = option.getValueOfProperty('onTimeout', defaultOption);
                    if (timeout > 0)
                    {
                        enableTimeout = true;
                        timeoutTimeoutId = window.setTimeout(function () {
                            reset(true);
                        }, timeout * 1000);
                    }
                }
            }
            onQuiting = option.getValueOfProperty('onQuiting', defaultOption);
            onDialogShowed = option.getValueOfProperty('onDialogShowed', defaultOption);
            onDialogClosed = option.getValueOfProperty('onDialogClosed', defaultOption);

            document.body.appendChild(dialogObj);
            var w = option.getValueOfProperty('width', defaultOption);
            dialogObj.style.width = w + 'px';

        }

        function setCenter() {
            //TODO：设置了这两个属性之后，loading转圈的图片不生效
//            dialogObj.style.maxHeight = document.documentElement.clientHeight * 0.8 + 'px';
//            dialogObj.style.overflowY = 'auto';
            var w = dialogObj.clientWidth;
            var h = dialogObj.clientHeight;
            dialogObj.style.marginLeft = (0 - w) / 2 +'px';
            dialogObj.style.marginTop = (0 - h) / 2 + 'px';
        }

        function reset(isTimeout) {
            if (!showContextExecuting)
            {
                return;
            }
            if (isTimeout)
            {
                enableTimeout = false;
            }
            else
            {
                if (enableTimeout)
                {
                    //阻止超时的处理
                    window.clearTimeout(timeoutTimeoutId);
                    enableTimeout = false;
                }
            }

            titleObj.innerHTML = '';
            if ($.checkType(contentParentCache) === type.eElement)
            {
                if (contentObj.children.length > 0)
                {
                    $(contentObj.firstElementChild).hide();
                    contentParentCache.appendChild(contentObj.firstElementChild);
                }
            }
            contentParentCache = null;
            contentObj.innerHTML = '';
            $(buttonObj).clearChild();

            onClickOk = null;
            onClickCancel = null;
            onClickYes = null;
            onClickNo = null;
            onClickClose = null;

            buttonObj.innerHTML = '';
            $(dialogObj).clearChild();
            $(dialogObj).setAttr('class', '');
            $(contentObj).setAttr('class', '');
            document.body.removeChild(dialogObj);
            if ($('#m-bgDiv_' + contextGuid).length > 0)
            {
                document.body.removeChild(bgObj);
            }
            if ($('#m-bgDivWhite_' + contextGuid).length > 0)
            {
                document.body.removeChild(bgObjWhite);
            }

            if (isTimeout)
            {
                if ($.checkType(onTimeout) === type.eFunction)
                {
                    onTimeout.call(window);
                }
            }
            else
            {
                if ($.checkType(onDialogClosed) === type.eFunction)
                {
                    onDialogClosed.call(window);
                }
            }
            //弹出消息序列中下一个消息框
            exeShowContext();
        }

        function disappearAnimation(dObj) {
            var disappearIntervalId = window.setInterval(function ()
            {
                var o = Number((dObj.style.opacity - 0.1).toFixed(1));
                dObj.style.opacity = o;
                if (dObj.style.opacity <= 0)
                {
                    window.clearInterval(disappearIntervalId);
                    reset();
                }
            }, 50);
        }

        this.show = function (option, afterShowCallBack) {
            if ($.isObjectNull(option))
            {
                throw 'Parameter is null!';
            }
            option = $(option);
            showContextSeq.push(new showContextClass(option, afterShowCallBack));
            if (showContextExecuting)
            {
                return;
            }
            showContextExecuting = true;
            var zIndex = 9990;
            if (dialogStack.length > 0) {
                zIndex = dialogStack[dialogStack.length - 1].zIndex;
            }
            this.initialize();
            this.setZIndex(zIndex + 10);
            dialogStack.push({ dialogContextGuid: contextGuid, zIndex: this.getZIndex() });
            exeShowContext();
        };

        this.close = function () {
            reset();
        };

        this.closeAll = function () {
            showContextSeq.splice(0, showContextSeq.length);
            reset();
        };

        this.setZIndex = function (zIdx) {
            if (!inited)
            {
                return;
            }
            bgObj.style.zIndex = zIdx;
            bgObjWhite.style.zIndex = zIdx;
            dialogObj.style.zIndex = zIdx + 1;
        };

        this.getZIndex = function () {
            if (showContextExecuting) {
                return Number(dialogObj.style.zIndex);
            }
            else {
                return 0;
            }
        };

        this.initialize = function () {
            init();
        };
    }

    function showContextClass(opn, aftCbk) {
        this.option = opn;
        this.afterShow = aftCbk;
    }

    function getbackgroundHeight() {
        if (document.body.clientHeight > document.documentElement.clientHeight)
        {
            return document.body.clientHeight;
        }
        else
        {
            return document.documentElement.clientHeight;
        }
    }

    return self;
}({})));