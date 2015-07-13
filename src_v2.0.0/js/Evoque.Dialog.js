//Dependency: Evoque.js
Evoque.extend('dialog', (function (self) {

    var defaultOption = {
        //对话框标题
        title:'',
        //对话框内容，可以是文本字符串，也可以是要显示的div的id
        content:'',
        width: 0,
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
        onTimeout: function () {},
        //弹层的位置:'center', 'top'. default: 'center'
        direction: 'center',
        //弹层的布局样式版本:'plain', 'preset'. default: 'preset'
        layoutVersion: 'preset',
        //是否弹层内容在内嵌的iFrame中显示，用于弹层滚动效果
        enableScrollFrame: false,
        //是否开启弹出层时将背景页面固定住
        enableFixBackground: false
    };

    var showSource = {
        messageBox: 0,
        modalDialog: 1
    };

    /**
     * 弹出2秒后自动消失的文本框，关联在全局dialog对象上
     * @param message
     * @return {*}
     */
    self.alert = function (message, onDialogClosed) {
        var ctx = getDialogContext.call(self.evoqueTarget);
        if (lexus.isObjectNull(ctx)) {
            return;
        }
        ctx.show({
            content: message,
            onDialogClosed: onDialogClosed,
            __source: showSource.messageBox
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
        if (lexus.isObjectNull(ctx)) {
            return;
        }
        ctx.show({
            content: message,
            button: 'no|yes',
            onClickYes: onclickyes,
            autoClose: false,
            __source: showSource.messageBox
        });
    };

    /**
     * 弹出带有ok按钮的消息框
     * @param message
     */
    self.message = function (message) {
        var ctx = getDialogContext.call(self.evoqueTarget);
        if (lexus.isObjectNull(ctx)) {
            return;
        }
        ctx.show({
            content: message,
            button: 'ok',
            autoClose: false,
            __source: showSource.messageBox
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
        if (lexus.isObjectNull(ctx)) {
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
            },
            layoutVersion: 'plain',
            __source: showSource.messageBox
        }, callback);
    };

    /**
     * 弹出根据option参数的自定义设置来显示的文本框，关联在全局dialog对象上
     * @param option
     * @return {*}
     */
    self.showMessageBox = function (option) {
        var ctx = getDialogContext.call(self.evoqueTarget);
        if (lexus.isObjectNull(ctx)) {
            return;
        }
        option.__source = showSource.messageBox;
        ctx.show(option);
    };

    /**
     * 弹出根据option参数的自定义设置来显示的模态窗体，关联在全局dialog对象上
     * @param option
     * @return {*}
     */
    self.showModalDialog = function (option) {
        var ctx = getDialogContext.call(self.evoqueTarget);
        if (lexus.isObjectNull(ctx)) {
            return;
        }
        option.__source = showSource.modalDialog;
        ctx.show(option);
    };

    /**
     * 关闭当前显示的文本框，关联在全局dialog对象上
     * @return {*}
     */
    self.closeCurrentDialog = function () {
        var ctx = getDialogContext.call(self.evoqueTarget);
        if (lexus.isObjectNull(ctx)) {
            return;
        }
        ctx.close();
    };

    /**
     * 关闭所有文本框，关联在全局$对象上
     */
    lexus.closeAllDialogs = function () {
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
        if (lexus.isStringEmpty(key))
        {
            key = lexus.guid();
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

    var evoquePage = (function () {
        var _enable = false;
        var currentScrollTop = 0;
        return {
            enable: function (v) {
                _enable = v;
            },
            fixBackground: function () {
                if (!_enable) {
                    return;
                }
                currentScrollTop = document.body.scrollTop;
                var objStyle = document.body.style;
                //objStyle.setProperty('position', 'absolute');
                objStyle.setProperty('height', document.documentElement.clientHeight + 'px');
                objStyle.setProperty('width', document.documentElement.clientWidth + 'px');
                objStyle.setProperty('overflow', 'hidden');
                objStyle.setProperty('margin-top', (0 - currentScrollTop) + 'px');
                /*objStyle.setProperty('position', 'fixed');
                objStyle.setProperty('top', (0 - currentScrollTop) + 'px');
                objStyle.setProperty('width', '100%');*/
                //ios6的safari上面发现在一个长页面的最底部的按钮触发弹层时，会先白屏，然后随便滚动一下就会恢复原状，不清楚原因，先暂时手动触发下页面滚动
                //window.scrollTo(0, 0);
            },
            restoreFixBackground: function () {
                if (!_enable) {
                    return;
                }
                var objStyle = document.body.style;
                //objStyle.removeProperty('position');
                objStyle.removeProperty('height');
                objStyle.removeProperty('width');
                objStyle.removeProperty('overflow');
                objStyle.removeProperty('margin-top');
                /*objStyle.removeProperty('position');
                objStyle.removeProperty('top');
                objStyle.removeProperty('width');*/
                //window.scrollTo(0, currentScrollTop);
            }
        };
    }());

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

        var originalWindowWidth = 0;
        var originalWindowHeight = 0;
        var originalDialogWidth = 0;
        var originalDialogHeight = 0;
        var originalOrientation = mOrientation.vertical;

        var originalDirection = 'center';

        var scrollFrame = null;

        function exeShowContext() {
            var ctx = showContextSeq.shift();
            if (lexus.isObjectNull(ctx))
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
            if (lexus.checkType(ctx.afterShow) === type.eFunction)
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
            lexus(bgObj).addClass('bg-dialog');
            //增加点击背景返回的事件处理器
            lexus(bgObj).click(function (event) {
                var result;
                if (lexus.checkType(onQuiting) === type.eFunction)
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
            lexus(bgObjWhite).addClass('bg-dialog-none');

            dialogObj = document.createElement('div');

            lexus.orientationChange(function () {
                var windowWidth = document.documentElement.clientWidth;
                var windowHeight = document.documentElement.clientHeight;
                var $dialog = lexus(dialogObj);
                var o = lexus.orientation();
                if (o === originalOrientation) {
                    dialogObj.style.width = originalDialogWidth + 'px';
                    if (originalDirection === 'center') {
                        $dialog.removeClass('J-pop-box-t');
                    }
                }
                else {
                    dialogObj.style.width = originalDialogWidth / originalWindowWidth * windowWidth + 'px';
                    if (originalDirection === 'center')
                    {
                        if (dialogObj.clientHeight > windowHeight) {
                            $dialog.addClass('J-pop-box-t');
                        }
                    }
                }
                bgObj.style.minHeight = getbackgroundHeight() + 'px';
                bgObjWhite.style.minHeight = getbackgroundHeight() + 'px';
            });
            //针对某些手机，在input软键盘弹出的时候，导致蒙版高度设置不对的问题，进行一些兼容
            if (lexus.hasTouchEvent()) {
                document.addEventListener('blur', function () {
                    bgObj.style.minHeight = getbackgroundHeight() + 'px';
                    bgObjWhite.style.minHeight = getbackgroundHeight() + 'px';
                });
            }

            titleObj = document.createElement('div');
            lexus(titleObj).addClass('J-pop-hd');

            contentObj = document.createElement('div');

            scrollFrame = document.createElement('iframe');
            scrollFrame.width = '100%';
            scrollFrame.height = '100%';
            scrollFrame.style.margin = 0;
            scrollFrame.style.padding = 0;
            scrollFrame.style.border = 0;

            buttonObj = document.createElement('div');
            lexus(buttonObj).addClass('J-pop-button');

            btnOK = createButton({ caption: '确定', onClick: function (event)
            {
                if (lexus.checkType(onClickOk) === type.eFunction)
                {
                    return onClickOk.call(this, event);
                }
            }
            });
            btnCancel = createButton({ caption: '取消', onClick: function (event)
            {
                if (lexus.checkType(onClickCancel) === type.eFunction)
                {
                    return onClickCancel.call(this, event);
                }
            }
            });
            btnYes = createButton({ caption: '是', onClick: function (event)
            {
                if (lexus.checkType(onClickYes) === type.eFunction)
                {
                    return onClickYes.call(this, event);
                }
            }
            });
            btnNo = createButton({ caption: '否', onClick: function (event)
            {
                if (lexus.checkType(onClickNo) === type.eFunction)
                {
                    return onClickNo.call(this, event);
                }
            }
            });
            btnClose = createButton({ caption: '关闭', onClick: function (event)
            {
                if (lexus.checkType(onClickClose) === type.eFunction)
                {
                    return onClickClose.call(this, event);
                }
            }
            });

            inited = true;
        }

        function createButton(btnOption) {
            var btn = document.createElement('span');
            btn.innerHTML = btnOption.caption;
            lexus(btn).addClass('button');
            lexus(btn).click(function (event) {
                var result;
                if (lexus.checkType(btnOption.onClick) === type.eFunction)
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

        function fillScrollFrame(html, height) {
            if (lexus.isObjectNull(scrollFrame)) {
                return;
            }
            dialogObj.style.height = height + 'px';
            dialogObj.appendChild(contentObj);
            document.body.appendChild(dialogObj);
            contentObj.style.height = '100%';
            contentObj.appendChild(scrollFrame);
            var iframedocument = scrollFrame.contentDocument;
            iframedocument.open();
            iframedocument.write('<html><head></head><body>' + html + '</body></html>');
            iframedocument.close();
        }

        function innerShow(option) {
            init();

            var showSrc = option[0].__source;
            dialogObj.style.opacity = 1;
            var title = option.getValueOfProperty('title', defaultOption);
            var content = option.getValueOfProperty('content', defaultOption);
            var enableScrollFrame = option.getValueOfProperty('enableScrollFrame', defaultOption);
            var buttonProperty = option.getValueOfProperty('button', defaultOption);
            var customButtonProperty = option.getValueOfProperty('customButton', defaultOption);
            var direction = option.getValueOfProperty('direction', defaultOption).toLowerCase();
            var layoutVersion = option.getValueOfProperty('layoutVersion', defaultOption).toLowerCase();
            var autoClose = option.getValueOfProperty('autoClose', defaultOption);
            var enableFixBackground = option.getValueOfProperty('enableFixBackground', defaultOption);
            evoquePage.enable(enableFixBackground);
            var h = 0;
            if (enableScrollFrame)
            {
                h = option.getValueOfProperty('height', defaultOption);
                if (h > document.documentElement.clientHeight * 0.9) {
                    h = document.documentElement.clientHeight * 0.9;
                }
            }
            if (!lexus.isStringEmpty(title)) {
                titleObj.innerHTML = title;
                if (layoutVersion !== 'plain') {
                    dialogObj.appendChild(titleObj);
                }
            }
            if (!lexus.isStringEmpty(content))
            {
                var eContent = lexus('#' + content);
                if (eContent.length > 0)
                {
                    var ele = eContent[0];
                    if (enableScrollFrame) {
                        fillScrollFrame(ele.outerHTML, h);
                    }
                    else {
                        //缓存内容的父节点
                        contentParentCache = ele.parentElement;
                        contentObj.appendChild(ele);
                        lexus(ele).show();
                        if (layoutVersion === 'plain') {
                            lexus(dialogObj).addClass('J-pop-box-transparent');
                        }
                    }
                }
                else
                {
                    if (enableScrollFrame) {
                        fillScrollFrame(content, h);
                    }
                    else {
                        lexus(contentObj).html(content);
                        if (showSrc === showSource.modalDialog) {
                            lexus(contentObj).addClass('J-pop-bd-l');
                        }
                        else {
                            lexus(contentObj).addClass('J-pop-bd');
                        }
                        if (lexus.isStringEmpty(buttonProperty) && customButtonProperty.length === 0 && autoClose) {
                            lexus(dialogObj).addClass('J-pop-box-b');
                        }
                    }
                }
            }
            else
            {
                lexus(contentObj).html('');
                lexus(contentObj).addClass('J-pop-bd');
                if (lexus.isStringEmpty(buttonProperty) && customButtonProperty.length === 0 && autoClose) {
                    lexus(dialogObj).addClass('J-pop-box-b');
                }
            }
            if (!enableScrollFrame)
            {
                dialogObj.appendChild(contentObj);
            }
            lexus(dialogObj).addClass('J-pop-box');
            if (direction === 'top') {
                lexus(dialogObj).addClass('J-pop-box-t');
            }
            if (!lexus.isStringEmpty(buttonProperty) || customButtonProperty.length > 0)
            {
                if (!lexus.isStringEmpty(buttonProperty))
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
                        if (!lexus.isStringEmpty(customBtn.caption))
                        {
                            buttonObj.appendChild(createButton(customBtn));
                        }
                    }
                }
                if (layoutVersion !== 'plain') {
                    dialogObj.appendChild(buttonObj);
                }

                document.body.appendChild(bgObj);
            }
            else
            {
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

            bgObj.style.minHeight = getbackgroundHeight() + 'px';
            bgObjWhite.style.minHeight = getbackgroundHeight() + 'px';

            onQuiting = option.getValueOfProperty('onQuiting', defaultOption);
            onDialogShowed = option.getValueOfProperty('onDialogShowed', defaultOption);
            onDialogClosed = option.getValueOfProperty('onDialogClosed', defaultOption);

            if (!enableScrollFrame)
            {
                document.body.appendChild(dialogObj);
            }
            var w = option.getValueOfProperty('width', defaultOption);
            if (w === 0) {
                w = document.documentElement.clientWidth * 0.9;
            }
            dialogObj.style.width = w + 'px';
            //固定住背景页面
            evoquePage.fixBackground();
            //触发DialogShow事件
            if (lexus.checkType(onDialogShowed) === type.eFunction)
            {
                onDialogShowed.call(window);
            }

            originalDialogWidth = w;
            originalDialogHeight = dialogObj.clientHeight;
            originalOrientation = lexus.orientation();
            originalWindowWidth = document.documentElement.clientWidth;
            originalWindowHeight = document.documentElement.clientHeight;
            originalDirection = direction;
            //show出来之后再判断下高度，超长则更改dialog的定位
            if (originalDirection === 'center' && originalDialogHeight > originalWindowHeight) {
                originalDirection = 'top';
                lexus(dialogObj).addClass('J-pop-box-t');
            }
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
            if (lexus.checkType(contentParentCache) === type.eElement)
            {
                if (contentObj.children.length > 0)
                {
                    lexus(contentObj.firstElementChild).hide();
                    contentParentCache.appendChild(contentObj.firstElementChild);
                }
            }
            contentParentCache = null;
            contentObj.innerHTML = '';
            lexus(buttonObj).clearChild();

            onClickOk = null;
            onClickCancel = null;
            onClickYes = null;
            onClickNo = null;
            onClickClose = null;

            buttonObj.innerHTML = '';
            lexus(dialogObj).clearChild();
            lexus(dialogObj).setAttr('class', '');
            lexus(contentObj).setAttr('class', '');
            document.body.removeChild(dialogObj);
            if (lexus('#m-bgDiv_' + contextGuid).length > 0)
            {
                document.body.removeChild(bgObj);
            }
            if (lexus('#m-bgDivWhite_' + contextGuid).length > 0)
            {
                document.body.removeChild(bgObjWhite);
            }

            if (isTimeout)
            {
                if (lexus.checkType(onTimeout) === type.eFunction)
                {
                    onTimeout.call(window);
                }
            }
            else
            {
                if (lexus.checkType(onDialogClosed) === type.eFunction)
                {
                    onDialogClosed.call(window);
                }
            }

            //解除固定背景页面
            evoquePage.restoreFixBackground();

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
            if (lexus.isObjectNull(option))
            {
                throw 'Parameter is null!';
            }
            option = lexus(option);
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