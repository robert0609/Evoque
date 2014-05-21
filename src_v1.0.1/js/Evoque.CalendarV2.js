//Dependency: Evoque.js
Evoque.extend('calendarV2', (function (self) {
    var defaultOption = {
        startDate: (new Date()).getYMD(),
        originalDate: (new Date()).getYMD(),
        onRenderDateTd: null,
        onSelected: function () {},
        //显示模式: waterfall:瀑布展示从开始日算起的6个月的日历; switch:左右按钮切换上下月的日历
        mode: 'switch'
    };

    self.create = function (option) {
        if ($.isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        option = $(option);
        var caller = self.evoqueTarget;
        defaultOption.startDate = (new Date()).getYMD();
        var startDate = option.getValueOfProperty('startDate', defaultOption);
        defaultOption.originalDate = (new Date()).getYMD();
        var activeDate = option.getValueOfProperty('originalDate', defaultOption);
        var mode = option.getValueOfProperty('mode').toLowerCase();
        if (mode !== 'switch' && mode !== 'waterfall') {
            throw 'Mode is error! It must be one of ["switch", "waterfall"]';
        }
        var onRenderDateTd = option.getValueOfProperty('onRenderDateTd');
        var onSelected = option.getValueOfProperty('onSelected');

        caller.each(function () {
            var calendar = new calendarClass(this, startDate, activeDate, mode, onRenderDateTd, onSelected);
        });
    };

    function calendarClass(element, minDate, activeDate, mode, onRenderDateTd, onSelected)
    {
        var minYear = Number(minDate.getFullYear());
        var minMonth = Number(minDate.getMonth());
        var minDay = Number(minDate.getDate());
        var minWeek = Number(minDate.getDay());
        var maxDate = new Date(minYear, minMonth + 12, minDay - 1);
        var maxYear = Number(maxDate.getFullYear());
        var maxMonth = Number(maxDate.getMonth());
        var maxDay = Number(maxDate.getDate());
        var maxWeek = Number(maxDate.getDay());

        if (activeDate < minDate)
        {
            activeDate = minDate;
        }

        function initTable(displayMonth) {
            var table = document.createElement('table');
            var $table = $(table);
            $table.addClass('table-wrap');
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
                        loadMonth(new Date(curY, curM - 1, 1));
                        setPrevNext();
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
                        loadMonth(new Date(curY, curM + 1, 1));
                        setPrevNext();
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
                    if (date - minDate < 0 || date - maxDate > 0)
                    {
                        $td.addClass('old');
                    }
                    else
                    {
                        if (Number(date.getFullYear()) === year && Number(date.getMonth()) === month) {
                            if ($.checkType(onRenderDateTd) === type.eFunction)
                            {
                                onRenderDateTd.call(td, { renderTarget: td, tdDate: date });
                            }
                            else
                            {
                                if (date - activeDate == 0)
                                {
                                    $td.addClass('active');
                                }
                                else
                                {
                                    $td.addClass('day');
                                }
                                $td.text(date.getDate());
                            }
                            $td.setAttr('curD', date.getDate());
                            $td.click(function (event) {
                                var curY = Number(title.getAttr('curY'));
                                var curM = Number(title.getAttr('curM'));
                                curM += 1;
                                var curD = Number($(event.currentTarget).getAttr('curD'));
                                var sel = curY + '-' + curM + '-' + curD;
                                if ($.checkType(onSelected) === type.eFunction)
                                {
                                    onSelected.call(this, event, { selectDate: sel, selectDateValue: new Date(curY, curM - 1, curD) });
                                }
                            });
                        }
                        else {
                            $td.addClass('old');
                        }
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
        element.appendChild(initTable(minDate)[0]);
        if (mode === 'waterfall')
        {
            for (var i = 1; i < 6; ++i)
            {
                var d = new Date(minYear, minMonth + i, minDay);
                element.appendChild(initTable(d)[0]);
            }
        }
    }

    return self;
}({})));


