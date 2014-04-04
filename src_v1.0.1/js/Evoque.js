var Evoque = (function (self)
{
    self.FrameworkName = 'Evoque.js';
    self.FrameworkVersion = '1.0.1';

    var _hasTouchEvent = 'ontouchstart' in window;
    //根据UserAgent判断访问网站的平台
    var _agent = navigator.userAgent.toLowerCase();
    /**
     * 标识当前UserAgent的字典变量
     * @type {Object}
     */
    window.mAgent = {
        other: 0,
        ios: 1,
        android: 2,
        windows: 3
    };
    /**
     * 标识承载当前页面的UserAgent的APP种别
     * @type {Object}
     */
    window.mApp = {
        none: 0,
        tujia: 1,
        weixin: 2,
        gaode: 3,
        qqbrowser: 4,
        ucbrowser: 5
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

    /**
     * 数据类型字典变量
     * @type {Object}
     */
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
    /**
     * 日期类型转换成字符串：Date --> 'yyyy-MM-dd'
     * @return {String}
     */
    Date.prototype.toCustomString = function () {
        var y = Number(this.getFullYear());
        var m = Number(this.getMonth()) + 1;
        var d = Number(this.getDate());
        return y + '-' + m + '-' + d;
    };

    /**
     * 获取日期的日期部分
     * @return {Date}
     */
    Date.prototype.getYMD = function () {
        return new Date(this.getFullYear(), this.getMonth(), this.getDate());
    };

    /**
     * 日期增加指定天数
     * @param n 天数
     * @return {Date}
     */
    Date.prototype.addDay = function (n) {
        this.setDate(this.getDate() + Number(n));
        return this;
    };

    /**
     * 删除字符串两边的指定字符，若参数为空则删除空格
     * @param c 指定字符
     * @return {String}
     */
    String.prototype.trim = function (c) {
        if ($.isStringEmpty(c))
        {
            c = ' ';
        }
        var si = -1;
        for (var i = 0; i < this.length; ++i)
        {
            if (this[i] != c)
            {
                si = i;
                break;
            }
        }
        if (si < 0)
        {
            return '';
        }
        var ei = -1;
        for (var j = this.length - 1; j >= 0; --j)
        {
            if (this[j] != c)
            {
                ei = j;
                break;
            }
        }
        return this.substring(si, ei + 1);
    };

    /**
     * 形如"yyyy-MM-dd"的字符床转换成日期
     * @return {Date}
     */
    String.prototype.toDate = function () {
        if (!/^\d{1,4}-\d{1,2}-\d{1,2}$/.test(this))
        {
            throw 'Invalided string value!';
        }
        var strs = this.split('-');
        return new Date(Number(strs[0]), Number(strs[1]) - 1, Number(strs[2]));
    };

    /**
     * 获取字符串的字节数
     * @return {Number}
     */
    String.prototype.getBytesLength = function() {
        return this.replace(/[^\x00-\xff]/gi, "--").length;
    };

    /**
     * 获取Evoque包装对象
     * @param parameter 可以是CSS选择器、js变量、DOM对象，也可以是DOMReady事件的回调函数
     * @return {EvoqueClass}
     */
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

    function array2Dictionary(arr)
    {
        this.length = arr.length;
        for (var i = 0; i < arr.length; ++i)
        {
            this[i] = arr[i];
        }
    }

    function EvoqueClass(objArray) {
        this.innerObjectList = objArray;
        array2Dictionary.call(this, this.innerObjectList);
    }
    EvoqueClass.prototype = self;

    //Global method begin
    /**
     * 获取当前UserAgent的标识码
     * @return {*}
     */
    $.agent = function () {
        return _mAgent;
    };

    /**
     * 终止事件流
     * @param event
     */
    $.cancelEventFlow = function (event) {
        event = event || window.event;
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        else {
            event.cancelBubble = true;
        }
    };

    /**
     * 取消事件的默认行为
     * @param event
     */
    $.cancelDefault = function (event) {
        event = event || window.event;
        if (event.preventDefault) {
            event.preventDefault();
        }
        else {
            event.returnValue = false;
        }
    };

    /**
     * 判断对象是否为空
     * @param obj
     * @return {Boolean}
     */
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

    /**
     * 判断字符串是否为空
     * @param str
     * @return {Boolean}
     */
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

    /**
     * 判断参数是否为对象
     * @param obj
     * @return {Boolean}
     */
    $.isObject = function (obj)
    {
        return 'undefined,number,boolean,string'.indexOf(typeof obj) < 0;
    };

    /**
     * 判断参数的类型
     * @param obj
     * @return {window.type}
     */
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

    /**
     * 加载Url
     * @param url
     */
    $.loadPage = function (url)
    {
        window.location.href = url;
    };

    /**
     * 集合对象转换为数组
     * @param obj
     * @return {*}
     */
    $.makeArray = function (obj)
    {
        return core_slice.call(obj,0);
    };

    /**
     * 绑定页面卸载的事件，*对支持页面间缓存的UserAgent来说，则是绑定pageHide事件
     * @param fn
     */
    $.unload = function (fn)
    {
        core_addUnloadHandler(fn, false);
    };

    /**
     * 绑定页面加载的事件，*对支持页面间缓存的UserAgent来说，则是绑定pageShow事件
     * @param fn
     */
    $.load = function (fn)
    {
        core_addLoadedHandler(fn, false);
    };

    /**
     * 绑定页面滚动至页面底部1/4位置的事件
     * @param fn
     * @param checkHandle: 由于fn有可能会发出异步的ajax调用，故需要调用方提供一个控制能否继续触发滚动事件的回调函数，checkHandle就是这个回调函数的指针
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

    $.scrollTo = function (destinationX, destinationY) {
        var dx = destinationX - window.pageXOffset;
        var dy = destinationY - window.pageYOffset;
        var vys = dy == 0 ? 0 : (dy > 0 ? 30 : -30);
        var vxs = dx == 0 ? 0 : (vys == 0 ? (dx > 0 ? 30 : -30) : (vys * dx / dy));
        var vy = dy == 0 ? 0 : (dy > 0 ? Math.max(vys, dy / 40) : Math.min(vys, dy / 40));
        var vx = dx == 0 ? 0 : (vy == 0 ? (dx > 0 ? Math.max(vxs, dx / 40) : Math.min(vxs, dx / 40)) : (vy * dx / dy));
        //var ay = dy == 0 ? 0 : (dy > 0 ? 5 : -5);
        //var ax = dx == 0 ? 0 : (ay == 0 ? (dx > 0 ? 5 : -5) : (ay * dx / dy));
        var ay = 0, ax = 0;

        var thresholdDx = Math.abs(dx) / 2;
        var thresholdDy = Math.abs(dy) / 2;
        var changedAxDirection = false;
        var changedAyDirection = false;
        var reachedX = dx == 0 ? true : false;
        var reachedY = dy == 0 ? true : false;
        var intervalId = window.setInterval(function ()
        {
            var currentX = window.pageXOffset;
            var currentY = window.pageYOffset;
            var nextX = currentX + vx;
            if (reachedX)
            {
                nextX = destinationX;
            }
            else if ((vx > 0 && nextX > destinationX) || (vx < 0 && nextX < destinationX))
            {
                nextX = destinationX;
                reachedX = true;
            }
            var nextY = currentY + vy;
            if (reachedY)
            {
                nextY = destinationY;
            }
            else if ((vy > 0 && nextY > destinationY) || (vy < 0 && nextY < destinationY))
            {
                nextY = destinationY;
                reachedY = true;
            }
            window.scrollTo(nextX, nextY);
            if (reachedX && reachedY)
            {
                window.clearInterval(intervalId);
                return;
            }
            //设置速度
            vx += ax;
            if (Math.abs(vx) < Math.abs(ax))
            {
                vx = 0 - ax;
            }
            vy += ay;
            if (Math.abs(vy) < Math.abs(ay))
            {
                vy = 0 - ay;
            }
            //路程过半则调转加速度的方向
            if (!changedAxDirection && Math.abs(destinationX - currentX) < thresholdDx)
            {
                ax = 0 - ax;
                changedAxDirection = true;
            }
            if (!changedAyDirection && Math.abs(destinationY - currentY) < thresholdDy)
            {
                ay = 0 - ay;
                changedAyDirection = true;
            }
        }, 25);
    };

    /**
     * 判断是否支持触屏事件
     * @return {Boolean}
     */
    $.hasTouchEvent = function ()
    {
        return _hasTouchEvent;
    };

    /**
     * 胖墩是否支持离线存储
     * @return {Boolean}
     */
    $.supportSessionStorage = function () {
        return !!window.sessionStorage;
    };

    var _chars16 = '0123456789ABCDEF'.split('');
    /**
     * 生成GUID
     * @return {String}
     */
    $.guid = function () {
        var uuid = [], i;
        // rfc4122, version 4 form
        var r;
        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++)
        {
            if (!uuid[i])
            {
                r = 0 | Math.random()*16;
                uuid[i] = _chars16[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
        return uuid.join('');
    };
    //Global method end

    /**
     * 按照传入的规则fn对包装集中的对象排序
     * @param fn
     * @return {*}
     */
    self.sort = function (fn) {
        if ($.checkType(fn) === type.eFunction)
        {
            core_sort.call(this.innerObjectList, fn);
        }
        array2Dictionary.call(this, this.innerObjectList);
        return this;
    };

    /**
     * 循环遍历包装集中的对象
     * @param fn
     */
    self.each = function (fn) {
        if ($.checkType(fn) === type.eFunction)
        {
            for (var i = 0; i < this.length; ++i)
            {
                if (fn.call(this[i], i) === false)
                {
                    break;
                }
            }
        }
    };

    /**
     * 获取表单项或基本数据类型的值
     * @return {*}
     */
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

    /**
     * 设置表单项的值
     * @param val
     */
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

    /**
     * 获取Html标签的Attribute值
     * @param name Attribute名称
     * @return {String}
     */
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

    /**
     * 设置Html标签的Attribute值
     * @param name Attribute名称
     * @param value Attribute值
     */
    self.setAttr = function (name, value) {
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement)
            {
                this.setAttribute(name, value);
            }
        });
    };

    /**
     * 删除Attribute
     * @param name
     */
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

    /**
     * 设置Html标签的Style
     * @param name
     * @param value
     */
    self.setStyle = function (name, value) {
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement)
            {
                this.style[name] = value;
            }
        });
    };

    /**
     * 根据CSS选择器获取子节点
     * @param query
     * @return {EvoqueClass}
     */
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

    /**
     * 清空子节点
     */
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

    /**
     * 设置节点的内部Html。若innerHtml参数被忽略则是返回当前节点的内部Html
     * @param innerHtml
     * @return {*}
     */
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

    /**
     * 设置节点的内部Text。若innerText参数被忽略则是返回当前节点的内部Text
     * @param innerText
     * @return {*}
     */
    self.text = function (innerText) {
        var ty = $.checkType(this[0]);
        if (innerText === undefined)
        {
            if (ty === type.eElement)
            {
                return this[0].innerText;
            }
            else
            {
                return '';
            }
        }
        else
        {
            if (ty === type.eElement)
            {
                this[0].innerText = innerText;
            }
        }
    };

    /**
     * 获取节点的class列表
     * @return {Array}
     */
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

    /**
     * 添加节点的css类
     * @param className
     */
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

    /**
     * 删除节点的类
     * @param className
     */
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

    /**
     * 隐藏DOM节点
     */
    self.hide = function () {
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement)
            {
                this.style.display = 'none';
            }
        });
    };

    /**
     * 显示DOM节点
     */
    self.show = function () {
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement)
            {
                this.style.display = '';
            }
        });
    };

    /**
     * 判断DOM节点是否隐藏
     * @return {Boolean}
     */
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

    /**
     * 设置表单项或者下拉框的可用状态
     */
    self.enable = function () {
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement && (this instanceof HTMLSelectElement || this instanceof HTMLInputElement))
            {
                $(this).delAttr('disabled');
            }
        });
    };

    /**
     * 设置表单项或者下拉框的禁用状态
     */
    self.disable = function () {
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement && (this instanceof HTMLSelectElement || this instanceof HTMLInputElement))
            {
                $(this).setAttr('disabled', 'disabled');
            }
        });
    };

    /**
     * 获取对象指定属性的辅助方法。若该对象的指定属性为空或者类型与默认对象中同名属性不一致，则从默认对象中获取同名属性的数据
     * @param propertyName 属性名
     * @param defObj 默认对象
     * @return {*}
     */
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

    /**
     * 触发Click事件
     */
    self.dispatchClick = function () {
        var evt = document.createEvent('MouseEvents');
        evt.initEvent('click', true, true);
        this.each(function () {
            this.dispatchEvent(evt);
        });
    };

    /**
     * 绑定Click事件，若支持触屏事件，则绑定Tap事件
     * @param callback
     */
    self.click = function (callback) {
        if (_hasTouchEvent)
        {
            this.tap(callback);
        }
        else
        {
            this.addEventHandler('click', callback);
        }
    };

    /**
     * 绑定Html元素的事件处理回调
     * @param evtName 事件名
     * @param callback 处理回调
     * @param useCapture 捕获模式开关
     */
    self.addEventHandler = function (evtName, callback, useCapture) {
        if ($.checkType(useCapture) !== type.eBoolean)
        {
            useCapture = false;
        }
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement)
            {
                if (_customEvents.hasOwnProperty(evtName))
                {
                    innerBindCustomEvent(this, evtName, callback);
                }
                else
                {
                    //DOM标准
                    if (this.addEventListener && $.checkType(callback) === type.eFunction) {
                        this.addEventListener(evtName, callback, useCapture);
                    }
                }
            }
        });
    };

    /**
     * 移除Html元素的事件处理回调
     * @param evtName 事件名
     * @param callback 处理回调
     * @param useCapture 捕获模式开关
     */
    self.removeEventHandler = function (evtName, callback, useCapture) {
        if ($.checkType(useCapture) !== type.eBoolean)
        {
            useCapture = false;
        }
        this.each(function ()
        {
            if ($.checkType(this) === type.eElement)
            {
                if (_customEvents.hasOwnProperty(evtName))
                {
                    innerUnbindCustomEvent(this, evtName, callback);
                }
                else
                {
                    //DOM标准
                    if (this.removeEventListener && $.checkType(callback) === type.eFunction) {
                        this.removeEventListener(evtName, callback, useCapture);
                    }
                }
            }
        });
    };

    /**
     * 声明自定义事件
     * @param evtName 自定义事件名称
     * @return {*}
     */
    $.declareCustomEvent = function (evtName) {
        return innerDeclareCustomEvent(evtName);
    }

    /**
     * 触发自定义事件
     * @param evtName 自定义事件名称
     * @param arg 自定义事件参数
     */
    self.dispatchCustomEvent = function (evtName, arg) {
        this.each(function () {
            innerDispatchCustomEvent(this, evtName, arg);
        });
    };

    var _customEvents = {};
    function innerDeclareCustomEvent(evt) {
        var evtListName = '__' + evt + 'List';
        _customEvents[evt] = evtListName;
    }

    function innerDispatchCustomEvent(ele, evt, arg) {
        if ($.checkType(ele) !== type.eElement)
        {
            return;
        }
        if (!_customEvents.hasOwnProperty(evt))
        {
            return;
        }
        var evtListName = _customEvents[evt];
        if ($.isStringEmpty(evtListName) || $.checkType(ele[evtListName]) !== type.eArray)
        {
            return;
        }
        $(ele[evtListName]).each(function () {
            if ($.checkType(this) === type.eFunction)
            {
                this.call(ele, arg);
            }
        });
    }

    function innerBindCustomEvent(ele, evt, callback) {
        var evtListName = _customEvents[evt];
        if ($.isStringEmpty(evtListName))
        {
            innerDeclareCustomEvent(evt);
            evtListName = _customEvents[evt];
        }
        if (_hasTouchEvent && touchEventType.hasOwnProperty(evt))
        {
            innerBindTouchEvent(ele);
        }
        if ($.checkType(ele) === type.eElement && $.checkType(callback) === type.eFunction)
        {
            if ($.checkType(ele[evtListName]) !== type.eArray)
            {
                ele[evtListName] = [];
            }
            ele[evtListName].push(callback);
        }
    }

    function innerUnbindCustomEvent(ele, evt, callback) {
        var evtListName = _customEvents[evt];
        if ($.isStringEmpty(evtListName))
        {
            innerDeclareCustomEvent(evt);
            evtListName = _customEvents[evt];
        }
        if ($.checkType(ele) === type.eElement && $.checkType(callback) === type.eFunction)
        {
            if ($.checkType(ele[evtListName]) !== type.eArray)
            {
                ele[evtListName] = [];
            }
            var idx = -1;
            for (var i = 0; i < ele[evtListName].length; ++i)
            {
                if (ele[evtListName][i] === callback)
                {
                    idx = i;
                    break;
                }
            }
            if (idx > -1)
            {
                ele[evtListName].splice(idx, 1);
            }
        }
    }

    if (_hasTouchEvent)
    {
        var touchEventType = {
            tap: 'tap',
            swipeUp: 'swipeup',
            swipeDown: 'swipedown',
            swipeLeft: 'swipeleft',
            swipeRight: 'swiperight'
        };
        innerDeclareCustomEvent(touchEventType.tap);
        innerDeclareCustomEvent(touchEventType.swipeUp);
        innerDeclareCustomEvent(touchEventType.swipeDown);
        innerDeclareCustomEvent(touchEventType.swipeLeft);
        innerDeclareCustomEvent(touchEventType.swipeRight);

        //触屏事件
        /**
         * 绑定Tap轻击事件
         * @param callback
         */
        self.tap = function (callback) {
            this.addEventHandler(touchEventType.tap, callback);
        };
        /**
         * 绑定上滑事件
         * @param callback
         */
        self.swipeUp = function (callback) {
            this.addEventHandler(touchEventType.swipeUp, callback);
        };
        /**
         * 绑定下滑事件
         * @param callback
         */
        self.swipeDown = function (callback) {
            this.addEventHandler(touchEventType.swipeDown, callback);
        };
        /**
         * 绑定左滑事件
         * @param callback
         */
        self.swipeLeft = function (callback) {
            this.addEventHandler(touchEventType.swipeLeft, callback);
        };
        /**
         * 绑定右滑事件
         * @param callback
         */
        self.swipeRight = function (callback) {
            this.addEventHandler(touchEventType.swipeRight, callback);
        };

        function innerBindTouchEvent(ele)
        {
            if (ele.__isBindTouchEvent)
            {
                return;
            }
            var $ele = $(ele);
            var touchStateDictionary = {};

            $ele.addEventHandler('touchstart', function (e) {
                if (e.touches.length !== 1)
                {
                    return;
                }
                var touchState = new TouchStateClass(e.touches[0].identifier);
                touchState.addTouchPoint(new PointClass(e.touches[0].clientX, e.touches[0].clientY));
                touchStateDictionary[e.touches[0].identifier] = touchState;
            });
            $ele.addEventHandler('touchmove', function (e) {
                if (e.touches.length !== 1)
                {
                    return;
                }
                var touchState = touchStateDictionary[e.touches[0].identifier];
                touchState.addTouchPoint(new PointClass(e.touches[0].clientX, e.touches[0].clientY));
            });
            $ele.addEventHandler('touchend', function (e) {
                if (e.changedTouches.length !== 1 || e.touches.length !== 0)
                {
                    return;
                }
                var touchState = touchStateDictionary[e.changedTouches[0].identifier];
                touchState.addTouchPoint(new PointClass(e.changedTouches[0].clientX, e.changedTouches[0].clientY));
                touchState.touchEndTime = new Date();
                var evtTyp = touchState.touchType();
                var that = this;
                $(evtTyp).each(function () {
                    innerDispatchCustomEvent(that, this);
                });
            });

            ele.__isBindTouchEvent = true;

            function TouchStateClass(identifier)
            {
                var identifier = identifier;
                this.touchStartTime = new Date();
                this.touchEndTime = null;
                this.touchPointList = [];
                this.directionX = 0;
                this.directionY = 0;
                this.isSameDirection = true;
                this.rangeX = 0;
                this.rangeY = 0;

                this.addTouchPoint = function (point) {
                    if (this.touchPointList.length > 0)
                    {
                        var sp = this.touchPointList[0];
                        var rx = Math.abs(point.x - sp.x);
                        var ry = Math.abs(point.y - sp.y);
                        this.rangeX = Math.max(this.rangeX, rx);
                        this.rangeY = Math.max(this.rangeY, ry);

                        var lp = this.touchPointList[this.touchPointList.length - 1];
                        var dx = point.x - lp.x == 0 ? 0 : (point.x - lp.x > 0 ? 1 : -1);
                        var dy = point.y - lp.y == 0 ? 0 : (point.y - lp.y > 0 ? 1 : -1);
                        if (this.touchPointList.length >= 2)
                        {
                            var sameX = this.directionX == 0 || dx == 0 ? true : (this.directionX == dx);
                            var sameY = this.directionY == 0 || dy == 0 ? true : (this.directionY == dy);
                            this.isSameDirection = sameX && sameY;
                        }
                        if (dx != 0)
                        {
                            this.directionX = dx;
                        }
                        if (dy != 0)
                        {
                            this.directionY = dy;
                        }
                    }
                    this.touchPointList.push(point);
                };

                this.touchType = function () {
                    var types = [];
                    if ($.checkType(this.touchEndTime) !== type.eDate)
                    {
                        return types;
                    }
                    var sp = this.touchPointList[0];
                    var touchSpan = this.touchEndTime - this.touchStartTime;
                    //tap
                    if (touchSpan < 750 && this.rangeX < 4 && this.rangeY < 4)
                    {
                        types.push(touchEventType.tap);
                        return types;
                    }
                    //swipe
                    if (this.isSameDirection)
                    {
                        if (this.rangeX > 30)
                        {
                            if (this.directionX > 0)
                            {
                                types.push(touchEventType.swipeRight);
                            }
                            else if (this.directionX < 0)
                            {
                                types.push(touchEventType.swipeLeft);
                            }
                        }
                        if (this.rangeY > 30)
                        {
                            if (this.directionY > 0)
                            {
                                types.push(touchEventType.swipeDown);
                            }
                            else if (this.directionY < 0)
                            {
                                types.push(touchEventType.swipeUp);
                            }
                        }
                    }
                    return types;
                };
            }

            function PointClass(x, y)
            {
                this.x = x;
                this.y = y;
            }
        }
    }

    return self;
}(Evoque || {}));