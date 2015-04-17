//Dependency: Evoque.js, Evoque.Cache.js, Evoque.ScrollBox.js
Evoque.extend('calendarV3', (function (self) {
    var defaultOption = {
        startDate: (new Date()).getYMD(),
        endDate: Date.min,
        onRenderDateTd: null,
        onBeforeSelect: function () {},
        onSelected: function () {},
        //显示模式: waterfall:瀑布展示从开始日算起的6个月的日历; switch:左右按钮切换上下月的日历
        displayMode: 'switch',
        //选择模式: single|range
        pickMode: 'single'
    };

    var weekDay = ['日', '一', '二', '三', '四', '五', '六'];

    self.create = function (option) {
        option = option || {};
        option = $(option);
        var caller = self.evoqueTarget;
        defaultOption.startDate = (new Date()).getYMD();
        var startDate = option.getValueOfProperty('startDate', defaultOption);
        var endDate = option.getValueOfProperty('endDate', defaultOption);
        var mode = option.getValueOfProperty('displayMode', defaultOption).toLowerCase();
        if (mode !== 'switch' && mode !== 'waterfall') {
            throw 'Mode is error! It must be one of ["switch", "waterfall"]';
        }
        var pickMode = option.getValueOfProperty('pickMode', defaultOption).toLowerCase();
        if (pickMode !== 'single' && pickMode !== 'range')
        {
            throw 'PickMode is error! It must be one of ["single", "range"]';
        }
        var onRenderDateTd = option.getValueOfProperty('onRenderDateTd', defaultOption);
        var onBeforeSelect = option.getValueOfProperty('onBeforeSelect', defaultOption);
        var onSelected = option.getValueOfProperty('onSelected', defaultOption);

        caller.each(function () {
            var thisCache = $(this).cache();
            if (!thisCache.containsKey('calendar_v2'))
            {
                thisCache.push('calendar_v2', new calendarClass(this, startDate, endDate, mode, pickMode, onRenderDateTd, onBeforeSelect, onSelected));
            }
        });
    };

    self.setActiveDate = function () {
        var parameters = arguments;
        var caller = self.evoqueTarget;
        caller.each(function () {
            var thisCache = $(this).cache();
            if (thisCache.containsKey('calendar_v2'))
            {
                thisCache.get('calendar_v2').setActiveDate.apply(thisCache.get('calendar_v2'), parameters);
            }
        });
    };

    self.reset = function () {
        var caller = self.evoqueTarget;
        caller.each(function () {
            var thisCache = $(this).cache();
            if (thisCache.containsKey('calendar_v2'))
            {
                thisCache.get('calendar_v2').reset();
            }
        });
    };

    self.findDayCell = function (date) {
        var caller = self.evoqueTarget;
        var ret = null;
        if (caller.length > 0) {
            var thisCache = $(caller[0]).cache();
            if (thisCache.containsKey('calendar_v2'))
            {
                ret = thisCache.get('calendar_v2').findDayCell(date);
            }
        }
        return ret;
    };

    var defaultShowOption = {
        confirmButtonText: '确定',
        onConfirm: function () {},
        onCancel: function () {}
    };
    self.show = function (option) {
        option = option || {};
        option = $(option);
        var confirmButtonText = option.getValueOfProperty('confirmButtonText', defaultShowOption);
        var onConfirm = option.getValueOfProperty('onConfirm', defaultShowOption);
        var onCancel = option.getValueOfProperty('onCancel', defaultShowOption);
        var caller = self.evoqueTarget;
        caller.each(function () {
            var thisCache = $(this).cache();
            if (thisCache.containsKey('calendar_v2'))
            {
                thisCache.get('calendar_v2').show(confirmButtonText, onConfirm, onCancel);
            }
        });
    };

    function calendarClass(element, minDate, maxDate, mode, pickMode, onRenderDateTd, onBeforeSelect, onSelected)
    {
        var minYear = Number(minDate.getFullYear());
        var minMonth = Number(minDate.getMonth());
        var minDay = Number(minDate.getDate());
        var minWeek = Number(minDate.getDay());
        if (maxDate.equalMin()) {
            maxDate = new Date(minYear, minMonth + 12, minDay - 1);
        }
        var maxYear = Number(maxDate.getFullYear());
        var maxMonth = Number(maxDate.getMonth());
        var maxDay = Number(maxDate.getDate());
        var maxWeek = Number(maxDate.getDay());

        var selectDates = [];
        if (pickMode === 'single')
        {
            selectDates.push(minDate);
        }

        var calendarContainer = document.createElement('div');
        var $calendarContainer = $(calendarContainer);
        $calendarContainer.addClass('m-calendar');
        element.appendChild(calendarContainer);
        var $element = $(element);

        //初始化button区域
        var btnDiv = document.createElement('div');
        $(btnDiv).addClass('m-calendar-btn');
        var btnUl = document.createElement('ul');
        var btnCancel = document.createElement('li');
        var $btnCancel = $(btnCancel);
        $btnCancel.addClass('cancel');
        $btnCancel.html('<span>取消</span>');
        $btnCancel.click(function () {
            if ($.checkType(cancelCallback) === type.eFunction)
            {
                var ret = cancelCallback.call();
                if ($.checkType(ret) === type.eBoolean && !ret)
                {
                    return;
                }
            }
            $element.poper.hide();
        });
        var cancelCallback = null;
        var btnSelectDate = document.createElement('li');
        $(btnSelectDate).addClass('text');
        var btnConfirm = document.createElement('li');
        var $btnConfirm = $(btnConfirm);
        $btnConfirm.addClass('confirm');
        $btnConfirm.html('<span></span>');
        $btnConfirm.click(function () {
            if ($.checkType(confirmCallback) === type.eFunction)
            {
                var ret = confirmCallback.call(window, { selectDateStart: _finalStart, selectDateEnd: _finalEnd });
                if ($.checkType(ret) === type.eBoolean && !ret)
                {
                    return;
                }
            }
            $element.poper.hide();
        });
        var confirmCallback = null;
        btnUl.appendChild(btnCancel);
        btnUl.appendChild(btnSelectDate);
        btnUl.appendChild(btnConfirm);
        btnDiv.appendChild(btnUl);

        calendarContainer.appendChild(btnDiv);
        //初始化标题部分
        var headDiv = document.createElement('div');
        $(headDiv).addClass('m-calendar-hd');
        $(headDiv).click(function () {
            $(headDiv).addClass('m-calendar-month-show');
            $(bodyDiv).addClass('m-calendar-month-show');
        });
        var headTitleDiv = document.createElement('div');
        $(headTitleDiv).addClass('m-calendar-title');
        var headP = document.createElement('p');
        var headSpan = document.createElement('span');
        var headEm = document.createElement('em');
        var headStrong = document.createElement('strong');
        var headB = document.createElement('b');
        headSpan.appendChild(headEm);
        headSpan.appendChild(headStrong);
        headP.appendChild(headSpan);
        headP.appendChild(headB);
        headTitleDiv.appendChild(headP);
        headDiv.appendChild(headTitleDiv);

        calendarContainer.appendChild(headDiv);
        //初始化日历部分
        var bodyDiv = document.createElement('div');
        $(bodyDiv).addClass('m-calendar-bd');
        var bodyMonthDiv = document.createElement('div');
        $(bodyMonthDiv).addClass('m-calendar-month');
        var bodyTableDiv = document.createElement('div');
        $(bodyTableDiv).addClass('m-calendar-table');
        var weekUl = document.createElement('ul');
        $(weekUl).addClass('m-calendar-weekday');
        for (var i = 0; i < 7; ++i)
        {
            var weekLi = document.createElement('li');
            $(weekLi).html('<div><p>' + weekDay[i] + '</p></div>');
            weekUl.appendChild(weekLi);
        }
        bodyTableDiv.appendChild(weekUl);

        var bodyTableWrapper = document.createElement('div');
        var $bodyTableWrapper = $(bodyTableWrapper);
        $bodyTableWrapper.addClass('m-calendar-wrapper');
        bodyTableDiv.appendChild(bodyTableWrapper);

        $bodyTableWrapper.addEventHandler('scroll', function () {
            var curMon = getCurrentScrollMonth(this.scrollTop);
            $(headEm).text(yearDesc(curMon));
            $(headStrong).text(curMon.getMonth() + 1);
        });

        function getCurrentScrollMonth(scrollTop) {
            var $uls = $bodyTableWrapper.getChild('ul');
            var ym = $($uls[0]).getAttr('curYM');
            $uls.each(function () {
                var offsetTop = this.offsetTop - this.parentElement.offsetTop;
                if (scrollTop > offsetTop)
                {
                    ym = $(this).getAttr('curYM');
                }
                else
                {
                    return false;
                }
            });
            $(bodyMonthDiv).getChild('li').removeClass('selected');
            $(bodyMonthDiv).getChild('li[curYM="' + ym + '"]').addClass('selected');

            var arr = ym.split('-');
            return new Date(Number(arr[0]), Number(arr[1]), 1);
        }

        function scrollToMonth(date) {
            var y = date.getFullYear();
            var m = date.getMonth();
            var $monthUl = $bodyTableWrapper.getChild('ul[curYM="' + y + '-' + m + '"]');
            if ($monthUl.length > 0)
            {
                var monthUl = $monthUl[0];
                var offsetTop = monthUl.offsetTop - monthUl.parentElement.offsetTop;
                $bodyTableWrapper[0].scrollTop = offsetTop + 1;
            }
        }


        function yearDesc(date) {
            var y = date.getFullYear();
            var curY = (new Date()).getFullYear();
            if (y === curY) {
                return '今年';
            }
            else if (y === curY + 1)
            {
                return '明年';
            }
            else
            {
                return y.toString();
            }
        }

        function initTable(displayMonth) {
            var tbody = document.createElement('ul');
            var $tbody = $(tbody);
            $(tbody).addClass('m-calendar-days');

            loadMonth(displayMonth);

            function loadMonth(dateDisplay) {
                // 当前要显示的年和月
                var year = Number(dateDisplay.getFullYear());
                var month = Number(dateDisplay.getMonth());
                $tbody.setAttr('curYM', year + '-' + month);

                var firstDay = 1;
                var firstDayWeek = (new Date(year, month, firstDay)).getDay();
                var datIndex = firstDay - firstDayWeek;
                var loopDate = new Date(year, month, datIndex);
                var endDate = new Date(year, month + 1, 1);

                $tbody.clearChild();
                while (true) {
                    if (loopDate.getDay() == 0) {
                        if (loopDate >= endDate) {
                            break;
                        }
                    }
                    tbody.appendChild(genDayTd(loopDate));
                    datIndex += 1;
                    loopDate = new Date(year, month, datIndex);
                }

                function genDayTd(date) {
                    var td = document.createElement('li');
                    var $td = $(td);
                    var div = document.createElement('div');
                    td.appendChild(div);
                    var p = document.createElement('p');
                    div.appendChild(p);
                    var strong = document.createElement('strong');
                    var em = document.createElement('em');
                    p.appendChild(strong);
                    p.appendChild(em);

                    var tder = {
                        normal: function () {
                            $td.clearClass();
                        },
                        disable: function () {
                            $td.clearClass();
                            $td.addClass('disabled');
                        },
                        select: function () {
                            $td.clearClass();
                            $td.addClass('selected');
                        },
                        range: function () {
                            $td.clearClass();
                            $td.addClass('range');
                        },
                        today: function () {
                            $td.clearClass();
                            $td.addClass('today');
                        },
                        get day() {
                            var strDay = $td.getAttr('curD');
                            if ($.isStringEmpty(strDay))
                            {
                                return 0;
                            }
                            else
                            {
                                return Number(strDay);
                            }
                        },
                        set day(value) {
                            if ($.checkType(value) === type.eNumber)
                            {
                                $(strong).text(value === 1 ? (date.getMonth() + 1).toString() + '月' : value);
                                $td.setAttr('curD', value);
                            }
                        },
                        get title() {
                            return $(em).text();
                        },
                        set title(value) {
                            $(em).text(value);
                        },
                        get canClick() {
                            var s = $td.getAttr('canClick');
                            if ($.isStringEmpty(s) || s !== '1')
                            {
                                return false;
                            }
                            else
                            {
                                return true;
                            }
                        },
                        set canClick(value) {
                            if ($.checkType(value) === type.eBoolean)
                            {
                                if (value)
                                {
                                    $td.setAttr('canClick', '1');
                                }
                                else
                                {
                                    $td.setAttr('canClick', '0');
                                }
                            }
                        },
                        save: function () {
                            var that = this;
                            var status = {
                                initClass: $td.getClassList(),
                                day: that.day,
                                title: that.title,
                                canClick: that.canClick
                            };
                            $td.cache().set('status', status);
                        },
                        restore: function () {
                            var that = this;
                            var status = $td.cache().get('status');
                            $td.clearClass();
                            $(status.initClass).each(function () {
                                $td.addClass(this);
                            });
                            that.day = status.day;
                            that.title = status.title;
                            that.canClick = status.canClick;
                        }
                    };
                    $td.cache().set('controller', tder);

                    if (Number(date.getFullYear()) === year && Number(date.getMonth()) === month) {
                        if (date - minDate < 0 || date - maxDate > 0)
                        {
                            tder.disable();
                            tder.day = date.getDate();
                        }
                        else
                        {
                            tder.canClick = true;
                            tder.day = date.getDate();
                            //判断今天还是明天
                            var today = (new Date()).getYMD();
                            var minus = date - today;
                            if (minus == 0)
                            {
                                tder.today();
                                tder.title = '今天';
                            }
                            else if (minus == 86400000)
                            {
                                tder.today();
                                tder.title = '明天';
                            }
                            if ($.checkType(onRenderDateTd) === type.eFunction)
                            {
                                onRenderDateTd.call(td, { renderTarget: td, tdDate: date, controller: tder });
                            }
                            $td.click(function (event) {
                                var tder = $(this).cache().get('controller');
                                if (!tder.canClick)
                                {
                                    return;
                                }
                                var curY = year;
                                var curM = month;
                                var curD = tder.day;
                                var selVal = new Date(curY, curM, curD);
                                curM += 1;
                                var sel = curY + '-' + curM + '-' + curD;
                                if (pickMode === 'range')
                                {
                                    reselectRange(selVal, event, onBeforeSelect);
                                }
                                else
                                {
                                    if ($.checkType(onBeforeSelect) === type.eFunction)
                                    {
                                        var beforeResult = onBeforeSelect.call(this, event, {
                                            newSelectDate: selVal.copy(),
                                            findDayTd: findDayTd, getTdController: getTdController
                                        });
                                        if ($.checkType(beforeResult) === type.eBoolean && !beforeResult)
                                        {
                                            return;
                                        }
                                    }
                                    var last = findDayTd(selectDates[0]);
                                    unselect(last);
                                    selectDates[0] = selVal;
                                    var nowSel = findDayTd(selectDates[0]);
                                    select(nowSel);
                                }
                                if (pickMode === 'range')
                                {
                                    if (selectDates.length > 1)
                                    {
                                        var minus = selectDates[0] - selectDates[1];
                                        var min, max;
                                        if (minus < 0)
                                        {
                                            min = selectDates[0];
                                            max = selectDates[1];
                                        }
                                        else
                                        {
                                            min = selectDates[1];
                                            max = selectDates[0];
                                        }
                                        setFinalSelectDate(min, max);
                                        onSelectedCallback.call(this, event, { selectDateStart: min.copy(), selectDateEnd: max.copy(), findDayTd: findDayTd, getTdController: getTdController });
                                    }
                                    else if (selectDates.length === 1)
                                    {
                                        setFinalSelectDate(selectDates[0]);
                                        onSelectedCallback.call(this, event, { selectDateStart: selectDates[0].copy(), findDayTd: findDayTd, getTdController: getTdController });
                                    }
                                }
                                else
                                {
                                    onSelectedCallback.call(this, event, { selectDate: selVal.copy(), findDayTd: findDayTd, getTdController: getTdController });
                                }
                            });
                            //保存初始td样式和初始innerHTML
                            tder.save();
                            if (pickMode === 'single' && date - selectDates[0] == 0)
                            {
                                select($td);
                            }
                        }
                    }
                    else {
                        tder.disable();
                    }

                    return td;
                }
            }

            return $tbody;
        }

        var bodyMonthUl = document.createElement('ul');
        bodyMonthDiv.appendChild(bodyMonthUl);
        for (var i = 0; i < 6; ++i)
        {
            var d = new Date(minYear, minMonth + i, 1);
            var bodyCurYear = d.getFullYear();
            var bodyCurMonth = d.getMonth() + 1;
            var bodyMonthLi = document.createElement('li');
            $(bodyMonthLi).html('<div><p><strong>' + bodyCurMonth + '月</strong><em>' + bodyCurYear + '</em></p></div>');
            $(bodyMonthLi).setAttr('curYM', bodyCurYear + '-' + bodyCurMonth);
            bodyMonthUl.appendChild(bodyMonthLi);
            bodyTableWrapper.appendChild(initTable(d)[0]);
        }

        bodyDiv.appendChild(bodyMonthDiv);
        bodyDiv.appendChild(bodyTableDiv);
        calendarContainer.appendChild(bodyDiv);

        function onSelectedCallback(event, arg) {
            if (pickMode === 'range')
            {
                var tder = arg.getTdController(arg.selectDateStart);
                tder.select();
                tder.title = '入住';
                if (!$.isObjectNull(arg.selectDateEnd))
                {
                    tder = arg.getTdController(arg.selectDateEnd);
                    tder.select();
                    tder.title = '离店';
                }
            }
            if ($.checkType(onSelected) === type.eFunction) {
                onSelected.call(this, event, arg);
            }
        }

        function getTdController(date) {
            return findDayTd(date).cache().get('controller');
        }

        function findDayTd(date) {
            var y = date.getFullYear();
            var m = date.getMonth();
            var d = date.getDate();
            return $(element).getChild('ul.m-calendar-days[curYM="' + y + '-' + m + '"] li[curD="' + d + '"]');
        }

        function select($td) {
            var tder = $td.cache().get('controller');
            tder.range();
        }

        function unselect($td) {
            var tder = $td.cache().get('controller');
            tder.restore();
        }

        function reselectRange(selVal, event, onBeforeSelect) {
            if (selectDates.length === 0 || selectDates.length > 1)
            {
                var minus, min, max, loopDate;
                if ($.checkType(onBeforeSelect) === type.eFunction)
                {
                    var beforeResult = onBeforeSelect.call(event.currentTarget, event, {
                        newSelectDateStart: selVal.copy(),
                        findDayTd: findDayTd, getTdController: getTdController
                    });
                    if ($.checkType(beforeResult) === type.eBoolean && !beforeResult)
                    {
                        return;
                    }
                }
                if (selectDates.length > 1)
                {
                    minus = selectDates[1] - selectDates[0];
                    if (minus > 0)
                    {
                        min = selectDates[0];
                        max = selectDates[1];
                    }
                    else
                    {
                        min = selectDates[1];
                        max = selectDates[0];
                    }
                    loopDate = new Date(min.getFullYear(), min.getMonth(), min.getDate());
                    while (loopDate <= max)
                    {
                        unselect(findDayTd(loopDate));
                        loopDate.addDay(1);
                    }
                    selectDates.splice(0, selectDates.length);
                }
                selectDates.push(selVal);
                var nowSel = findDayTd(selectDates[0]);
                select(nowSel);
            }
            else if (selectDates.length === 1)
            {
                var minus, min, max, loopDate;
                minus = selVal - selectDates[0];
                if (minus === 0)
                {
                    return;
                }
                else if (minus < 0)
                {
                    //如果第二次选择的入住日期比前一次小，则取消前一次的选择
                    if ($.checkType(onBeforeSelect) === type.eFunction)
                    {
                        var beforeResult = onBeforeSelect.call(event.currentTarget, event, {
                            newSelectDateStart: selVal.copy(),
                            findDayTd: findDayTd, getTdController: getTdController
                        });
                        if ($.checkType(beforeResult) === type.eBoolean && !beforeResult)
                        {
                            return;
                        }
                    }
                    unselect(findDayTd(selectDates[0]));
                    selectDates[0] = selVal;
                    var nowSel = findDayTd(selectDates[0]);
                    select(nowSel);
                    return;
                }
                if ($.checkType(onBeforeSelect) === type.eFunction)
                {
                    var beforeResult = onBeforeSelect.call(event.currentTarget, event, {
                        newSelectDateStart: minus > 0 ? selectDates[0].copy() : selVal.copy(),
                        newSelectDateEnd: minus < 0 ? selectDates[0].copy() : selVal.copy(),
                        findDayTd: findDayTd, getTdController: getTdController
                    });
                    if ($.checkType(beforeResult) === type.eBoolean && !beforeResult)
                    {
                        return;
                    }
                }
                selectDates.push(selVal);
                if (minus > 0)
                {
                    min = selectDates[0];
                    max = selectDates[1];
                }
                else
                {
                    min = selectDates[1];
                    max = selectDates[0];
                }
                loopDate = new Date(min.getFullYear(), min.getMonth(), min.getDate());
                while (loopDate <= max)
                {
                    select(findDayTd(loopDate));
                    loopDate.addDay(1);
                }
            }
        }

        var _finalStart;
        var _finalEnd;
        function setFinalSelectDate(start, end) {
            _finalStart = start.copy();
            var strStart = _finalStart.toCustomString('M月d日');
            if ($.checkType(end) === type.eDate) {
                _finalEnd = end.copy();
                var dayNum = Math.floor((_finalEnd - _finalStart) / (1000 * 3600 * 24)).toString();
                $(btnSelectDate).html('<span>' + strStart + '入住,共<strong>' + dayNum + '</strong>晚</span>');
            }
            else {
                _finalEnd = null;
                $(btnSelectDate).html('<span>' + strStart + '入住,共<strong></strong>晚</span>');
            }
        }

        return {
            show: function (confirmButtonText, onConfirm, onCancel) {
                $btnConfirm.getChild('span').text(confirmButtonText);
                confirmCallback = onConfirm;
                cancelCallback = onCancel;
                $element.poper.show({
                    onShow: function () {
                        var height = document.documentElement.clientHeight - $('div.m-calendar-btn')[0].clientHeight - $('div.m-calendar-hd')[0].clientHeight - $('ul.m-calendar-weekday')[0].clientHeight;
                        $element.getChild('div.m-calendar-wrapper').setStyle('height', height + 'px');
                        if (selectDates.length > 0)
                        {
                            scrollToMonth(selectDates[0]);
                        }
                        else
                        {
                            var curMon = getCurrentScrollMonth(0);
                            $(headEm).text(yearDesc(curMon));
                            $(headStrong).text(curMon.getMonth() + 1);
                        }
                    },
                    onHide: function () {}
                });
            },
            findDayCell: function (date) {
                return findDayTd(date);
            },
            reset: function () {
                if (pickMode === 'range')
                {
                    var minus, min, max, loopDate;
                    if (selectDates.length > 0)
                    {
                        if (selectDates.length === 1)
                        {
                            unselect(findDayTd(selectDates[0]));
                        }
                        else
                        {
                            minus = selectDates[1] - selectDates[0];
                            if (minus > 0)
                            {
                                min = selectDates[0];
                                max = selectDates[1];
                            }
                            else
                            {
                                min = selectDates[1];
                                max = selectDates[0];
                            }
                            loopDate = new Date(min.getFullYear(), min.getMonth(), min.getDate());
                            while (loopDate <= max)
                            {
                                unselect(findDayTd(loopDate));
                                loopDate.addDay(1);
                            }
                        }
                        selectDates = [];
                    }
                }
            },
            setActiveDate: function () {
                if (pickMode === 'range')
                {
                    if (arguments.length !== 2)
                    {
                        return;
                    }
                    $(arguments).each(function () {
                        if ($.checkType(this) !== type.eDate)
                        {
                            throw 'Parameter type is error!';
                        }
                    });
                    var ad = arguments[0].getYMD();
                    if (ad < minDate || ad > maxDate)
                    {
                        return;
                    }
                    ad = arguments[1].getYMD();
                    if (ad < minDate || ad > maxDate)
                    {
                        return;
                    }
                    if ($.checkType(onBeforeSelect) === type.eFunction)
                    {
                        var beforeResult = onBeforeSelect.call(this, null, {
                            newSelectDateStart: arguments[0].copy(),
                            newSelectDateEnd: arguments[1].copy(),
                            findDayTd: findDayTd, getTdController: getTdController
                        });
                        if ($.checkType(beforeResult) === type.eBoolean && !beforeResult)
                        {
                            return;
                        }
                    }
                    this.reset();
                    var minus, min, max, loopDate;
                    selectDates.push(arguments[0].getYMD());
                    selectDates.push(arguments[1].getYMD());
                    minus = selectDates[1] - selectDates[0];
                    if (minus != 0)
                    {
                        if (minus > 0)
                        {
                            min = selectDates[0];
                            max = selectDates[1];
                        }
                        else
                        {
                            min = selectDates[1];
                            max = selectDates[0];
                        }
                        loopDate = new Date(min.getFullYear(), min.getMonth(), min.getDate());
                        while (loopDate <= max)
                        {
                            select(findDayTd(loopDate));
                            loopDate.addDay(1);
                        }
                    }
                    setFinalSelectDate(min, max);
                    onSelectedCallback.call(this, event, { selectDateStart: min.copy(), selectDateEnd: max.copy(), findDayTd: findDayTd, getTdController: getTdController });
                }
                else
                {
                    if (arguments.length !== 1)
                    {
                        return;
                    }
                    $(arguments).each(function () {
                        if ($.checkType(this) !== type.eDate)
                        {
                            throw 'Parameter type is error!';
                        }
                    });
                    var ad = arguments[0].getYMD();
                    if (ad < minDate || ad > maxDate)
                    {
                        return;
                    }
                    if ($.checkType(onBeforeSelect) === type.eFunction)
                    {
                        var beforeResult = onBeforeSelect.call(this, null, {
                            newSelectDate: arguments[0].copy(),
                            findDayTd: findDayTd, getTdController: getTdController
                        });
                        if ($.checkType(beforeResult) === type.eBoolean && !beforeResult)
                        {
                            return;
                        }
                    }
                    var last = findDayTd(selectDates[0]);
                    unselect(last);
                    selectDates[0] = arguments[0].getYMD();
                    var nowSel = findDayTd(selectDates[0]);
                    select(nowSel);
                    onSelectedCallback.call(this, event, { selectDate: selectDates[0].copy(), findDayTd: findDayTd, getTdController: getTdController });
                }
            }
        };
    }

    return self;
}({})));

