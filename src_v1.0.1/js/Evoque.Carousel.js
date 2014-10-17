//Dependency: Evoque.js, Evoque.Cache.js
Evoque.extend('carousel', (function (self) {
    var defaultOption = {
        loop: false,
        height: 0,
        ratio: 4/3,
        onSwitched: function () {}
    };

    self.create = function (option) {
        option = option || {};
        option = $(option);
        var caller = self.evoqueTarget;
        var loop = option.getValueOfProperty('loop', defaultOption);
        var height = option.getValueOfProperty('height', defaultOption);
        var ratio = option.getValueOfProperty('ratio', defaultOption);
        var onSwitched = option.getValueOfProperty('onSwitched', defaultOption);

        caller.each(function () {
            var thisCache = $(this).cache();
            if (!thisCache.containsKey('carousel'))
            {
                thisCache.push('carousel', new carouselClass(this, loop, height, ratio, onSwitched));
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

    function carouselClass(element, loop, height, ratio, onSwitched) {
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
        var imgLiCache = [];
        imgLiList.each(function () {
            imgLiCache.push(this);
        });

        imgFrame.addClass('hotel-slidercontainer');
        var sizeObj = setSize();

        var positionX = 0;
        var currentIndex = -1;
        innerDisplay(0);

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
            var nextIndex = 0;
            if (d > 0) {
                nextIndex = currentIndex + 1;
            }
            else if (d < 0) {
                nextIndex = currentIndex - 1;
            }
            else {
                return;
            }

            if (nextIndex < 0) {
                if (loop) {
                    nextIndex = imgCount + nextIndex;
                }
                else {
                    nextIndex = 0;
                }
            }
            else if (nextIndex > imgCount - 1) {
                if (loop) {
                    nextIndex = nextIndex - imgCount;
                }
                else {
                    nextIndex = imgCount - 1;
                }
            }

            innerDisplay(nextIndex, d);
        }

        function innerDisplay(index, direction) {
            if (index < 0) {
                index = 0;
            }
            else if (index > imgCount - 1) {
                index = imgCount - 1;
            }
            if (index === currentIndex) {
                return;
            }

            if ($.checkType(direction) !== type.eNumber) {
                direction = 0;
            }
            var transitionFlag = direction !== 0;
            //循环展示
            if (loop) {
                /*if (currentIndex > -1) {
                    if (direction > 0) {
                        var n = index - currentIndex;
                        if (index < currentIndex) {
                            n = imgCount + index - currentIndex;
                        }
                        var ppx = 0 - (n + 1) * sizeObj.singleWidth;
                        if (transitionFlag) {
                            transition();
                        }
                        transform(ppx);
                    }
                    else {
                        var m = currentIndex - index;
                    }
                }
                currentIndex = index;
                if (transitionFlag) {
                    imgUl.addEventHandler('webkitTransitionEnd', callBackResortImages);
                }
                else {
                    resortImages();
                }*/
            }
            else {
                currentIndex = index;
                positionX = 0 - currentIndex * sizeObj.singleWidth;
                if (transitionFlag) {
                    transition();
                }
                transform(positionX);
                if ($.checkType(onSwitched) === type.eFunction) {
                    onSwitched.call(element, {
                        imageIndex: currentIndex
                    });
                }

                //加载邻接的图片
                loadImage(currentIndex);
                if (currentIndex > 0) {
                    loadImage(currentIndex - 1);
                }
                if (currentIndex < imgCount - 1) {
                    loadImage(currentIndex + 1);
                }
            }
        }

        function loadImage(index) {
            var $img = $(imgLiCache[index]).getChild('img');
            var dataSrc = $img.getAttr('data-src');
            var src = $img.getAttr('src');
            if ($.isStringEmpty(src)) {
                $img.setAttr('src', dataSrc);
            }
        }

        function resortImages() {
            imgUl.hide();
            var i =0;
            for (i = currentIndex + 1; i < imgCount; ++i) {
                imgUl[0].appendChild(imgLiCache[i]);
            }
            for (i = 0; i < currentIndex - 1; ++i) {
                imgUl[0].appendChild(imgLiCache[i]);
            }
            if (currentIndex === 0) {
                imgUl[0].insertBefore(imgLiCache[imgCount - 1], imgLiCache[currentIndex]);
            }
            else {
                imgUl[0].insertBefore(imgLiCache[currentIndex - 1], imgLiCache[currentIndex]);
            }
            imgUl.show();
            positionX = 0 - sizeObj.singleWidth;
            transform(positionX);
        }

        function callBackResortImages() {
            resortImages();
            imgUl.removeEventHandler('webkitTransitionEnd', callBackResortImages);
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
