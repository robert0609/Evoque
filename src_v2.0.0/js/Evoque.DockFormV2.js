//Dependency: Evoque.js
Evoque.extend('dockFormV2', (function (self) {
    var defaultOption = {
        content: '',
        // top|bottom|left|right. default: bottom
        direction: 'bottom',
        onShow: function () { },
        onHide: function () { }
    };

    var dockGroupAttr = 'data-dock-group';
    
    var bottomStyleSheet = null;
    var bottomStyle = 'body{margin: 0;}.dock-bottom-actionsheet{position: relative;}.dock-bottom-content{position: absolute;left: 0;bottom: 0;margin: 0;padding: 0;width: 100%;z-index: -1;-webkit-transform:translate(0,0);transform:translate(0,0);-webkit-backface-visibility: hidden;backface-visibility: hidden;-webkit-transition: -webkit-transform .3s;transition: transform .3s;}.dock-bottom-content.show{-webkit-transform:translate(0,100%);transform:translate(0,100%);}';

    var bgStyle = '.dockformV2-bg-div{position: absolute;top: 0;left: 0;width: 100%;background: #777;opacity: 0.5;z-index: 1;margin: 0;padding: 0;filter: progid:DXImageTransform.Microsoft.Alpha(style=3,opacity=25,finishOpacity=75);}';

    var bgElement = null;

    self.init = function (option) {
        option = option || {};
        option = lexus(option);
        var content = option.getValueOfProperty('content', defaultOption);
        var evoqueContent = lexus('#' + content);
        if (evoqueContent.length === 0)
        {
            return;
        }
        var dir = option.getValueOfProperty('direction', defaultOption).toLowerCase();
        var onShow = option.getValueOfProperty('onShow', defaultOption);
        var onHide = option.getValueOfProperty('onHide', defaultOption);

        var caller = self.evoqueTarget;
        if (caller.length > 0) {
            var element = caller[0];
            if (lexus.isObjectNull(element.__dockForm)) {
                element.__dockForm = new dockFormClass(element, evoqueContent[0], dir, onShow, onHide);
            }
        }
    };

    self.show = function () {
        var caller = self.evoqueTarget;
        if (caller.length > 0) {
            var element = caller[0];
            if (lexus.isObjectNull(element.__dockForm)) {
                return;
            }
            //判断是否有互斥的dockForm，如果有则收起其他互斥的dockForm
            var grp = caller.getAttr(dockGroupAttr);
            if (!lexus.isStringEmpty(grp))
            {
                var evoqueGrp = lexus('*[' + dockGroupAttr + '="' + grp + '"]');
                if (evoqueGrp.length > 1) {
                    evoqueGrp.each(function () {
                        lexus(this).dockFormV2.hide();
                    });
                    setTimeout(function () {
                        element.__dockForm.show();
                    }, 300);
                    return;
                }
            }
            element.__dockForm.show();
        }
    };

    self.hide = function (hideCompleted) {
        var caller = self.evoqueTarget;
        if (caller.length > 0) {
            var element = caller[0];
            if (lexus.isObjectNull(element.__dockForm)) {
                return;
            }
            element.__dockForm.hide(hideCompleted);
        }
    };

    function dockFormClass(dockElement, contentElement, direction, onShow, onHide) {
        switch (direction) {
            case 'top':
                break;
            case 'bottom':
                appendStyle(bottomStyle);
                break;
            case 'left':
                break;
            case 'right':
                break;
        }

        var backgroundElement = appendBackground();

        var evoqueDockElement = lexus(dockElement);
        var evoqueContentElement = lexus(contentElement);
        evoqueDockElement.addClass('dock-bottom-actionsheet');
        evoqueContentElement.addClass('dock-bottom-content');
        dockElement.appendChild(contentElement);
        evoqueContentElement.show();

        var hideCompletedCallback = null;

        var isShow = false;
        evoqueContentElement.addEventHandler('transitionEnd', function () {
            if (isShow) {
                onShow.call(contentElement);
            }
            else {
                onHide.call(contentElement);
                if (lexus.checkType(hideCompletedCallback) === type.eFunction) {
                    hideCompletedCallback.call(contentElement);
                }
            }
        }, { useEventPrefix: true });

        var that = this;
        this.show = function () {
            if (isShow) {
                return;
            }
            isShow = true;
            lexus(backgroundElement).click(closeMe);
            document.body.appendChild(backgroundElement);
            evoqueContentElement.addClass('show');
        };

        this.hide = function (hideCompleted) {
            if (!isShow) {
                return;
            }
            isShow = false;
            hideCompletedCallback = hideCompleted;
            evoqueContentElement.removeClass('show');
            document.body.removeChild(backgroundElement);
            lexus(backgroundElement).removeEventHandler('click', closeMe);
        };

        function closeMe() {
            that.hide();
        }
    }

    function appendStyle(cssHtml) {
        if (!lexus.isObjectNull(bottomStyleSheet))
        {
            return bottomStyleSheet;
        }
        var style = document.createElement('style');
        style.innerHTML = cssHtml;
        document.head.appendChild(style);
        bottomStyleSheet = style.sheet;
        return bottomStyleSheet;
    }

    function appendBackground() {
        if (lexus.checkType(bgElement) === type.eElement) {
            return bgElement;
        }
        appendStyle(bgStyle);
        bgElement = document.createElement('div');
        lexus(bgElement).addClass('dockformV2-bg-div');
        bgElement.style.height = getbackgroundHeight() + 'px';

        return bgElement;
    }

    function getbackgroundHeight() {
        return document.documentElement.clientHeight;
    }

    return self;
}({})));