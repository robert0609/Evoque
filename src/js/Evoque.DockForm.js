//Dependency: Evoque.js
Evoque.dockForm = (function (self) {
    var defaultOption = {
        elementId: '',
        // top|bottom|left|right. default: bottom
        direction: 'bottom',
        onShow: function () {},
        onHide: function () {}
    };

    var dockFormInstances = {};

    self.show = function (option, element) {
        self.hide();

        if ($.isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        option = $(option);
        if ($.checkType(element) !== type.eElement)
        {
            var id = option.getValueOfProperty('elementId', defaultOption);
            if ($.isStringEmpty(id))
            {
                throw 'Parameter is error!';
            }
            element = document.getElementById(id);
        }
        var dir = option.getValueOfProperty('direction', defaultOption).toLowerCase();
        if ($.isObjectNull(dockFormInstances[dir]))
        {
            dockFormInstances[dir] = new dockFormClass(dir);
        }

        dockFormInstances[dir].show(element);
    };

    self.hide = function () {
        for (var p in dockFormInstances)
        {
            if ($.checkType(dockFormInstances[p].hide) === type.eFunction)
            {
                dockFormInstances[p].hide();
            }
        }
    };

    function dockFormClass(direction)
    {
        var that = this;

        var docWidth = document.documentElement.clientWidth;
        var docHeight = document.documentElement.clientHeight;
        var maxWidth = Math.floor(docWidth * 0.8);
        var maxHeight = Math.floor(docHeight * 0.8);

        var div = document.createElement('div');
        $(div).addClass('dockform-dg-div');
        div.style[direction] = '0';
        switch (direction)
        {
            case 'left':
            case 'right':
                div.style.top = '0';
                div.style.height = docHeight + 'px';
                break;
            default:
                div.style.left = '0';
                div.style.width = docWidth + 'px';
                break;
        }

        var bgObj = document.createElement('div');
        $(bgObj).addClass('dockform-bg-div');
        bgObj.style.width = docWidth + 'px';
        bgObj.style.height = getbackgroundHeight() + 'px';
        bgObj.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(style=3,opacity=25,finishOpacity=75)';
        $(bgObj).addEventHandler('click', function () {
            that.hide();
        });

        function getbackgroundHeight()
        {
            if (document.body.clientHeight > document.documentElement.clientHeight)
            {
                return document.body.clientHeight;
            }
            else
            {
                return document.documentElement.clientHeight;
            }
        }

        var parentCache = null;
        this.currentShowElement = null;
        var showFlag = false;

        this.show = function (element) {
            if (showFlag)
            {
                this.hide();
            }
            parentCache = element.parentElement;
            this.currentShowElement = element;
            div.appendChild(element);
            $(element).show();
            document.body.appendChild(bgObj);
            document.body.appendChild(div);
            setDivSize(element);
            $(div).addClass('bottomTop');
            showFlag = true;

            return this;
        };

        function setDivSize(element)
        {
            switch (direction)
            {
                case 'left':
                case 'right':
                    if (element.clientWidth < maxWidth)
                    {
                        div.style.width = element.clientWidth + 'px';
                    }
                    else
                    {
                        div.style.width = maxWidth + 'px';
                    }
                    break;
                default:
                    if (element.clientHeight < maxHeight)
                    {
                        div.style.height = element.clientHeight + 'px';
                    }
                    else
                    {
                        div.style.height = maxHeight + 'px';
                    }
                    break;
            }
        }

        this.hide = function () {
            if (!showFlag)
            {
                return;
            }
            $(div).removeClass('bottomTop');
            document.body.removeChild(div);
            var element = this.currentShowElement;
            $(element).hide();
            document.body.removeChild(bgObj);
            parentCache.appendChild(element);
            parentCache = null;
            this.currentShowElement = null;
            showFlag = false;
        };
    }

    //API
    Evoque.showDockForm = function (option) {
        option = option || {};
        if (this.length < 1)
        {
            return;
        }
        self.show(option, this[0]);
    };

    Evoque.hideDockForm = function () {
        self.hide();
    };

    return self;
}(Evoque.dockForm || {}));
