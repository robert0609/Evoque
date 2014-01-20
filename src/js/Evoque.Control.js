//Dependency: Evoque.js
Evoque.control = (function (self)
{
    var defaultOption_RangeSelect = {
        inputId: '',
        minVal: 0,
        maxVal: 0,
        //flag: 1: up; -1: down; 0: no click
        beforeValueChange: function (flag) {},
        valueChanged: function (flag) {}
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
        var beforeValChange = option.getValueOfProperty('beforeValueChange', defaultOption_RangeSelect);
        var valChanged = option.getValueOfProperty('valueChanged', defaultOption_RangeSelect);
        if (min > max)
        {
            throw 'Error:[min] > [max]';
        }

        var ret = [];
        input.each(function () {
            var re = null;
            if ($(this).getAttr('type') == 'text')
            {
                re = generateRange(this);
            }
            ret.push(re);
        });
        return ret;

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
                    if (beforeValChange.call(input, -1) === false)
                    {
                        return;
                    }
                    setValue(val);
                    valChanged.call(input, -1);
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
                    if (beforeValChange.call(input, 1) === false)
                    {
                        return;
                    }
                    setValue(val);
                    valChanged.call(input, 1);
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

            return {
                setVal: function (v) {
                    if (v < min)
                    {
                        v = min;
                    }
                    if (v > max)
                    {
                        v = max;
                    }
                    var flg = v == input1.getVal();
                    if (flg)
                    {
                        return;
                    }
                    if (beforeValChange.call(input, 0) === false)
                    {
                        return;
                    }
                    setValue(v);
                    valChanged.call(input, 0);
                }
            };
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

    var defaultOption_Rate = {
        elementId: '',
        bindField: '',
        uncheckedClass: '',
        checkedClass: 'checked',
        pointLevels: [ 1, 2, 3, 4, 5 ],
        initPoint: 0,
        description: [],
        readonly: false
    };

    self.rate = function (option, element)
    {
        if ($.isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        option = $(option);
        var ele;
        if ($.checkType(element) === type.eElement)
        {
            ele = $(element);
        }
        else
        {
            var id = option.getValueOfProperty('elementId', defaultOption_Rate);
            if ($.isStringEmpty(id))
            {
                throw 'Parameter is error!';
            }
            ele = $('#' + id);
        }
        if (ele.length < 1)
        {
            return;
        }
        var bindField = option.getValueOfProperty('bindField', defaultOption_Rate);
        var uncheckedClass = option.getValueOfProperty('uncheckedClass', defaultOption_Rate);
        var checkedClass = option.getValueOfProperty('checkedClass', defaultOption_Rate);
        var pointLevels = option.getValueOfProperty('pointLevels', defaultOption_Rate);
        if (pointLevels.length < 1)
        {
            pointLevels = defaultOption_Rate.pointLevels;
        }
        else if ($.checkType(pointLevels[0]) !== type.eNumber)
        {
            pointLevels = defaultOption_Rate.pointLevels;
        }
        var initPoint = option.getValueOfProperty('initPoint', defaultOption_Rate);
        var description = option.getValueOfProperty('description', defaultOption_Rate);
        var readonly = option.getValueOfProperty('readonly', defaultOption_Rate);

        var div = document.createElement('div');
        var $div = $(div);
        $div.addClass('rate');
        var span = document.createElement('span');
        var $span = $(span);
        $span.addClass('rateBtn');
        var initPointValid = false;
        var initPointIndex;
        for (var i = 0; i < pointLevels.length; ++i)
        {
            var eleI = document.createElement('i');
            eleI.innerHTML = pointLevels[i];
            if (pointLevels[i] === initPoint)
            {
                initPointValid = true;
                initPointIndex = i;
            }
            eleI.setAttribute('idx', i);
            var $eleI = $(eleI);
            if (i == 0)
            {
                $eleI.addClass('leftRadius');
            }
            else if (i == pointLevels.length - 1)
            {
                $eleI.addClass('rightRadius');
            }
            if (!readonly)
            {
                $eleI.addEventHandler('click', function () {
                    setPointIndex.call(this);
                });
            }
            span.appendChild(eleI);
        }
        div.appendChild(span);
        if (!readonly)
        {
            var hid = document.createElement('input');
            var $hid = $(hid);
            hid.type = 'hidden';
            if (!$.isStringEmpty(bindField))
            {
                hid.id = bindField;
                $hid.setAttr('name', bindField);
            }
            div.appendChild(hid);
        }
        var desSpan = document.createElement('span');
        var $desSpan = $(desSpan);
        $desSpan.addClass('description');
        div.appendChild(desSpan);
        resetInitPoint(true);

        ele[0].parentElement.replaceChild(div, ele[0]);

        function resetInitPoint(isInit)
        {
            if (initPointValid)
            {
                setPointIndex.call($span.getChild('i[idx="' + initPointIndex + '"]')[0]);
            }
            else
            {
                if (isInit === true)
                {
                    return;
                }
                $span.getChild('i[idx]').each(function () {
                    var $this = $(this);
                    $this.removeClass(checkedClass);
                    $this.addClass(uncheckedClass);
                });
                if (!readonly)
                {
                    $hid.setVal('');
                }
                $desSpan.html('');
            }
        }

        function setPointIndex()
        {
            var clickIdx = this.getAttribute('idx');
            var isFind = false;
            $span.getChild('i[idx]').each(function () {
                var idx = this.getAttribute('idx');
                var $this = $(this);
                if (isFind)
                {
                    $this.removeClass(checkedClass);
                    $this.addClass(uncheckedClass);
                }
                else
                {
                    $this.removeClass(uncheckedClass);
                    $this.addClass(checkedClass);
                }
                if (idx === clickIdx)
                {
                    isFind = true;
                }
            });
            if (!readonly)
            {
                $hid.setVal(this.innerHTML);
            }
            $desSpan.html('');
            if (!$.isStringEmpty(description[clickIdx]))
            {
                $desSpan.html(description[clickIdx]);
            }
        }

        return {
            reset: resetInitPoint,
            setPoint: function (point) {
                var index = -1;
                for (var i = 0; i < pointLevels.length; ++i)
                {
                    if (pointLevels[i] === point)
                    {
                        index = i;
                        break;
                    }
                }
                setPointIndex.call($span.getChild('i[idx="' + index + '"]')[0]);
            },
            getPoint: function () {
                var $checked = $span.getChild('.rateBtn>.checked');
                if ($checked.length < 1)
                {
                    return null;
                }
                return $checked[$checked.length - 1].innerHTML;
            }
        };
    };

    //API
    Evoque.createRangeSelect = function (option)
    {
        option = option || {};
        if (this.length < 1)
        {
            return null;
        }
        var ret = null;
        this.each(function (i) {
            this.rangeSelectObject = self.rangeSelect(option, this)[0];
            if (i === 0)
            {
                ret = this.rangeSelectObject;
            }
        });
        return ret;
    };

    Evoque.createButton = function (option)
    {
        option = option || {};
        if (this.length < 1)
        {
            return null;
        }
        return self.button(option, this[0]);
    };

    Evoque.createSliderBar = function (option)
    {
        option = option || {};
        if (this.length < 1)
        {
            return null;
        }
        return self.sliderBar(option, this[0]);
    };

    Evoque.createRate = function (option)
    {
        option = option || {};
        if (this.length < 1)
        {
            return null;
        }
        return self.rate(option, this[0]);
    };

    return self;
}(Evoque.control || {}));

