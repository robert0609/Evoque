//Dependency: Evoque.js
Evoque.extend('lazyLoader', (function (self) {
    var defaultOption = {};

    var imgSrcAttrName = 'data-evoque-img-src';

    self.init = function (option) {
        option = option || {};
        option = $(option);
        var caller = self.evoqueTarget;
        caller.each(function () {
            var thisCache = $(this).cache();
            if (!thisCache.containsKey('lazyloader'))
            {
                thisCache.push('lazyloader', new carouselClass(this, loop, height, ratio, onSwitched));
            }
        });
    };

    function lazyLoadClass() {

    }

    return self;
}({})));