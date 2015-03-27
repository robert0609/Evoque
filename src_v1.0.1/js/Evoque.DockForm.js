//Dependency: Evoque.js
Evoque.extend('dockForm', (function (self) {
    var defaultOption = {
        // top|bottom|left|right. default: bottom
        direction: 'bottom',
        onShow: function () {},
        onHide: function () {}
    };

    var dockFormInstances = {};

    self.show = function (option) {
        option = option || {};
        self.hide();

        if ($.isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        option = $(option);
        var caller = self.evoqueTarget;
        if (caller.length > 0) {
            var element = caller[0];
            var dir = option.getValueOfProperty('direction', defaultOption).toLowerCase();
            if ($.isObjectNull(dockFormInstances[dir]))
            {
                dockFormInstances[dir] = new dockFormClass(dir);
            }
            var onShow = option.getValueOfProperty('onShow', defaultOption);
            var onHide = option.getValueOfProperty('onHide', defaultOption);
            dockFormInstances[dir].show(element, onShow, onHide);
        }
    };

    self.hide = function () {
        for (var p in dockFormInstances)
        {
            if ($.checkType(dockFormInstances[p].hide) === type.eFunction)
            {
                dockFormInstances[p].hide();
            }
        }
    };

    var evoquePage = (function () {
        var currentScrollTop = 0;
        return {
            fixBackground: function () {
                currentScrollTop = document.body.scrollTop;
                var objStyle = document.body.style;
                objStyle.setProperty('position', 'fixed');
                objStyle.setProperty('top', (0 - currentScrollTop) + 'px');
                objStyle.setProperty('width', '100%');
            },
            restoreFixBackground: function () {
                var objStyle = document.body.style;
                objStyle.removeProperty('position');
                objStyle.removeProperty('top');
                objStyle.removeProperty('width');
                window.scrollTo(0, currentScrollTop);
            }
        };
    }());

    function dockFormClass(direction)
    {
        var that = this;

        var docWidth = document.documentElement.clientWidth;
        var docHeight = document.documentElement.clientHeight;
        var maxWidth = Math.floor(docWidth * 0.9);
        var maxHeight = Math.floor(docHeight * 0.9);

        var div = document.createElement('div');
        var $div = $(div);
        $div.addClass('dockform-dg-div');
        div.style[direction] = '0';
        switch (direction)
        {
            case 'left':
            case 'right':
                div.style.top = '0';
                div.style.height = docHeight + 'px';
                break;
            default:
                div.style.left = '0';
                div.style.width = docWidth + 'px';
                break;
        }
        var animationEndCallback = null;
        $div.addEventHandler('animationEnd', function () {
            if ($.checkType(animationEndCallback) === type.eFunction) {
                animationEndCallback.call(div);
            }
        }, { useEventPrefix: true });
        var formHideCallback = null;

        var bgObj = document.createElement('div');
        $(bgObj).addClass('dockform-bg-div');
        bgObj.style.width = docWidth + 'px';
        bgObj.style.height = getbackgroundHeight() + 'px';
        bgObj.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(style=3,opacity=25,finishOpacity=75)';
        $(bgObj).addEventHandler('click', function () {
            that.hide();
        });
        //TODO: 发现在弹出的层中绑定的触摸事件，第一次弹出有效，以后的弹出无效，加上以下这句代码，该现象不存在，原因不明。
        document.addEventListener('touchstart', function () {});

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

        var parentCache = null;
        this.currentShowElement = null;
        var showFlag = false;

        this.show = function (element, onShow, onHide) {
            if (showFlag)
            {
                this.hide();
            }
            animationEndCallback = onShow;
            formHideCallback = onHide;

            parentCache = element.parentElement;
            this.currentShowElement = element;
            div.appendChild(element);
            $(element).show();
            document.body.appendChild(bgObj);
            document.body.appendChild(div);
            evoquePage.fixBackground();
            setDivSize();
            if ($.device() !== mDevice.samsung) {
                $div.addClass('bottomTop');
            }
            showFlag = true;
            if ($.device() === mDevice.samsung) {
                if ($.checkType(animationEndCallback) === type.eFunction) {
                    animationEndCallback.call(div);
                }
            }

            return this;
        };

        function setDivSize()
        {
            switch (direction)
            {
                case 'left':
                case 'right':
                    if (div.clientWidth > maxWidth)
                    {
                        div.style.width = maxWidth + 'px';
                    }
                    break;
                default:
                    if (div.clientHeight > maxHeight)
                    {
                        div.style.height = maxHeight + 'px';
                    }
                    break;
            }
        }

        this.hide = function () {
            if (!showFlag)
            {
                return;
            }
            if ($.device() !== mDevice.samsung) {
                $div.removeClass('bottomTop');
            }
            evoquePage.restoreFixBackground();
            document.body.removeChild(div);
            var element = this.currentShowElement;
            $(element).hide();
            document.body.removeChild(bgObj);
            parentCache.appendChild(element);
            parentCache = null;
            this.currentShowElement = null;
            showFlag = false;

            if ($.checkType(formHideCallback) === type.eFunction) {
                formHideCallback.call(div);
            }
            animationEndCallback = null;
            formHideCallback = null;
        };
    }

    //API
    /**
     * 弹出Dock层
     * @param option
     */
    Evoque.showDockForm = function (option) {
        this.dockForm.show(option);
    };

    /**
     * 关闭Dock层
     */
    Evoque.hideDockForm = function () {
        self.hide();
    };

    return self;
}({})));
