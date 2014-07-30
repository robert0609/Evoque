//Dependency: Evoque.js
Evoque.extend('cardNoInputer', (function (self) {

    var defaultOption = {
        totalLength: 10,
        boxLength: 4
    };

    self.create = function (option) {
        option = option || {};
        var $option = $(option);
        var totalLength = $option.getValueOfProperty('totalLength', defaultOption);
        var boxLength = $option.getValueOfProperty('boxLength', defaultOption);
        if (totalLength === 0 || boxLength === 0) {
            return;
        }
        var caller = self.evoqueTarget;
        caller.each(function () {
            var cardInput = new cardInputClass(this, totalLength, boxLength);
        });
    };

    function isNumber(text) {
        return /^\d+$/g.test(text);
    }

    function cardInputClass(input, totalLength, boxLength) {
        var div = document.createElement('div');
        $(div).addClass('container-div');
        var boxNum = Math.ceil(totalLength / boxLength);
        var lastBoxLen = totalLength % boxLength;
        for (var i = 0; i < boxNum; ++i) {
            var len = boxLength;
            if (lastBoxLen > 0 && i === boxNum - 1) {
                len = lastBoxLen;
            }
            div.appendChild(createBox(i, len));
        }
        input.type = 'hidden';
        input.parentElement.insertBefore(div, input);
        var $input = $(input);
        var $boxes = $(div).getChild('input[data-index]');

        function createBox(idx, boxLength) {
            var box = document.createElement('input');
            var $box = $(box);
            $box.addClass('box-input');
            box.type = 'tel';
            box.style.width = Math.ceil(boxLength * 2 / 3) + 'em';
            $box.setAttr('maxlength', boxLength);
            $box.setAttr('data-index', idx);

            var originalValue = '';
            $box.addEventHandler('input', function () {
                var strVal = $box.getVal();
                if (!isNumber(strVal)) {
                    $box.setVal(originalValue);
                }
                originalValue = $box.getVal();
                //将输入同步至原来的input
                syncInput();
                if (strVal.length === boxLength) {
                    var nextIdx = idx + 1;
                    var $next = $(div).getChild('input[data-index="' + nextIdx + '"]');
                    if ($next.length > 0) {
                        $next[0].focus();
                        $next.dispatchClick();
                    }
                }
            });
            return box;
        }

        function syncInput() {
            var valArray = new Array(boxNum);
            $boxes.each(function () {
                var $this = $(this);
                var idx = Number($this.getAttr('data-index'));
                valArray[idx] = $.isStringEmpty($this.getVal()) ? '' : $this.getVal();
            });
            $input.setVal(valArray.join(''));
        }
    }

    return self;
}({})));