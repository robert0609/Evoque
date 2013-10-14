//Dependency: Evoque.js, Evoque.Ajax.js
Evoque.loader = (function (self)
{
    var defaultOption = {
        elementId: '',
        loadingElementId: ''
    };

    self.create = function (option, element) {
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

        return new loaderClass(element, loading);
    };

    function loaderClass(element, loadingElementId)
    {
        var recieveDiv = document.createElement('div');
        var loadingElement = $('#' + loadingElementId).html();
        if (loadingElement === null)
        {
            loadingElement = '';
        }

        var parent = element.parentElement;

        this.load = function (url, query)
        {
            element.innerHTML = loadingElement;
            $.ajax.get({
                url : url,
                parameter : query,
                onSuccess : function (returnObj) {
                    recieveDiv.innerHTML = returnObj;
                    for (var i = 0; i < recieveDiv.childNodes.length; ++i)
                    {
                        parent.insertBefore(recieveDiv.childNodes[i], element);
                    }
                    element.innerHTML = '';
                },
                onFail : function () {
                    element.innerHTML = '';
                }
            });
        };
    }

    return self;
}(Evoque.loader || {}));