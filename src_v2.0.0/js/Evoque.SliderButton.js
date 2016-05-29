//Dependency: Evoque.js
Evoque.extend('sliderButton', (function (self) {
    var defaultOption = {
        min: 0,
        max: 100,
        valueChanged: function () { }
    };

    var controlHtml = '<div class="min" style="right:100%"><span class="handle"></span></div><div class="max" style="left:100%;"><span class="handle"></span></div>';

    Number.prototype.round5 = function () {
        var remainder = this % 5;
        return remainder > 3 ? this - remainder + 5 : this - remainder;
    };

    self.init = function (option) {
        option = option || {};
        option = lexus(option);
        var min = option.getValueOfProperty('min', defaultOption).round5();
        var max = option.getValueOfProperty('max', defaultOption).round5();
        var valueChanged = option.getValueOfProperty('valueChanged', defaultOption);
        if (min >= max) {
            throw 'sliderButton init failed! min >= max';
        }
        var caller = self.evoqueTarget;
        caller.each(function () {
            if (lexus.isObjectNull(this.__sliderButton)) {
                this.__sliderButton = new sliderButtonClass(this, min, max, valueChanged);
            }
        });
    };

    self.getValue = function () {
        var caller = self.evoqueTarget;
        var elem = caller[0];
        if (lexus.isObjectNull(elem.__sliderButton)) {
            return null;
        }
        else {
            return elem.__sliderButton.getValue();
        }
    };

    self.setValue = function (o) {
        var caller = self.evoqueTarget;
        var elem = caller[0];
        if (!lexus.isObjectNull(elem.__sliderButton)) {
            elem.__sliderButton.setValue(o);
        }
    };

    function sliderButtonClass(elem, min, max, valueChanged) {
        var evoqueElem = lexus(elem);
        evoqueElem.addClass('range');
        evoqueElem.html(controlHtml);

        var currentMin = min;
        var currentMax = max;
        var valueSpan = max - min;

        var evoqueLeftBtn = evoqueElem.getChild('.min>.handle');
        var evoqueRightBtn = evoqueElem.getChild('.max>.handle');
        var evoqueLeftDistance = evoqueElem.getChild('.min');
        var evoqueRightDistance = evoqueElem.getChild('.max');

        var recElem = elem.getBoundingClientRect();
        var recLeftBtn = evoqueLeftBtn[0].getBoundingClientRect();
        var recRightBtn = evoqueRightBtn[0].getBoundingClientRect();

        var sliderWidth = recElem.right - recElem.left;
        var leftBtnWidth = recLeftBtn.right - recLeftBtn.left;
        var rightBtnWidth = recRightBtn.right - recRightBtn.left;

        var leftBtnWidthPercent = leftBtnWidth / sliderWidth * 100;
        var rightBtnWidthPercent = rightBtnWidth / sliderWidth * 100;

        var sliderLeft = recElem.left - leftBtnWidth / 2;

        var offsetLeftMove = 0;
        var leftBtnMoveMinPercent = 0;
        evoqueLeftBtn.addEventHandler('touchstart', function (e) {
            if (e.touches.length !== 1) {
                return;
            }
            var touchX = e.touches[0].clientX;
            offsetLeftMove = touchX - evoqueLeftBtn[0].getBoundingClientRect().left;
            leftBtnMoveMinPercent = 100 - Number(evoqueRightDistance[0].style.left.trim('%')) + rightBtnWidthPercent;
            lexus.cancelDefault(e);
        });
        evoqueLeftBtn.addEventHandler('touchmove', function (e) {
            if (e.touches.length !== 1) {
                return;
            }
            var touchX = e.touches[0].clientX;
            //减去偏移量
            touchX -= offsetLeftMove;
            var percentValue = ((1 - (touchX - sliderLeft) / sliderWidth) * 100).toFixed(10);
            if (percentValue >= leftBtnMoveMinPercent && percentValue <= 100) {
                var newCurrentMin = (min + valueSpan * (1 - percentValue / 100)).round5();
                if (newCurrentMin !== currentMin) {
                    valueChanged.call(elem, {
                        min: newCurrentMin,
                        max: currentMax
                    });
                }
                currentMin = newCurrentMin;
                var percent = percentValue + '%';
                evoqueLeftDistance.setStyle('right', percent);
            }

            lexus.cancelDefault(e);
        });

        var offsetRightMove = 0;
        var rightBtnMoveMinPercent = 0;
        evoqueRightBtn.addEventHandler('touchstart', function (e) {
            if (e.touches.length !== 1) {
                return;
            }
            var touchX = e.touches[0].clientX;
            offsetRightMove = touchX - evoqueRightBtn[0].getBoundingClientRect().left;
            rightBtnMoveMinPercent = 100 - Number(evoqueLeftDistance[0].style.right.trim('%')) + leftBtnWidthPercent;
            lexus.cancelDefault(e);
        });
        evoqueRightBtn.addEventHandler('touchmove', function (e) {
            if (e.touches.length !== 1) {
                return;
            }
            var touchX = e.touches[0].clientX;
            //减去偏移量
            touchX -= offsetRightMove;
            var percentValue = ((touchX - sliderLeft) / sliderWidth * 100).toFixed(10);
            if (percentValue >= rightBtnMoveMinPercent && percentValue <= 100) {
                var newCurrentMax = (min + valueSpan * percentValue / 100).round5();
                if (newCurrentMax !== currentMax)
                {
                    valueChanged.call(elem, {
                        min: currentMin,
                        max: newCurrentMax
                    });
                }
                currentMax = newCurrentMax;
                var percent = percentValue + '%';
                evoqueRightDistance.setStyle('left', percent);
            }

            lexus.cancelDefault(e);
        });

        this.getValue = function () {
            return {
                min: currentMin,
                max: currentMax
            };
        };

        this.setValue = function (o) {
            var newMin = min,
                newMax = max;
            if (lexus.checkType(o.min) === type.eNumber) {
                newMin = o.min.round5();
            }
            if (lexus.checkType(o.max) === type.eNumber) {
                newMax = o.max.round5();
            }
            if (newMin > newMax) {
                return;
            }
            currentMin = newMin;
            currentMax = newMax;
            evoqueLeftDistance.setStyle('right', (max - currentMin) / (max - min) * 100 + '%');
            evoqueRightDistance.setStyle('left', (currentMax - min) / (max - min) * 100 + '%');
        };
    }

    return self;
}({})));