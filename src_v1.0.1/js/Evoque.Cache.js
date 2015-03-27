//Dependency: Evoque.js, Evoque.Session.js
$.extend('cache', (function (self) {
    var defaultOption = {
        // 'page' | 'session' | 'local', default: 'page'
        cacheLevel: 'page'
    };

    var __global = new cacheClass();
    var __elementCacheKeyProperty = 'elementCache';

    self.create = function (option) {
        var lvl = getLevel(option);
        switch (lvl) {
            case 'session':
                return $.session;
            case 'local':
                return $.storage;
            default:
                return new cacheClass();
        }
    };

    self.push = function (key, obj, option) {
        getCacheProvider(getLevel(option)).push(key, obj);
    };

    self.pop = function (option) {
        return getCacheProvider(getLevel(option)).pop();
    };

    self.containsKey = function (key, option) {
        return getCacheProvider(getLevel(option)).containsKey(key);
    };

    self.get = function (key, option) {
        return getCacheProvider(getLevel(option)).get(key);
    };

    self.set = function (key, obj, option) {
        getCacheProvider(getLevel(option)).set(key, obj);
    };

    self.del = function (key, option) {
        getCacheProvider(getLevel(option)).del(key);
    };

    self.keys = function (option) {
        return getCacheProvider(getLevel(option)).keys();
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

        this.set = function (key, obj) {
            if (!this.containsKey(key)) {
                __seqStorer.push(key);
            }
            __dataStorer[key] = obj;
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
                    delete __dataStorer[key];
                }
            }
        };

        this.keys = function () {
            return __seqStorer;
        };
    }

    function getLevel(option) {
        option = option || {};
        var $option = $(option);
        var cacheLevel = $option.getValueOfProperty('cacheLevel', defaultOption).toLowerCase();
        if ((cacheLevel === 'session' && $.isObjectNull($.session)) || (cacheLevel === 'local' && $.isObjectNull($.storage))) {
            cacheLevel = 'page';
        }
        return cacheLevel;
    }

    function getCacheProvider(lvl) {
        switch (lvl) {
            case 'session':
                return $.session;
            case 'local':
                return $.storage;
            default:
                return __global;
        }
    }

    //API
    Evoque.cache = function () {
        if (this.length !== 1)
        {
            return null;
        }
        var key = this.getAttr(__elementCacheKeyProperty);
        if ($.isStringEmpty(key))
        {
            key = $.guid();
            this.setAttr(__elementCacheKeyProperty, key);
        }
        var isGCStarted = __gcCacheKeys.length > 0;
        if (!$.cache.containsKey(key))
        {
            $.cache.push(key, new cacheClass());
            __gcCacheKeys.push(key);
        }
        if (!isGCStarted) {
            gcCache();
        }
        return $.cache.get(key);
    };

    //Evoque.cache的回收处理
    var __gcCacheKeys = [];
    function gcCache() {
        if (__gcCacheKeys.length > 0) {
            for (var i in __gcCacheKeys) {
                var key = __gcCacheKeys[i];
                if ($('*[' + __elementCacheKeyProperty + '="' + key + '"]').length === 0) {
                    $.cache.del(key);
                    delete __gcCacheKeys[i];
                }
            }
            __gcCacheKeys = __gcCacheKeys.filter(function (loop) {
                return $.checkType(loop) !== type.eUndefined;
            });
        }
        if (__gcCacheKeys.length > 0) {
            setTimeout(gcCache, 180000);
        }
    }

    return self;
}({})));