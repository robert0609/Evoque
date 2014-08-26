
var secSpan = 1000, minSpan = 60000, hourSpan = 3600000, daySpan = 86400000;
//Extension
Date.prototype.copy = function ()
{
    return new Date(this.getTime());
};
Date.prototype.getYMD = function ()
{
    return new Date(this.getFullYear(), this.getMonth(), this.getDate());
};
Date.prototype.addDay = function (n)
{
    this.setDate(this.getDate() + Number(n));
    return this;
};
Date.prototype.addSecond = function (n)
{
    this.setTime(this.getTime() + Number(n) * secSpan);
    return this;
};


//var startDay = new Date(2014, 6, 29);
//var endDay = new Date(2014, 6, 31);
//TODO:test
var startDay = new Date(2014, 6, 22);
var endDay = new Date(2014, 6, 24);
var startHourTime = 10;
var endHourTime = 24;

var skillDay = null;
var currentTime = null;

var defaultTimeObject = {
    //秒杀时刻点
    killTime: null,
    //0: 距离本场结束; 1: 距离本场开始
    kind: null,
    //具体时间
    span: null
};

var onmessage = function (data)
{
    skillDay = data.skillDate;
    currentTime = data.systemTime;
    init();
};

var postMessage = function (data) {
    var d = data;
};

startTimer();
var postData = [];
function startTimer()
{
    setInterval(function ()
    {
        if (currentTime == null)
        {
            return;
        }
        currentTime.addSecond(1);
        if (postData.length == 0)
        {
            return;
        }
        for (var i = 0; i < postData.length; ++i)
        {
            var currentStartTime = postData[i].killTime;
            if (currentTime < currentStartTime)
            {
                postData[i].kind = 1;
                postData[i].span = new timeSpanClass(currentStartTime - currentTime);
            }
            else
            {
                var currentOverTime = currentStartTime.copy().addSecond(3480);
                if (currentTime < currentOverTime)
                {
                    postData[i].kind = 0;
                    postData[i].span = new timeSpanClass(currentOverTime - currentTime);
                }
                else
                {
                    postData[i].kind = null;
                    postData[i].span = null;
                }
            }
        }
        postMessage(postData);
    }, 1000);
}


function init()
{
    if (skillDay == null)
    {
        return;
    }
    if (skillDay < startDay)
    {
        if ((startDay - skillDay) / daySpan < 4)
        {
            skillDay = startDay;
        }
        else
        {
            return;
        }
    }
    if (skillDay > endDay)
    {
        return;
    }
    var loopy = skillDay.getFullYear();
    var loopM = skillDay.getMonth();
    var loopd = skillDay.getDate();
    for (var loopH = startHourTime; loopH <= endHourTime; ++loopH)
    {
        postData.push({ killTime: new Date(loopy, loopM, loopd, loopH, 0, 0) });
    }
}

function timeSpanClass(totalMilliseconds)
{
    var ms = 0, s = 0, m = 0, H = 0, d = 0;
    var totalSpan = totalMilliseconds;
    if (totalSpan > 1000)
    {
        ms = totalSpan % 1000;
        totalSpan -= ms;
        //totalSpan换算成秒
        totalSpan /= 1000;
        if (totalSpan > 60)
        {
            s = totalSpan % 60;
            totalSpan -= s;
            //totalSpan换算成分
            totalSpan /= 60;
            if (totalSpan > 60)
            {
                m = totalSpan % 60;
                totalSpan -= m;
                //totalSpan换算成时
                totalSpan /= 60;
                if (totalSpan > 24)
                {
                    H = totalSpan % 24;
                    totalSpan -= H;
                    //totalSpan换算成天
                    totalSpan /= 24;
                    d = totalSpan;
                }
                else
                {
                    H = totalSpan;
                }
            }
            else
            {
                m = totalSpan;
            }
        }
        else
        {
            s = totalSpan;
        }
    }
    else
    {
        ms = totalSpan;
    }
    this.totalMilliseconds = ms;
    this.totalSeconds = s;
    this.totalMinutes = m;
    this.totalHours = H;
    this.totalDays = d;
}