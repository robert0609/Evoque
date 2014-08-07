//Dependency: Evoque.js
$.extend('cookie', (function (self) {
    var defaultOption = {
        expires: (new Date()).addDay(1),
        path: '/',
        domain: ''
    };

    self.checkEnable = function () {
        if ($.checkType(navigator.cookiesEnabled) === type.eBoolean)
        {
            return navigator.cookiesEnabled;
        }
        else
        {
            var result=false;
            document.cookie = "testcookie=yes;";
            var cookieSet = document.cookie;
            if (cookieSet.indexOf("testcookie=yes") > -1)
            {
                result=true;
            }
            return result;
        }
    };

    self.get = function (key) {
        return getCookie(key);
    };

    self.set = function (key, val, option) {
        setCookie(key, val, option);
    };

    function getCookie(key)
    {
        var arrCookie=document.cookie.split('; ');
        for(var i = 0; i < arrCookie.length; i++){
            var arr = arrCookie[i].split("=");
            if(arr[0] == key)
            {
                return arr[1];
            }
        }
        return null;
    }

    function setCookie(key, val, option)
    {
        //获取当前时间
        var date = new Date();
        var originalVal = getCookie(key);
        if (originalVal != null)
        {
            //将date设置为过去的时间
            date.setTime(date.getTime() - 10000);
            //将这个cookie删除
            document.cookie = key + '=' + originalVal + '; expires=' + date.toUTCString() + '; path=/';
        }
        option = option || {};
        option = $(option);
        var expires = option.getValueOfProperty('expires', defaultOption);
        var path = option.getValueOfProperty('path', defaultOption);
        var domain = option.getValueOfProperty('domain', defaultOption);
        var strVal = null;
        switch ($.checkType(val))
        {
            case type.eBoolean:
                strVal = val ? 'True' : 'False';
                break;
            case type.eNumber:
                strVal = val.toString();
                break;
            case type.eString:
                strVal = val;
                break;
        }
        if (!$.isStringEmpty(strVal)) {
            var strCookie = key + '=' + strVal + '; expires=' + expires.toUTCString();
            if ($.isStringEmpty(path)) {
                strCookie += '; path=/';
            }
            else {
                strCookie += '; path=' + path;
            }
            if (!$.isStringEmpty(domain)) {
                strCookie += '; domain=' + domain;
            }
            document.cookie = strCookie;
        }
    }

    return self;
}({})));