//Dependency: Evoque.js, Evoque.Cache.js
Evoque.extend('scrollBox', (function (self) {
    var defaultOption = {
        //滚动方向，horizontal/vertical, default:'vertical'
        direction: 'vertical'
    };

    self.create = function (option) {
        option = option || {};
        option = lexus(option);
        var caller = self.evoqueTarget;
        var direction = option.getValueOfProperty('direction', defaultOption).toLowerCase();
        if (direction !== 'vertical' && direction !== 'horizontal') {
            direction = 'vertical';
        }

        caller.each(function () {
            var thisCache = lexus(this).cache();
            if (!thisCache.containsKey('scrollBox'))
            {
                thisCache.push('scrollBox', new scrollBoxClass(this, direction));
            }
        });
    };

    self.recreate = function (option) {
        option = option || {};
        option = lexus(option);
        var caller = self.evoqueTarget;
        var direction = option.getValueOfProperty('direction', defaultOption).toLowerCase();
        if (direction !== 'vertical' && direction !== 'horizontal') {
            direction = 'vertical';
        }

        caller.each(function () {
            var thisCache = lexus(this).cache();
            if (thisCache.containsKey('scrollBox')) {
                thisCache.del('scrollBox');
            }
            thisCache.push('scrollBox', new scrollBoxClass(this, direction));
        });
    };

    function scrollBoxClass(element, direction) {
        var $frame = lexus(element);
        var $content = lexus(element.firstElementChild);
        if ($content.length === 0) {
            throw 'Frame must contain one Content!';
        }
        $frame.addClass('scroll-frame');
        $content.addClass('scroll-content');

        var frameRange = $frame[0].clientHeight;
        var contentRange = $content[0].clientHeight;
        if (direction === 'horizontal') {
            frameRange = $frame[0].clientWidth;
            contentRange = $content[0].clientWidth;
        }
        if (contentRange <= frameRange) {
            //TODO
            return;
        }

        var scrollStart = 0;
        var scrollEnd = 0 - contentRange + frameRange;

        var position = 0;
        $content.drag(function (e) {
            var m = e.detail.moveY;
            if (direction === 'horizontal') {
                m = e.detail.moveX;
            }
            position += m;
            if (position > scrollStart) {
                position = scrollStart;
            }
            else if (position < scrollEnd) {
                position = scrollEnd;
            }
            transform(position);
        });
        if (direction === 'horizontal') {
            $content.swipeLeft(function () {
                move(-1);
            });
            $content.swipeRight(function () {
                move(1);
            });
        }
        else {
            $content.swipeUp(function () {
                move(-1);
            });
            $content.swipeDown(function () {
                move(1);
            });
        }
        $content.addEventHandler('webkitTransitionEnd', function () {
            this.style.removeProperty('-webkit-transition');
        });

        var cacheDistance = 300;
        function move(endFlag) {
            var endPosition = position - cacheDistance;
            if (endPosition < scrollEnd) {
                endPosition = scrollEnd;
            }
            if (endFlag === 1) {
                endPosition = position + cacheDistance;
                if (endPosition > scrollStart) {
                    endPosition = scrollStart;
                }
            }
            transition();
            transform(endPosition);
            position = endPosition;
        }

        function transform(px) {
            if (direction === 'horizontal') {
                $content[0].style.webkitTransform = 'translateX(' + px + 'px)';
            }
            else {
                $content[0].style.webkitTransform = 'translateY(' + px + 'px)';
            }
        }
        function transition() {
            $content[0].style.webkitTransition = 'all .3s ease-out';
        }
    }

    return self;
}({})));