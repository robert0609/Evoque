//Dependency: Evoque.js
Evoque.calendar = (function (self) {
    var cache = {};

    var defaultOption = {
        tableElementid: '',
        calendarData: null,
        originalDate: (new Date()).getYMD(),
        callBack: function () {}
    };

    self.create = function (option) {
        if (isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        option = $(option);
        var tableId = option.getValueOfProperty('tableElementid', defaultOption);
        if (isStringEmpty(tableId))
        {
            throw 'Parameter is error!';
        }
        var fCallBack = option.getValueOfProperty('callBack', defaultOption);
        defaultOption.originalDate = (new Date()).getYMD();
        var activeDate = option.getValueOfProperty('originalDate', defaultOption);
        var checkInData = option.getValueOfProperty('calendarData', defaultOption);
        cache[tableId] = new calendarClass(tableId, activeDate, checkInData, fCallBack);
        cache[tableId].init();
        return cache[tableId];
    };

    function calendarClass(tableId, activeDate, checkInData, fCallBack)
    {
        var now = (new Date()).getYMD();
        var currentYear = Number(now.getFullYear());
        var currentMonth = Number(now.getMonth());
        var currentDay = Number(now.getDate());
        var currentWeek = Number(now.getDay());

        var max = new Date(currentYear, currentMonth + 11, currentDay);
        var maxYear = Number(max.getFullYear());
        var maxMonth = Number(max.getMonth());
        var maxDay = Number(max.getDate());
        var maxWeek = Number(max.getDay());

        var startYear = Number(activeDate.getFullYear());
        var startMonth = Number(activeDate.getMonth());
        var startDay = Number(activeDate.getDate());
        var startWeek = Number(activeDate.getDay());

        this.init = function ()
        {
            $('#' + tableId).addClass('table-wrap');
            $('#' + tableId).addClass('table-calendar');

            var strHtml = '<thead><tr><th id="thPrev" class="prev disable">←</th><th id="thTitle" colspan="5" class="switch"></th><th id="thNext" class="next">→</th></tr><tr><th class="dow">日</th><th class="dow">一</th><th class="dow">二</th><th class="dow">三</th><th class="dow">四</th><th class="dow">五</th><th class="dow">六</th></tr></thead><tbody id="tbodyMonth"></tbody><tfoot><tr><th colspan="7" class="today" style="display: none;">Today</th></tr></tfoot>';
            $('#' + tableId).html(strHtml);
            //绑定上下个月事件
            $('#' + tableId + ' #thPrev').addEventHandler('click', function ()
            {
                var title = $('#' + tableId + ' #thTitle');
                var curY = Number(title.getAttr('curY'));
                var curM = Number(title.getAttr('curM'));
                if (curY == currentYear && curM == currentMonth) {
                    return;
                }
                $('#' + tableId + ' #tbodyMonth').html(loadMonth(new Date(curY, curM - 1, 1)));
                //绑定日期的选择事件
                $('#' + tableId + ' td[enablePick]').addEventHandler('click', onClickDay);
                setPrevNext();
            });
            $('#' + tableId + ' #thNext').addEventHandler('click', function ()
            {
                var title = $('#' + tableId + ' #thTitle');
                var curY = Number(title.getAttr('curY'));
                var curM = Number(title.getAttr('curM'));
                if (curY == maxYear && curM == maxMonth) {
                    return;
                }
                $('#' + tableId + ' #tbodyMonth').html(loadMonth(new Date(curY, curM + 1, 1)));
                //绑定日期的选择事件
                $('#' + tableId + ' td[enablePick]').addEventHandler('click', onClickDay);
                setPrevNext();
            });

            $('#' + tableId + ' #tbodyMonth').html(loadMonth(new Date(startYear, startMonth, 1)));
            //绑定日期的选择事件
            $('#' + tableId + ' td[enablePick]').addEventHandler('click', onClickDay);
            setPrevNext();
        };

        function onClickDay(event) {
            var title = $('#' + tableId + ' #thTitle');
            var curY = Number(title.getAttr('curY'));
            var curM = Number(title.getAttr('curM'));
            curM += 1;
            var curD = Number($(event.currentTarget).getAttr('curD'));
            var sel = curY + '-' + curM + '-' + curD;
            if (checkType(fCallBack) === type.eFunction) {
                fCallBack(event, { selectDate: sel });
            }
        };

        function setPrevNext() {
            var title = $('#' + tableId + ' #thTitle');
            var curY = Number(title.getAttr('curY'));
            var curM = Number(title.getAttr('curM'));
            if (curY == currentYear && curM == currentMonth) {
                $('#' + tableId + ' #thPrev').addClass('disable');
            }
            else {
                $('#' + tableId + ' #thPrev').removeClass('disable');
            }
            if (curY == maxYear && curM == maxMonth) {
                $('#' + tableId + ' #thNext').addClass('disable');
            }
            else {
                $('#' + tableId + ' #thNext').removeClass('disable');
            }
        }

        function loadMonth(dateDiplay) {
            // 当前要显示的年和月
            var year = Number(dateDiplay.getFullYear());
            var month = Number(dateDiplay.getMonth());

            var monthStr = month + 1;
            var title = $('#' + tableId + ' #thTitle');
            title.html(year + '年' + monthStr + '月');
            title.setAttr('curY', year);
            title.setAttr('curM', month);

            var firstDay = 1;
            var firstDayWeek = (new Date(year, month, firstDay)).getDay();
            var datIndex = firstDay - firstDayWeek;
            var loopDate = new Date(year, month, datIndex);
            var endDate = new Date(year, month + 1, 1);

            var tbody = '';
            while (true) {
                if (loopDate.getDay() == 0) {
                    if (loopDate >= endDate) {
                        break;
                    }
                    tbody += '<tr>';
                }
                tbody += genDayTd(loopDate);
                if (loopDate.getDay() == 6) {
                    tbody += '</tr>';
                    if (loopDate >= endDate) {
                        break;
                    }
                }

                datIndex += 1;
                loopDate = new Date(year, month, datIndex);
            }

            function genDayTd(date) {
                var tdClass = 'day disable';
                var cb = '';
                var price = '';
                if (date - now >= 0) {
                    if (Number(date.getFullYear()) == year && Number(date.getMonth()) == month) {
                        if (checkInData) {
                            var monthIdx = Number(date.getMonth()) - currentMonth + (Number(date.getFullYear()) - currentYear) * 12;
                            var stat = checkInData[monthIdx][Number(date.getDate()) - 1];
                            if (stat[0] == 1) {
                                tdClass = 'day';
                                cb = ' enablePick="true"';
                                if (stat[1] > 0) {
                                    price = '<span>¥<em>' + stat[1] + '</em></span>';
                                }
                                else {
                                    price = '';
                                }
                            }
                        }
                        else {
                            tdClass = 'day';
                            cb = ' enablePick="true"';
                        }
                    }
                    else {
                        return '<td class="day disable"></td>';
                    }
                }
                else {
                    return '<td class="day disable"></td>';
                }

                if (date - activeDate == 0) {
                    tdClass = 'day active';
                }
                var td = '<td curD="' + date.getDate() + '"' + cb + ' class="' + tdClass + '">' + date.getDate() + price + '</td>'
                return td;
            }

            return tbody;
        }
    }

    //API
    Evoque.createCalendar = function (option)
    {
        option = option || {};
        option.tableElementid = this.getAttr('id');
        return self.create(option);
    };

    return self;
}(Evoque.calendar || {}));


