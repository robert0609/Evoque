var Evoque = (function (self)
{
    self.FrameworkName = 'Evoque.js';
    self.FrameworkVersion = '1.0.0';

    var _hasTouchEvent = 'ontouchstart' in window;
    //根据UserAgent判断访问网站的平台
    var _agent = navigator.userAgent.toLowerCase();
    window.mAgent = {
        other: 0,
        ios: 1,
        android: 2,
        windows: 3
    };
    window.mApp = {
        none: 0,
        tujia: 1,
        weixin: 2,
        gaode: 3,
        qqbrowser: 4,
        ucbrowser: 5,
        hmbrowser: 6
    };
    var _mAgent = mAgent.other;
    if (_agent.indexOf('android') > -1)
    {
        _mAgent = mAgent.android;
    }
    else if (_agent.indexOf('iphone') > -1 || _agent.indexOf('ipod') > -1 || _agent.indexOf('ipad') > -1)
    {
        _mAgent = mAgent.ios;
    }
    else if (_agent.indexOf('windows phone') > -1)
    {
        _mAgent = mAgent.windows;
    }
    var _mApp = mApp.none;
    if (_agent.indexOf('micromessenger') > -1)
    {
        _mApp = mApp.weixin;
    }
    else if (_agent.indexOf('mqqbrowser') > -1)
    {
        _mApp = mApp.qqbrowser;
    }
    else if (_agent.indexOf('ucbrowser') > -1)
    {
        _mApp = mApp.ucbrowser;
    }
    else if (_agent.indexOf('miuibrowser') > -1)
    {
        if (_agent.indexOf('build/hm') > -1)
        {
            _mApp = mApp.hmbrowser;
        }
    }

    window.type = {
        eUndefined: 'undefined',
        eNull: 'null',
        eNumber: 'number',
        eBoolean: 'boolean',
        eString: 'string',
        eFunction: 'function',
        eRegExp: 'regexp',
        eArray: 'array',
        eDate: 'date',
        eError: 'error',
        eNode: 'node',
        eElement: 'element',
        eArraylist: 'arraylist',
        eObject: 'object'
    };

    var class2type = {
        'undefined' : type.eUndefined,
        'number' : type.eNumber,
        'boolean' : type.eBoolean,
        'string' : type.eString,
        'function' : type.eFunction,
        '[object Boolean]' : type.eBoolean,
        '[object Number]' : type.eNumber,
        '[object String]' : type.eString,
        '[object Function]' : type.eFunction,
        '[object RegExp]' : type.eRegExp,
        '[object Array]' : type.eArray,
        '[object Date]' : type.eDate,
        '[object Error]' : type.eError
    };

    var core_toString = class2type.toString;
    var core_slice = Array.prototype.slice;
    var core_sort = Array.prototype.sort;
    function core_addReadyHandler(fn, useCapture)
    {
        //DOM标准
        if (document.addEventListener && $.checkType(fn) === type.eFunction) {
            document.addEventListener('DOMContentLoaded', fn, useCapture);
        }
    }

    function core_addLoadedHandler(fn, useCapture)
    {
        var evtName = 'load';
        if ((_mAgent === mAgent.ios) || (_mAgent === mAgent.android && (_mApp === mApp.qqbrowser || _mApp === mApp.ucbrowser)))
        {
            evtName = 'pageshow';
        }
        //DOM标准
        if (window.addEventListener && $.checkType(fn) === type.eFunction) {
            window.addEventListener(evtName, fn, useCapture);
        }
    }

    function core_addUnloadHandler(fn, useCapture)
    {
        var evtName = 'unload';
        if ((_mAgent === mAgent.ios) || (_mAgent === mAgent.android && (_mApp === mApp.qqbrowser || _mApp === mApp.ucbrowser)))
        {
            evtName = 'pagehide';
        }
        //DOM标准
        if (window.addEventListener && $.checkType(fn) === type.eFunction) {
            window.addEventListener(evtName, fn, useCapture);
        }
    }

    //Extension
    Date.prototype.toCustomString = function () {
        var y = Number(this.getFullYear());
        var m = Number(this.getMonth()) + 1;
        var d = Number(this.getDate());
        return y + '-' + m + '-' + d;
    };

    Date.prototype.getYMD = function () {
        return new Date(this.getFullYear(), this.getMonth(), this.getDate());
    };

    Date.prototype.addDay = function (n) {
        this.setDate(this.getDate() + Number(n));
        return this;
    };

    String.prototype.trim = function () {
        return this.replace(/\s/g, '');
    };

    /*
     *形如"yyyy-MM-dd"的字符床转换成日期
     */
    String.prototype.toDate = function () {
        if (!/^\d{1,4}-\d{1,2}-\d{1,2}$/.test(this))
        {
            throw 'Invalided string value!';
        }
        var strs = this.split('-');
        return new Date(Number(strs[0]), Number(strs[1]) - 1, Number(strs[2]));
    };

    String.prototype.getBytesLength = function() {
        return this.replace(/[^\x00-\xff]/gi, "--").length;
    };

    /**
     * 判断数组是否包含指定的元素
     * @param v
     * @return {Boolean}
     */
    Array.prototype.contains = function (v) {
        if ($.checkType(this.indexOf) === type.eFunction) {
            return this.indexOf(v) > -1;
        }
        else {
            var flag = false;
            $(this).each(function () {
                if (this === v) {
                    flag = true;
                    return false;
                }
            });
            return flag;
        }
    };

    window.$ = function (parameter)
    {
        var list = [];
        switch ($.checkType(parameter))
        {
            case type.eString:
                if (document.querySelectorAll) {
                    try
                    {
                        var ret = document.querySelectorAll(parameter);
                        if (ret !== null && ret.length > 0)
                        {
                            list = list.concat($.makeArray(ret));
                        }
                    }
                    catch (ex)
                    {
                    }
                }
                else {
                    throw 'Your brower does not support Evoque!';
                }
                break;
            case type.eNumber:
            case type.eBoolean:
            case type.eElement:
            case type.eNode:
            case type.eRegExp:
            case type.eDate:
            case type.eError:
            case type.eObject:
                list.push(parameter);
                break;
            case type.eArray:
                list = list.concat(parameter);
                break;
            case type.eArraylist:
                list = list.concat($.makeArray(parameter));
                break;
            case type.eFunction:
                core_addReadyHandler(parameter, false);
                break;
        }

        return new EvoqueClass(list);
    };

    function EvoqueClass(objArray)
    {
        var _innerArray = objArray;
        resetOrder.call(this);

        function resetOrder()
        {
            this.length = _innerArray.length;
            for (var i = 0; i < _innerArray.length; ++i)
            {
                this[i] = _innerArray[i];
            }
        }

        this.sort = function (fn) {
            if ($.checkType(fn) === type.eFunction)
            {
                core_sort.call(_innerArray, fn);
            }
            else
            {
                core_sort.call(_innerArray);
            }
            resetOrder.call(this);
            return this;
        };

        this.each = function (fn) {
            if ($.checkType(fn) === type.eFunction)
            {
                for (var i = 0; i < _innerArray.length; ++i)
                {
                    if (fn.call(_innerArray[i], i) === false)
                    {
                        break;
                    }
                }
            }
        };

        if (this.length === 0)
        {
            for (var fnName in self)
            {
                if ($.checkType(self[fnName]) === type.eFunction)
                {
                    this[fnName] = createFunction(fnName);
                }
            }
        }
    }
    EvoqueClass.prototype = self;

    function createFunction(fnName)
    {
        var ret = function ()
        {
            /*if (this.length == 0)
            {
                return null;
            }
            return self[fnName].apply(this, arguments);*/
            return null;
        };
        return ret;
    }

    //Global method begin
    $.agent = function () {
        return _mAgent;
    };

    $.app = function () {
        return _mApp;
    };

    $.cancelEventFlow = function (event) {
        event = event || window.event;
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        else {
            event.cancelBubble = true;
        }
    };

    $.cancelDefault = function (event) {
        event = event || window.event;
        if (event.preventDefault) {
            event.preventDefault();
        }
        else {
            event.returnValue = false;
        }
    };

    $.isObjectNull = function (obj)
    {
        if (obj === undefined)
        {
            return true;
        }
        if (!$.isObject(obj))
        {
            throw 'Parameter is not an object!';
        }
        return obj === null;
    };

    $.isStringEmpty = function (str)
    {
        var ty = $.checkType(str);
        if (ty === type.eUndefined || ty === type.eNull)
        {
            return true;
        }
        if (ty !== type.eString)
        {
            throw 'Parameter is not a string!';
        }
        if ($.isObject(str))
        {
            return str.valueOf() === '';
        }
        else
        {
            return str === '';
        }
    };

    $.isObject = function (obj)
    {
        return 'undefined,number,boolean,string'.indexOf(typeof obj) < 0;
    };

    $.checkType = function (obj)
    {
        var ty = typeof obj;
        if (class2type[ty])
        {
            return class2type[ty];
        }
        if (obj == null)
        {
            return type.eNull;
        }
        ty = core_toString.call(obj);
        if (class2type[ty])
        {
            return class2type[ty];
        }
        else if (obj instanceof Element)
        {
            return type.eElement;
        }
        else if (obj instanceof Node)
        {
            return type.eNode;
        }
        else if (isArrayList(obj))
        {
            return type.eArraylist;
        }
        else
        {
            return type.eObject;
        }
    };

    function isArrayList(obj)
    {
        /* Real arrays are array-like
         if (obj instanceof Array)
         {
         return true;
         }*/
        // Arrays must have a length property
        if (!('length' in obj))
        {
            return false;
        }
        // Length must be a number
        if (typeof obj.length != 'number')
        {
            return false;
        }
        // and nonnegative
        if (obj.length < 0)
        {
            return false;
        }
        if (obj.length > 0)
        {
            // If the array is nonempty, it must at a minimum
            // have a property defined whose name is the number length-1
            if (!((obj.length - 1) in obj))
            {
                return false;
            }
        }
        return true;
    }

    $.loadPage = function (url)
    {
        window.location.href = url;
    };

    $.makeArray = function (obj)
    {
        return core_slice.call(obj,0);
    };

    $.unload = function (fn)
    {
        core_addUnloadHandler(fn, false);
    };

    $.load = function (fn)
    {
        core_addLoadedHandler(fn, false);
    };

    /**
     *
     * @param fn
     * @param checkHandle: 由于fn有可能会发出异步的ajax调用，故需要调用房提供一个验证能否继续触发滚动事件的回调函数，checkHandle就是这个回调函数的指针
     * @param distance2Bottom
     */
    $.scroll2Bottom = function (fn, checkHandle)
    {
        //DOM标准
        if (window.addEventListener && $.checkType(fn) === type.eFunction) {
            window.addEventListener('scroll', function (e) {
                var bodyH = document.body.scrollHeight;
                var winH = document.documentElement.clientHeight;
                if (bodyH <= winH)
                {
                    return;
                }
                var h = bodyH - winH;
                var bo = h / 4;
                if ($.checkType(checkHandle) === type.eFunction)
                {
                    if (checkHandle.call(window) === false)
                    {
                        return;
                    }
                }
                var t = document.documentElement.scrollTop;
                if (t == 0)
                {
                    t = document.body.scrollTop;
                }
                if (h - t <= bo)
                {
                    fn.call(window, { currentScrollTop: t });
                }
            });
        }
    };

    $.hasTouchEvent = function ()
    {
        return _hasTouchEvent;
    };

    $.supportSessionStorage = function () {
        return !!window.sessionStorage;
    };
    //Global method end

    self.getVal = function () {
        var ret = null;
        switch ($.checkType(this[0]))
        {
            case type.eElement:
                if (this[0] instanceof HTMLInputElement || this[0] instanceof HTMLTextAreaElement)
                {
                    ret = this[0].value;
                    if ($.isStringEmpty(ret))
                    {
                        ret = this[0].getAttribute('value');
                    }
                }
                else
                {
                    ret = this[0].getAttribute('value');
                }
                break;
            case type.eNumber:
            case type.eBoolean:
                if ($.isObject(this[0]))
                {
                    ret = this[0].valueOf();
                }
                else
                {
                    ret = this[0];
                }
                break;
            case type.eDate:
                ret = this[0].toCustomString();
                break;
            default:
                ret = null;
                break;
        }
        return ret;
    };

    self.setVal = function (val) {
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement && this instanceof HTMLInputElement)
            {
                this.setAttribute('value', val);
                this.value = val;
            }
        });
    };

    self.getAttr = function (name) {
        if ($.checkType(this[0]) === type.eElement)
        {
            return this[0].getAttribute(name);
        }
        else
        {
            return null;
        }
    };

    self.setAttr = function (name, value) {
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement)
            {
                this.setAttribute(name, value);
            }
        });
    };

    self.delAttr = function (name) {
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement)
            {
                var t = this.getAttribute(name);
                if ((t !== undefined && t !== null))
                {
                    this.removeAttribute(name);
                }
            }
        });
    };

    self.setStyle = function (name, value) {
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement)
            {
                this.style[name] = value;
            }
        });
    };

    self.addEventHandler = function (evtName, callback, useCapture) {
        if ($.checkType(useCapture) !== type.eBoolean)
        {
            useCapture = false;
        }
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement)
            {
                //DOM标准
                if (this.addEventListener && $.checkType(callback) === type.eFunction) {
                    this.addEventListener(evtName, callback, useCapture);
                }
            }
        });
    };

    self.removeEventHandler = function (evtName, callback, useCapture) {
        if ($.checkType(useCapture) !== type.eBoolean)
        {
            useCapture = false;
        }
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement)
            {
                //DOM标准
                if (this.removeEventListener && $.checkType(callback) === type.eFunction) {
                    this.removeEventListener(evtName, callback, useCapture);
                }
            }
        });
    };

    self.getChild = function (query) {
        var list = [];
        if ($.checkType(this[0]) === type.eElement)
        {
            if ($.isStringEmpty(query))
            {
                list = $.makeArray(this[0].children);
            }
            else
            {
                var ret = this[0].querySelectorAll(query);
                if (ret !== null && ret.length > 0)
                {
                    list = $.makeArray(ret);
                }
            }
        }
        return new EvoqueClass(list);
    };

    self.clearChild = function () {
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement)
            {
                if (this.hasChildNodes())
                {
                    var lst = $.makeArray(this.childNodes);
                    for (var i = 0; i < lst.length; ++i)
                    {
                        this.removeChild(lst[i]);
                    }
                }
            }
        });
    };

    self.html = function (innerHtml) {
        var ty = $.checkType(this[0]);
        if (innerHtml === undefined)
        {
            if (ty === type.eElement)
            {
                return this[0].innerHTML;
            }
            else
            {
                return null;
            }
        }
        else
        {
            if (ty === type.eElement)
            {
                this[0].innerHTML = innerHtml;
            }
        }
    };

    self.getClassList = function () {
        if ($.checkType(this[0]) === type.eElement)
        {
            return $.makeArray(this[0].classList);
        }
        else
        {
            return [];
        }
    };

    self.addClass = function (className) {
        if ($.isStringEmpty(className))
        {
            return;
        }
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement)
            {
                if (!this.classList.contains(className))
                {
                    this.classList.add(className);
                }
            }
        });
    };

    self.removeClass = function (className) {
        if ($.isStringEmpty(className))
        {
            return;
        }
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement)
            {
                if (this.classList.contains(className))
                {
                    this.classList.remove(className);
                }
            }
        });
    };

    self.hide = function () {
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement)
            {
                this.style.display = 'none';
            }
        });
    };

    self.show = function () {
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement)
            {
                this.style.display = 'block';
            }
        });
    };

    self.isHide = function () {
        if ($.checkType(this[0]) === type.eElement)
        {
            var ret = false;
            var ele = this[0];
            var parent = ele.parentElement;
            while (ele.style.display != 'none' && !$.isObjectNull(parent))
            {
                ele = parent;
                parent = ele.parentElement;
            }
            if (ele.style.display == 'none')
            {
                ret = true;
            }
            return ret;
        }
        else
        {
            return false;
        }
    };

    self.enable = function () {
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement && (this instanceof HTMLSelectElement || this instanceof HTMLInputElement))
            {
                $(this).delAttr('disabled');
            }
        });
    };

    self.disable = function () {
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement && (this instanceof HTMLSelectElement || this instanceof HTMLInputElement))
            {
                $(this).setAttr('disabled', 'disabled');
            }
        });
    };

    self.getValueOfProperty = function (propertyName, defObj) {
        var isPropertyExistInThis = false;
        var isPropertyExistInDefObj = false;
        var thisType, defaultType;
        if (!$.isObjectNull(this[0]))
        {
            thisType = $.checkType(this[0][propertyName]);
            isPropertyExistInThis = thisType !== type.eUndefined && thisType !== type.eNull;
        }
        if ($.isObjectNull(defObj))
        {
            defObj = {};
        }
        else
        {
            defaultType = $.checkType(defObj[propertyName]);
            isPropertyExistInDefObj = defaultType !== type.eUndefined && defaultType !== type.eNull;
        }

        if (isPropertyExistInThis)
        {
            if (isPropertyExistInDefObj)
            {
                if (thisType !== defaultType)
                {
                    throw 'type of [' + propertyName + '] is error!';
                }
            }
            return this[0][propertyName];
        }
        else
        {
            return defObj[propertyName];
        }
    };

    self.dispatchClick = function () {
        var evt = document.createEvent('MouseEvents');
        evt.initEvent('click', true, true);
        this.each(function () {
            this.dispatchEvent(evt);
        });
    };

    return self;
}(Evoque || {}));