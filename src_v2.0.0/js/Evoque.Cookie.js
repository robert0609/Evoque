//Dependency: Evoque.js
lexus.extend('cookie', (function (self) {
    var defaultOption = {
        expires: (new Date()).addDay(1),
        path: '/',
        domain: '',
        isSession: false
    };

    self.checkEnable = function () {
        if (lexus.checkType(navigator.cookiesEnabled) === type.eBoolean)
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

    self.remove = function (key) {
        var date = new Date();
        //将date设置为过去的时间
        date.setTime(date.getTime() - 10000);
        var originalVal = getCookie(key);
        //将这个cookie删除
        document.cookie = key + '=' + originalVal + '; expires=' + date.toUTCString() + '; path=/';
    };

    self.clear = function (key, option) {
        return setCookie(key, '', option, true);
    };

    function getCookie(key)
    {
        var arrCookie = document.cookie.split('; ');
        for (var i = 0; i < arrCookie.length; i++)
        {
            var arr = arrCookie[i].split("=");
            if (arr[0] == key)
            {
                return arr[1];
            }
        }
        return '';
    }

    function setCookie(key, val, option, clearFlag)
    {
        //获取当前时间
        var date = new Date();
        var originalVal = getCookie(key);
        if (originalVal != null && originalVal != '')
        {
            //将date设置为过去的时间
            date.setTime(date.getTime() - 10000);
            //将这个cookie删除
            document.cookie = key + '=' + originalVal + '; expires=' + date.toUTCString() + '; path=/';
        }
        option = option || {};
        option = lexus(option);
        var expires = option.getValueOfProperty('expires', defaultOption);
        var path = option.getValueOfProperty('path', defaultOption);
        var domain = option.getValueOfProperty('domain', defaultOption);
        var isSession = option.getValueOfProperty('isSession', defaultOption);
        var strVal = null;
        switch (lexus.checkType(val))
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
        if ($.checkType(clearFlag) === type.eBoolean && clearFlag) {
            var strCookie = key + '=';
            if (lexus.isStringEmpty(path)) {
                strCookie += '; path=/';
            }
            else {
                strCookie += '; path=' + path;
            }
            if (!lexus.isStringEmpty(domain) && domain.toLowerCase() !== 'localhost') {
                strCookie += '; domain=' + domain;
            }
            document.cookie = strCookie;
        }
        else {
            if (!lexus.isStringEmpty(strVal)) {
                var strCookie = key + '=' + strVal;
                if (!isSession) {
                    strCookie += '; expires=' + expires.toUTCString();
                }
                if (lexus.isStringEmpty(path)) {
                    strCookie += '; path=/';
                }
                else {
                    strCookie += '; path=' + path;
                }
                if (!lexus.isStringEmpty(domain) && domain.toLowerCase() !== 'localhost') {
                    strCookie += '; domain=' + domain;
                }
                document.cookie = strCookie;
            }
        }
    }

    return self;
}({})));