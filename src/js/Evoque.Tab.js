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

    self.create = function (option)
    {
        if (isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        if (isStringEmpty(option.tabDivId))
        {
            throw 'Parameter is error!';
        }
        return new tabClass(option.tabDivId, option.getValueOfProperty('onTabSwitched', defaultOption));
    };

    function tabClass(tabDivId, onTabSwitched)
    {
        var tabList = new Array();

        this.Id = tabDivId;
        var currentIndex = -1;

        var titleArray = $('#' + tabDivId + '>.' + titleClass + '>div').sort(sortBy);
        var contentArray = $('#' + tabDivId + '>.' + contentClass + '>div').sort(sortBy);

        for (var i = 0; i < titleArray.length; ++i)
        {
            var title = titleArray[i];
            var idx = title.getAttribute(indexAttrName);
            var content = contentArray[i];
            tabList.push(new tcPairClass(idx, title, content));
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
            if (currentIndex == tabIndex)
            {
                return;
            }
            for (var i = 0; i < tabList.length; ++i)
            {
                var pair = tabList[i];
                if (pair.TabIndex == tabIndex)
                {
                    pair.Content.style.display = 'block';
                    $(pair.Title).addClass('active');
                }
                else
                {
                    pair.Content.style.display = 'none';
                    $(pair.Title).removeClass('active');
                }
            }

            if (checkType(tabSwitchedHandler) === type.eFunction)
            {
                tabSwitchedHandler({
                    lastSelectIndex : currentIndex,
                    currentSelectIndex : tabIndex
                });
            }
            currentIndex = tabIndex;
        }

        if (tabList.length > 0)
        {
            switchTo(tabList[0].TabIndex);
        }
    }

    return self;
}(Evoque.tab || {}));