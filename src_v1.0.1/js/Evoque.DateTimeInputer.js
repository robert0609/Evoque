//Dependency: Evoque.js, Evoque.Dialog.js
Evoque.extend('dateTimePicker', (function (self) {

    var defaultOption = {
        //date/datetime/time
        format: 'date',
        //显示时间的精度, 只有format为datetime或time时有效: hour/minute/second
        precision: 'minute'
    };

    self.create = function (option) {
        option = option || {};
        var $option = $(option);
        var format = $option.getValueOfProperty('format', defaultOption).toLowerCase();
        if (format !== 'datetime' && format !== 'time')
        {
            format = 'date';
        }
        var precision = $option.getValueOfProperty('precision', defaultOption).toLowerCase();
        var caller = self.evoqueTarget;
        caller.each(function () {
            var picker = new pickerClass(this, format, precision);
        });
    };

    function pickerClass(caller, format, precision) {
        var container = document.createElement('div');
        container.id = 'evoqueDateTimePicker' + $.guid();
        var $container = $(container);
        $container.addClass('ui-date-time');
        $container.hide();
        var div1 = document.createElement('div');
        var $div1 = $(div1);
        $div1.addClass('year');
        var div2 = document.createElement('div');
        var $div2 = $(div2);
        $div2.addClass('second');
        var divBtn = document.createElement('div');
        var $divBtn = $(divBtn);
        $divBtn.addClass('submit');
        var divConfirm = document.createElement('div');
        var $divConfirm = $(divConfirm);
        $divConfirm.text('确定');
        $divConfirm.addClass('button-on');
        var divClear = document.createElement('div');
        var $divClear = $(divClear);
        $divClear.text('清除');
        $divClear.addClass('button-on');
        divBtn.appendChild(divClear);
        divBtn.appendChild(divConfirm);
        container.appendChild(div1);
        container.appendChild(div2);
        container.appendChild(divBtn);
        document.body.appendChild(container);

        var y = createInput(0, valueChanged);
        var M = createInput(1, valueChanged);
        var d = createInput(2, valueChanged);
        var H = createInput(3, valueChanged);
        var m = createInput(4, valueChanged);
        var s = createInput(5, valueChanged);

        if (format === 'date' || format === 'datetime')
        {
            div1.appendChild(y.getElement());
            div1.appendChild(M.getElement());
            div1.appendChild(d.getElement());
        }
        if (format === 'time' || format === 'datetime')
        {
            div2.appendChild(H.getElement());
            if (precision === 'minute')
            {
                div2.appendChild(m.getElement());
            }
            else if (precision === 'second')
            {
                div2.appendChild(m.getElement());
                div2.appendChild(s.getElement());
            }
        }

        var $dialog = $(caller);
        $dialog.setAttr('readonly', 'readonly');
        $dialog.click(function () {
            var val = $dialog.getVal();
            var init = $.isStringEmpty(val) ? new Date() : $dialog.getVal().toDate();
            y.setVal(Number(init.getFullYear()));
            M.setVal(Number(init.getMonth()) + 1);
            d.setVal(Number(init.getDate()));
            H.setVal(Number(init.getHours()));
            m.setVal(Number(init.getMinutes()));
            s.setVal(Number(init.getSeconds()));

            $dialog.showModalDialog({
                content:container.id,
                autoClose: false
            });
        });

        $divConfirm.click(function () {
            $dialog.closeCurrentDialog();
            var selectDate = new Date(y.getVal(), M.getVal() - 1, d.getVal(), H.getVal(), m.getVal(), s.getVal());
            var selectValue = selectDate.toCustomString(getDateFormat());
            if ($dialog.getVal() !== selectValue) {
                $dialog.setVal(selectValue);
                var event = document.createEvent('HTMLEvents');
                event.initEvent('change', true, false);
                caller.dispatchEvent(event);
            }
        });

        $divClear.click(function () {
            $dialog.closeCurrentDialog();
            if (!$.isStringEmpty($dialog.getVal())) {
                $dialog.setVal('');
                var event = document.createEvent('HTMLEvents');
                event.initEvent('change', true, false);
                caller.dispatchEvent(event);
            }
        });

        function getDateFormat() {
            var dateFormat = 'yyyy-MM-dd';
            if (format === 'date')
            {
                dateFormat = 'yyyy-MM-dd';
            }
            else if (format === 'time')
            {
                if (precision === 'hour')
                {
                    dateFormat = 'HH:00:00';
                }
                else if (precision === 'minute')
                {
                    dateFormat = 'HH:mm:00';
                }
                else if (precision === 'second')
                {
                    dateFormat = 'HH:mm:ss';
                }
            }
            else if (format === 'datetime')
            {
                if (precision === 'hour')
                {
                    dateFormat = 'yyyy-MM-dd HH:00:00';
                }
                else if (precision === 'minute')
                {
                    dateFormat = 'yyyy-MM-dd HH:mm:00';
                }
                else if (precision === 'second')
                {
                    dateFormat = 'yyyy-MM-dd HH:mm:ss';
                }
            }
            return dateFormat;
        }

        function valueChanged(e) {
            if (e.kind === 0 || e.kind === 1)
            {
                var year = y.getVal();
                var month = M.getVal();
                var day = d.getVal();
                if (month === 2)
                {
                    if (year % 4 === 0)
                    {
                        d.setRange(1, 29);
                    }
                    else
                    {
                        d.setRange(1, 28);
                    }
                }
                else if ('1,3,5,7,8,10,12'.indexOf(month) > -1)
                {
                    d.setRange(1, 31);
                }
                else if ('4,6,9,11'.indexOf(month) > -1)
                {
                    d.setRange(1, 30);
                }
            }
        }

        function isNumber(text) {
            return /^\d+$/g.test(text);
        }

        /**
         * 创建输入框
         * @param kind: 0:year; 1:month; 2:day; 3:hour; 4:minute; 5:second;
         * @param onValueChanged: 值变更事件
         */
        function createInput(kind, onValueChanged) {
            var divBox = document.createElement('div');
            $(divBox).addClass('item');
            var divNum = document.createElement('div');
            var $divNum = $(divNum);
            $divNum.addClass('num');
            var emNum = document.createElement('input');
            emNum.type = 'text';
            emNum.style.width = '30px';
            var $emNum = $(emNum);
            var span = document.createElement('span');
            var $span = $(span);
            divNum.appendChild(emNum);
            divNum.appendChild(span);
            divBox.appendChild(divNum);
            //init
            var now = new Date();
            var min, max;
            switch (kind)
            {
                case 0:
                    $emNum.setVal(Number(now.getFullYear()));
                    $span.text('年');
                    min = 1900;
                    max = Infinity;
                    break;
                case 1:
                    $emNum.setVal(Number(now.getMonth()) + 1);
                    $span.text('月');
                    min = 1;
                    max = 12;
                    break;
                case 2:
                    $emNum.setVal(Number(now.getDate()));
                    $span.text('日');
                    min = 1;
                    max = 31;
                    break;
                case 3:
                    $emNum.setVal(Number(now.getHours()));
                    $span.text('时');
                    min = 0;
                    max = 23;
                    break;
                case 4:
                    $emNum.setVal(Number(now.getMinutes()));
                    $span.text('分');
                    min = 0;
                    max = 59;
                    break;
                case 5:
                    $emNum.setVal(Number(now.getSeconds()));
                    $span.text('秒');
                    min = 0;
                    max = 59;
                    break;
            }
            var originalValue = Number($emNum.getVal());
            $emNum.addEventHandler('blur', function () {
                var strVal = $emNum.getVal();
                if (!isNumber(strVal)) {
                    $emNum.alert('输入格式不正确');
                    $emNum.setVal(originalValue);
                    return;
                }
                var val = Number(strVal);
                if (val > max) {
                    val = max;
                }
                if (val < min) {
                    val = min;
                }
                $emNum.setVal(val);
                originalValue = val;
                if ($.checkType(onValueChanged) === type.eFunction)
                {
                    onValueChanged.call(divBox, { kind: kind });
                }
            });

            return {
                getElement: function () {
                    return divBox;
                },
                getVal: function () {
                    return Number($emNum.getVal());
                },
                setVal: function (val) {
                    if (!isNumber(val.toString())) {
                        $emNum.alert('设置数据格式不正确');
                        return;
                    }
                    if (val > max || val < min) {
                        return;
                    }
                    if (Number($emNum.getVal()) === val)
                    {
                        return;
                    }
                    $emNum.setVal(val);
                    originalValue = val;
                    if ($.checkType(onValueChanged) === type.eFunction)
                    {
                        onValueChanged.call(divBox, { kind: kind });
                    }
                },
                setRange: function (minVal, maxVal) {
                    if (min === minVal && max === maxVal)
                    {
                        return;
                    }
                    min = minVal;
                    max = maxVal;
                    var val = Number($emNum.getVal());
                    if (val < min || val > max)
                    {
                        $emNum.setVal(1);
                        originalValue = 1;
                    }
                }
            };
        }
    }

    return self;
}({})));