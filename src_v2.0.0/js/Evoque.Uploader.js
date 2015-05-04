//Dependency: Evoque.js
lexus.extend('uploader', (function (self) {
    var defaultOption = {
        url : '',
        // json
        parameter : {},
        // Form(Only can be used when [method] == 'post'). Its value can be id or element
        form: undefined,
        // 'text'(default), 'json', 'html'
        returnType : 'text',
        onSuccess : function (returnObj) {},
        onFail : function () {},
        onProgess: function (progressEvent) {},
        crossOrigin: false,
        withCredentials: false
    };

    self.exec = function (option) {
        checkOption(option);
        option = lexus(option);
        var crossOrigin = option.getValueOfProperty('crossOrigin', defaultOption);
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('post', option.getValueOfProperty('url', defaultOption), true);
        if (crossOrigin) {
            var withCredentials = option.getValueOfProperty('withCredentials', defaultOption);
            if (withCredentials) {
                xmlhttp.withCredentials = 'true';
            }
        }
        bindEvent(xmlhttp, option);
        if (!crossOrigin) {
            xmlhttp.setRequestHeader('x-requested-with', 'XMLHttpRequest');
        }
        // 使用FormData传递post数据，无须设置Content-Type. xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlhttp.send(serializeForm(option.getValueOfProperty('parameter', defaultOption), option[0].form));

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

    function bindEvent(xmlhttp, option)
    {
        var returnType = option.getValueOfProperty('returnType', defaultOption).toLowerCase();
        var onSuccess = option.getValueOfProperty('onSuccess', defaultOption);
        var onFail = option.getValueOfProperty('onFail', defaultOption);
        var onProgess = option.getValueOfProperty('onProgess', defaultOption);
        // 设置返回值类型(android平台目前不支持returnType == 'html')
        if (returnType == 'html')
        {
            xmlhttp.responseType = 'document';
        }
        xmlhttp.onloadstart = function () {};
        xmlhttp.onload = function () {
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
                onSuccess.call(xmlhttp, JSON.parse(resp));
            }
            else
            {
                onSuccess.call(xmlhttp, resp);
            }
        };
        xmlhttp.onerror = function () {
            onFail.call(xmlhttp, { type: 'error' });
        };
        xmlhttp.onloadend = function () {
            xmlhttp = null;
        };
        xmlhttp.upload.onprogress = function (e) {
            onProgess.call(xmlhttp, e);
        };
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
            formData.append(p, parameter[p]);
        }
        return formData;
    }

    return self;
}({})));