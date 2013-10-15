//Dependency: Evoque.js, json2.js
$.ajax = (function (self)
{
    var defaultOption = {
        // 'get'(default), 'post'
        method : 'get',
        url : '',
        // json
        parameter : {},
        // 'text'(default), 'json', 'html'
        returnType : 'text',
        onSuccess : function (returnObj) {},
        onFail : function () {},
        // seconds
        timeOut : 30
    };

    self.get = function (option)
    {
        checkOption(option);
        option = $(option);
        var xmlhttp = new XMLHttpRequest();
        bindEvent(xmlhttp, option);
        var urlTemp = option.getValueOfProperty('url', defaultOption);
        var spliter = '';
        if (urlTemp.indexOf('?') > -1)
        {
            spliter = '&';
        }
        else
        {
            spliter = '?';
        }
        xmlhttp.open('get', urlTemp + spliter + serializeQuery(option.getValueOfProperty('parameter', defaultOption)), true);
        xmlhttp.send();
        if (!xmlhttp.evoque_sptTimeout)
        {
            xmlhttp.timeoutId = setTimeout(function () {
                xmlhttp.abort();
                xmlhttp.ontimeout();
            }, xmlhttp.timeout);
        }
    };

    self.post = function (option)
    {
        checkOption(option);
        option = $(option);
        var xmlhttp = new XMLHttpRequest();
        bindEvent(xmlhttp, option);
        xmlhttp.open('post', option.getValueOfProperty('url', defaultOption), true);
        // 使用FormData传递post数据，无须设置Content-Type. xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlhttp.send(serializeForm(option.getValueOfProperty('parameter', defaultOption)));
        if (!xmlhttp.evoque_sptTimeout)
        {
            xmlhttp.timeoutId = setTimeout(function () {
                xmlhttp.abort();
                xmlhttp.ontimeout();
            }, xmlhttp.timeout);
        }
    };

    function checkOption(option)
    {
        if ($.isObjectNull(option))
        {
            throw 'option is null!';
        }
        if ($.isStringEmpty(option.url))
        {
            throw 'url is empty!';
        }
    }

    function serializeQuery(parameter)
    {
        var ret = '';
        for (var p in parameter)
        {
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

    function serializeForm(parameter)
    {
        var formData = new FormData();
        for (var p in parameter)
        {
            formData.append(p, parameter[p]);
        }
        return formData;
    }

    function bindEvent(xmlhttp, option)
    {
        var returnType = option.getValueOfProperty('returnType', defaultOption).toLowerCase();
        var onSuccess = option.getValueOfProperty('onSuccess', defaultOption);
        var onFail = option.getValueOfProperty('onFail', defaultOption);
        var timeOut = option.getValueOfProperty('timeOut', defaultOption);
        // 设置返回值类型
        if (returnType == 'html')
        {
            xmlhttp.responseType = 'document';
        }
        // 这里Chrome和Safari都不支持把 responseType 设置成'json'
        // safari不支持timeout属性
        xmlhttp.evoque_sptTimeout = true;
        if ($.checkType(xmlhttp.timeout) === type.eUndefined)
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
                    if (returnType == 'json')
                    {
                        onSuccess(JSON.parse(xmlhttp.response));
                    }
                    else
                    {
                        onSuccess(xmlhttp.response);
                    }
                }
                else
                {
                    onFail({ type: 'failed' });
                }
                xmlhttp = null;
            }
        };
        xmlhttp.onerror = function () {
            if (!xmlhttp.evoque_sptTimeout)
            {
                clearTimeout(xmlhttp.timeoutId);
            }
            onFail({ type: 'error' });
            xmlhttp = null;
        };
        xmlhttp.ontimeout = function () {
            onFail({ type: 'timeout' });
            xmlhttp = null;
        };
    }

    return self;
}($.ajax || {}));