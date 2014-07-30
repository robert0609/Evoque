//Dependency: Evoque.js, Evoque.Cache.js
Evoque.extend('scrollNavigator', (function (self) {
    var defaultOption = {
        visualWidth: 200,
        displayThingCount: 1
    };

    self.create = function (option) {
        option = option || {};
        option = $(option);
        var visualWidth = option.getValueOfProperty('visualWidth', defaultOption);
        var displayThingCount = option.getValueOfProperty('displayThingCount', defaultOption);
        var caller = self.evoqueTarget;
        caller.each(function () {
            var thisCache = $(this).cache();
            if (!thisCache.containsKey('scrollNavigator'))
            {
                thisCache.push('scrollNavigator', new navigatorClass(this, visualWidth, displayThingCount));
            }
        });
    };

    self.next = function () {
        var parameters = arguments;
        var caller = self.evoqueTarget;
        caller.each(function () {
            var thisCache = $(this).cache();
            if (thisCache.containsKey('scrollNavigator'))
            {
                thisCache.get('scrollNavigator').next.apply(thisCache.get('scrollNavigator'), parameters);
            }
        });
    };

    self.previous = function () {
        var parameters = arguments;
        var caller = self.evoqueTarget;
        caller.each(function () {
            var thisCache = $(this).cache();
            if (thisCache.containsKey('scrollNavigator'))
            {
                thisCache.get('scrollNavigator').previous.apply(thisCache.get('scrollNavigator'), parameters);
            }
        });
    };

    self.setDisplayIndex = function () {
        var parameters = arguments;
        var caller = self.evoqueTarget;
        caller.each(function () {
            var thisCache = $(this).cache();
            if (thisCache.containsKey('scrollNavigator'))
            {
                thisCache.get('scrollNavigator').setDisplayIndex.apply(thisCache.get('scrollNavigator'), parameters);
            }
        });
    };

    function navigatorClass(element, visualWidth, displayThingCount) {
        element.style.width = visualWidth + 'px';
        var $container = $(element);
        var $ul = $container.getChild('ul');
        if ($ul.length !== 1)
        {
            throw '滚动导航栏的div只能包含一个ul';
        }
        var ul = $ul[0];
        var $li = $ul.getChild('li');
        var liCount = $li.length;
        var liWidth = visualWidth / displayThingCount;
        ul.style.width = liWidth * liCount + 'px';
        $li.setStyle('width', liWidth + 'px');

        var switchMaxCount = liCount - (displayThingCount - 1);

        var currentIndex = 0;

        //切换动画变量
        var stopAnimation = true;
        var speed = 0;
        //ul的移动方向
        var direction = 0;
        var targetLeft = 0;
        var moveDistance = liWidth;

        this.next = function () {
            if (currentIndex === switchMaxCount - 1) {
                return;
            }
            speed = moveDistance / 100;
            direction = -1;
            var clientLeft = getLeft.call(ul);
            targetLeft = clientLeft + direction * moveDistance;
            stopAnimation = false;
            ++currentIndex;
            moveAnimation();
        };
        this.previous = function () {
            if (currentIndex === 0) {
                return;
            }
            speed = moveDistance / 50;
            direction = 1;
            var clientLeft = getLeft.call(ul);
            targetLeft = clientLeft + direction * moveDistance;
            stopAnimation = false;
            --currentIndex;
            moveAnimation();
        };
        this.setDisplayIndex = function (index) {
            if (index < 0)
            {
                index = 0;
            }
            else if (index >= switchMaxCount) {
                index = switchMaxCount - 1;
            }
            currentIndex = index;
            var l = 0 - liWidth * index;
            ul.style.left = l + 'px';
        };

        function moveAnimation() {
            var clientLeft = getLeft.call(ul);
            if (stopAnimation || speed == 0 || direction == 0 || clientLeft == targetLeft) {
                return;
            }
            var newLeftValue = clientLeft + speed * direction;
            if (direction > 0) {
                if (newLeftValue >= targetLeft) {
                    newLeftValue = targetLeft;
                    stopAnimation = true;
                }
            }
            else {
                if (newLeftValue <= targetLeft) {
                    newLeftValue = targetLeft;
                    stopAnimation = true;
                }
            }
            ul.style.left = newLeftValue + 'px';
            setTimeout(moveAnimation, 10);
        }

        function getLeft() {
            var leftStr = this.style.left;
            if ($.isStringEmpty(leftStr)) {
                return 0;
            }
            else {
                return Number(leftStr.replace('px', ''));
            }
        }
    }

    return self;
}({})));