//Dependency: Evoque.js, Evoque.Cache.js
$.extend('carousel', (function (self) {
    var defaultOption = {
        loop: false,
        height: 0,
        ratio: 4/3
    };

    self.create = function (option) {
        option = option || {};
        option = $(option);
        var caller = self.evoqueTarget;
        var loop = option.getValueOfProperty('loop', defaultOption);
        var height = option.getValueOfProperty('height', defaultOption);
        var ratio = option.getValueOfProperty('ratio', defaultOption);

        caller.each(function () {
            var thisCache = $(this).cache();
            if (!thisCache.containsKey('carousel'))
            {
                thisCache.push('carousel', new carouselClass(this, loop));
            }
        });
    };

    function carouselClass(element, loop, height, ratio) {
        var imgFrame = $(element);
        var imgUl = imgFrame.getChild('ul');
        if (imgUl.length !== 1) {
            throw 'DOM Error!';
        }
        var imgLiList = imgUl.getChild('li');
        if (imgLiList.length === 0) {
            throw '<li>count error';
        }
        var imgCount = imgLiList.length;

        imgFrame.addClass('hotel-slidercontainer');
        setSize();

        imgUl.addEventHandler('touchstart', function (e) {});
        imgUl.addEventHandler('touchstart', function (e) {});

        function setSize() {
            var frameWidth = document.documentElement.clientWidth;
            var frameHeight = 0;
            if (height > 0)
            {
                frameHeight = height;
            }
            else
            {
                frameHeight = Math.floor(frameWidth / ratio);
            }
            imgFrame.setStyle('width', frameWidth + 'px');
            imgFrame.setStyle('height', frameHeight + 'px');
            var ulWidth = frameWidth * imgCount;
            imgUl.setStyle('width', ulWidth + 'px');
            imgLiList.setStyle('width', frameWidth + 'px');
            imgLiList.setStyle('height', frameHeight + 'px');
        }
    }

    return self;
}({})));
