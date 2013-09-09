//Dependency: Evoque.js, json2.js
$.ajax = (function (self)
{
    var defaultOption = {
        // 'get'(default), 'post'
        method : 'get',
        url : '',
        // json
        parameter : {},
        // 'text'(default), 'json'
        returnType : 'text',
        onSuccess : function (returnObj) {},
        onFail : function () {}
    };

    self.get = function (option)
    {
        checkOption(option);
        var xmlhttp = new XMLHttpRequest();
        bindEvent(xmlhttp, option);
        xmlhttp.open('get', option.getValueOfProperty('url', defaultOption) + '?' + serialize(option.getValueOfProperty('parameter', defaultOption)), true);
        xmlhttp.send();
    };

    self.post = function (option)
    {
        checkOption(option);
        var xmlhttp = new XMLHttpRequest();
        bindEvent(xmlhttp, option);
        xmlhttp.open('post', option.getValueOfProperty('url', defaultOption), true);
        xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlhttp.send(serialize(option.getValueOfProperty('parameter', defaultOption)));
    };

    function checkOption(option)
    {
        if (isObjectNull(option))
        {
            throw 'option is null!';
        }
        if (isStringEmpty(option.url))
        {
            throw 'url is empty!';
        }
    }

    function serialize(parameter)
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

    function bindEvent(xmlhttp, option)
    {
        var returnType = option.getValueOfProperty('returnType', defaultOption);
        var onSuccess = option.getValueOfProperty('onSuccess', defaultOption);
        var onFail = option.getValueOfProperty('onFail', defaultOption);
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4)
            {
                if (xmlhttp.status == 200)
                {
                    if (returnType == 'json')
                    {
                        onSuccess(JSON.parse(xmlhttp.responseText));
                    }
                    else
                    {
                        onSuccess(xmlhttp.responseText);
                    }
                }
                else
                {
                    onFail();
                }
            }
        };
    }

    return self;
}($.ajax || {}));