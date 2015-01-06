//Dependency: Evoque.js
$.extend('lazyLoader', (function (self) {
    var defaultOption = {};

    var imgSrcAttrName = 'data-lazy-src';

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
    };

    self.append = function (dom) {

    };

    $.load(function () {
        $.lazyLoader.init();
    });

    return self;
}({})));