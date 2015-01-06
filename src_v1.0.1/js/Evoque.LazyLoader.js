//Dependency: Evoque.js
$.extend('lazyLoader', (function (self) {
    var defaultOption = {};

    var imgSrcAttrName = 'data-lazy-src';

    var loaderInstance = null;

    self.init = function (option) {
        option = option || {};
        option = $(option);

        var $lazyImgList = $('img[' + imgSrcAttrName + ']');
        var lazyImgList = [];
        var scrollTop = getCurrentScrollTop();
        $lazyImgList.each(function () {
            var obj = {
                imgObj: $(this),
                isHide: $(this).isHide(),
                isLoaded: false,
                currentTop: -1,
                currentBottom: -1
            };
            if (!obj.isHide) {
                var rec = this.getBoundingClientRect();
                obj.currentTop = scrollTop + rec.top;
                obj.currentBottom = scrollTop + rec.bottom;
            }
            lazyImgList.push(obj);
            this.__lazyImgListFlag = true;
        });

        window.addEventListener('scroll', loadImage);
        loadImage();

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
                if (viewportTop <= obj.currentBottom && viewportBottom >= obj.currentTop) {
                    obj.imgObj.setAttr('src', obj.imgObj.getAttr(imgSrcAttrName));
                    obj.isLoaded = true;
                }
            }
        }

        function getCurrentScrollTop() {
            var scrollTop = document.documentElement.scrollTop;
            if (scrollTop == 0)
            {
                scrollTop = document.body.scrollTop;
            }
            return scrollTop;
        }

        return {
            load: loadImage,
            append: function (dom) {
                var $appendLazyImgList = null;
                if ($.checkType(dom) === type.eElement) {
                    $appendLazyImgList = $(dom).getChild('img[' + imgSrcAttrName + ']');
                }
                else {
                    $appendLazyImgList = $('img[' + imgSrcAttrName + ']');
                }
                $appendLazyImgList.each(function () {
                    if ($.checkType(this.__lazyImgListFlag) === type.eBoolean && this.__lazyImgListFlag) {
                        return;
                    }
                    var obj = {
                        imgObj: $(this),
                        isHide: $(this).isHide(),
                        isLoaded: false,
                        currentTop: -1,
                        currentBottom: -1
                    };
                    if (!obj.isHide) {
                        var rec = this.getBoundingClientRect();
                        obj.currentTop = scrollTop + rec.top;
                        obj.currentBottom = scrollTop + rec.bottom;
                    }
                    lazyImgList.push(obj);
                    this.__lazyImgListFlag = true;
                });
            }
        };
    };

    self.load = function () {
        if ($.isObjectNull(loaderInstance)) {
            return;
        }
        loaderInstance.load();
    };

    self.append = function (dom) {
        if ($.isObjectNull(loaderInstance)) {
            return;
        }
        loaderInstance.append(dom);
    };

    $.load(function () {
        loaderInstance = $.lazyLoader.init();
    });

    return self;
}({})));