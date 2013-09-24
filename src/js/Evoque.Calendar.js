//Dependency: Evoque.js
Evoque.calendar = (function (self) {
    var cache = {};

    var defaultOption = {
        tableElementid: '',
        startDate: (new Date()).getYMD(),
        calendarData: null,
        originalDate: (new Date()).getYMD(),
        callBack: function () {}
    };

    self.create = function (option, tableElement) {
        if ($.isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        option = $(option);
        var tableId;
        if ($.checkType(tableElement) === type.eElement)
        {
            tableId = tableElement;
        }
        else
        {
            tableId = option.getValueOfProperty('tableElementid', defaultOption);
            if ($.isStringEmpty(tableId))
            {
                throw 'Parameter is error!';
            }
        }
        var fCallBack = option.getValueOfProperty('callBack', defaultOption);
        defaultOption.originalDate = (new Date()).getYMD();
        var activeDate = option.getValueOfProperty('originalDate', defaultOption);
        var checkInData = option.getValueOfProperty('calendarData', defaultOption);
        defaultOption.startDate = (new Date()).getYMD();
        var startDate = option.getValueOfProperty('startDate', defaultOption);
        cache[tableId] = new calendarClass(tableId, startDate, activeDate, checkInData, fCallBack);
        cache[tableId].init();
        return cache[tableId];
    };

    function calendarClass(tableElement, startDate, activeDate, checkInData, fCallBack)
    {
        var now = startDate;
        var currentYear = Number(now.getFullYear());
        var currentMonth = Number(now.getMonth());
        var currentDay = Number(now.getDate());
        var currentWeek = Number(now.getDay());

        var max = new Date(currentYear, currentMonth + 11, currentDay);
        var maxYear = Number(max.getFullYear());
        var maxMonth = Number(max.getMonth());
        var maxDay = Number(max.getDate());
        var maxWeek = Number(max.getDay());

        if (activeDate < now)
        {
            activeDate = now;
        }
        var startYear = Number(activeDate.getFullYear());
        var startMonth = Number(activeDate.getMonth());
        var startDay = Number(activeDate.getDate());
        var startWeek = Number(activeDate.getDay());

        var tableObj = null;
        if ($.checkType(tableElement) === type.eElement)
        {
            tableObj = $(tableElement);
        }
        else if ($.checkType(tableElement) === type.eString)
        {
            tableObj = $('#' + tableElement);
        }
        else
        {
            throw 'Invalid parameter!';
        }

        this.init = function ()
        {
            tableObj.addClass('table-wrap');
            tableObj.addClass('table-calendar');

            var strHtml = '<thead><tr><th id="thPrev" class="prev disable">←</th><th id="thTitle" colspan="5" class="switch"></th><th id="thNext" class="next">→</th></tr><tr><th class="dow">日</th><th class="dow">一</th><th class="dow">二</th><th class="dow">三</th><th class="dow">四</th><th class="dow">五</th><th class="dow">六</th></tr></thead><tbody id="tbodyMonth"></tbody><tfoot><tr><th colspan="7" class="today" style="display: none;">Today</th></tr></tfoot>';
            tableObj.html(strHtml);
            //绑定上下个月事件
            tableObj.getChild('#thPrev').addEventHandler('click', function ()
            {
                var title = tableObj.getChild('#thTitle');
                var curY = Number(title.getAttr('curY'));
                var curM = Number(title.getAttr('curM'));
                if (curY == currentYear && curM == currentMonth) {
                    return;
                }
                tableObj.getChild('#tbodyMonth').html(loadMonth(new Date(curY, curM - 1, 1)));
                //绑定日期的选择事件
                tableObj.getChild('td[enablePick]').addEventHandler('click', onClickDay);
                setPrevNext();
            });
            tableObj.getChild('#thNext').addEventHandler('click', function ()
            {
                var title = tableObj.getChild('#thTitle');
                var curY = Number(title.getAttr('curY'));
                var curM = Number(title.getAttr('curM'));
                if (curY == maxYear && curM == maxMonth) {
                    return;
                }
                tableObj.getChild('#tbodyMonth').html(loadMonth(new Date(curY, curM + 1, 1)));
                //绑定日期的选择事件
                tableObj.getChild('td[enablePick]').addEventHandler('click', onClickDay);
                setPrevNext();
            });

            tableObj.getChild('#tbodyMonth').html(loadMonth(new Date(startYear, startMonth, 1)));
            //绑定日期的选择事件
            tableObj.getChild('td[enablePick]').addEventHandler('click', onClickDay);
            setPrevNext();
        };

        function onClickDay(event) {
            var title = tableObj.getChild('#thTitle');
            var curY = Number(title.getAttr('curY'));
            var curM = Number(title.getAttr('curM'));
            curM += 1;
            var curD = Number($(event.currentTarget).getAttr('curD'));
            var sel = curY + '-' + curM + '-' + curD;
            if ($.checkType(fCallBack) === type.eFunction) {
                fCallBack(event, { selectDate: sel, selectDateValue: new Date(curY, curM - 1, curD) });
            }
        }

        function setPrevNext() {
            var title = tableObj.getChild('#thTitle');
            var curY = Number(title.getAttr('curY'));
            var curM = Number(title.getAttr('curM'));
            if (curY == currentYear && curM == currentMonth) {
                tableObj.getChild('#thPrev').addClass('disable');
            }
            else {
                tableObj.getChild('#thPrev').removeClass('disable');
            }
            if (curY == maxYear && curM == maxMonth) {
                tableObj.getChild('#thNext').addClass('disable');
            }
            else {
                tableObj.getChild('#thNext').removeClass('disable');
            }
        }

        function loadMonth(dateDiplay) {
            // 当前要显示的年和月
            var year = Number(dateDiplay.getFullYear());
            var month = Number(dateDiplay.getMonth());

            var monthStr = month + 1;
            var title = tableObj.getChild('#thTitle');
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
        if (this.length < 1)
        {
            return null;
        }
        return self.create(option, this[0]);
    };

    return self;
}(Evoque.calendar || {}));


