//Dependency: Evoque.js, Evoque.Cache.js
Evoque.extend('calendarV2', (function (self) {
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

        function initTable(displayMonth) {
            var table = document.createElement('table');
            var $table = $(table);
            $table.addClass('table-calendar');
            initHead();
            initBody();
            initFoot();
            loadMonth(displayMonth);

            function initHead() {
                var thead = document.createElement('thead');
                var theadRow1 = document.createElement('tr');
                var prev = document.createElement('th');
                var $prev = $(prev);
                var next = document.createElement('th');
                var $next = $(next);
                if (mode === 'switch')
                {
                    $prev.addClass('prev');
                    $prev.text('←');
                    $prev.click(function () {
                        var title = $($table.getChild('thead>tr>th')[1]);
                        var curY = Number(title.getAttr('curY'));
                        var curM = Number(title.getAttr('curM'));
                        if (curY == minYear && curM == minMonth) {
                            return;
                        }
                        var $nowDisplay = $(element).getChild('table[curYM="' + curY + '-' + curM + '"]');
                        $nowDisplay.hide();
                        var $toDisplay = $(element).getChild('table[curYM="' + curY + '-' + (curM - 1).toString() + '"]');
                        if ($toDisplay.length === 0)
                        {
                            $toDisplay = initTable(new Date(curY, curM - 1, 1));
                            element.insertBefore($toDisplay[0], $nowDisplay[0]);
                        }
                        $toDisplay.show();
                    });
                    $next.addClass('next');
                    $next.text('→');
                    $next.click(function () {
                        var title = $($table.getChild('thead>tr>th')[1]);
                        var curY = Number(title.getAttr('curY'));
                        var curM = Number(title.getAttr('curM'));
                        if (curY == maxYear && curM == maxMonth) {
                            return;
                        }
                        var $nowDisplay = $(element).getChild('table[curYM="' + curY + '-' + curM + '"]');
                        $nowDisplay.hide();
                        var $toDisplay = $(element).getChild('table[curYM="' + curY + '-' + (curM + 1).toString() + '"]');
                        if ($toDisplay.length === 0)
                        {
                            $toDisplay = initTable(new Date(curY, curM + 1, 1));
                            element.appendChild($toDisplay[0]);
                        }
                        $toDisplay.show();
                    });
                }
                var title = document.createElement('th');
                var $title = $(title);
                $title.addClass('switch');
                $title.setAttr('colspan', '5');
                theadRow1.appendChild(prev);
                theadRow1.appendChild(title);
                theadRow1.appendChild(next);

                var theadRow2 = document.createElement('tr');
                var weekArray = [ '日', '一', '二', '三', '四', '五', '六' ];
                $(weekArray).each(function () {
                    var th = document.createElement('th');
                    var $th = $(th);
                    $th.addClass('dow');
                    $th.text(this);
                    theadRow2.appendChild(th);
                });

                thead.appendChild(theadRow1);
                thead.appendChild(theadRow2);
                table.appendChild(thead);
            }
            function initBody() {
                var tbody = document.createElement('tbody');
                table.appendChild(tbody);
            }
            function initFoot() {
                var tfoot = document.createElement('tfoot');
                table.appendChild(tfoot);
            }

            function loadMonth(dateDisplay) {
                // 当前要显示的年和月
                var year = Number(dateDisplay.getFullYear());
                var month = Number(dateDisplay.getMonth());
                $table.setAttr('curYM', year + '-' + month);

                var monthStr = month + 1;
                var title = $($table.getChild('thead>tr>th')[1]);
                title.text(year + '年' + monthStr + '月');
                title.setAttr('curY', year);
                title.setAttr('curM', month);

                var firstDay = 1;
                var firstDayWeek = (new Date(year, month, firstDay)).getDay();
                var datIndex = firstDay - firstDayWeek;
                var loopDate = new Date(year, month, datIndex);
                var endDate = new Date(year, month + 1, 1);

                var $tbody = $table.getChild('tbody');
                $tbody.clearChild();
                var body = $tbody[0];
                var bodyRow = null;
                while (true) {
                    if (loopDate.getDay() == 0) {
                        if (loopDate >= endDate) {
                            break;
                        }
                        bodyRow = document.createElement('tr');
                        body.appendChild(bodyRow);
                    }
                    bodyRow.appendChild(genDayTd(loopDate));
                    datIndex += 1;
                    loopDate = new Date(year, month, datIndex);
                }

                function genDayTd(date) {
                    var td = document.createElement('td');
                    var $td = $(td);
                    if (Number(date.getFullYear()) === year && Number(date.getMonth()) === month) {
                        if (date - minDate < 0 || date - maxDate > 0)
                        {
                            $td.addClass('old');
                            $td.text(date.getDate());
                        }
                        else
                        {
                            $td.setAttr('canClick', '1');
                            if ($.checkType(onRenderDateTd) === type.eFunction)
                            {
                                onRenderDateTd.call(td, { renderTarget: td, tdDate: date, disableSelect: function () {
                                    $(this.renderTarget).setAttr('canClick', '0');
                                } });
                            }
                            else
                            {
                                $td.addClass('day');
                                $td.text(date.getDate());
                            }
                            $td.setAttr('curD', date.getDate());
                            $td.click(function (event) {
                                if (!isTdCanClick(event.currentTarget))
                                {
                                    return;
                                }
                                var curY = Number(title.getAttr('curY'));
                                var curM = Number(title.getAttr('curM'));
                                var curD = Number($(event.currentTarget).getAttr('curD'));
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
                                        var beforeResult = onBeforeSelect.call(event.currentTarget, event, {
                                            newSelectDate: selVal.copy(),
                                            findDayTd: findDayTd
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
                                if ($.checkType(onSelected) === type.eFunction)
                                {
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
                                            onSelected.call(this, event, { selectDateStart: min.copy(), selectDateEnd: max.copy(), findDayTd: findDayTd });
                                        }
                                        else if (selectDates.length === 1)
                                        {
                                            onSelected.call(this, event, { selectDateStart: selectDates[0].copy(), findDayTd: findDayTd });
                                        }
                                    }
                                    else
                                    {
                                        onSelected.call(this, event, { selectDate: selVal.copy(), findDayTd: findDayTd });
                                    }
                                }
                            });
                            //保存初始td样式和初始innerHTML
                            $td.cache().push('initClass', $td.getClassList());
                            $td.cache().push('initInnerHtml', $td.html());
                            if (pickMode === 'single' && date - selectDates[0] == 0)
                            {
                                select($td);
                            }
                        }
                    }
                    else {
                        $td.addClass('old');
                    }

                    return td;
                }
            }

            function setPrevNext() {
                var title = $($table.getChild('thead>tr>th')[1]);
                var curY = Number(title.getAttr('curY'));
                var curM = Number(title.getAttr('curM'));
                var prev = $($table.getChild('thead>tr>th')[0]);
                var next = $($table.getChild('thead>tr>th')[2]);
                if (curY == minYear && curM == minMonth) {
                    prev.addClass('disable');
                }
                else {
                    prev.removeClass('disable');
                }
                if (curY == maxYear && curM == maxMonth) {
                    next.addClass('disable');
                }
                else {
                    next.removeClass('disable');
                }
            }

            if (mode === 'switch')
            {
                setPrevNext();
            }

            return $table;
        }
        element.appendChild(initTable(new Date(minYear, minMonth, 1))[0]);
        if (mode === 'waterfall')
        {
            for (var i = 1; i < 6; ++i)
            {
                var d = new Date(minYear, minMonth + i, 1);
                element.appendChild(initTable(d)[0]);
            }
        }

        function findDayTd(date) {
            var y = date.getFullYear();
            var m = date.getMonth();
            var d = date.getDate();
            return $(element).getChild('table[curYM="' + y + '-' + m + '"] td[curD="' + d + '"]');
        }

        function select($td) {
            $td.clearClass();
            $td.addClass('active');
        }

        function unselect($td) {
            $td.clearClass();
            var clses = $td.cache().get('initClass');
            $(clses).each(function () {
                $td.addClass(this);
            });
            var innerHtml = $td.cache().get('initInnerHtml');
            $td.html(innerHtml);
        }

        function isTdCanClick(td) {
            var canClick = $(td).getAttr('canClick');
            return !$.isStringEmpty(canClick) && canClick == '1';
        }

        function reselectRange(selVal, event, onBeforeSelect) {
            if (selectDates.length === 0 || selectDates.length > 1)
            {
                var minus, min, max, loopDate;
                if ($.checkType(onBeforeSelect) === type.eFunction)
                {
                    var beforeResult = onBeforeSelect.call(event.currentTarget, event, {
                        newSelectDateStart: selVal.copy(),
                        findDayTd: findDayTd
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
                if ($.checkType(onBeforeSelect) === type.eFunction)
                {
                    var beforeResult = onBeforeSelect.call(event.currentTarget, event, {
                        newSelectDateStart: minus > 0 ? selectDates[0].copy() : selVal.copy(),
                        newSelectDateEnd: minus < 0 ? selectDates[0].copy() : selVal.copy(),
                        findDayTd: findDayTd
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

        return {
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
                            findDayTd: findDayTd
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
                    onSelected.call(this, event, { selectDateStart: min.copy(), selectDateEnd: max.copy(), findDayTd: findDayTd });
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
                            findDayTd: findDayTd
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
                    onSelected.call(this, event, { selectDate: selectDates[0].copy(), findDayTd: findDayTd });
                }
            }
        };
    }

    return self;
}({})));


