//Dependency: Evoque.js
Evoque.tab = (function (self)
{
    var titleClass = 'mtab-title';
    var contentClass = 'mtab-content';

    var indexAttrName = 'tabIndex';

    var defaultOption = {
        tabDivId: '',
        defaultTabIndex: -1,
        //'horizontal'、'vertical'。default: 'horizontal'
        orientation: 'horizontal',
        //if orientation === 'vertical', this property is valid!
        verticalContentHeight: 0,
        onTabSwitched: function () {}
    };

    self.create = function (option, tabDivElement)
    {
        if ($.isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        option = $(option);
        var orientation = option.getValueOfProperty('orientation', defaultOption);
        if (![ 'horizontal', 'vertical' ].contains(orientation)) {
            orientation = 'horizontal';
        }
        var verticalContentHeight = option.getValueOfProperty('verticalContentHeight', defaultOption);

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
            var $tabObj = $('#' + tabId);
            if ($tabObj.length === 0) {
                throw 'Parameter is error!';
            }
            tabId = $tabObj[0];
        }
        if ($.isObjectNull(tabId.__tabControl)) {
            tabId.__tabControl = new tabClass(tabId, option.getValueOfProperty('defaultTabIndex', defaultOption), orientation, verticalContentHeight, option.getValueOfProperty('onTabSwitched', defaultOption));
        }
    };

    self.resetScrollBox = function (tabDivElement) {
        if ($.isObjectNull(tabDivElement.__tabControl)) {
            return;
        }
        tabDivElement.__tabControl.resetScrollBox();
    };

    function tabClass(tabDivElement, defaultTabIndex, orientation, verticalContentHeight, onTabSwitched)
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
        //增加唯一Attr
        var guid = $.guid();
        tabDivObj.setAttr('data-guid', guid);
        var titleArray = tabDivObj.getChild('*[data-guid="' + guid + '"]>.' + titleClass + '>*[' + indexAttrName + ']').sort(sortBy);
        var contentArray = tabDivObj.getChild('*[data-guid="' + guid + '"]>.' + contentClass + '>*[' + indexAttrName + ']').sort(sortBy);

        for (var i = 0; i < titleArray.length; ++i)
        {
            var title = titleArray[i];
            var idx = title.getAttribute(indexAttrName);
            var content = contentArray[i];
            tabList[idx] = new tcPairClass(idx, title, content);
        }

        if (orientation === 'vertical' && verticalContentHeight > 0) {
            tabDivObj.getChild('*[data-guid="' + guid + '"]>.' + titleClass).setStyle('height', verticalContentHeight + 'px');
            contentArray.setStyle('height', verticalContentHeight + 'px');
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
            var $content = $(tabList[tabIndex].Content);
            $content.show();

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
        var currentTitle = tabDivObj.getChild('*[data-guid="' + guid + '"]>.' + titleClass + '>*[' + indexAttrName + '="' + defaultTabIndex + '"]');
        if (currentTitle.length > 0)
        {
            switchTo(Number(currentTitle.getAttr(indexAttrName)));
        }
        else if (titleArray.length > 0)
        {
            switchTo(Number(titleArray.getAttr(indexAttrName)));
        }

        return {
            resetScrollBox: function () {
                /*if ($.checkType(currentIndex) !== type.eNumber) {
                    return;
                }
                var $content = $(tabList[currentIndex].Content);
                if (orientation === 'vertical' && verticalContentHeight > 0) {
                    $content.setStyle('height', verticalContentHeight + 'px');
                    $content.scrollBox.recreate();
                }*/
            }
        };
    }

    //API
    Evoque.createTab = function (option)
    {
        option = option || {};
        this.each(function () {
            self.create(option, this);
        });
    };

    Evoque.resetScrollBoxOfTab = function () {
        this.each(function () {
            self.resetScrollBox(this);
        });
    };

    return self;
}(Evoque.tab || {}));