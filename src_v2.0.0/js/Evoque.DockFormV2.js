//Dependency: Evoque.js
Evoque.extend('dockFormV2', (function (self) {
    var defaultOption = {
        content: '',
        // top|bottom|left|right. default: bottom
        direction: 'bottom',
        onPopup: function () { },
        onPackup: function () { }
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
        var onPopup = option.getValueOfProperty('onPopup', defaultOption);
        var onPackup = option.getValueOfProperty('onPackup', defaultOption);

        var caller = self.evoqueTarget;
        if (caller.length > 0) {
            var element = caller[0];
            if (lexus.isObjectNull(element.__dockForm)) {
                element.__dockForm = new dockFormClass(element, evoqueContent[0], dir, onPopup, onPackup);
            }
        }
    };

    self.popup = function (popupCompleted) {
        var caller = self.evoqueTarget;
        if (caller.length > 0) {
            var element = caller[0];
            if (lexus.isObjectNull(element.__dockForm)) {
                return;
            }
            //判断是否有互斥的dockForm，如果有则收起其他互斥的dockForm
            var grp = caller.getAttr(dockGroupAttr);
            var breakFlag = false;
            if (!lexus.isStringEmpty(grp))
            {
                var evoqueGrp = lexus('*[' + dockGroupAttr + '="' + grp + '"]');
                if (evoqueGrp.length > 1) {
                    evoqueGrp.each(function () {
                        var evoqueThis = lexus(this);
                        if (evoqueThis.dockFormV2.guid() !== element.__dockForm.guid() && evoqueThis.dockFormV2.isPopup()) {
                            evoqueThis.dockFormV2.packup(function () {
                                element.__dockForm.popup(popupCompleted);
                            });
                            breakFlag = true;
                            return false;
                        }
                    });
                }
            }
            if (!breakFlag)
            {
                element.__dockForm.popup(popupCompleted);
            }
        }
    };

    self.packup = function (packupCompleted) {
        var caller = self.evoqueTarget;
        if (caller.length > 0) {
            var element = caller[0];
            if (lexus.isObjectNull(element.__dockForm)) {
                return;
            }
            element.__dockForm.packup(packupCompleted);
        }
    };

    self.show = function () {
        var caller = self.evoqueTarget;
        if (caller.length > 0) {
            var element = caller[0];
            if (lexus.isObjectNull(element.__dockForm)) {
                return;
            }
            element.__dockForm.show();
        }
    };

    self.hide = function () {
        var caller = self.evoqueTarget;
        if (caller.length > 0) {
            var element = caller[0];
            if (lexus.isObjectNull(element.__dockForm)) {
                return;
            }
            element.__dockForm.hide();
        }
    };

    self.isPopup = function () {
        var caller = self.evoqueTarget;
        if (caller.length > 0) {
            var element = caller[0];
            if (lexus.isObjectNull(element.__dockForm)) {
                return false;
            }
            return element.__dockForm.isPopup();
        }
        return false;
    };

    self.guid = function () {
        var caller = self.evoqueTarget;
        if (caller.length > 0) {
            var element = caller[0];
            if (lexus.isObjectNull(element.__dockForm)) {
                return null;
            }
            return element.__dockForm.guid();
        }
        return null;
    };

    function dockFormClass(dockElement, contentElement, direction, onPopup, onPackup) {
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

        var popupCompletedCallback = null;
        var packupCompletedCallback = null;

        var __instanceId = lexus.guid();

        var isPopup = false;
        evoqueContentElement.addEventHandler('transitionEnd', function () {
            if (isPopup) {
                onPopup.call(contentElement);
                if (lexus.checkType(popupCompletedCallback) === type.eFunction) {
                    popupCompletedCallback.call(contentElement);
                }
            }
            else {
                onPackup.call(contentElement);
                if (lexus.checkType(packupCompletedCallback) === type.eFunction) {
                    packupCompletedCallback.call(contentElement);
                }
            }
        }, { useEventPrefix: true });

        var that = this;
        this.popup = function (popupCompleted) {
            if (isPopup) {
                return;
            }
            isPopup = true;
            popupCompletedCallback = popupCompleted;
            lexus(backgroundElement).click(closeMe);
            document.body.appendChild(backgroundElement);
            evoqueContentElement.addClass('show');
        };

        this.packup = function (packupCompleted) {
            if (!isPopup) {
                return;
            }
            isPopup = false;
            packupCompletedCallback = packupCompleted;
            evoqueContentElement.removeClass('show');
            document.body.removeChild(backgroundElement);
            lexus(backgroundElement).removeEventHandler('click', closeMe);
        };

        this.show = function () {
            evoqueContentElement.show();
            lexus(backgroundElement).show();
        };
        this.hide = function () {
            evoqueContentElement.hide();
            lexus(backgroundElement).hide();
        };

        this.isPopup = function () {
            return isPopup;
        };

        this.guid = function () {
            return __instanceId;
        };

        function closeMe() {
            that.packup();
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
        var style = document.createElement('style');
        style.innerHTML = bgStyle;
        document.head.appendChild(style);

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