//Dependency: Evoque.js
$.extend('cache', (function (self) {
    var __global = new cacheClass();
    var __elementCacheKeyProperty = 'elementCache';

    self.create = function () {
        return new cacheClass();
    };

    self.push = function (key, obj) {
        __global.push(key, obj);
    };

    self.pop = function () {
        return __global.pop();
    };

    self.containsKey = function (key) {
        return __global.containsKey(key);
    };

    self.get = function (key) {
        return __global.get(key);
    };

    self.del = function (key) {
        __global.del(key);
    };

    function cacheClass() {
        var __seqStorer = [];
        var __dataStorer = {};

        this.push = function (key, obj) {
            if (this.containsKey(key))
            {
                throw '缓存中已经存在键为[' + key + ']的对象';
            }
            __dataStorer[key] = obj;
            __seqStorer.push(key);
        };

        this.pop = function () {
            if (__seqStorer.length < 1)
            {
                throw '缓存中已经没有数据';
            }
            var key = __seqStorer.pop();
            var obj = __dataStorer[key];
            __dataStorer[key] = undefined;
            return obj;
        };

        this.containsKey = function (key) {
            return __dataStorer.hasOwnProperty(key);
        };

        this.get = function (key) {
            if (!this.containsKey(key))
            {
                throw '缓存中不存在键为[' + key + ']的对象';
            }
            return __dataStorer[key];
        };

        this.del = function (key) {
            if (this.containsKey(key))
            {
                var idx = -1;
                for (var i = 0; i < __seqStorer.length; ++i)
                {
                    if (__seqStorer[i] === key)
                    {
                        idx = i;
                        break;
                    }
                }
                if (idx > -1)
                {
                    __seqStorer.splice(idx, 1);
                    __dataStorer[key] = undefined;
                }
            }
        };
    }

    //API
    Evoque.cache = function () {
        if (this.length < 1)
        {
            return null;
        }
        var ele = this[0];
        var key = ele[__elementCacheKeyProperty];
        if ($.isStringEmpty(key))
        {
            key = $.guid();
            ele[__elementCacheKeyProperty] = key;
        }
        if (!$.cache.containsKey(key))
        {
            $.cache.push(key, new cacheClass());
        }
        return $.cache.get(key);
    };

    return self;
}({})));