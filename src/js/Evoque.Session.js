//Dependency: Evoque.js, json2.js
$.session = (function (self)
{
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

    self.getString = createFunction(function (key) {
        return sessionStorage.getItem(key);
    });

    self.setString = createFunction(function (key, val) {
        sessionStorage.setItem(key, val);
    });

    self.getJson = createFunction(function (key) {
        var val = sessionStorage.getItem(key);
        if ($.isStringEmpty(val))
        {
            return null;
        }
        return JSON.parse(val);
    });

    self.setJson = createFunction(function (key, val) {
        sessionStorage.setItem(key, JSON.stringify(val));
    });

    self.remove = createFunction(function (key) {
        sessionStorage.removeItem(key);
    });

    return self;
}($.session || {}));