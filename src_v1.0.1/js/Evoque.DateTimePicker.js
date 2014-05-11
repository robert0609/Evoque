//Dependency: Evoque.js, Evoque.Dialog.js
Evoque.extend('dateTimePicker', (function (self) {

    var defaultOption = {
        //date/datetime/time
        format: 'date'
    };

    self.create = function (option) {
        var $option = $(option);
        var format = $option.getValueOfProperty('format', defaultOption).toLowerCase();
        if (format !== 'datetime' && format !== 'time')
        {
            format = 'date';
        }
        var caller = self.evoqueTarget;
        caller.each(function () {
            var picker = new pickerClass(this, format);
        });
    };

    function pickerClass(caller, format) {
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

        if (format === 'date')
        {
            div1.appendChild(y.getElement());
            div1.appendChild(M.getElement());
            div1.appendChild(d.getElement());
        }
        else if (format === 'time')
        {
            div2.appendChild(H.getElement());
            div2.appendChild(m.getElement());
            div2.appendChild(s.getElement());
        }
        else if (format === 'datetime')
        {
            div1.appendChild(y.getElement());
            div1.appendChild(M.getElement());
            div1.appendChild(d.getElement());
            div2.appendChild(H.getElement());
            div2.appendChild(m.getElement());
            div2.appendChild(s.getElement());
        }

        var $dialog = $(caller);
        $dialog.setAttr('readonly', 'readonly');
        $dialog.addEventHandler('focus', function () {
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
            caller.value = selectDate.toCustomString(getDateFormat());
            //$dialog.setVal(selectDate.toCustomString(getDateFormat()));
        });

        function getDateFormat() {
            var dateFormat = 'yyyy-MM-dd';
            if (format === 'date')
            {
                dateFormat = 'yyyy-MM-dd';
            }
            else if (format === 'time')
            {
                dateFormat = 'HH:mm:ss';
            }
            else if (format === 'datetime')
            {
                dateFormat = 'yyyy-MM-dd HH:mm:ss';
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
            var emNum = document.createElement('em');
            var $emNum = $(emNum);
            var span = document.createElement('span');
            var $span = $(span);
            var btnUp = document.createElement('sup');
            var $btnUp = $(btnUp);
            $btnUp.text('+');
            var btnDown = document.createElement('sub');
            var $btnDown = $(btnDown);
            $btnDown.text('-');
            divNum.appendChild(emNum);
            divNum.appendChild(span);
            divBox.appendChild(btnUp);
            divBox.appendChild(divNum);
            divBox.appendChild(btnDown);
            //init
            var now = new Date();
            var min, max;
            switch (kind)
            {
                case 0:
                    $emNum.text(Number(now.getFullYear()));
                    $span.text('年');
                    min = 1900;
                    max = Infinity;
                    break;
                case 1:
                    $emNum.text(Number(now.getMonth()) + 1);
                    $span.text('月');
                    min = 1;
                    max = 12;
                    break;
                case 2:
                    $emNum.text(Number(now.getDate()));
                    $span.text('日');
                    min = 1;
                    max = 31;
                    break;
                case 3:
                    $emNum.text(Number(now.getHours()));
                    $span.text('时');
                    min = 0;
                    max = 23;
                    break;
                case 4:
                    $emNum.text(Number(now.getMinutes()));
                    $span.text('分');
                    min = 0;
                    max = 59;
                    break;
                case 5:
                    $emNum.text(Number(now.getSeconds()));
                    $span.text('秒');
                    min = 0;
                    max = 59;
                    break;
            }
            $btnUp.click(function () {
                var val = Number($emNum.text());
                if (val === max)
                {
                    val = min;
                }
                else
                {
                    val += 1;
                }
                $emNum.text(val);
                if ($.checkType(onValueChanged) === type.eFunction)
                {
                    onValueChanged.call(divBox, { kind: kind });
                }
            });
            $btnDown.click(function () {
                var val = Number($emNum.text());
                if (val === min)
                {
                    val = max;
                }
                else
                {
                    val -= 1;
                }
                $emNum.text(val);
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
                    return Number($emNum.text());
                },
                setVal: function (val) {
                    if (Number($emNum.text()) === val)
                    {
                        return;
                    }
                    $emNum.text(val);
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
                    var val = Number($emNum.text());
                    if (val < min || val > max)
                    {
                        $emNum.text(1);
                    }
                }
            };
        }

        function adjustMonthRange() {

        }

        function adjustDayRange() {

        }


    }

    return self;
}({})));