//Dependency: Evoque.js, Evoque.Ajax.js, Evoque.Dialog.js
Evoque.loader = (function (self)
{
    var defaultOption = {
        elementId: '',
        loadingElementId: '',
        url:'',
        // json
        query: {},
        onSuccess : function () {},
        onFail : function () {},
        timeOut : 30,
        // 'append', 'replace'
        loadMode: 'append',
        delayReplace: false
    };

    var loadExFlag = 'LoadException:';

    self.load = function (option, element) {
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
        var loading = option.getValueOfProperty('loadingElementId', defaultOption);

        if ($.isObjectNull(element.__innerLoader) || !element.__innerLoader instanceof loaderClass)
        {
            element.__innerLoader = new loaderClass(element, loading);
        }
        var url = option.getValueOfProperty('url', defaultOption);
        var query = option.getValueOfProperty('query', defaultOption);
        var onSuccess = option.getValueOfProperty('onSuccess', defaultOption);
        var onFail = option.getValueOfProperty('onFail', defaultOption);
        var timeout = option.getValueOfProperty('timeOut', defaultOption);
        var loadMode = option.getValueOfProperty('loadMode', defaultOption).toLowerCase();
        var delayReplace = option.getValueOfProperty('delayReplace', defaultOption);
        element.__innerLoader.loadSomething(url, query, onSuccess, onFail, timeout, loadMode, delayReplace);
    };

    function loaderClass(element, loadingElementId)
    {
        var loadingElement = $('#' + loadingElementId).html();
        if (loadingElement === null)
        {
            loadingElement = '';
        }

        var parent = element.previousElementSibling;
        element.style.textAlign = 'center';

        this.loadSomething = function (url, query, onsuccess, onfail, timeout, loadMode, delayReplace)
        {
            if (loadMode === 'replace' && delayReplace) {
                $.dialog.showLoading(loadingElementId);
            }
            else {
                if (loadMode === 'replace')
                {
                    parent.innerHTML = '';
                }
                element.innerHTML = loadingElement;
                $(element).show();
            }
            $.ajax.get({
                url : url,
                parameter : query,
                //returnType : 'html',
                onSuccess: function (returnObj)
                {
                    if (loadMode === 'replace' && delayReplace) {
                        $.dialog.closeCurrentDialog();
                    }
                    else {
                        $(element).hide();
                        element.innerHTML = '';
                    }
                    if (returnObj.trim().substr(0, 14) === loadExFlag)
                    {
                        onfail.call(window, { type: returnObj.trim().substr(14) });
                    }
                    else
                    {
                        if (loadMode === 'replace')
                        {
                            parent.innerHTML = returnObj;
                        }
                        else
                        {
                            parent.innerHTML += returnObj;
                        }
                        onsuccess.call(window);
                    }
                },
                onFail: function (e)
                {
                    if (loadMode === 'replace' && delayReplace) {
                        $.dialog.closeCurrentDialog();
                    }
                    else {
                        $(element).hide();
                        element.innerHTML = '';
                    }
                    onfail.call(window, e);
                },
                timeOut: timeout
            });
        };
    }

    //API
    Evoque.load = function (option)
    {
        option = option || {};
        if (this.length < 1)
        {
            return;
        }
        self.load(option, this[0]);
    };

    return self;
}(Evoque.loader || {}));