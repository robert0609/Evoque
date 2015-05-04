//Dependency: Evoque.js, Evoque.Ajax.js, Evoque.Dialog.js
Evoque.extend('loader', (function (self) {
    var defaultOption = {
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

    self.load = function (option) {
        option = option || {};
        option = lexus(option);
        if (self.evoqueTarget.length === 0) {
            return;
        }
        var element = self.evoqueTarget[0];
        var loading = option.getValueOfProperty('loadingElementId', defaultOption);

        if (lexus.isObjectNull(element.__innerLoader) || !element.__innerLoader instanceof loaderClass)
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
        var loadingElement = lexus('#' + loadingElementId).html();
        if (loadingElement === null)
        {
            loadingElement = '';
        }

        var parent = element.previousElementSibling;
        element.style.textAlign = 'center';

        this.loadSomething = function (url, query, onsuccess, onfail, timeout, loadMode, delayReplace)
        {
            //判断是否引用了延迟加载插件
            var lazyLoaderEnable = !lexus.isObjectNull(lexus.lazyLoader);

            if (loadMode === 'replace' && delayReplace) {
                lexus.dialog.showLoading(loadingElementId);
            }
            else {
                if (loadMode === 'replace')
                {
                    parent.innerHTML = '';
                }
                element.innerHTML = loadingElement;
                lexus(element).show();
            }
            lexus.ajax.get({
                url : url,
                parameter : query,
                //returnType : 'html',
                onSuccess: function (returnObj)
                {
                    if (loadMode === 'replace' && delayReplace) {
                        lexus.dialog.closeCurrentDialog();
                    }
                    else {
                        lexus(element).hide();
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
                            if (lazyLoaderEnable) {
                                lexus.lazyLoader.reset();
                                lexus.lazyLoader.load();
                            }
                        }
                        else
                        {
                            if (lazyLoaderEnable) {
                                var docFrag = document.createElement('div');
                                docFrag.innerHTML = returnObj;
                                var $docFrag = lexus(docFrag);
                                $docFrag.getChild().each(function () {
                                    parent.appendChild(this);
                                    lexus.lazyLoader.update(this);
                                });
                                lexus.lazyLoader.load();
                            }
                            else {
                                parent.innerHTML += returnObj;
                            }
                        }
                        onsuccess.call(window);
                    }
                },
                onFail: function (e)
                {
                    if (loadMode === 'replace' && delayReplace) {
                        lexus.dialog.closeCurrentDialog();
                    }
                    else {
                        lexus(element).hide();
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
        return this.loader.load(option);
    };

    return self;
}({})));