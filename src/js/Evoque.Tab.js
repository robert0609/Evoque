//Dependency: Evoque.js
Evoque.tab = (function (self)
{
    var titleClass = 'mtab-title';
    var contentClass = 'mtab-content';

    var indexAttrName = 'tabIndex';

    var defaultOption = {
        tabDivId: '',
        onTabSwitched: function () {}
    };

    self.create = function (option, tabDivElement)
    {
        if ($.isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        option = $(option);
        var tabId;
        if ($.checkType(tabDivElement) === type.eElement)
        {
            tabId = tabDivElement;
        }
        else
        {
            tabId = option.getValueOfProperty('tabDivId', defaultOption);
            if ($.isStringEmpty(tabId))
            {
                throw 'Parameter is error!';
            }
        }
        return new tabClass(tabId, option.getValueOfProperty('onTabSwitched', defaultOption));
    };

    function tabClass(tabDivElement, onTabSwitched)
    {
        var tabList = {};

        var currentIndex;

        var tabDivObj = null;
        if ($.checkType(tabDivElement) === type.eElement)
        {
            tabDivObj = $(tabDivElement);
        }
        else if ($.checkType(tabDivElement) === type.eString)
        {
            tabDivObj = $('#' + tabDivElement);
        }
        else
        {
            throw 'Invalid parameter!';
        }
        var titleArray = tabDivObj.getChild('.' + titleClass + '>div[' + indexAttrName + ']').sort(sortBy);
        var contentArray = tabDivObj.getChild('.' + contentClass + '>div[' + indexAttrName + ']').sort(sortBy);

        for (var i = 0; i < titleArray.length; ++i)
        {
            var title = titleArray[i];
            var idx = title.getAttribute(indexAttrName);
            var content = contentArray[i];
            tabList[idx] = new tcPairClass(idx, title, content);
        }

        function tcPairClass(index, title, content)
        {
            var nIndex = Number(index);
            this.TabIndex = nIndex;
            this.Title = title;
            this.Content = content;

            $(title).addEventHandler('click', function ()
            {
                switchTo(nIndex, onTabSwitched);
            }, false);
        }

        function sortBy(a, b)
        {
            var ia = Number(a.getAttribute(indexAttrName));
            var ib = Number(b.getAttribute(indexAttrName));
            return ia - ib;
        }

        function switchTo(tabIndex, tabSwitchedHandler)
        {
            if ($.checkType(currentIndex) !== type.eUndefined)
            {
                if (currentIndex == tabIndex)
                {
                    return;
                }
                $(tabList[currentIndex].Title).removeClass('active');
                $(tabList[currentIndex].Content).hide();
            }

            $(tabList[tabIndex].Title).addClass('active');
            $(tabList[tabIndex].Content).show();

            if ($.checkType(tabSwitchedHandler) === type.eFunction)
            {
                tabSwitchedHandler.call(tabList[tabIndex].Content, {
                    lastSelectIndex : currentIndex,
                    currentSelectIndex : tabIndex
                });
            }
            currentIndex = tabIndex;
        }

        contentArray.hide();
        if (titleArray.length > 0)
        {
            switchTo(Number(titleArray.getAttr(indexAttrName)));
        }
    }

    //API
    Evoque.createTab = function (option)
    {
        option = option || {};
        this.each(function () {
            self.create(option, this);
        });
    };

    return self;
}(Evoque.tab || {}));