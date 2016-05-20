//Dependency: Evoque.js, Evoque.Ajax.js
lexus.extend('domLazyLoader', (function (self) {
    var defaultOption = {
        timeout: 30
    };

    lexus.declareCustomEvent('DomContentLoad');
    var domLoadUrlAttrName = 'data-dom-url';

    self.init = function (option) {
        option = option || {};
        option = lexus(option);
        var timeout = option.getValueOfProperty('timeout', defaultOption);
        //需要加载的dom区域列表
        var toLoadDoms = [];
        //判断是否所有的ajax加载处理都返回结果了
        function allAjaxGottenResult() {
            return toLoadDoms.every(function (elem) {
                return elem.ajaxResult > 0;
            });
        }

        var lazyDoms = initPlaceDoms();
        window.addEventListener('scroll', loadDom);
        loadDom();

        function initPlaceDoms() {
            var results = [];
            var scrollTop = getCurrentScrollTop();
            var evoqueDoms = lexus('*[' + domLoadUrlAttrName + ']');
            evoqueDoms.each(function () {
                var evoqueThis = lexus(this);
                var url = evoqueThis.getAttr(domLoadUrlAttrName);
                var obj = {
                    domObj: evoqueThis,
                    domUrl: url,
                    isHide: evoqueThis.isHide(),
                    isLoaded: false,
                    currentTop: -1,
                    currentBottom: -1
                };
                //隐藏的dom不计入监控
                if (obj.isHide) {
                    return;
                }
                results.push(obj);
            });

            return results;
        }

        function loadDom() {
            var scrollTop = getCurrentScrollTop();
            var winHeight = document.documentElement.clientHeight;
            var scrollBottom = scrollTop + winHeight;
            var viewportTop = scrollTop - winHeight / 2;
            var viewportBottom = scrollBottom + winHeight / 2;

            toLoadDoms = [];
            for (var i = 0; i < lazyDoms.length; ++i) {
                var obj = lazyDoms[i];
                if (obj.isHide || obj.isLoaded) {
                    continue;
                }
                var rec = obj.domObj[0].getBoundingClientRect();
                obj.currentTop = scrollTop + rec.top;
                obj.currentBottom = scrollTop + rec.bottom;
                //判断是否该元素滚动到可视范围
                if (viewportTop <= obj.currentBottom && viewportBottom >= obj.currentTop) {
                    obj.isLoaded = true;
                    toLoadDoms.push({
                        dom: obj,
                        //1: ajax加载成功; 2: ajax加载失败
                        ajaxResult: 0
                    });
                }
            }
            //如果待加载dom列表有数据，则触发加载动作
            if (toLoadDoms.length > 0) {
                for (var i = 0; i < toLoadDoms.length; ++i) {
                    loadDomContent(toLoadDoms[i]);
                }
            }
        }

        function loadDomContent(toLoadDom, tmpLoadingElement) {
            var evoqueDom = toLoadDom.dom.domObj;
            var url = toLoadDom.dom.domUrl;

            if (lexus.isStringEmpty(tmpLoadingElement)) {
                tmpLoadingElement = evoqueDom.html();
            }
            else {
                evoqueDom.html(tmpLoadingElement);
            }
            lexus.ajax.get({
                url: url,
                onSuccess: function (returnHtml) {
                    evoqueDom.html(returnHtml);
                    toLoadDom.ajaxResult = 1;
                    if (allAjaxGottenResult()) {
                        //再去尝试加载一遍Dom
                        loadDom();
                    }
                    //初始化图片延迟加载插件
                    var lazyLoaderEnable = !lexus.isObjectNull(lexus.lazyLoader);
                    if (lazyLoaderEnable) {
                        lexus.lazyLoader.update(evoqueDom[0]);
                        lexus.lazyLoader.load();
                    }
                    //触发DomContentLoad事件
                    evoqueDom.dispatchCustomEvent('DomContentLoad');
                },
                onFail: function (e) {
                    toLoadDom.ajaxResult = 2;
                    if (allAjaxGottenResult()) {
                        //再去尝试加载一遍Dom
                        loadDom();
                    }
                    //创建重试逻辑
                    var div = document.createElement('div');
                    div.innerHTML = '<p style="text-Align: center; margin: 0; padding: 15px;">加载失败，点击重试</p>'
                    div.addEventListener('click', function () {
                        loadDomContent(toLoadDom, tmpLoadingElement);
                    });
                    evoqueDom.html('');
                    evoqueDom[0].appendChild(div);
                },
                timeOut: timeout
            });

        }
    };

    function getCurrentScrollTop() {
        var scrollTop = document.documentElement.scrollTop;
        if (scrollTop == 0) {
            scrollTop = document.body.scrollTop;
        }
        return scrollTop;
    }

    lexus(function () {
        self.init();
    });

    return self;
}({})));