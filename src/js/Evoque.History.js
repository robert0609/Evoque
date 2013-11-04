//Dependency: Evoque.js, json2.js
$.history = (function (self)
{
    var START_FLAG = 0;
    var SEQ_FLAG = 1;
    var END_FLAG = 9;

    var mainFlowId = '$$$$';
    var currentFlowId = null;

    function getCacheList() {
        if (!!window.sessionStorage)
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

    self.add = function (url, flowId, flag) {
        if ($.isStringEmpty(flowId))
        {
            if ($.isStringEmpty(currentFlowId))
            {
                flowId = mainFlowId;
            }
            else
            {
                flowId = currentFlowId;
            }
        }
        if ($.isStringEmpty(url))
        {
            throw 'url is null!';
        }
        if ($.checkType(flag) !== type.eNumber)
        {
            flag = SEQ_FLAG;
        }
        else
        {
            flag = $(flag).getVal();
        }

        currentFlowId = flowId;
        getCacheList().push({
            flowId: flowId,
            flag: flag,
            url: url
        });
    };

    self.back2LastUrl = function () {
        var _cacheList = getCacheList();
        if (_cacheList.length() > 1)
        {
            return _cacheList.pop(2).url;
        }
        else
        {
            return null;
        }
    };

    self.back2Flow = function (flowId) {};

    self.back2LastFlow = function () {
        var _cacheList = getCacheList();
        if (_cacheList.length() < 2)
        {
            return null;
        }
        while (_cacheList.length() > 0)
        {
            var pop = _cacheList.pop();
            if (pop.flowId == currentFlowId)
            {
                continue;
            }
            return pop.url;
        }
        return null;
    };

    self.length = function () {
        var _cacheList = getCacheList();
        return _cacheList.length();
    };

    return self;
}($.history || {}));

function back2Last()
{
    $.loadPage($.history.back2LastUrl());
}

function back2LastFlow()
{
    $.loadPage($.history.back2LastFlow());
}