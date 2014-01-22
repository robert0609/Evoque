//Dependency: Evoque.js
$.history = (function (self)
{
    //history enable switcher
    var _enable = genEnable(true);

    self.CMD_NORMAL = 1;
    self.CMD_NOHISTORY = 2;
    self.CMD_BEGINTRAN = 3;
    self.CMD_ENDTRAN = 4;
    self.command = self.CMD_NORMAL;

    //var defaultRecord = { pageId: '', pageUrl: '', transaction:0, top: 0 };
    var historyKey = 'historyList';
    var historyList = [];
    var isSync = false;

    function genEnable(val)
    {
        return val && $.supportSessionStorage();
    }

    function syncHistoryList()
    {
        if (!isSync)
        {
            if ($.session.containsKey(historyKey))
            {
                historyList = $.session.getJson(historyKey);
            }
            else
            {
                $.session.setJson(historyKey, historyList);
            }
            isSync = true;
        }
    }

    function push(record)
    {
        syncHistoryList();
        while (historyList.length > 0)
        {
            var peek = historyList.slice(-1)[0];
            if (peek.pageId === record.pageId)
            {
                historyList.pop();
            }
            else
            {
                break;
            }
        }
        historyList.push(record);
        $.session.setJson(historyKey, historyList);
    }

    function pop(currentPageId)
    {
        syncHistoryList();
        var ret = null;
        while (historyList.length > 0)
        {
            var po = historyList.pop();
            if ($.isStringEmpty(currentPageId))
            {
                ret = po;
                break;
            }
            else
            {
                if (po.pageId === currentPageId)
                {
                    continue;
                }
                else
                {
                    ret = po;
                    break;
                }
            }
        }
        $.session.setJson(historyKey, historyList);
        return ret;
    }

    function peek(currentPageId)
    {
        syncHistoryList();
        var ret = null;
        while (historyList.length > 0)
        {
            var pe = historyList.slice(-1)[0];
            if (pe.pageId === currentPageId)
            {
                historyList.pop();
                continue;
            }
            else
            {
                ret = pe;
                break;
            }
        }
        $.session.setJson(historyKey, historyList);
        return ret;
    }

    function endCurrentTransaction()
    {
        syncHistoryList();
        if (historyList.length == 0)
        {
            return;
        }
        var curTran = historyList.slice(-1)[0].transaction;
        if (curTran > 0)
        {
            var po = historyList.pop();
            while (historyList.length > 0)
            {
                var pe = historyList.slice(-1)[0];
                if (po.transaction === pe.transaction)
                {
                    historyList.pop();
                }
                else
                {
                    break;
                }
            }
            $.session.setJson(historyKey, historyList);
        }
    }

    function clear()
    {
        syncHistoryList();
        historyList.splice(0, historyList.length);
        $.session.setJson(historyKey, historyList);
    }

    function generateTransaction()
    {
        return (new Date()).getTime();
    }

    self.enable = function (val) {
        if ($.checkType(val) === type.eBoolean)
        {
            _enable = genEnable(val);
        }
        else
        {
            return _enable;
        }
    };

    self.show = function () {
        if (!_enable)
        {
            return null;
        }
        var ret = '';
        syncHistoryList();
        for (var i = 0; i < historyList.length; ++i)
        {
            var hPop = historyList[i];
            var str = '<div>PageId:<em>' + hPop.pageId + '</em>; PageUrl:<em>' + hPop.pageUrl + '</em>; Transaction:<em>' + hPop.transaction + '</em>; Top:<em>' + hPop.top + '</em></div>';
            ret += str;
        }
        return ret;
    };

    self.back = function () {
        if (!_enable)
        {
            window.removeEventListener('popstate', winPopStateHandle);
            history.go(-1);
            return;
        }
        var pageId = $('meta[name="pageid"]').getAttr('content');
        var p = pop(pageId);
        if ($.isObjectNull(p))
        {
            window.removeEventListener('popstate', winPopStateHandle);
            history.go(-1);
            return;
        }
        this.command = this.CMD_NOHISTORY;
        $.loadPage(p.pageUrl + '#' + p.top);
    };

    self.backLastTran = function () {
        if (!_enable)
        {
            window.removeEventListener('popstate', winPopStateHandle);
            history.go(-1);
            return;
        }
        endCurrentTransaction();
        this.back();
    };

    /**
     * 点击浏览器后退按钮所调用的回调
     */
    self.backHandleByBrowser = function () {};

    var _currentUrl = null;
    var _currentTitle = null;
    function winPopStateHandle(e)
    {
        try
        {
            if (!_enable)
            {
                return;
            }
            if ($.isObjectNull(e.state))
            {
                return;
            }
            self.backHandleByBrowser();
        }
        finally
        {
            history.replaceState({ backIsClicked: true }, _currentTitle, _currentUrl);
            history.pushState({ backIsClicked: true }, _currentTitle, _currentUrl);
        }
    }

    var nohistory = 'nohistory';
    var begintransaction = 'begintransaction';
    var endtransaction = 'endtransaction';
    function enableCustomAttribute(attribute)
    {
        var $href = $('a[' + attribute + '][href]');
        $href.each(function (i) {
            var $this = $(this);
            var desUrl = $this.getAttr('href');
            if ($.isStringEmpty(desUrl) || desUrl.toLowerCase().indexOf('javascript:') > -1)
            {
                return;
            }
            $this.setAttr('href', 'javascript:void(0);');
            $this.addEventHandler('click', function () {
                if (attribute === begintransaction)
                {
                    $.history.command = $.history.CMD_BEGINTRAN;
                }
                else if (attribute === endtransaction)
                {
                    $.history.command = $.history.CMD_ENDTRAN;
                }
                else if (attribute === nohistory)
                {
                    $.history.command = $.history.CMD_NOHISTORY;
                }
                $.loadPage(desUrl);
            });
        });
    }

    $(function () {
        if (!_enable)
        {
            return;
        }
        enableCustomAttribute(nohistory);
        enableCustomAttribute(begintransaction);
        enableCustomAttribute(endtransaction);

        $.unload(function () {
            var pageId = $('meta[name="pageid"]').getAttr('content');
            if ($.isStringEmpty(pageId))
            {
                return;
            }
            var url = location.href;
            var idx = url.indexOf('#');
            if (idx > -1)
            {
                url = url.substr(0, idx);
            }
            var scrollTop = document.body.scrollTop;
            switch ($.history.command)
            {
                case $.history.CMD_NOHISTORY:
                    break;
                case $.history.CMD_BEGINTRAN:
                    push({
                        pageId: pageId,
                        pageUrl: url,
                        transaction: generateTransaction(),
                        top: scrollTop
                    });
                    break;
                case $.history.CMD_ENDTRAN:
                    endCurrentTransaction();
                    break;
                default:
                    var pe = peek(pageId);
                    var curTran = 0;
                    if (!$.isObjectNull(pe))
                    {
                        curTran = pe.transaction;
                    }
                    push({
                        pageId: pageId,
                        pageUrl: url,
                        transaction: curTran,
                        top: scrollTop
                    });
                    break;
            }
        });
        //浏览器后退按钮控制机制
        _currentUrl = location.href;
        _currentTitle = document.title;
        window.addEventListener('popstate', winPopStateHandle);
        if ($.agent() === mAgent.windows)
        {
            history.replaceState({ backIsClicked: true }, _currentTitle, _currentUrl);
            history.pushState({ backIsClicked: true }, _currentTitle, _currentUrl);
        }
    });

    return self;
}($.history || {}));
