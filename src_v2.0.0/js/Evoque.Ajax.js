//Dependency: Evoque.js, json2.js, Evoque.Cache.js
lexus.extend('ajax', (function (self) {
    var defaultOption = {
        // 'get'(default), 'post'
        method : 'get',
        url : '',
        // json
        parameter : {},
        // Form(Only can be used when [method] == 'post'). Its value can be id or element
        form: undefined,
        // 'text'(default), 'json', 'html'
        returnType : 'text',
        onSuccess : function (returnObj) {},
        onFail : function () {},
        // seconds
        timeOut: 30,
        //默认开启跨域
        crossOrigin: true,
        withCredentials: true,
        withTimestamp: true
    };

    var _cacheInstance = null;
    function getAjaxCache() {
        if (lexus.isObjectNull(_cacheInstance)) {
            _cacheInstance = lexus.cache.create();
        }
        return _cacheInstance;
    }

    self.request = function (option)
    {
        checkOption(option);
        var $option = lexus(option);
        var method = $option.getValueOfProperty('method', defaultOption);
        if (method === 'post')
        {
            return self.post(option);
        }
        else
        {
            return self.get(option);
        }
    };

    self.get = function (option)
    {
        checkOption(option);
        option = lexus(option);
        var xmlhttp = new XMLHttpRequest();
        var fnResult = {
            abort: function () {
                if (lexus.isObjectNull(xmlhttp)) {
                    return;
                }
                xmlhttp.abort();
            }
        };
        var urlTemp = option.getValueOfProperty('url', defaultOption);
        //CORS跨域请求的URL如果是目录的话一定要以'/'结尾，否则在预检请求OPTIONS的时候会报：Response for preflight is invalid (redirect)
        urlTemp = formatPath(urlTemp);
        var spliter = '';
        if (urlTemp.indexOf('?') > -1)
        {
            spliter = '&';
        }
        else
        {
            spliter = '?';
        }
        var parameterGet = option.getValueOfProperty('parameter', defaultOption);
        var crossOrigin = true;
        var withTimestamp = option.getValueOfProperty('withTimestamp', defaultOption);
        if (withTimestamp)
        {
            //针对IE对ajax请求结果的缓存机制，增加时间戳参数
            parameterGet.timestamp = (new Date()).getTime();
        }
        xmlhttp.open('get', urlTemp + spliter + serializeQuery(parameterGet), true);
        if (crossOrigin) {
            var withCredentials = option.getValueOfProperty('withCredentials', defaultOption);
            if (withCredentials) {
                xmlhttp.withCredentials = 'true';
            }
        }
        bindEvent(xmlhttp, option, {
            url: urlTemp,
            parameter: parameterGet
        });
        xmlhttp.setRequestHeader('x-requested-with', 'XMLHttpRequest');
        xmlhttp.send();
        if (!xmlhttp.evoque_sptTimeout)
        {
            if (lexus.app() === mApp.hmbrowser)
            {
                return fnResult;
            }
            xmlhttp.timeoutId = setTimeout(function () {
                xmlhttp.abort();
                xmlhttp.ontimeout();
            }, xmlhttp.timeout);
        }

        return fnResult;
    };

    self.post = function (option)
    {
        checkOption(option);
        option = lexus(option);
        var crossOrigin = true;
        var xmlhttp = new XMLHttpRequest();
        var fnResult = {
            abort: function () {
                if (lexus.isObjectNull(xmlhttp)) {
                    return;
                }
                xmlhttp.abort();
            }
        };
        var urlTemp = option.getValueOfProperty('url', defaultOption);
        //CORS跨域请求的URL如果是目录的话一定要以'/'结尾，否则在预检请求OPTIONS的时候会报：Response for preflight is invalid (redirect)
        urlTemp = formatPath(urlTemp);
        var parameterPost = option.getValueOfProperty('parameter', defaultOption);
        xmlhttp.open('post', urlTemp, true);
        if (crossOrigin) {
            var withCredentials = option.getValueOfProperty('withCredentials', defaultOption);
            if (withCredentials) {
                xmlhttp.withCredentials = 'true';
            }
        }
        bindEvent(xmlhttp, option, {
            url: urlTemp,
            parameter: parameterPost
        });
        xmlhttp.setRequestHeader('x-requested-with', 'XMLHttpRequest');

        if (window.FormData)
        {
            // 使用FormData传递post数据，无须设置Content-Type. xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            xmlhttp.send(serializeForm(parameterPost, option[0].form));
        }
        else {
            xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            var pain = parameterPost;
            var frm = option[0].form;
            if (frm) {
                for (var i = 0; i < frm.length; ++i)
                {
                    if (lexus.isStringEmpty(frm[i].name))
                    {
                        continue;
                    }
                    pain[frm[i].name] = frm[i].value;
                }
            }
            xmlhttp.send(serializeQuery(pain));
        }
        if (!xmlhttp.evoque_sptTimeout)
        {
            if (lexus.app() === mApp.hmbrowser)
            {
                return fnResult;
            }
            xmlhttp.timeoutId = setTimeout(function () {
                xmlhttp.abort();
                xmlhttp.ontimeout();
            }, xmlhttp.timeout);
        }
        return fnResult;
    };

    self.postCrossOrigin = function (option) {
        checkOption(option);
        option.crossOrigin = true;
        option.withCredentials = true;
        return self.post(option);
    };

    function checkOption(option)
    {
        if (lexus.isObjectNull(option))
        {
            throw 'option is null!';
        }
        if (lexus.isStringEmpty(option.url))
        {
            throw 'url is empty!';
        }
    }

    function formatPath(path) {
        if (lexus.isStringEmpty(path)) {
            return '';
        }
        var query = '';
        var anchor = '';
        if (path.indexOf('?') > 0) {
            var arr = path.split('?');
            path = arr[0];
            query = arr[1];
            if (query.indexOf('#') > 0) {
                var arr1 = query.split('#');
                query = arr1[0];
                anchor = arr1[1];
            }
        }
        else if (path.indexOf('#') > 0) {
            var arr = path.split('#');
            path = arr[0];
            anchor = arr[1];
        }

        var isDirectory = true;
        if (path.lastIndexOf('.') > 0) {
            isDirectory = false;
        }
        var isAbsoluteUrl = /^https?:\/\/[^\/]/i.test(path);
        var firstChar = path.charAt(0);
        var lastChar = path.charAt(path.length - 1);
        if (!isAbsoluteUrl && firstChar != '/') {
            path = '/' + path;
        }
        if (isDirectory && lastChar != '/') {
            path += '/';
        }
        if (!lexus.isStringEmpty(query)) {
            path = path + '?' + query;
        }
        if (!lexus.isStringEmpty(anchor)) {
            path = path + '#' + anchor;
        }
        return path;
    }

    function serializeQuery(parameter)
    {
        var ret = '';
        for (var p in parameter)
        {
            if (lexus.checkType(parameter[p]) === type.eUndefined)
            {
                continue;
            }
            ret += p;
            ret += '=';
            ret += encodeURIComponent(parameter[p].toString());
            ret += '&';
        }
        if (ret.length > 0)
        {
            ret = ret.slice(0, -1);
        }
        return ret;
    }

    function serializeForm(parameter, form)
    {
        var formData;
        var typeF = lexus.checkType(form);
        if (typeF === type.eElement && form instanceof HTMLFormElement)
        {
            formData = new FormData(form);
        }
        else if (typeF === type.eString && !lexus.isStringEmpty(form))
        {
            var formEle = lexus('#' + form);
            if (formEle.length > 0)
            {
                formData = new FormData(formEle[0]);
            }
        }
        else if (lexus.isObject(form) && form instanceof FormData)
        {
            formData = form;
        }
        if (lexus.isObjectNull(formData))
        {
            formData = new FormData();
        }
        for (var p in parameter)
        {
            if (lexus.checkType(parameter[p]) === type.eUndefined)
            {
                continue;
            }
            formData.append(p, parameter[p]);
        }
        return formData;
    }

    function dateReviver(key, value) {
        var a;
        if (typeof value === 'string') {
            a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)/.exec(value);
            if (a) {
                return new Date(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]);
            }
        }
        return value;
    }

    function bindEvent(xmlhttp, option, debugInfo)
    {
        var returnType = option.getValueOfProperty('returnType', defaultOption).toLowerCase();
        var onSuccess = option.getValueOfProperty('onSuccess', defaultOption);
        var onFail = option.getValueOfProperty('onFail', defaultOption);
        var isFailed = false;
        var timeOut = option.getValueOfProperty('timeOut', defaultOption);
        // 设置返回值类型(android平台目前不支持returnType == 'html')
        if (returnType == 'html')
        {
            xmlhttp.responseType = 'document';
        }
        // 这里Chrome和Safari都不支持把 responseType 设置成'json'
        // safari不支持timeout属性
        xmlhttp.evoque_sptTimeout = true;
        if (lexus.checkType(xmlhttp.timeout) === type.eUndefined)
        {
            xmlhttp.evoque_sptTimeout = false;
        }
        xmlhttp.timeout = timeOut * 1000;
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4)
            {
                if (!xmlhttp.evoque_sptTimeout)
                {
                    clearTimeout(xmlhttp.timeoutId);
                }
                if (xmlhttp.status == 200)
                {
                    var resp = null;
                    if (lexus.checkType(xmlhttp.response) === type.eUndefined)
                    {
                        resp = xmlhttp.responseText;
                    }
                    else
                    {
                        resp = xmlhttp.response;
                    }
                    if (returnType == 'json')
                    {
                        onSuccess(JSON.parse(resp, dateReviver));
                    }
                    else
                    {
                        onSuccess(resp);
                    }
                }
                else
                {
                    if (!isFailed)
                    {
                        isFailed = true;
                        if (!$.isObjectNull(debugInfo)) {
                            console.log(JSON.stringify(debugInfo));
                            console.log('failed');
                            console.log(xmlhttp.status);
                        }
                        onFail({ type: 'failed', xhrContext: xmlhttp });
                    }
                }
                //xmlhttp = null;
            }
        };
        xmlhttp.onerror = function () {
            if (!xmlhttp.evoque_sptTimeout)
            {
                clearTimeout(xmlhttp.timeoutId);
            }
            if (!isFailed)
            {
                isFailed = true;
                if (!$.isObjectNull(debugInfo)) {
                    console.log(JSON.stringify(debugInfo));
                    console.log('error');
                    console.log(xmlhttp.status);
                }
                onFail({ type: 'error', xhrContext: xmlhttp });
            }
            //xmlhttp = null;
        };
        xmlhttp.ontimeout = function () {
            if (!isFailed)
            {
                isFailed = true;
                if (!$.isObjectNull(debugInfo)) {
                    console.log(JSON.stringify(debugInfo));
                    console.log('timeout');
                    console.log(xmlhttp.status);
                }
                onFail({ type: 'timeout', xhrContext: xmlhttp });
            }
            //xmlhttp = null;
        };
        xmlhttp.onabort = function () {
            //if (!xmlhttp.evoque_sptTimeout) {
            //    clearTimeout(xmlhttp.timeoutId);
            //}
            if (!isFailed)
            {
                isFailed = true;
                if (!$.isObjectNull(debugInfo)) {
                    console.log(JSON.stringify(debugInfo));
                    console.log('abort');
                    console.log(xmlhttp.status);
                }
                onFail({ type: 'abort', xhrContext: xmlhttp });
            }
            //xmlhttp = null;
        };
    }

    //API
    Evoque.post = function (option)
    {
        option = option || {};
        if (this.length < 1)
        {
            return;
        }
        var form = this[0];
        if (form instanceof HTMLFormElement)
        {
            if (lexus.isStringEmpty(option.url))
            {
                option.url = this.getAttr('action');
            }
            if (lexus.isStringEmpty(option.url))
            {
                return;
            }
            option.method = 'post';
            option.form = form;
            return lexus.ajax.post(option);
        }
    }

    return self;
}({})));