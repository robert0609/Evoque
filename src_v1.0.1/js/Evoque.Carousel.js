//Dependency: Evoque.js, Evoque.Cache.js
Evoque.extend('carousel', (function (self) {
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
                thisCache.push('carousel', new carouselClass(this, loop, height, ratio));
            }
        });
    };

    self.next = function () {
        var caller = self.evoqueTarget;
        caller.each(function () {
            var thisCache = $(this).cache();
            if (thisCache.containsKey('carousel'))
            {
                thisCache.get('carousel').next();
            }
        });
    };
    self.prev = function () {
        var caller = self.evoqueTarget;
        caller.each(function () {
            var thisCache = $(this).cache();
            if (thisCache.containsKey('carousel'))
            {
                thisCache.get('carousel').prev();
            }
        });
    };
    self.display = function (index) {
        var parameters = arguments;
        var caller = self.evoqueTarget;
        caller.each(function () {
            var thisCache = $(this).cache();
            if (thisCache.containsKey('carousel'))
            {
                thisCache.get('carousel').display.apply(thisCache.get('carousel'), parameters);
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
        var sizeObj = setSize();

        var positionX = 0;
        var currentIndex = 0;

        imgUl.drag(function (e) {
            var mx = e.detail.moveX;
            positionX += mx;
            if (positionX > sizeObj.moveMin) {
                positionX = sizeObj.moveMin;
            }
            else if (positionX < sizeObj.moveMax) {
                positionX = sizeObj.moveMax;
            }
            transform(positionX);
        });
        imgUl.swipeLeft(function () {
            move(1);
        });
        imgUl.swipeRight(function () {
            move(-1);
        });
        imgUl.addEventHandler('webkitTransitionEnd', function () {
            this.style.removeProperty('-webkit-transition');
        });

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
            return {
                totalWidth: ulWidth,
                singleWidth: frameWidth,
                moveMin: 0,
                moveMax: 0 - frameWidth * (imgCount - 1)
            };
        }

        function transform(px) {
            imgUl[0].style.webkitTransform = 'translateX(' + px + 'px)';
        }
        function transition() {
            imgUl[0].style.webkitTransition = 'all .3s';
        }

        function move(d) {
            if (d > 0) {
                if (currentIndex < imgCount - 1) {
                    ++currentIndex;
                }
            }
            else if (d < 0) {
                if (currentIndex > 0) {
                    --currentIndex;
                }
            }
            else {
                return;
            }
            positionX = 0 - currentIndex * sizeObj.singleWidth;
            transform(positionX);
            transition();
        }

        function innerDisplay(index) {
            positionX = 0 - index * sizeObj.singleWidth;
            transform(positionX);
        }

        return {
            next: function () {
                move(1);
            },
            prev: function () {
                move(-1);
            },
            display: function (index) {
                innerDisplay(index);
            }
        };
    }

    return self;
}({})));
