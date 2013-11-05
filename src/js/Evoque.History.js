//Dependency: Evoque.js, json2.js
$.history = (function (self)
{
    self.NORMAL = 1;
    self.CLEARCURFLOW = 2;
    self.CLEAR = 3;
    self.REPLACE = 4;
    self.REPLACECURFLOW = 5;
    var FLAG_NORMAL = 1;
    var FLAG_CLEARCURFLOW = 2;
    var FLAG_CLEAR = 3;
    var FLAG_REPLACE = 4;
    var FLAG_REPLACECURFLOW = 5;

    var mainFlowId = '$$$$';

    function getCacheList() {
        if (self.supportWebStorage())
        {
            var cache = [];
            var cacheStr = sessionStorage.getItem('sessionhistory');
            if (!$.isStringEmpty(cacheStr))
            {
                cache = JSON.parse(cacheStr);
            }
            return {
                push: function (obj) {
                    if (cache.length > 0 && cache.slice(-1)[0].url === obj.url)
                    {
                        //refresh
                        return;
                    }
                    cache.push(obj);
                    sessionStorage.setItem('sessionhistory', JSON.stringify(cache));
                },
                pop: function (n) {
                    if (!n || n < 1)
                    {
                        n = 1;
                    }
                    if (n > cache.length)
                    {
                        n = cache.length;
                    }
                    var ret;
                    for (var i = 0; i < n; ++i)
                    {
                        ret = cache.pop();
                    }
                    sessionStorage.setItem('sessionhistory', JSON.stringify(cache));
                    return ret;
                },
                peek: function () {
                    if (cache.length < 1)
                    {
                        return null;
                    }
                    return cache.slice(-1)[0];
                },
                clear: function () {
                    cache.splice(0, cache.length);
                    sessionStorage.setItem('sessionhistory', JSON.stringify(cache));
                },
                length: function () {
                    return cache.length;
                }
            };
        }
        else
        {
            // 浏览器不支持WebStorage的情况
            throw '浏览器不支持WebStorage';
        }
    }

    self.supportWebStorage = function () {
        return !!window.sessionStorage;
    };

    self.add = function (record) {
        var url = location.href;
        record = record || {};
        var flowId = record.flowId;
        var flag = record.flag;
        if ($.checkType(flag) !== type.eNumber)
        {
            flag = FLAG_NORMAL;
        }
        else
        {
            flag = $(flag).getVal();
        }
        var _cacheList = getCacheList();
        if (flag == FLAG_CLEAR)
        {
            _cacheList.clear();
        }
        else if (flag == FLAG_REPLACE)
        {
            while (_cacheList.length() > 0)
            {
                var pop = _cacheList.pop();
                if (pop.url == url)
                {
                    continue;
                }
                else
                {
                    break;
                }
            }
        }
        var currentFlowId = mainFlowId;
        if (_cacheList.length() > 0)
        {
            currentFlowId = _cacheList.peek().flowId;
        }

        if ($.isStringEmpty(flowId))
        {
            flowId = currentFlowId;
        }
        if (flag == FLAG_CLEARCURFLOW || flag == FLAG_REPLACECURFLOW)
        {
            while (_cacheList.length() > 0)
            {
                var peek = _cacheList.peek();
                if (peek.flowId == currentFlowId)
                {
                    _cacheList.pop();
                }
                else
                {
                    break;
                }
            }
            if (flag == FLAG_REPLACECURFLOW)
            {
                _cacheList.push({
                    flowId: flowId,
                    flag: flag,
                    url: url
                });
            }
        }
        else
        {
            _cacheList.push({
                flowId: flowId,
                flag: flag,
                url: url
            });
        }
    };

    self.back = function () {
        var _cacheList = getCacheList();
        while (_cacheList.length() > 0)
        {
            var pop = _cacheList.pop();
            if (pop.url == location.href)
            {
                continue;
            }
            else
            {
                return pop.url;
            }
        }
        return null;
    };

    self.length = function () {
        var _cacheList = getCacheList();
        return _cacheList.length();
    };

    self.setSession = function (key, val) {
        sessionStorage.setItem(key, val);
    };
    self.getSession = function (key) {
        return sessionStorage.getItem(key);
    };
    self.delSession = function (key) {
        sessionStorage.removeItem(key);
    };

    return self;
}($.history || {}));