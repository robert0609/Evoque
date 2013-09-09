var Evoque = (function (self)
{
    self.FrameworkName = 'Evoque.js';
    self.FrameworkVersion = '1.0.0';

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
    function core_addLoadedEvent(fn, useCapture)
    {
        //DOM标准
        if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', fn, useCapture);
        }
        else {
            //IE方式,忽略useCapture参数
            window.attachEvent('onload', fn);
        }
    }

    //Global method
    Object.prototype.getValueOfProperty = function (propertyName, defObj)
    {
        var isPropertyExistInThis = false;
        var isPropertyExistInDefObj = false;
        var thisType, defaultType;
        if (!isObjectNull(this))
        {
            thisType = checkType(this[propertyName]);
            isPropertyExistInThis = thisType !== type.eUndefined && thisType !== type.eNull;
        }
        if (!isObjectNull(defObj))
        {
            defaultType = checkType(defObj[propertyName]);
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
            return this[propertyName];
        }
        else
        {
            return defObj[propertyName];
        }
    };

    Date.prototype.toCustomString = function () {
        var y = Number(this.getFullYear());
        var m = Number(this.getMonth()) + 1;
        var d = Number(this.getDate());
        return y + '-' + m + '-' + d;
    };

    window.cancelEventFlow = function (event) {
        event = event || window.event;
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        else {
            event.cancelBubble = true;
        }
    };

    window.cancelDefault = function (event) {
        event = event || window.event;
        if (event.preventDefault) {
            event.preventDefault();
        }
        else {
            event.returnValue = false;
        }
    };

    window.isObjectNull = function (obj)
    {
        if (obj === undefined)
        {
            return true;
        }
        if (!isObject(obj))
        {
            throw 'Parameter is not an object!';
        }
        return obj === null;
    };

    window.isStringEmpty = function (str)
    {
        var ty = checkType(str);
        if (ty === type.eUndefined || ty === type.eNull)
        {
            return true;
        }
        if (ty !== type.eString)
        {
            throw 'Parameter is not a string!';
        }
        if (isObject(str))
        {
            return str.valueOf() === '';
        }
        else
        {
            return str === '';
        }
    };

    window.isObject = function (obj)
    {
        return 'undefined,number,boolean,string'.indexOf(typeof obj) < 0;
    };

    window.checkType = function (obj)
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
        else if (isArrayList(obj))
        {
            return type.eArraylist;
        }
        else if (obj instanceof Element)
        {
            return type.eElement;
        }
        else if (obj instanceof Node)
        {
            return type.eNode;
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

    window.loadPage = function (url)
    {
        window.location.href = url;
    };

    window.makeArray = function (obj)
    {
        return core_slice.call(obj,0);
    };

    window.$ = function (parameter)
    {
        var list = [];
        switch (checkType(parameter))
        {
            case type.eString:
                if (document.querySelectorAll) {
                    try
                    {
                        var ret = document.querySelectorAll(parameter);
                        if (ret !== null && ret.length > 0)
                        {
                            list = list.concat(makeArray(ret));
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
                list = list.concat(makeArray(parameter));
                break;
            case type.eFunction:
                core_addLoadedEvent(parameter, false);
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

        this.sort = function (fn)
        {
            if (checkType(fn) === type.eFunction)
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

        this.each = function (fn)
        {
            if (checkType(fn) === type.eFunction)
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

        this.getVal = function () {
            var ret = null;
            if (_innerArray.length > 0)
            {
                switch (checkType(_innerArray[0]))
                {
                    case type.eElement:
                        ret = _innerArray[0].getAttribute('value');
                        break;
                    case type.eNumber:
                    case type.eBoolean:
                        if (isObject(_innerArray[0]))
                        {
                            ret = _innerArray[0].valueOf();
                        }
                        else
                        {
                            ret = _innerArray[0];
                        }
                        break;
                    case type.eDate:
                        ret = _innerArray[0].toCustomString();
                        break;
                    default:
                        ret = _innerArray[0].toString();
                        break;
                }
            }
            return ret;
        };

        for (var fnName in self)
        {
            if (checkType(self[fnName]) === type.eFunction)
            {
                this[fnName] = createFunction(fnName);
            }
        }
    }
    EvoqueClass.prototype = self;

    function createFunction(fnName)
    {
        var ret = function ()
        {
            if (this.length == 0)
            {
                return;
            }
            return self[fnName].apply(this, arguments);
        };
        return ret;
    }

    self.getAttr = function (name) {
        if (checkType(this[0]) === type.eElement)
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
            if (checkType(this) === type.eElement)
            {
                this.setAttribute(name, value);
            }
        });
    };

    self.delAttr = function (name) {
        this.each(function ()
        {
            if (checkType(this) === type.eElement)
            {
                var t = this.getAttribute(name);
                if ((t !== undefined && t !== null))
                {
                    this.removeAttribute(name);
                }
            }
        });
    };

    self.addEventHandler = function (evtName, callback, useCapture) {
        this.each(function ()
        {
            if (checkType(this) === type.eElement)
            {
                //DOM标准
                if (this.addEventListener) {
                    this.addEventListener(evtName, callback, useCapture);
                }
                else {
                    //IE方式,忽略useCapture参数
                    this.attachEvent('on' + evtName, callback);
                }
            }
        });
    };

    self.removeEventHandler = function (evtName, callback, useCapture) {
        this.each(function ()
        {
            if (checkType(this) === type.eElement)
            {
                //DOM标准
                if (this.removeEventListener) {
                    this.removeEventListener(evtName, callback, useCapture);
                }
                else {
                    //IE方式,忽略useCapture参数
                    this.detachEvent('on' + evtName, callback);
                }
            }
        });
    };

    self.getChild = function (query) {
        var list = [];
        if (checkType(this[0]) === type.eElement)
        {
            if (isStringEmpty(query))
            {
                list = makeArray(this[0].children);
            }
            else
            {
                var ret = this[0].querySelectorAll(query);
                if (ret !== null && ret.length > 0)
                {
                    list = makeArray(ret);
                }
            }
        }
        return new EvoqueClass(list);
    };

    self.clearChild = function () {
        this.each(function ()
        {
            if (checkType(this) === type.eElement)
            {
                if (this.hasChildNodes())
                {
                    var lst = makeArray(this.childNodes);
                    for (var i = 0; i < lst.length; ++i)
                    {
                        this.removeChild(lst[i]);
                    }
                }
            }
        });
    };

    self.html = function (innerHtml) {
        var ty = checkType(this[0]);
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
        if (checkType(this[0]) === type.eElement)
        {
            return makeArray(this[0].classList);
        }
        else
        {
            return [];
        }
    };

    self.addClass = function (className) {
        this.each(function ()
        {
            if (checkType(this) === type.eElement)
            {
                if (!this.classList.contains(className))
                {
                    this.classList.add(className);
                }
            }
        });
    };

    self.removeClass = function (className) {
        this.each(function ()
        {
            if (checkType(this) === type.eElement)
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
            if (checkType(this) === type.eElement)
            {
                this.style.display = 'none';
            }
        });
    };

    self.show = function () {
        this.each(function ()
        {
            if (checkType(this) === type.eElement)
            {
                this.style.display = 'block';
            }
        });
    };

    self.enable = function () {
        this.each(function ()
        {
            if (checkType(this) === type.eElement && (this instanceof HTMLSelectElement || this instanceof HTMLInputElement))
            {
                $(this).delAttr('disabled');
            }
        });
    };

    self.disable = function () {
        this.each(function ()
        {
            if (checkType(this) === type.eElement && (this instanceof HTMLSelectElement || this instanceof HTMLInputElement))
            {
                $(this).setAttr('disabled', 'disabled');
            }
        });
    };

    return self;
}(Evoque || {}));