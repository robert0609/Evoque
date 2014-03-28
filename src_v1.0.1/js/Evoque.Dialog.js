//Dependency: Evoque.js
$.dialog = (function (self) {
    var zIndexStack = [];
    var dialogList = [];
    zIndexStack.push(10000);
    var dialogGUID = 0;
    var gDialog = new dialogClass(dialogGUID, zIndexStack.slice(zIndexStack.length - 1)[0]);
    dialogList.push(gDialog);
    ++dialogGUID;

    /**
     * 弹出2秒后自动消失的文本框，关联在全局dialog对象上
     * @param message
     * @return {*}
     */
    self.alert = function (message)
    {
        return gDialog.alert(message);
    };

    self.showLoading = function (loadingMsg, callback)
    {
        return gDialog.showLoading(loadingMsg, callback);
    };

    /**
     * 弹出根据option参数的自定义设置来显示的文本框，关联在全局dialog对象上
     * @param option
     * @return {*}
     */
    self.showMessageBox = function (option) {
        return gDialog.showMessageBox(option);
    };

    /**
     * 弹出根据option参数的自定义设置来显示的模态窗体，关联在全局dialog对象上
     * @param option
     * @return {*}
     */
    self.showModalDialog = function (option) {
        return gDialog.showModalDialog(option);
    };

    /**
     * 关闭当前显示的文本框，关联在全局dialog对象上
     * @return {*}
     */
    self.closeCurrentDialog = function () {
        return gDialog.closeCurrentDialog();
    };

    /**
     * 关闭所有文本框，关联在全局dialog对象上
     */
    self.closeAll = function () {
        for (var i = 0; i < dialogList.length; ++i)
        {
            dialogList[i].closeCurrentDialog();
        }
    };

    function dialogClass(dialogGUID, zIdx)
    {
        var inited = false;

        var defaultOption = null;
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
        var cmdSeq = [];
        var cmdExecuting = false;

        function cmdClass(mtd, opn, aftCbk)
        {
            this.methodName = mtd;
            this.option = opn;
            this.afterShow = aftCbk;
        }

        function exeCmd()
        {
            var cmd = cmdSeq.shift();
            if ($.isObjectNull(cmd))
            {
                cmdExecuting = false;
                zIndexStack.pop();
                return;
            }
            show(cmd.option);
            if ($.checkType(onDialogShowed) === type.eFunction)
            {
                onDialogShowed.call(window);
            }
            if ($.checkType(cmd.afterShow) === type.eFunction)
            {
                var waiting100 = window.setTimeout(function ()
                {
                    window.clearTimeout(waiting100);
                    cmd.afterShow.call();
                }, 100);
            }
        }

        this.alert = function (message)
        {
            this.showMessageBox({
                content:message
            });
        };

        this.showLoading = function (loadingMsg, callback)
        {
            var that = this;
            this.showMessageBox({
                content: loadingMsg,
                onQuiting: function () {
                    return false;
                },
                autoClose: false,
                timeout: 60,
                onTimeout: function () {
                    that.alert('抱歉，你的网络不太好，请稍后重新刷新页面!')
                }
            }, callback);
        };

        this.showMessageBox = function (option, afterShowCallBack) {
            if ($.isObjectNull(option))
            {
                throw 'Parameter is null!';
            }
            option = $(option);
            cmdSeq.push(new cmdClass('show', option, afterShowCallBack));
            if (cmdExecuting)
            {
                return;
            }
            cmdExecuting = true;
            zIndexStack.push(zIdx + 1);
            exeCmd();
        };

        this.showModalDialog = function (option) {
            if ($.isObjectNull(option))
            {
                throw 'Parameter is null!';
            }
            option = $(option);
            cmdSeq.push(new cmdClass('show', option));
            if (cmdExecuting)
            {
                return;
            }
            cmdExecuting = true;
            zIndexStack.push(zIdx + 1);
            exeCmd();
        };

        this.closeCurrentDialog = function () {
            reset();
        };

        this.setZIndex = function (zIdx) {
            if (inited)
            {
                return;
            }
            bgObj.style.zIndex = zIdx;
            dialogObj.style.zIndex = zIdx + 1;
        };

        this.initialize = function () {
            init();
        };

        function init()
        {
            if (inited)
            {
                return;
            }
            defaultOption = createDefaultOption();

            sWidth = document.documentElement.clientWidth;
            sHeight = document.documentElement.clientHeight;

            bgObj = document.createElement('div');
            bgObj.setAttribute('id', 'm-bgDiv_' + dialogGUID);
            $(bgObj).addClass('mdialog-bg-div');
            bgObj.style.width = sWidth + 'px';
            bgObj.style.height = getbackgroundHeight() + 'px';
            bgObj.style.zIndex = zIdx;
            bgObj.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(style=3,opacity=25,finishOpacity=75)';
            //增加点击背景返回的事件处理器
            $(bgObj).addEventHandler('click', function (event) {
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
            bgObjWhite.setAttribute('id', 'm-bgDivWhite_' + dialogGUID);
            $(bgObjWhite).addClass('mdialog-bg-div-white');
            bgObjWhite.style.width = sWidth + 'px';
            bgObjWhite.style.height = getbackgroundHeight() + 'px';
            bgObjWhite.style.zIndex = zIdx;
            bgObjWhite.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(style=3,opacity=25,finishOpacity=75)';

            dialogObj = document.createElement('div');
            dialogObj.setAttribute('align', 'center');
            dialogObj.style.zIndex = zIdx + 1;

            titleObj = document.createElement('div');
            titleObj.setAttribute('align', 'left');
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

        function reset(isTimeout)
        {
            if (cmdExecuting == false)
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
            if ($('#m-bgDiv_' + dialogGUID).length > 0)
            {
                document.body.removeChild(bgObj);
            }
            if ($('#m-bgDivWhite_' + dialogGUID).length > 0)
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
            exeCmd();
        }

        function show(option)
        {
            init();

            dialogObj.style.opacity = 1;
            var title = option.getValueOfProperty('title', defaultOption);
            if (!$.isStringEmpty(title)) {
                titleObj.innerHTML = title;
                dialogObj.appendChild(titleObj);
            }
            var content = option.getValueOfProperty('content', defaultOption);
            if (!$.isStringEmpty(content))
            {
                var eContent = $('#' + content);
                if (eContent.length > 0)
                {
                    //缓存内容的父节点
                    var ele = eContent[0];
                    contentParentCache = ele.parentElement;
                    contentObj.appendChild(ele);
                    ele.style.display = 'block';
                    $(dialogObj).addClass('mdialog-dg-div-raw');
                    $(contentObj).addClass('mdialog-content-div-raw');
                }
                else
                {
                    contentObj.innerHTML = content;
                    $(dialogObj).addClass('mdialog-dg-div');
                    $(contentObj).addClass('mdialog-content-div');
                }
                dialogObj.appendChild(contentObj);
            }
            var buttonProperty = option.getValueOfProperty('button', defaultOption);
            var customButtonProperty = option.getValueOfProperty('customButton', defaultOption);
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

                bgObj.style.height = getbackgroundHeight() + 'px';
                document.body.appendChild(bgObj);
            }
            else
            {
                var autoClose = option.getValueOfProperty('autoClose', defaultOption);
                if (autoClose)
                {
                    bgObjWhite.style.height = getbackgroundHeight() + 'px';
                    document.body.appendChild(bgObjWhite);
                    // 等待2秒自动消失
                    window.setTimeout(function () {
                        disappearAnimation(dialogObj);
                    }, 2000);
                }
                else
                {
                    bgObj.style.height = getbackgroundHeight() + 'px';
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
            dialogObj.style.maxHeight = document.documentElement.clientHeight * 0.8 + 'px';
            dialogObj.style.overflowY = 'auto';
            var h = dialogObj.clientHeight;
            dialogObj.style.marginLeft = (0 - w) / 2 +'px';
            dialogObj.style.marginTop = (0 - h) / 2 + 'px';

        }

        function disappearAnimation(dObj)
        {
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

        function getbackgroundHeight()
        {
            if (document.body.clientHeight > document.documentElement.clientHeight)
            {
                return document.body.clientHeight;
            }
            else
            {
                return document.documentElement.clientHeight;
            }
        }

        function createButton(btnOption)
        {
            var btn = document.createElement('input');
            btn.type = 'button';
            btn.value = btnOption.caption;
            $(btn).addClass('mdialog-button-input');
            $(btn).addEventHandler('click', function (event)
            {
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
            }, false);
            return btn;
        }

        function createDefaultOption() {
            var option = {
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

            return option;
        }
    }

    //API
    /**
     * 弹出2秒后自动消失的文本框，关联在当前Evoque对象上
     * @param message
     * @return {*}
     */
    Evoque.alert = function (message)
    {
        genDialog.apply(this);
        this.dialog.setZIndex(zIndexStack.slice(zIndexStack.length - 1)[0] + 1);
        return this.dialog.alert(message);
    };

    Evoque.showLoading = function (loadingMsg, callback)
    {
        genDialog.apply(this);
        this.dialog.setZIndex(zIndexStack.slice(zIndexStack.length - 1)[0] + 1);
        return this.dialog.showLoading(loadingMsg, callback);
    };

    /**
     * 弹出根据option参数的自定义设置来显示的文本框，关联在当前Evoque对象上
     * @param option
     * @return {*}
     */
    Evoque.showMessageBox = function (option)
    {
        genDialog.apply(this);
        this.dialog.setZIndex(zIndexStack.slice(zIndexStack.length - 1)[0] + 1);
        return this.dialog.showMessageBox(option);
    };

    /**
     * 弹出根据option参数的自定义设置来显示的模态窗体，关联在当前Evoque对象上
     * @param option
     * @return {*}
     */
    Evoque.showModalDialog = function (option)
    {
        genDialog.apply(this);
        this.dialog.setZIndex(zIndexStack.slice(zIndexStack.length - 1)[0] + 1);
        return this.dialog.showModalDialog(option);
    };

    /**
     * 关闭当前显示的文本框，关联在当前Evoque对象上
     * @return {*}
     */
    Evoque.closeCurrentDialog = function ()
    {
        genDialog.apply(this);
        this.dialog.setZIndex(zIndexStack.slice(zIndexStack.length - 1)[0] + 1);
        return this.dialog.closeCurrentDialog();
    };

    function genDialog()
    {
        if ($.checkType(this.dialog) !== type.eObject)
        {
            this.dialog = new dialogClass(dialogGUID, zIndexStack.slice(zIndexStack.length - 1)[0] + 1);
            this.dialog.initialize();
            dialogList.push(this.dialog);
            ++dialogGUID;
        }
    }

    return self;
}($.dialog || {}));