Evoque.extend('poper', (function (self) {
    var defaultOption = {
        // top|bottom|left|right. default: bottom
        direction: 'bottom',
        onShow: function () {},
        onHide: function () {}
    };

    var poperInstances = {};

    self.show = function (option) {
        option = option || {};
        self.hide();

        if ($.isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        option = $(option);
        var caller = self.evoqueTarget;
        if (caller.length > 0) {
            var element = caller[0];
            var dir = option.getValueOfProperty('direction', defaultOption).toLowerCase();
            if ($.isObjectNull(poperInstances[dir]))
            {
                poperInstances[dir] = new poperClass(dir);
            }
            var onShow = option.getValueOfProperty('onShow', defaultOption);
            var onHide = option.getValueOfProperty('onHide', defaultOption);
            poperInstances[dir].show(element, onShow, onHide);
        }
    };

    self.hide = function () {
        for (var p in poperInstances)
        {
            if ($.checkType(poperInstances[p].hide) === type.eFunction)
            {
                poperInstances[p].hide();
            }
        }
    };

    function poperClass(direction)
    {
        var that = this;

        var docWidth = document.documentElement.clientWidth;
        var docHeight = document.documentElement.clientHeight;
        var maxWidth = Math.floor(docWidth);
        var maxHeight = Math.floor(docHeight);

        var div = document.createElement('div');
        var $div = $(div);
        $div.addClass('poper-dg-div');
        $div.addClass('poper-bottomTop');
        div.style[direction] = '0';
        switch (direction)
        {
            case 'left':
            case 'right':
                div.style.top = '0';
                div.style.height = docHeight + 'px';
                break;
            default:
                div.style.left = '0';
                div.style.width = docWidth + 'px';
                break;
        }
        var formShowCallback = null;
        var formHideCallback = null;
        var callbackKind = 0;
        $div.addEventHandler('transitionEnd', function () {
            switch (callbackKind) {
                case 1:
                    if ($.checkType(formShowCallback) === type.eFunction) {
                        formShowCallback.call(div);
                    }
                    callbackKind = 0;
                    return;
                case 2:
                    document.body.removeChild(div);
                    var element = that.currentShowElement;
                    $(element).hide();
                    parentCache.appendChild(element);
                    parentCache = null;
                    that.currentShowElement = null;
                    showFlag = false;
                    if ($.checkType(formHideCallback) === type.eFunction) {
                        formHideCallback.call(div);
                    }
                    formShowCallback = null;
                    formHideCallback = null;
                    callbackKind = 0;
                    return;
            }
        }, { useEventPrefix: true });

        var parentCache = null;
        this.currentShowElement = null;
        var showFlag = false;

        this.show = function (element, onShow, onHide) {
            if (showFlag)
            {
                this.hide();
            }
            formShowCallback = onShow;
            formHideCallback = onHide;

            parentCache = element.parentElement;
            this.currentShowElement = element;
            div.appendChild(element);
            $(element).show();
            document.body.appendChild(div);
            setDivSize();
            if ($.device() !== mDevice.samsung) {
                callbackKind = 1;
                $div.addClass('show');
            }
            showFlag = true;
            if ($.device() === mDevice.samsung) {
                if ($.checkType(formShowCallback) === type.eFunction) {
                    formShowCallback.call(div);
                }
            }

            return this;
        };

        function setDivSize()
        {
            switch (direction)
            {
                case 'left':
                case 'right':
                    if (div.clientWidth > maxWidth)
                    {
                        div.style.width = maxWidth + 'px';
                    }
                    break;
                default:
                    if (div.clientHeight > maxHeight)
                    {
                        div.style.height = maxHeight + 'px';
                    }
                    break;
            }
        }

        this.hide = function () {
            if (!showFlag)
            {
                return;
            }
            if ($.device() !== mDevice.samsung) {
                callbackKind = 2;
                $div.removeClass('show');
            }

            if ($.device() === mDevice.samsung) {
                document.body.removeChild(div);
                var element = this.currentShowElement;
                $(element).hide();
                parentCache.appendChild(element);
                parentCache = null;
                this.currentShowElement = null;
                showFlag = false;
                if ($.checkType(formHideCallback) === type.eFunction) {
                    formHideCallback.call(div);
                }
                formShowCallback = null;
                formHideCallback = null;
            }
        };
    }

    return self;
}({})));
