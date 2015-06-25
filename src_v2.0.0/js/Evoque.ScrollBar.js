//Dependency: Evoque.js, Evoque.Cache.js
Evoque.extend('scrollBar', (function (self) {
    var defaultOption = {
        //滚动方向，horizontal/vertical, default:'vertical'
        direction: 'vertical'
    };

    self.init = function (option) {
        option = option || {};
        option = lexus(option);
        var caller = self.evoqueTarget;
        var direction = option.getValueOfProperty('direction', defaultOption).toLowerCase();
        if (direction !== 'vertical' && direction !== 'horizontal') {
            direction = 'vertical';
        }
        caller.each(function () {
            var thisCache = lexus(this).cache();
            if (!thisCache.containsKey('scrollBar'))
            {
                thisCache.push('scrollBar', new scrollBarClass(this, direction));
            }
        });
    };

    function scrollBarClass(element, direction) {
        var directionFlags = 0;
        switch  (direction) {
            case 'vertical':
                directionFlags = 1;
                break;
            case 'horizontal':
                directionFlags = 2;
                break;
        }

        var $frame = lexus(element);
        if (lexus.checkType(element.firstElementChild) !== type.eElement) {
            throw 'Frame must contain one Content!';
        }
        var $content = lexus(element.firstElementChild);
        $frame.setStyle('position', 'relative');
        $frame.setStyle('overflow', 'hidden');
        var contentId = lexus.guid();
        $content.setAttr('id', contentId);
        $content.setStyle('position', 'absolute');
        $content.setStyle('left', '0');
        $content.setStyle('top', '0');
        if (directionFlags === 1) {
            //垂直滚动的情况
            $content.setStyle('width', '100%');
        }
        else if (directionFlags === 2) {
            //水平滚动的情况
            $content.setStyle('height', '100%');
        }

        var frameHeight = $frame[0].clientHeight;
        var frameWidth = $frame[0].clientWidth;
        var contentHeight = $content[0].clientHeight;
        var contentWidth = $content[0].clientWidth;
        if (directionFlags === 1 && contentHeight <= frameHeight) {
            return;
        }
        if (directionFlags === 2 && contentWidth <= frameWidth) {
            return;
        }
        $content.addEventHandler('webkitTransitionEnd', function () {
            this.style.removeProperty('-webkit-transition');
        });

        var speedHelper = {
            lastTime: 0,
            lastPosition: 0,
            getSpeed: function (currentTime, currentPosition) {
                var dis = Math.abs(currentPosition - this.lastPosition);
                return dis / (currentTime - this.lastTime);
            }
        };

        var scrollStartX = 0;
        var scrollEndX = 0 - contentWidth + frameWidth;
        var scrollStartY = 0;
        var scrollEndY = 0 - contentHeight + frameHeight;

        //一些计算变量
        var hasMoved = false;
        var lastClientX = 0;
        var lastClientY = 0;
        var directionX = 0;
        var directionY = 0;
        var lastTouchTime = 0;

        //是否能够滚动的标志
        var canScroll = true;

        var touchStartTime = 0;
        var touchEndTime = 0;
        //移动距离的累加
        var sumDistanceX = 0;
        var sumDistanceY = 0;

        //由于此种模拟是禁用了content的默认触摸行为，因此它的子级元素不能触发click事件，需要手动触发
        var handleEventDic = {};

        $content.addEventHandler('touchstart', function (e) {
            if (e.touches.length !== 1)
            {
                return;
            }
            if (e.target.id !== contentId)
            {

            }
            _start(e.touches[0]);
            lexus.cancelDefault(e);
        });
        $content.addEventHandler('touchmove', function (e) {
            if (e.touches.length !== 1)
            {
                return;
            }
            _move(e.touches[0]);
        });
        $content.addEventHandler('touchend', function (e) {
            if (e.changedTouches.length !== 1 || e.touches.length !== 0)
            {
                return;
            }
            _end(e.changedTouches[0]);
        });

        function _start(e) {
            if (!canScroll) {
                return;
            }
            lastClientX = e.clientX;
            lastClientY = e.clientY;
            lastTouchTime = (new Date()).getTime();

            touchStartTime = lastTouchTime;
        }
        function _move(e) {
            if (!canScroll) {
                return;
            }
            var currentClientX = e.clientX;
            var currentClientY = e.clientY;
            /*var originalDirection = directionFlags === 1 ? directionY : directionX;*/
            directionX = currentClientX === lastClientX ? directionX : (currentClientX > lastClientX ? 1 : -1);
            directionY = currentClientY === lastClientY ? directionY : (currentClientY > lastClientY ? 1 : -1);
            var currentTouchTime = (new Date()).getTime();

            var disX = Math.abs(currentClientX - lastClientX);
            var disY = Math.abs(currentClientY - lastClientY);
            sumDistanceX += directionX * disX;
            sumDistanceY += directionY * disY;
            if (directionFlags === 1)
            {
                //判断滑动是否超出范围了
                if (sumDistanceY > scrollStartY || sumDistanceY < scrollEndY) {
                    sumDistanceY -= directionY * disY * 2 / 3;
                }
                /*else {
                    //判断方向是否有变化，判断与上一次的时间的间隔是否过大，这两种情况都需要重新计算速度
                    if (directionY !== originalDirection || currentTouchTime - lastTouchTime >= 100)
                    {
                        speedHelper.lastTime = currentTouchTime;
                        speedHelper.lastPosition = sumDistanceY;
                    }
                }*/
            }
            if (directionFlags === 2)
            {
                //判断滑动是否超出范围了
                if (sumDistanceX > scrollStartX || sumDistanceX < scrollEndX) {
                    sumDistanceX -= directionX * disX * 2 / 3;
                }
            }

            transform(sumDistanceX, sumDistanceY);

            lastClientX = currentClientX;
            lastClientY = currentClientY;
            lastTouchTime = currentTouchTime;
        }
        function _end(e) {
            if (!canScroll) {
                return;
            }
            var currentClientX = e.clientX;
            var currentClientY = e.clientY;
            directionX = currentClientX === lastClientX ? directionX : (currentClientX > lastClientX ? 1 : -1);
            directionY = currentClientY === lastClientY ? directionY : (currentClientY > lastClientY ? 1 : -1);
            var currentTouchTime = (new Date()).getTime();

            var disX = Math.abs(currentClientX - lastClientX);
            var disY = Math.abs(currentClientY - lastClientY);
            sumDistanceX += directionX * disX;
            sumDistanceY += directionY * disY;
            //判断当前的触摸时间与上一次时间的差是否在100毫秒以内
            var timespan = currentTouchTime - lastTouchTime;

            if (directionFlags === 1)
            {
                //判断滑动是否超出范围了
                if (sumDistanceY > scrollStartY || sumDistanceY < scrollEndY) {
                    //回弹效果，在当前位置回弹回去
                    transition();
                    sumDistanceY = sumDistanceY > scrollStartY ? scrollStartY : scrollEndY;
                }
                else if (timespan < 100)
                {
                    //与上一次touchmove的时间间隔小于100毫秒即认为是手指很快的滑动的行为，此时需要计算惯性滑动距离
                    /*var speed = speedHelper.getSpeed(currentTouchTime, sumDistanceY);
                    var decelerateTime = speed / 0.006;
                    var momentumDistance = speed * decelerateTime - 0.006 * decelerateTime * decelerateTime / 2;*/
                    sumDistanceY += directionY * 100;
                    //判断滑动是否超出范围了
                    if (sumDistanceY > scrollStartY || sumDistanceY < scrollEndY) {
                        sumDistanceY = sumDistanceY > scrollStartY ? scrollStartY : scrollEndY;
                    }
                    transition1();
                }
            }
            if (directionFlags === 2)
            {
                //判断滑动是否超出范围了
                if (sumDistanceX > scrollStartX || sumDistanceX < scrollEndX) {
                    //回弹效果，在当前位置回弹回去
                    transition();
                    sumDistanceX = sumDistanceX > scrollStartX ? scrollStartX : scrollEndX;
                }
                else if (timespan < 100)
                {
                    //与上一次touchmove的时间间隔小于100毫秒即认为是手指很快的滑动的行为，此时需要计算惯性滑动距离
                    sumDistanceX += directionX * 100;
                    //判断滑动是否超出范围了
                    if (sumDistanceX > scrollStartX || sumDistanceX < scrollEndX) {
                        sumDistanceX = sumDistanceX > scrollStartX ? scrollStartX : scrollEndX;
                    }
                    transition1();
                }
            }

            transform(sumDistanceX, sumDistanceY);

            touchEndTime = currentTouchTime;

            //重置计算变量
            lastClientX = 0;
            lastClientY = 0;
            directionX = 0;
            directionY = 0;
            lastTouchTime = 0;

            canScroll = true;

            touchStartTime = 0;
        }

        function transform(disX, disY) {
            if (directionFlags === 1) {
                $content[0].style.webkitTransform = 'translateY(' + disY + 'px)';
            }
            else if (directionFlags === 2) {
                $content[0].style.webkitTransform = 'translateX(' + disX + 'px)';
            }
        }
        function transition() {
            $content[0].style.webkitTransition = 'all .3s ease';
        }

        function transition1() {
            $content[0].style.webkitTransition = 'all .3s ease-out';
        }
    }



    return self;
}({})));
