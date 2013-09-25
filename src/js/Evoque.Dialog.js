//Dependency: Evoque.js
$.dialog = (function (self) {
    var zIndexStack = [];
    zIndexStack.push(10000);
    var dialogGUID = 0;
    var gDialog = new dialogClass(dialogGUID, zIndexStack.slice(zIndexStack.length - 1)[0]);
    ++dialogGUID;

    self.alert = function (message)
    {
        return gDialog.alert(message);
    };

    self.showLoading = function (loadingMsg, callback)
    {
        return gDialog.showLoading(loadingMsg, callback);
    };

    self.showMessageBox = function (option) {
        return gDialog.showMessageBox(option);
    };

    self.showModalDialog = function (option) {
        return gDialog.showModalDialog(option);
    };

    self.closeCurrentDialog = function () {
        return gDialog.closeCurrentDialog();
    };

    function dialogClass(dialogGUID, zIdx)
    {
        var inited = false;

        var defaultOption = null;
        var sWidth = null;
        var sHeight = null;
        var bgObj = null;
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

        var contentParentCache = null;

        //消息序列
        var cmdSeq = [];
        var cmdExecuting = false;

        function cmdClass(mtd, opn)
        {
            this.methodName = mtd;
            this.option = opn;
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
        }

        this.alert = function (message)
        {
            this.showMessageBox({
                content:message
            });
        };

        this.showLoading = function (loadingMsg, callback)
        {
            this.showMessageBox({
                content: loadingMsg,
                autoClose: false
            });
            //TODO:这里有个Bug：在调用完alert方法之后，接着调用showLoading方法，此处的callback回调会立即调用
            if ($.checkType(callback) === type.eFunction)
            {
                var waiting100 = window.setTimeout(function ()
                {
                    window.clearTimeout(waiting100);
                    callback.call();
                }, 100);
            }
        };

        this.showMessageBox = function (option) {
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
            $(bgObj).addEventHandler('click', function () {
                reset();
            });

            dialogObj = document.createElement('div');
            dialogObj.setAttribute('align', 'center');
            $(dialogObj).addClass('mdialog-dg-div');
            dialogObj.style.zIndex = zIdx + 1;

            titleObj = document.createElement('div');
            titleObj.setAttribute('align', 'left');
            $(titleObj).addClass('mdialog-title-div');

            contentObj = document.createElement('div');
            $(contentObj).addClass('mdialog-content-div');

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

        function reset()
        {
            if (cmdExecuting == false)
            {
                return;
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
            dialogObj.style.backgroundColor = '';
            dialogObj.style.borderColor = '';
            document.body.removeChild(dialogObj);
            if ($('#m-bgDiv_' + dialogGUID).length > 0)
            {
                document.body.removeChild(bgObj);
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
                    dialogObj.style.backgroundColor = 'transparent';
                    dialogObj.style.borderColor = 'transparent';
                }
                else
                {
                    contentObj.innerHTML = content;
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
                    // 等待2秒自动消失
                    window.setTimeout(function () {
                        disappearAnimation(dialogObj);
                    }, 2000);
                }
                else
                {
                    bgObj.style.height = getbackgroundHeight() + 'px';
                    document.body.appendChild(bgObj);
                }
            }

            document.body.appendChild(dialogObj);
            var w = option.getValueOfProperty('width', defaultOption);
            dialogObj.style.width = w + 'px';
            var h = dialogObj.clientHeight;
            dialogObj.style.marginLeft = (0 - w) / 2 +'px';
            dialogObj.style.marginTop = (0 - h) / 2 + document.body.scrollTop + 'px';

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
                title:'',
                icon:'',
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
                // customButton example:{ caption: 'xxxx', onClick: function(){} }
                customButton: [],
                autoClose: true
            };

            return option;
        }
    }

    //API
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

    Evoque.showMessageBox = function (option)
    {
        genDialog.apply(this);
        this.dialog.setZIndex(zIndexStack.slice(zIndexStack.length - 1)[0] + 1);
        return this.dialog.showMessageBox(option);
    };

    Evoque.showModalDialog = function (option)
    {
        genDialog.apply(this);
        this.dialog.setZIndex(zIndexStack.slice(zIndexStack.length - 1)[0] + 1);
        return this.dialog.showModalDialog(option);
    };

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
            ++dialogGUID;
        }
    }

    return self;
}($.dialog || {}));