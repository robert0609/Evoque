//Dependency: Evoque.js
$.history = (function (self)
{
    self.CMD_NORMAL = 1;
    self.CMD_NOHISTORY = 2;
    self.CMD_BEGINTRAN = 3;
    self.CMD_ENDTRAN = 4;
    self.command = self.CMD_NORMAL;

    //var defaultRecord = { pageId: '', pageUrl: '', transaction:0 };
    var historyKey = 'historyList';
    var historyList = [];

    function syncHistoryList()
    {
        if ($.session.containsKey(historyKey))
        {
            historyList = $.session.getJson(historyKey);
        }
        else
        {
            $.session.setJson(historyKey, historyList);
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

    self.show = function () {
        var div = document.createElement('div');
        document.body.appendChild(div);
        syncHistoryList();
        for (var i = 0; i < historyList.length; ++i)
        {
            var hPop = historyList[i];
            var str = '<div>PageId:<em>' + hPop.pageId + '</em>; PageUrl:<em>' + hPop.pageUrl + '</em>; Transaction:<em>' + hPop.transaction + '</em></div>';
            div.innerHTML += str;
        }
    };

    self.back = function () {
        var pageId = $('meta[name="pageid"]').getAttr('content');
        if ($.isStringEmpty(pageId))
        {
            return;
        }
        var p = pop(pageId);
        if ($.isObjectNull(p))
        {
            return;
        }
        this.command = this.CMD_NOHISTORY;
        $.loadPage(p.pageUrl);
    };

    self.backLastTran = function () {
        var pageId = $('meta[name="pageid"]').getAttr('content');
        if ($.isStringEmpty(pageId))
        {
            return;
        }
        endCurrentTransaction();
        this.back();
    };

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
                $.loadPage(desUrl);
            });
        });
    }

    $(function () {
        enableCustomAttribute(begintransaction);
        enableCustomAttribute(endtransaction);

        $.unload(function () {
            var pageId = $('meta[name="pageid"]').getAttr('content');
            if ($.isStringEmpty(pageId))
            {
                return;
            }
            var url = location.href;
            switch ($.history.command)
            {
                case $.history.CMD_NOHISTORY:
                    break;
                case $.history.CMD_BEGINTRAN:
                    push({
                        pageId: pageId,
                        pageUrl: url,
                        transaction: generateTransaction()
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
                        transaction: curTran
                    });
                    break;
            }
        });
    });

    return self;
}($.history || {}));
