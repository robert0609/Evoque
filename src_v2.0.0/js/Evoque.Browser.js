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
            if (idx > -1)
            {
                queryDic = queryStr2Dic(url.substr(idx));
                url = url.substr(0, idx);
            }
            for (var p in query)
            {
                queryDic[p] = query[p];
            }
            return url + queryDic2Str(queryDic);
        },
        removeParameter: function (parameterNames, url) {
            if (lexus.isStringEmpty(url)) {
                url = location.href;
            }
            var queryDic = {};
            var idx = url.indexOf('?');
            if (idx > -1)
            {
                queryDic = queryStr2Dic(url.substr(idx));
                url = url.substr(0, idx);
            }
            lexus(parameterNames).each(function () {
                if (this in queryDic) {
                    delete queryDic[this];
                }
            });
            return url + queryDic2Str(queryDic);
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