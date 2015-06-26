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

        var touchStateDictionary = {};

        $content.addEventHandler('touchstart', function (e) {
            if (e.touches.length !== 1)
            {
                return;
            }
            if (e.target.id !== contentId)
            {
                var touchState = new TouchStateClass(e.touches[0].identifier, e.target);
                touchState.addTouchPoint(new PointClass(e.touches[0].clientX, e.touches[0].clientY));
                touchStateDictionary[e.touches[0].identifier] = touchState;
            }
            _start(e.touches[0]);
            lexus.cancelDefault(e);
        });
        $content.addEventHandler('touchmove', function (e) {
            if (e.touches.length !== 1)
            {
                return;
            }
            if (e.target.id !== contentId)
            {
                var touchState = touchStateDictionary[e.touches[0].identifier];
                touchState.addTouchPoint(new PointClass(e.touches[0].clientX, e.touches[0].clientY));
            }
            _move(e.touches[0]);
        });
        $content.addEventHandler('touchend', function (e) {
            if (e.changedTouches.length !== 1 || e.touches.length !== 0)
            {
                return;
            }
            if (e.target.id !== contentId)
            {
                var touchState = touchStateDictionary[e.changedTouches[0].identifier];
                touchState.addTouchPoint(new PointClass(e.changedTouches[0].clientX, e.changedTouches[0].clientY));
                touchState.over();
                var evtTyp = touchState.touchType();
                if (evtTyp.length > 0 && evtTyp[0].name === 'tap') {
                    lexus(touchState.target).dispatchClick();
                }
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

    //判断触摸行为来模拟点击行为的辅助类
    function TouchStateClass(identifier, target)
    {
        var identifier = identifier;
        this.target = target;

        this.touchStartTime = null;
        this.touchEndTime = null;
        this.touchPointList = [];
        this.rangeX = 0;
        this.rangeY = 0;

        this.addTouchPoint = function (point) {
            if (this.touchPointList.length > 0)
            {
                var sp = this.touchPointList[0];
                var rx = Math.abs(point.x - sp.x);
                var ry = Math.abs(point.y - sp.y);
                this.rangeX = Math.max(this.rangeX, rx);
                this.rangeY = Math.max(this.rangeY, ry);
            }
            else {
                this.touchStartTime = point.timestamp;
            }
            this.touchPointList.push(point);
        };

        this.over = function () {
            if (this.touchPointList.length > 0) {
                this.touchEndTime = this.touchPointList[this.touchPointList.length - 1].timestamp;
            }
        };

        this.touchType = function () {
            var types = [];
            var touchSpan = this.touchEndTime - this.touchStartTime;
            //tap
            if (touchSpan < 750 && this.rangeX < 4 && this.rangeY < 4)
            {
                types.push({ name: 'tap' });
                return types;
            }
            return types;
        };
    }

    function PointClass(x, y)
    {
        this.x = x;
        this.y = y;
        this.timestamp = new Date();
    }

    return self;
}({})));
