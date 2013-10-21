//Dependency: Evoque.js
Evoque.control = (function (self)
{
    var defaultOption_RangeSelect = {
        inputId: '',
        minVal: 0,
        maxVal: 0
    };

    self.rangeSelect = function (option, inputElement)
    {
        if ($.isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        option = $(option);
        var input;
        if ($.checkType(inputElement) === type.eElement)
        {
            input = $(inputElement);
        }
        else
        {
            var id = option.getValueOfProperty('inputId', defaultOption_RangeSelect);
            if ($.isStringEmpty(id))
            {
                throw 'Parameter is error!';
            }
            input = $('input[id="' + id + '"]');
        }
        var min = option.getValueOfProperty('minVal', defaultOption_RangeSelect);
        var max = option.getValueOfProperty('maxVal', defaultOption_RangeSelect);
        if (min > max)
        {
            throw 'Error:[min] > [max]';
        }
        input.each(function () {
            if ($(this).getAttr('type') == 'text')
            {
                generateRange(this);
            }
        });

        function generateRange(input)
        {
            var div = $(document.createElement('div'));
            div.addClass('form-add-sub');
            var input1 = $(input);
            input1.addClass('num');
            input1.setAttr('readonly', 'readonly');
            var aDown = $(document.createElement('a'));
            aDown.addClass('sub');
            aDown.setAttr('href', 'javascript:void(0);');
            aDown.addEventHandler('click', function () {
                var val = Number(input1.getVal());
                if (val > min)
                {
                    val -= 1;
                    setValue(val);
                }
            }, false);
            var aUp = $(document.createElement('a'));
            aUp.addClass('add');
            aUp.setAttr('href', 'javascript:void(0);');
            aUp.addEventHandler('click', function () {
                var val = Number(input1.getVal());
                if (val < max)
                {
                    val += 1;
                    setValue(val);
                }
            }, false);
            input.parentElement.replaceChild(div[0], input);
            div[0].appendChild(aDown[0]);
            div[0].appendChild(input1[0]);
            div[0].appendChild(aUp[0]);

            setValue(min);

            function setValue(val)
            {
                input1.setVal(val);
                if (val > min)
                {
                    aDown.removeClass('disabled');
                }
                else
                {
                    aDown.addClass('disabled');
                }
                if (val < max)
                {
                    aUp.removeClass('disabled');
                }
                else
                {
                    aUp.addClass('disabled');
                }
            }
        }
    };

    var defaultOption_Button = {
        elementId: '',
        classDown: '',
        onclick: function () {}
    };

    self.button = function (option, element)
    {
        if ($.isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        option = $(option);
        var btn;
        if ($.checkType(element) === type.eElement)
        {
            btn = $(element);
        }
        else
        {
            var id = option.getValueOfProperty('elementId', defaultOption_Button);
            if ($.isStringEmpty(id))
            {
                throw 'Parameter is error!';
            }
            btn = $('#' + id);
        }
        var classDown = option.getValueOfProperty('classDown', defaultOption_Button);
        var clickHandler = option.getValueOfProperty('onclick', defaultOption_Button);

        if ($.hasTouchEvent())
        {
            btn.addEventHandler('touchstart', function () {
                $(this).addClass(classDown);
            });
            btn.addEventHandler('touchend', function () {
                $(this).removeClass(classDown);
            });
        }
        else
        {
            btn.addEventHandler('mousedown', function () {
                $(this).addClass(classDown);
            });
            btn.addEventHandler('mouseup', function () {
                $(this).removeClass(classDown);
            });
        }
        btn.addEventHandler('mouseout', function (e) {
            // WebKit提供了event.which来标识是否按下了键以及是哪个键。 为0则表示没有按下键
            if (e.which == 0)
            {
                return;
            }
            $(this).removeClass(classDown);
        });
        btn.addEventHandler('click', clickHandler);
    };

    var defaultOption_SliderBar = {
        divId: '',
        // top|bottom|left|right
        dock: 'top'
    };

    self.sliderBar = function (option, divElement)
    {
        if ($.isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        option = $(option);
        var divCollection;
        if ($.checkType(divElement) === type.eElement)
        {
            divCollection = $(divElement);
        }
        else
        {
            var id = option.getValueOfProperty('divId', defaultOption_SliderBar);
            if ($.isStringEmpty(id))
            {
                throw 'Parameter is error!';
            }
            divCollection = $('#' + id);
        }
        var dock = option.getValueOfProperty('dock', defaultOption_SliderBar).toLowerCase();
        if (divCollection.length > 0)
        {
            divCollection[0].style.position = 'fixed';
            divCollection[0].style[dock] = '0';
            switch (dock)
            {
                case 'top':
                case 'bottom':
                    divCollection[0].style.left = '0';
                    divCollection[0].style.width = '100%';
                    break;
                case 'left':
                case 'right':
                    divCollection[0].style.top = '0';
                    divCollection[0].style.height = '100%';
                    break;
            }
        }
    };

    //API
    Evoque.createRangeSelect = function (option)
    {
        option = option || {};
        this.each(function () {
            self.rangeSelect(option, this);
        });
    };

    Evoque.createButton = function (option)
    {
        option = option || {};
        this.each(function () {
            self.button(option, this);
        });
    };

    Evoque.createSliderBar = function (option)
    {
        option = option || {};
        if (this.length < 1)
        {
            return null;
        }
        self.sliderBar(option, this[0]);
    };

    return self;
}(Evoque.control || {}));

