//Dependency: Evoque.js
$.extend('cookie', (function (self) {
    self.get = function (key) {
        return getCookie(key);
    };

    self.set = function (key, val) {
        setCookie(key, val);
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

    function setCookie(key, val)
    {
        //获取当前时间
        var date = new Date();
        var originalVal = getCookie(key);
        if (originalVal != null)
        {
            //将date设置为过去的时间
            date.setTime(date.getTime() - 10000);
            //将userId这个cookie删除
            document.cookie = key + '=' + originalVal + '; expires=' + date.toUTCString() + '; path=/';
        }
        if (!$.isObject(val) && val !== undefined)
        {
            //在设置新的同名Cookie
            var now = new Date();
            now.setDate(Number(now.getDate()) + 1);
            var strVal = '';
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
            document.cookie = key + '=' + strVal + '; expires=' + now.toUTCString() + '; path=/';
        }
    }

    return self;
}({})));