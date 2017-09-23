//Dependency: Evoque.js
lexus.extend('browser', (function (self) {

    var _enableClickBackControl;

    self.enableClickBackControl = function () {
        if (lexus.checkType(_enableClickBackControl) === type.eBoolean)
        {
            return _enableClickBackControl;
        }
        //查找文档元数据：<meta name="EvoqueClickBackControl" content="true" />
        var $meta = lexus('meta[name="EvoqueClickBackControl"]');
        if ($meta.length < 1)
        {
            _enableClickBackControl = false;
        }
        else
        {
            var content = $meta.getAttr('content');
            if (lexus.isStringEmpty(content) || content.toLowerCase() !== 'true')
            {
                _enableClickBackControl = false;
            }
            else
            {
                _enableClickBackControl = true;
            }
        }
        return _enableClickBackControl;
    };

    var clickBackHandles = [];
    var isTriggerPushed = false;

    self.clickBack = function (fn) {
        if (self.enableClickBackControl() && lexus.checkType(fn) === type.eFunction)
        {
            clickBackHandles.push(fn);
        }
    };

    window.addEventListener('popstate', function (e) {
        if (!self.enableClickBackControl() || !isTriggerPushed)
        {
            return;
        }
        try
        {
            lexus(clickBackHandles).each(function () {
                this.call();
            });
        }
        finally
        {
            window.history.pushState(e.state, document.title, location.href);
        }
    });

    self.pushBackHandleTrigger = function () {
        if (self.enableClickBackControl())
        {
            window.history.replaceState(history.state, document.title, location.href);
            window.history.pushState(history.state, document.title, location.href);
            isTriggerPushed = true;
        }
    };

    try
    {
        Object.defineProperty(location, 'query', {
            get: function () {
                if (!location.__queryDic) {
                    location.__queryDic = queryStr2Dic(location.search);
                }
                return location.__queryDic;
            }
        });
    }
    catch (e)
    {
        //经过测试，ios7版本的safari中不支持使用Object.defineProperty方法在location对象上扩展属性，会报出异常“Attempting to change access mechanism for an unconfiguable property”，故这样来扩展
        window.location.query = (function () {
            if (!location.__queryDic) {
                location.__queryDic = queryStr2Dic(location.search);
            }
            return location.__queryDic;
        }());
    }

    /**
     * URL操作工具
     */
    self.location = {
        addParameter: function (query, url) {
            if (lexus.isStringEmpty(url)) {
                url = location.href;
            }
            var queryDic = {};
            var idx = url.indexOf('?');
            var anchorIdx = url.indexOf('#');
            var anchor = '';
            if (idx > -1) {
                if (anchorIdx > -1) {
                    queryDic = queryStr2Dic(url.substr(idx, anchorIdx - idx));
                    anchor = url.substr(anchorIdx);
                    url = url.substr(0, idx);
                }
                else {
                    queryDic = queryStr2Dic(url.substr(idx));
                    url = url.substr(0, idx);
                }
            }
            else if (anchorIdx > -1) {
                anchor = url.substr(anchorIdx);
                url = url.substr(0, anchorIdx);
            }
            for (var p in query)
            {
                queryDic[p] = encodeURIComponent(query[p]);
            }
            return url + queryDic2Str(queryDic) + anchor;
        },
        removeParameter: function (parameterNames, url) {
            if (lexus.isStringEmpty(url)) {
                url = location.href;
            }
            var queryDic = {};
            var idx = url.indexOf('?');
            var anchorIdx = url.indexOf('#');
            var anchor = '';
            if (idx > -1)
            {
                if (anchorIdx > -1) {
                    queryDic = queryStr2Dic(url.substr(idx, anchorIdx - idx));
                    anchor = url.substr(anchorIdx);
                    url = url.substr(0, idx);
                }
                else {
                    queryDic = queryStr2Dic(url.substr(idx));
                    url = url.substr(0, idx);
                }
            }
            else if (anchorIdx > -1) {
                anchor = url.substr(anchorIdx);
                url = url.substr(0, anchorIdx);
            }
            lexus(parameterNames).each(function () {
                if (this in queryDic) {
                    delete queryDic[this];
                }
            });
            return url + queryDic2Str(queryDic) + anchor;
        }
    };
    function queryStr2Dic(str) {
        if (lexus.isStringEmpty(str)) {
            return {};
        }
        var dic = {};
        var kvps = str.substr(1).split('&');
        for (var i = 0; i < kvps.length; ++i) {
            var kv = kvps[i].split('=');
            var k = kv[0];
            var v = '';
            if (kv.length > 1) {
                v = kv[1];
            }
            dic[k] = v;
        }
        return dic;
    }
    function queryDic2Str(dic) {
        var str = '';
        var arr = [];
        for (var k in dic) {
            var v = dic[k];
            var kv = k + '=' + v;
            arr.push(kv);
        }
        if (arr.length > 0) {
            str = '?' + arr.join('&');
        }
        return str;
    }


    return self;
}({})));