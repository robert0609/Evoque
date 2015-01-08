var Evoque = (function (self)
{
    self.FrameworkName = 'Evoque.js';
    self.FrameworkVersion = '1.0.1';

    var _hasTouchEvent = 'ontouchstart' in window;
    var _enableTapEvent;
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
        ucbrowser: 5,
        hmbrowser: 6,
        baidubrowser: 7,
        safaribrowser: 8,
        _360browser: 9,
        operabrowser: 10,
        chromebrowser: 11
    };
    /**
     * 标识当前的移动设备种类
     * @type {Object}
     */
    window.mDevice = {
        other: 0,
        mx3: 1
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
    else if (_agent.indexOf('baidubrowser') > -1)
    {
        _mApp = mApp.baidubrowser;
    }
    else if (_agent.indexOf('safari') > -1)
    {
        _mApp = mApp.safaribrowser;
    }
    else if (_agent.indexOf('opera') > -1)
    {
        _mApp = mApp.operabrowser;
    }
    else if (_agent.indexOf('chrome') > -1)
    {
        _mApp = mApp.chromebrowser;
    }
    else if (_agent.indexOf('360') > -1)
    {
        _mApp = mApp._360browser;
    }
    var _mDevice = mDevice.other;
    if (_agent.indexOf('m353') > -1) {
        _mDevice = mDevice.mx3;
    }

    /**
     * 设备方向枚举
     * @type {Object}
     */
    window.mOrientation = {
        vertical: 0,
        horizontal: 1
    };

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
        if ((_mAgent === mAgent.ios) || (_mAgent === mAgent.android && (_mApp === mApp.qqbrowser || _mApp === mApp.ucbrowser || _mApp === mApp.baidubrowser)))
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
     * javascript日期的最小值
     * @type {Date}
     */
    Date.min = new Date(1970, 0, 1);

    /**
     * 复制一个等值的时间实例
     * @return {Date}
     */
    Date.prototype.copy = function () {
        return new Date(this.getTime());
    };

    /**
     * 日期类型转换成字符串：Date --> 'yyyy-MM-dd'
     * @parameter format: 'yyyy-MM-dd HH:mm:ss'
     * @return {String}
     */
    Date.prototype.toCustomString = function (format) {
        var y = Number(this.getFullYear());
        var M = Number(this.getMonth()) + 1;
        var d = Number(this.getDate());
        if ($.isStringEmpty(format))
        {
            return y + '-' + M.toString().padLeft(2, '0') + '-' + d.toString().padLeft(2, '0');
        }
        var H = Number(this.getHours());
        var m = Number(this.getMinutes());
        var s = Number(this.getSeconds());
        var operations = [];
        if (format.indexOf('yyyy') > -1)
        {
            operations.push(function (str) {
                return str.replace('yyyy', y.toString());
            });
        }
        if (format.indexOf('MM') > -1)
        {
            operations.push(function (str) {
                return str.replace('MM', M.toString().padLeft(2, '0'));
            });
        }
        else if (format.indexOf('M') > -1)
        {
            operations.push(function (str) {
                return str.replace('M', M.toString());
            });
        }
        if (format.indexOf('dd') > -1)
        {
            operations.push(function (str) {
                return str.replace('dd', d.toString().padLeft(2, '0'));
            });
        }
        else if (format.indexOf('d') > -1)
        {
            operations.push(function (str) {
                return str.replace('d', d.toString());
            });
        }
        if (format.indexOf('HH') > -1)
        {
            operations.push(function (str) {
                return str.replace('HH', H.toString().padLeft(2, '0'));
            });
        }
        else if (format.indexOf('H') > -1)
        {
            operations.push(function (str) {
                return str.replace('H', H.toString());
            });
        }
        if (format.indexOf('mm') > -1)
        {
            operations.push(function (str) {
                return str.replace('mm', m.toString().padLeft(2, '0'));
            });
        }
        else if (format.indexOf('m') > -1)
        {
            operations.push(function (str) {
                return str.replace('m', m.toString());
            });
        }
        if (format.indexOf('ss') > -1)
        {
            operations.push(function (str) {
                return str.replace('ss', s.toString().padLeft(2, '0'));
            });
        }
        else if (format.indexOf('s') > -1)
        {
            operations.push(function (str) {
                return str.replace('s', s.toString());
            });
        }
        var ret = format;
        for (var i = 0; i < operations.length; ++i)
        {
            ret = operations[i].call(window, ret);
        }
        return ret;
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
     * 将日期序列化为JSON的格式
     * @return {String}
     */
    Date.prototype.toJSONDate = function () {
        var ret = '/Date({0}+0800)/';
        var msLocal = this.getTime();
        return ret.replace('{0}', msLocal.toString());
    };

    /**
     * 判断时间类型是否等于最小值
     * @return {Boolean}
     */
    Date.prototype.equalMin = function () {
        return this - Date.min === 0;
    };

    /**
     * 将JSON序列化格式的日期字符串转换为日期类型
     * @return {Date}
     */
    Date.fromJSONDate = function (jsonDateString) {
        var reg = /\/Date\(\d+(\+0800)?\)\//g;
        if (!reg.test(jsonDateString))
        {
            throw 'Error format JSON UTC Date String!'
        }
        var matches = jsonDateString.match(/\(.+\)/g);
        var ms = matches[0].substring(1, matches[0].length - 1);
        if (ms.indexOf('+') > -1)
        {
            ms = ms.substring(0, ms.indexOf('+'));
        }
        return new Date(Number(ms));
    };

    /**
     * 使用指定字符补足字符串的左边至指定长度
     * @param n 指定长度
     * @param c 指定字符
     * @return {String}
     */
    String.prototype.padLeft = function (n, c) {
        var ret = this;
        var s = $.isStringEmpty(c) ? ' ' : c;
        while (ret.length < n)
        {
            ret = s + ret;
        }
        if ($.isStringEmpty(s.trim()))
        {
            ret = ret.replace(' ', '&nbsp;');
        }
        return ret;
    };

    /**
     * 删除字符串两边的指定字符，若参数为空则删除空格
     * @param c 指定字符
     * @return {String}
     */
    String.prototype.trim = function (c) {
        if ($.isStringEmpty(this) || this.length === 0)
        {
            return this;
        }
        var reg = null
        if ($.isStringEmpty(c))
        {
            reg = new RegExp('\\s', 'g');
        }
        else
        {
            reg = new RegExp(c, 'g');
        }
        var si = -1;
        for (var i = 0; i < this.length; ++i)
        {
            reg.lastIndex = 0;
            if (!reg.test(this[i]))
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
            reg.lastIndex = 0;
            if (!reg.test(this[j]))
            {
                ei = j;
                break;
            }
        }
        return this.substring(si, ei + 1);
    };

    /**
     * 形如"yyyy-MM-dd"或"yyyy-MM-dd HH:mm:ss"或"yyyy/MM/dd"或"yyyy/MM/dd HH:mm:ss"的字符床转换成日期
     * @return {Date}
     */
    String.prototype.toDate = function () {
        var ret = new Date(this);
        if ($.checkType(ret) === type.eDate && !isNaN(ret.valueOf()))
        {
            return ret;
        }
        var datetimeStr = this.trim();
        if (!/^(\d{1,4}[-/]\d{1,2}[-/]\d{1,2}(\s+\d{1,2}:\d{1,2}:\d{1,2})?)|(\d{1,2}:\d{1,2}:\d{1,2})$/.test(datetimeStr))
        {
            throw 'Invalid string value!';
        }
        var isTimeFormat = false;
        if (/^\d{1,2}:\d{1,2}:\d{1,2}$/.test(datetimeStr))
        {
            isTimeFormat = true;
        }
        var strs = datetimeStr.replace(/\s+/g, '|').split(/[-/\s:\|]/g);
        if (strs.length == 3)
        {
            if (isTimeFormat)
            {
                var now = new Date();
                return new Date(now.getFullYear(), now.getMonth(), now.getDate(), Number(strs[0]), Number(strs[1]), Number(strs[2]));
            }
            else
            {
                return new Date(Number(strs[0]), Number(strs[1]) - 1, Number(strs[2]));
            }
        }
        else if (strs.length == 6)
        {
            return new Date(Number(strs[0]), Number(strs[1]) - 1, Number(strs[2]), Number(strs[3]), Number(strs[4]), Number(strs[5]));
        }
        return null;
    };

    /**
     * 获取字符串的字节数
     * @return {Number}
     */
    String.prototype.getBytesLength = function() {
        return this.replace(/[^\x00-\xff]/gi, "--").length;
    };

    /**
     * 使用参数替换文字中的占位符,例： "{0} and {1}".format("hello", "world") 输出 hello and world
     * @return {string}
     */
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/\{(\d+)\}/g, function (m, g) {
            var v = args[parseInt(g)];
            return v == undefined ? m : v;
        });
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

    /**
     * 数值想减，如果是浮点型数字则转换成整型进行想减
     * @param n
     */
    Number.prototype.subtract = function (n) {
        var chkThis = $.checkFloat(this);
        var chkN = $.checkFloat(n);
        if (!chkN.isNumber) {
            return NaN;
        }
        if (!chkThis.isFloat && !chkN.isFloat) {
            return this - n;
        }
        var fixedNum = Math.max(chkThis.pointRightCount, chkN.pointRightCount);
        var coefficient = Math.pow(10, fixedNum);
        return Number(((this * coefficient - n * coefficient) / coefficient).toFixed(fixedNum));
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
     * 获取当前内嵌的应用标识码
     * @return {*}
     */
    $.app = function () {
        return _mApp;
    };

    /**
     * 获取当前设备的种类
     */
    $.device = function () {
        return _mDevice;
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
     * 判断数字是否是浮点型，并返回小数位数等信息
     */
    $.checkFloat = function (n) {
        var ret = {
            isNumber: false,
            isFloat: false,
            pointRightCount: 0
        };
        if (isNaN(n)) {
            return ret;
        }
        ret.isNumber = true;
        var strN = n.toString();
        var pInt = parseInt(strN);
        var pFloat = parseFloat(strN);
        if (pInt === pFloat) {
            return ret;
        }
        ret.isFloat = true;
        ret.pointRightCount = strN.length - 1 - strN.indexOf('.');
        return ret;
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
     * 绑定设备重力感应方向变化的事件
     * @param fn
     */
    $.orientationChange = function (fn) {
        var evtName = 'onorientationchange' in window ? 'orientationchange' : 'resize';
        if (window.addEventListener && $.checkType(fn) === type.eFunction) {
            window.addEventListener(evtName, fn, false);
        }
    };

    /**
     * 获取设备当前方向
     */
    $.orientation = function () {
        if (window.orientation == 180||window.orientation == 0) {
            return mOrientation.vertical;
        }
        if (window.orientation == 90||window.orientation == -90) {
            return mOrientation.horizontal;
        }
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

    /**
     * 带有动画效果的滚动处理
     * @param destinationX 目的地X坐标
     * @param destinationY 目的地Y坐标
     */
    $.scrollTo = function (destinationX, destinationY, scrollComplete) {
        var bodyW = document.body.scrollWidth;
        var winW = document.documentElement.clientWidth;
        var maxScrollWidth = 0;
        if (bodyW > winW)
        {
            maxScrollWidth = bodyW - winW;
        }
        var bodyH = document.body.scrollHeight;
        var winH = document.documentElement.clientHeight;
        var maxScrollHeight = 0;
        if (bodyH > winH)
        {
            maxScrollHeight = bodyH - winH;
        }
        destinationX = Math.min(destinationX, maxScrollWidth);
        destinationY = Math.min(destinationY, maxScrollHeight);
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
                if ($.checkType(scrollComplete) === type.eFunction) {
                    scrollComplete.call();
                }
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
    $.hasTouchEvent = function () {
        return _hasTouchEvent;
    };

    /**
     * 是否启动tap事件替换click事件
     * @return {*}
     */
    $.enableTapEvent = function () {
        if ($.checkType(_enableTapEvent) === type.eBoolean)
        {
            return _enableTapEvent;
        }
        //查找文档元数据：<meta name="EvoqueEnableTapEvent" content="true" />
        var $meta = $('meta[name="EvoqueEnableTapEvent"]');
        if ($meta.length < 1)
        {
            _enableTapEvent = false;
        }
        else
        {
            var content = $meta.getAttr('content');
            if ($.isStringEmpty(content) || content.toLowerCase() !== 'true')
            {
                _enableTapEvent = false;
            }
            else
            {
                _enableTapEvent = true;
            }
        }
        return _enableTapEvent;
    };

    /**
     * 判断是否支持离线存储
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
            if ($.isObjectNull(this[0].classList))
            {
                var classText = this.getAttr('class').trim();
                if ($.isStringEmpty(classText))
                {
                    return [];
                }
                else
                {
                    return classText.split(' ');
                }
            }
            else
            {
                return $.makeArray(this[0].classList);
            }
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
                if ($.isObjectNull(this.classList))
                {
                    var classText = $(this).getAttr('class');
                    if ($.isStringEmpty(classText))
                    {
                        classText = '';
                    }
                    classText = classText.trim();
                    if (classText.indexOf(className) < 0)
                    {
                        $(this).setAttr('class', classText + ' ' + className);
                    }
                }
                else
                {
                    if (!this.classList.contains(className))
                    {
                        this.classList.add(className);
                    }
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
                if ($.isObjectNull(this.classList))
                {
                    var classText = $(this).getAttr('class');
                    if ($.isStringEmpty(classText))
                    {
                        classText = '';
                    }
                    classText = classText.trim();
                    if (classText.indexOf(className) > -1)
                    {
                        $(this).setAttr('class', classText.replace(className, ''));
                    }
                }
                else
                {
                    if (this.classList.contains(className))
                    {
                        this.classList.remove(className);
                    }
                }
            }
        });
    };

    /**
     * 清空节点的css样式
     */
    self.clearClass = function () {
        this.each(function () {
            if ($.checkType(this) === type.eElement)
            {
                if ($.isObjectNull(this.classList))
                {
                    $(this).setAttr('class', '');
                }
                else
                {
                    var clses = $(this).getClassList();
                    for (var i = 0; i < clses.length; ++i)
                    {
                        this.classList.remove(clses[i]);
                    }
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
        if (_hasTouchEvent && $.enableTapEvent())
        {
            this.each(function () {
                if (innerIsBindedTapEvent(this))
                {
                    innerDispatchCustomEvent(this, 'tap');
                }
                else
                {
                    var evt = document.createEvent('MouseEvents');
                    evt.initEvent('click', true, true);
                    this.dispatchEvent(evt);
                }
            });
        }
        else
        {
            var evt = document.createEvent('MouseEvents');
            evt.initEvent('click', true, true);
            this.each(function () {
                this.dispatchEvent(evt);
            });
        }
    };

    /**
     * 绑定Click事件，若支持触屏事件，则绑定Tap事件
     * @param callback
     */
    self.click = function (callback) {
        if (_hasTouchEvent && $.enableTapEvent())
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
    self.addEventHandler = function (evtName, callback, option) {
        if (_hasTouchEvent)
        {
            if ($.enableTapEvent() && evtName == 'click')
            {
                evtName = 'tap';
            }
            else if (!$.enableTapEvent() && evtName == 'tap')
            {
                evtName = 'click';
            }
        }
        //判断处理option参数
        var o = handleEventOption(option);
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
                        if (o.useEventPrefix) {
                            var evtNames = generatePrefixEvent(evtName);
                            for (var i = 0; i < evtNames.length; ++i) {
                                this.addEventListener(evtNames[i], callback, o.useCapture);
                            }
                        }
                        else {
                            this.addEventListener(evtName, callback, o.useCapture);
                        }
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
    self.removeEventHandler = function (evtName, callback, option) {
        if (_hasTouchEvent)
        {
            if ($.enableTapEvent() && evtName == 'click')
            {
                evtName = 'tap';
            }
            else if (!$.enableTapEvent() && evtName == 'tap')
            {
                evtName = 'click';
            }
        }
        //判断处理option参数
        var o = handleEventOption(option);
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
                        if (o.useEventPrefix) {
                            var evtNames = generatePrefixEvent(evtName);
                            for (var i = 0; i < evtNames.length; ++i) {
                                this.removeEventListener(evtNames[i], callback, o.useCapture);
                            }
                        }
                        else {
                            this.removeEventListener(evtName, callback, o.useCapture);
                        }
                    }
                }
            }
        });
    };

    function handleEventOption(option) {
        var useCapture = false;
        var useEventPrefix = false;
        switch ($.checkType(option)) {
            case type.eBoolean:
                useCapture = option;
                break;
            case type.eObject:
                if ($.checkType(option.useCapture) === type.eBoolean) {
                    useCapture = option.useCapture;
                }
                if ($.checkType(option.useEventPrefix) === type.eBoolean) {
                    useEventPrefix = option.useEventPrefix;
                }
                break;
            default:
                break;
        }
        return {
            useCapture: useCapture,
            useEventPrefix: useEventPrefix
        };
    }
    function generatePrefixEvent(evtName) {
        if ($.isStringEmpty(evtName)) {
            return [evtName];
        }
        //对于动画的CSS事件，单独特殊处理下，全部转成小写字母
        var retEvt = [];
        if (evtName === 'animationStart' || evtName === 'animationIteration' || evtName === 'animationEnd') {
            retEvt.push(evtName.toLowerCase());
        }
        else {
            retEvt.push(evtName);
        }
        var pfx = ['webkit', 'moz', 'MS'];
        var convertEvtName = evtName.substr(0, 1).toUpperCase() + evtName.substr(1);
        for (var i = 0; i < pfx.length; ++i) {
            retEvt.push(pfx[i] + convertEvtName);
        }
        return retEvt;
    }

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
        var customEvent = document.createEvent('CustomEvent');
        customEvent.initCustomEvent(evt, true, false, arg);
        ele.dispatchEvent(customEvent);
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
            ele.addEventListener(evt, callback);
            if ($.checkType(ele[evtListName]) !== type.eNumber)
            {
                ele[evtListName] = 0;
            }
            ele[evtListName] += 1;
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
            ele.removeEventListener(evt, callback);
            if ($.checkType(ele[evtListName]) !== type.eNumber)
            {
                ele[evtListName] = 0;
            }
            if (ele[evtListName] > 0) {
                ele[evtListName] -= 1;
            }
        }
    }

    if (_hasTouchEvent)
    {
        var touchEventType = {
            tap: 'tap',
            swipeUp: 'swipeUp',
            swipeDown: 'swipeDown',
            swipeLeft: 'swipeLeft',
            swipeRight: 'swipeRight',
            drag: 'drag'
        };
        innerDeclareCustomEvent(touchEventType.tap);
        innerDeclareCustomEvent(touchEventType.swipeUp);
        innerDeclareCustomEvent(touchEventType.swipeDown);
        innerDeclareCustomEvent(touchEventType.swipeLeft);
        innerDeclareCustomEvent(touchEventType.swipeRight);
        innerDeclareCustomEvent(touchEventType.drag);

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
        /**
         * 绑定手指的拖动事件
         * @param callback
         */
        self.drag = function (callback) {
            this.addEventHandler(touchEventType.drag, callback);
        };

        var _bg = document.createElement('div');
        _bg.style.width = document.documentElement.clientWidth + 'px';
        _bg.style.height = document.documentElement.clientHeight + 'px';
        _bg.style.zIndex = 100000;
        _bg.style.position = 'fixed';
        _bg.style.top = 0;
        _bg.style.left = 0;
        _bg.style.opacity = 0;
        _bg.style.margin = 0;
        _bg.style.padding = 0;
        _bg.onclick = function (e) {
            $.cancelDefault(e);
            $.cancelEventFlow(e);
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
                $.cancelDefault(e);
            });
            $ele.addEventHandler('touchmove', function (e) {
                if (e.touches.length !== 1)
                {
                    return;
                }
                var touchState = touchStateDictionary[e.touches[0].identifier];
                touchState.addTouchPoint(new PointClass(e.touches[0].clientX, e.touches[0].clientY));
                var evtTyp = touchState.touchType();
                var that = this;
                $(evtTyp).each(function () {
                    innerDispatchCustomEvent(that, this.name, this.arg);
                });
            });
            $ele.addEventHandler('touchend', function (e) {
                if (e.changedTouches.length !== 1 || e.touches.length !== 0)
                {
                    return;
                }
                var touchState = touchStateDictionary[e.changedTouches[0].identifier];
                touchState.addTouchPoint(new PointClass(e.changedTouches[0].clientX, e.changedTouches[0].clientY));
                touchState.over();
                var evtTyp = touchState.touchType();
                var that = this;
                if (_mAgent === mAgent.android)
                {
                    document.body.appendChild(_bg);
                    setTimeout(function () {document.body.removeChild(_bg);}, 350);
                }
                $(evtTyp).each(function () {
                    innerDispatchCustomEvent(that, this.name, this.arg);
                });
            });

            ele.__isBindTouchEvent = true;

            function TouchStateClass(identifier)
            {
                var identifier = identifier;
                this.touchStartTime = null;
                this.touchEndTime = null;
                this.touchPointList = [];
                this.directionX;
                this.directionY;
                this.isSameDirection = true;
                this.rangeX = 0;
                this.rangeY = 0;
                this.moveBetweenPointX = 0;
                this.moveBetweenPointY = 0;

                this.addTouchPoint = function (point) {
                    if (this.touchPointList.length > 0)
                    {
                        var sp = this.touchPointList[0];
                        var rx = Math.abs(point.x - sp.x);
                        var ry = Math.abs(point.y - sp.y);
                        this.rangeX = Math.max(this.rangeX, rx);
                        this.rangeY = Math.max(this.rangeY, ry);

                        var lp = this.touchPointList[this.touchPointList.length - 1];
                        this.moveBetweenPointX = point.x - lp.x;
                        this.moveBetweenPointY = point.y - lp.y;
                        var dx = this.moveBetweenPointX == 0 ? 0 : (this.moveBetweenPointX > 0 ? 1 : -1);
                        var dy = this.moveBetweenPointY == 0 ? 0 : (this.moveBetweenPointY > 0 ? 1 : -1);
                        if (this.touchPointList.length >= 2)
                        {
                            var sameX = dx == 0 ? true : (this.directionX == dx);
                            var sameY = dy == 0 ? true : (this.directionY == dy);
                            this.isSameDirection = sameX && sameY;
                        }
                        if ($.checkType(this.directionX) === type.eUndefined)
                        {
                            this.directionX = dx;
                        }
                        if ($.checkType(this.directionY) === type.eUndefined)
                        {
                            this.directionY = dy;
                        }
                    }
                    else {
                        this.touchStartTime = point.timestamp;
                    }
                    this.touchPointList.push(point);
                };

                this.over = function () {
                    if (this.touchPointList.length > 0) {
                        this.touchEndTime = this.touchPointList[this.touchPointList.length - 1].timestamp;
                    }
                };

                this.touchType = function () {
                    var types = [];
                    if ($.checkType(this.touchEndTime) !== type.eDate)
                    {
                        if (this.touchPointList.length > 0)
                        {
                            //drag
                            types.push({
                                name: touchEventType.drag,
                                arg: {
                                    moveX: this.moveBetweenPointX,
                                    moveY: this.moveBetweenPointY
                                }
                            });
                        }
                        return types;
                    }
                    var sp = this.touchPointList[0];
                    var touchSpan = this.touchEndTime - this.touchStartTime;
                    //tap
                    if (touchSpan < 750 && this.rangeX < 4 && this.rangeY < 4)
                    {
                        types.push({ name: touchEventType.tap });
                        return types;
                    }
                    if (this.touchPointList.length > 2) {
                        var lp2 = this.touchPointList[this.touchPointList.length - 2];
                        var lp3 = this.touchPointList[this.touchPointList.length - 3];
                        if (Math.abs(lp2.x - lp3.x) < 4 && Math.abs(lp2.y - lp3.y) < 4) {
                            this.isSameDirection = false;
                        }
                    }
                    //swipe
                    if (this.isSameDirection)
                    {
                        if (this.rangeX > 30)
                        {
                            if (this.directionX > 0)
                            {
                                types.push({ name: touchEventType.swipeRight });
                            }
                            else if (this.directionX < 0)
                            {
                                types.push({ name: touchEventType.swipeLeft });
                            }
                        }
                        if (this.rangeY > 30)
                        {
                            if (this.directionY > 0)
                            {
                                types.push({ name: touchEventType.swipeDown });
                            }
                            else if (this.directionY < 0)
                            {
                                types.push({ name: touchEventType.swipeUp });
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
                this.timestamp = new Date();
            }
        }

        function innerIsBindedTapEvent(ele)
        {
            var tapEvtListName = _customEvents['tap'];
            if ($.checkType(ele[tapEvtListName]) === type.eNumber && ele[tapEvtListName] > 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }

    /**
     * 扩展全局功能。扩展之后调用方式：$.name.method()
     * @param name 功能对象名
     * @param obj 提供功能调用的对象
     */
    $.extend = function (name, obj) {
        Object.defineProperty($, name, {
            get: function () {
                obj.evoqueTarget = undefined;
                return obj;
            }
        });
    };

    /**
     * 扩展Evoque功能。扩展之后调用方式：$('').name.method()，在method内部使用self.evoqueTarget可以获取调用的evoque对象
     * @param name 功能对象名
     * @param obj 提供功能调用的对象
     */
    self.extend = function (name, obj) {
        Object.defineProperty(self, name, {
            get: function () {
                obj.evoqueTarget = this;
                return obj;
            }
        });
    };

    return self;
}(Evoque || {}));