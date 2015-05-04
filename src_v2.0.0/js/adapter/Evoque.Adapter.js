//Dependency: Evoque.js
Evoque.adapter = (function (self)
{
    window.element = function (elementId) {
        return document.getElementById(elementId);
    };

    window.getAttr = function (element, name) {
        if (element) {
            return element.getAttribute(name);
        }
        else {
            return null;
        }
    };

    window.setAttr = function (element, name, value) {
        if (element) {
            element.setAttribute(name, value);
        }
    };

    window.delAttr = function (element, name) {
        if (element.getAttribute(name) == undefined || element.getAttribute(name) == null) {
            return;
        }
        element.removeAttribute(name);
    };

    window.AddEventHandler = function (element, evtName, callback, useCapture) {
        addEventHandler(element, evtName, callback, useCapture);
    };

    window.addEventHandler = function (element, evtName, callback, useCapture) {
        //DOM标准
        if (element.addEventListener) {
            element.addEventListener(evtName, callback, useCapture);
        }
        else {
            //IE方式,忽略useCapture参数
            element.attachEvent('on' + evtName, callback);
        }
    };

    window.removeEventHandler = function (element, evtName, callback, useCapture) {
        //DOM标准
        if (element.removeEventListener) {
            element.removeEventListener(evtName, callback, useCapture);
        }
        else {
            //IE方式,忽略useCapture参数
            element.detachEvent('on' + evtName, callback);
        }
    };

    window.IsObjectNull = function (obj) {
        if (obj == undefined || obj == null)
        {
            return true;
        }
        return false;
    };

    window.IsStringEmpty = function (str) {
        if (IsObjectNull(str) || str == '')
        {
            return true;
        }
        return false;
    };

    window.clearChild = function (element) {
        var array = lexus.makeArray(element.childNodes);
        for (var i = 0; i < array.length; ++i)
        {
            element.removeChild(array[i]);
        }
    };

    window.cancelEventFlow = function (event) {
        return lexus.cancelEventFlow(event);
    };

    window.cancelDefault = function (event) {
        return lexus.cancelDefault(event);
    };

    window.isObjectNull = function (obj) {
        return lexus.isObjectNull(obj);
    };

    window.isStringEmpty = function (str) {
        return lexus.isStringEmpty(str);
    };

    window.loadPage = function (url) {
        return lexus.loadPage(url);
    };

    window.makeArray = function (obj) {
        return lexus.makeArray(obj);
    };

    return self;
}(Evoque.adapter || {}));
