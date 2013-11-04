//Dependency: Evoque.js, json2.js
$.history = (function (self)
{
    var START_FLAG = 0;
    var SEQ_FLAG = 1;
    var END_FLAG = 9;

    var mainFlowId = 'mainFlow';

    function getCacheList() {
        if (!!window.sessionStorage)
        {
            var cacheStr = sessionStorage.getItem('sessionhistory');
            if (!cacheStr)
            {
                cacheStr = [];
                sessionStorage.setItem('sessionhistory', cacheStr);
            }
            return cacheStr;
        }
        else
        {
            // 浏览器不支持WebStorage的情况
            throw '浏览器不支持WebStorage';
        }
    }

    self.add = function (flowId, url, flag) {
        if ($.isStringEmpty(flowId))
        {
            flowId = mainFlowId;
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

        getCacheList().push({
            flowId: flowId,
            flag: flag,
            url: url
        });
    };

    self.back2LastUrl = function () {
        var _cacheList = getCacheList();
        if (_cacheList.length > 0)
        {
            return _cacheList.pop().url;
        }
        else
        {
            return null;
        }
    };

    self.back2Flow = function (flowId) {};

    self.back2LastFlow = function () {
        var _cacheList = getCacheList();
        if (_cacheList.length < 2)
        {
            return null;
        }
        var currentFlowId = _cacheList.pop().flowId;
        while (_cacheList.length > 0)
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
        return _cacheList.length;
    };

    return self;
}($.history || {}));