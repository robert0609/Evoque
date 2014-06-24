//Dependency: Evoque.js, json2.js
$.extend('session', (function (self) {
    function createFunction(fn)
    {
        return function () {
            if (!$.supportSessionStorage())
            {
                throw 'Your device does not support WebStorage!';
            }
            return fn.apply(self, arguments);
        };
    }

    /**
     * 判断是否包含指定Key的数据
     * @type {*}
     */
    self.containsKey = createFunction(function (key) {
        if ($.isStringEmpty(sessionStorage.getItem(key)))
        {
            return false;
        }
        else
        {
            return true;
        }
    });

    /**
     * 获取指定Key的字符串数据
     * @type {*}
     */
    self.getString = createFunction(function (key) {
        return sessionStorage.getItem(key);
    });

    /**
     * 设置指定Key的字符串数据
     * @type {*}
     */
    self.setString = createFunction(function (key, val) {
        sessionStorage.setItem(key, val);
    });

    /**
     * 获取指定Key的Json数据
     * @type {*}
     */
    self.getJson = createFunction(function (key) {
        var val = sessionStorage.getItem(key);
        if ($.isStringEmpty(val))
        {
            return null;
        }
        return JSON.parse(val);
    });

    /**
     * 设置指定Key的Json数据
     * @type {*}
     */
    self.setJson = createFunction(function (key, val) {
        sessionStorage.setItem(key, JSON.stringify(val));
    });

    /**
     * 移除指定Key的数据
     * @type {*}
     */
    self.remove = createFunction(function (key) {
        sessionStorage.removeItem(key);
    });

    return self;
}({})));