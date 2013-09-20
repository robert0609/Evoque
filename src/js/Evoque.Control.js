//Dependency: Evoque.js
Evoque.control = (function (self)
{
    var defaultOption_RangeSelect = {
        inputId: '',
        minVal: 0,
        maxVal: 0
    };

    self.rangeSelect = function (option)
    {
        if ($.isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        option = $(option);
        var id = option.getValueOfProperty('inputId', defaultOption_RangeSelect);
        if ($.isStringEmpty(id))
        {
            throw 'Parameter is error!';
        }
        var min = option.getValueOfProperty('minVal', defaultOption_RangeSelect);
        var max = option.getValueOfProperty('maxVal', defaultOption_RangeSelect);
        if (min > max)
        {
            throw 'Error:[min] > [max]';
        }
        $('input[id="' + id + '"][type="text"]').each(function () {
            generateRange(this);
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
        inputId: '',
        onclick: function () {}
    };

    self.button = function (option)
    {
        if ($.isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        option = $(option);
        var id = option.getValueOfProperty('inputId', defaultOption_Button);
        if ($.isStringEmpty(id))
        {
            throw 'Parameter is error!';
        }
        $('#' + id)[0].onclick = null;
        var handler = option.getValueOfProperty('onclick', defaultOption_Button);
        $('#' + id).addEventHandler('click', function () {
            $.dialog.showLoading('click event!!!!');
            handler.apply(this, arguments);
            location.reload();
        });
    };

    var defaultOption_SliderBar = {
        divId: '',
        // top|bottom|left|right
        dock: 'top'
    };

    self.sliderBar = function (option)
    {
        if ($.isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        option = $(option);
        var id = option.getValueOfProperty('divId', defaultOption_SliderBar);
        if ($.isStringEmpty(id))
        {
            throw 'Parameter is error!';
        }
        var dock = option.getValueOfProperty('dock', defaultOption_SliderBar).toLowerCase();
        var divCollection = $('#' + id);
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
        option.inputId = this.getAttr('id');
        self.rangeSelect(option);
    };

    Evoque.createButton = function (option)
    {
        option = option || {};
        option.inputId = this.getAttr('id');
        self.button(option);
    };

    Evoque.createSliderBar = function (option)
    {
        option = option || {};
        option.divId = this.getAttr('id');
        self.sliderBar(option);
    };

    return self;
}(Evoque.control || {}));

