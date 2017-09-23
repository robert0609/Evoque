//Dependency: Evoque.js, Evoque.Cache.js
lexus.extend('lazyLoader', (function (self) {
    var defaultOption = {};

    var imgSrcAttrName = 'data-lazy-src';

    var loaderInstance = null;

    self.init = function (option) {
        option = option || {};
        option = lexus(option);

        var lazyImgList = [];
        initLazyImgList();

        window.addEventListener('scroll', loadImage);
        loadImage();

        function initLazyImgList() {
            lazyImgList = [];
            var scrollTop = getCurrentScrollTop();
            var $lazyImgList = lexus('img[' + imgSrcAttrName + ']');
            $lazyImgList.each(function () {
                var obj = {
                    imgObj: lexus(this),
                    isHide: lexus(this).isHide(),
                    isLoaded: false,
                    currentTop: -1,
                    currentBottom: -1
                };
                //隐藏的img不计入监控
                if (obj.isHide) {
                    return;
                }
                var rec = this.getBoundingClientRect();
                obj.currentTop = scrollTop + rec.top;
                obj.currentBottom = scrollTop + rec.bottom;
                lazyImgList.push(obj);
                this.__lazyImgListFlag = true;
            });
        }

        function loadImage() {
            var scrollTop = getCurrentScrollTop();
            var winHeight = document.documentElement.clientHeight;
            var scrollBottom = scrollTop + winHeight;
            var viewportTop = scrollTop - winHeight / 2;
            var viewportBottom = scrollBottom + winHeight / 2;
            for (var i = 0; i < lazyImgList.length; ++i) {
                var obj = lazyImgList[i];
                if (obj.isHide || obj.isLoaded) {
                    continue;
                }
                if (obj.currentTop < 0) {
                    var rec = obj.imgObj[0].getBoundingClientRect();
                    obj.currentTop = scrollTop + rec.top;
                    obj.currentBottom = scrollTop + rec.bottom;
                }
                //判断是否该元素滚动到可视范围
                if (viewportTop <= obj.currentBottom && viewportBottom >= obj.currentTop)
                {
                    var defaultSrc = obj.imgObj.getAttr('src');
                    obj.imgObj.cache().set('defaultSrc', defaultSrc);
                    obj.imgObj.addEventHandler('error', imageLoadError);
                    obj.imgObj.setAttr('src', obj.imgObj.getAttr(imgSrcAttrName));
                    obj.isLoaded = true;
                }
            }
        }

        function imageLoadError() {
            $(this).setAttr('src', $(this).cache().get('defaultSrc'));
            $(this).removeEventHandler('error', imageLoadError);
        }

        function getCurrentScrollTop() {
            var scrollTop = document.documentElement.scrollTop;
            if (scrollTop == 0)
            {
                scrollTop = document.body.scrollTop;
            }
            return scrollTop;
        }

        loaderInstance = {
            load: loadImage,
            reset: initLazyImgList,
            update: function (dom) {
                var $appendLazyImgList = null;
                if (lexus.checkType(dom) === type.eElement) {
                    $appendLazyImgList = lexus(dom).getChild('img[' + imgSrcAttrName + ']');
                }
                else {
                    $appendLazyImgList = lexus('img[' + imgSrcAttrName + ']');
                }
                var scrollTop = getCurrentScrollTop();
                $appendLazyImgList.each(function () {
                    if (lexus.checkType(this.__lazyImgListFlag) === type.eBoolean && this.__lazyImgListFlag) {
                        return;
                    }
                    var obj = {
                        imgObj: lexus(this),
                        isHide: lexus(this).isHide(),
                        isLoaded: false,
                        currentTop: -1,
                        currentBottom: -1
                    };
                    //隐藏的img不计入监控
                    if (obj.isHide) {
                        return;
                    }
                    var rec = this.getBoundingClientRect();
                    obj.currentTop = scrollTop + rec.top;
                    obj.currentBottom = scrollTop + rec.bottom;
                    lazyImgList.push(obj);
                    this.__lazyImgListFlag = true;
                });
            }
        };
    };

    lexus(['load', 'reset', 'update']).each(function () {
        var that = this;
        self[that] = function () {
            if (lexus.isObjectNull(loaderInstance)) {
                return;
            }
            return loaderInstance[that].apply(loaderInstance, arguments);
        };
    });

    lexus(function () {
        self.init();
    });

    return self;
}({})));