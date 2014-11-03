//Dependency: Evoque.js, Evoque.Dialog.js
$.container = (function (self)
{
    var defaultOption = {
        divIdList: [],
        startDivId: '',
        onShow: function () {},
        onHide: function () {},
        //同一个页面最多只能有一个container开启history操控
        enableHistory: false,
        //不同的div切换的特效: 'none'、'bottom2top'、'right2left'.default: 'none'
        switchEffect: 'none'
    };

    self.create = function (option)
    {
        if ($.isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        option = $(option);
        var divIdList = option.getValueOfProperty('divIdList', defaultOption);
        var onShowMtd = option.getValueOfProperty('onShow', defaultOption);
        var onHideMtd = option.getValueOfProperty('onHide', defaultOption);
        var enableHistory = option.getValueOfProperty('enableHistory', defaultOption);
        var switchEffect = option.getValueOfProperty('switchEffect', defaultOption);
        if (![ 'none', 'bottom2top', 'right2left' ].contains(switchEffect)) {
            switchEffect = 'none';
        }
        if ($.checkType(divIdList) !== type.eArray || divIdList.length < 1)
        {
            throw 'Parameter is error!';
        }
        var startDivId = option.getValueOfProperty('startDivId', defaultOption);
        if (!$.isStringEmpty(startDivId) && divIdList.indexOf(startDivId) < 0)
        {
            startDivId = divIdList[0];
        }
        var obj = new containerClass(divIdList, startDivId, onShowMtd, onHideMtd, enableHistory, switchEffect);
        if (!$.isStringEmpty(startDivId))
        {
            obj.disableSwitchEffect();
            obj.display(startDivId);
            obj.enableSwitchEffect();
        }
        return obj;
    };

    function containerClass(divIdList, startDivId, onShow, onHide, enableHistory, switchEffect)
    {
        var onShowIsFn = $.checkType(onShow) === type.eFunction;
        var onHideIsFn = $.checkType(onHide) === type.eFunction;

        var ids = divIdList;
        var divList = [];
        for (var i = 0; i < ids.length; ++i)
        {
            var loop = $('#' + ids[i]);
            divList.push(loop);
            hide(loop);
        }

        var currentDisplayId = '';
        this.currentDisplay = null;

        var lastTop = {};

        if (enableHistory)
        {
            var that = this;
            window.addEventListener('popstate', function (e) {
                if ($.isObjectNull(e.state))
                {
                    return;
                }
                var parameter = createOption();
                if ($.checkType(e.state.remainHideDivInput) === type.eBoolean)
                {
                    parameter.remainHideDivInput = e.state.remainHideDivInput;
                }
                innerDisplay.call(that, e.state.toShowId, parameter, true);
                window.scrollTo(0, 0);
            });
        }

        this.display = function(divId, option)
        {
            var parameter = createOption();
            if (!$.isObjectNull(option))
            {
                if ($.checkType(option.remainHideDivInput) === type.eBoolean)
                {
                    parameter.remainHideDivInput = option.remainHideDivInput;
                }
            }
            innerDisplay.call(this, divId, parameter);
            window.scrollTo(0, 0);
            if (enableHistory)
            {
                if (startDivId === divId)
                {
                    history.replaceState({ toShowId: divId, remainHideDivInput: parameter.remainHideDivInput }, document.title, location.href);
                }
                else
                {
                    history.pushState({ toShowId: divId, remainHideDivInput: parameter.remainHideDivInput }, document.title, genHref());
                }
            }
        };

        var originalSwitchEffect = switchEffect;
        this.disableSwitchEffect = function () {
            switchEffect = 'none';
        };
        this.enableSwitchEffect = function () {
            switchEffect = originalSwitchEffect;
        };

        function genHref() {
            var stamp = (new Date()).getTime();
            var query = queryStr2Dic(location.search);
            query['timestamp'] = stamp.toString();
            var url = location.protocol + '//' + location.host + location.pathname + queryDic2Str(query);
            return url;
        }

        function queryStr2Dic(str) {
            if ($.isStringEmpty(str)) {
                return {};
            }
            var dic = {};
            var kvps = str.substr(1).split('&');
            for (var i = 0; i < kvps.length; ++i) {
                var kv = kvps[i].split('=');
                var k = kv[0];
                var v = '';
                if (kv.length > 1) {
                    v = kv[1];
                }
                dic[k] = v;
            }
            return dic;
        }

        function queryDic2Str(dic) {
            var str = '';
            var arr = [];
            for (var k in dic) {
                var v = dic[k];
                if ($.isStringEmpty(v)) {
                    continue;
                }
                var kv = k + '=' + v;
                arr.push(kv);
            }
            if (arr.length > 0) {
                str = '?' + arr.join('&');
            }
            return str;
        }

        function innerDisplay(divId, parameter, isBack)
        {
            var that = this;
            var backFlag = false;
            if ($.checkType(isBack) === type.eBoolean && isBack)
            {
                backFlag = true;
            }
            var toShowId = divId;
            var toShowDiv = null;
            for (var i = 0; i < ids.length; ++i)
            {
                if (ids[i] == toShowId)
                {
                    toShowDiv = divList[i];
                }
                else
                {
                    if (!$.isStringEmpty(currentDisplayId) && ids[i] === currentDisplayId)
                    {
                        var toHideDiv = this.currentDisplay;
                        lastTop[toHideDiv.id] = document.body.scrollTop;
                        currentDisplayId = '';
                        this.currentDisplay = null;
                        if (backFlag && switchEffect === 'bottom2top') {
                            toHideDiv.addClass('top-bottom');
                            var windowHeight = document.documentElement.clientHeight;
                            var top1 = windowHeight;
                            //去除header的高度
                            var top2 = top1 - 44;
                            toHideDiv.setStyle('top', '44px');
                            window.setTimeout(function () {
                                toHideDiv.setStyle('webkitTransform', 'translateY(' + top2 + 'px)');
                                window.setTimeout(function () {
                                    hide(toHideDiv, parameter.remainHideDivInput);
                                    if (toHideDiv.length > 0 && onHideIsFn) {
                                        toHideDiv[0].style.removeProperty('-webkit-transform');
                                        toHideDiv.removeClass('top-bottom');
                                        parameter.backMode = backFlag;
                                        onHide.call(toHideDiv[0], parameter);
                                    }
                                }, 400);
                            }, 10);
                        }
                        else if (backFlag && switchEffect === 'right2left') {
                            toHideDiv.addClass('left-right');
                            toHideDiv.setStyle('top', '44px');
                            window.setTimeout(function () {
                                toHideDiv.setStyle('webkitTransform', 'translateX(100%)');
                                window.setTimeout(function () {
                                    hide(toHideDiv, parameter.remainHideDivInput);
                                    if (toHideDiv.length > 0 && onHideIsFn) {
                                        toHideDiv[0].style.removeProperty('top');
                                        toHideDiv[0].style.removeProperty('-webkit-transform');
                                        toHideDiv.removeClass('left-right');
                                        parameter.backMode = backFlag;
                                        onHide.call(toHideDiv[0], parameter);
                                    }
                                }, 400);
                            }, 10);
                        }
                        else {
                            hide(toHideDiv, parameter.remainHideDivInput);
                            if (toHideDiv.length > 0 && onHideIsFn)
                            {
                                parameter.backMode = backFlag;
                                onHide.call(toHideDiv[0], parameter);
                            }
                        }
                    }
                }
            }
            if (toShowDiv != null)
            {
                currentDisplayId = toShowId;
                this.currentDisplay = toShowDiv;
                //如果开启特效的情况
                if (!backFlag && switchEffect === 'bottom2top') {
                    toShowDiv.addClass('bottom-top');
                    var windowHeight = document.documentElement.clientHeight;
                    var top1 = windowHeight;
                    //去除header的高度
                    var top2 = top1 - 44;
                    toShowDiv.setStyle('top', top1 + 'px');
                    show(toShowDiv);
                    if (toShowDiv.length > 0 && onShowIsFn)
                    {
                        onShow.call(toShowDiv[0]);
                    }
                    window.setTimeout(function () {
                        toShowDiv.setStyle('webkitTransform', 'translateY(-' + top2 + 'px)');
                        window.setTimeout(function () {
                            toShowDiv[0].style.removeProperty('top');
                            toShowDiv[0].style.removeProperty('-webkit-transform');
                            toShowDiv.removeClass('bottom-top');
                        }, 400);
                    }, 10);
                }
                else if (!backFlag && switchEffect === 'right2left') {
                    toShowDiv.addClass('right-left');
                    //toShowDiv.setStyle('top', '44px');
                    //toShowDiv.setStyle('left', windowWidth + 'px');
                    show(toShowDiv);
                    if (toShowDiv.length > 0 && onShowIsFn)
                    {
                        onShow.call(toShowDiv[0]);
                    }
                    window.setTimeout(function () {
                        toShowDiv.setStyle('webkitTransform', 'translateX(0px)');
                        window.setTimeout(function () {
                            //toShowDiv[0].style.removeProperty('left');
                            //toShowDiv[0].style.removeProperty('top');
                            toShowDiv[0].style.removeProperty('-webkit-transform');
                            toShowDiv.removeClass('right-left');
                        }, 400);
                    }, 10);
                }
                else {
                    show(toShowDiv);
                    if (toShowDiv.length > 0 && onShowIsFn)
                    {
                        onShow.call(toShowDiv[0]);
                    }
                }
            }
        }

        this.showDialog = function(divId)
        {
            var toShowDiv = null;
            for (var i = 0; i < ids.length; ++i)
            {
                if (ids[i] == divId)
                {
                    toShowDiv = divList[i];
                    break;
                }
            }
            if (toShowDiv == null)
            {
                return;
            }
            //调用dialog控件显示
            $.dialog.showModalDialog({
                content:divId,
                width:document.documentElement.clientWidth * 0.9,
                onDialogShowed: function(){
                    var select = toShowDiv.getChild('select');
                    select.enable();
                    var input = toShowDiv.getChild('input');
                    input.enable();
                    if (toShowDiv.length > 0 && onShowIsFn)
                    {
                        onShow.call(toShowDiv[0]);
                    }
                },
                onQuiting: function () {
                    return false;
                },
                autoClose: false
            });
        }

        this.closeDialog = function (divId, remainHideDivInput)
        {
            var toHideDiv = null;
            for (var i = 0; i < ids.length; ++i)
            {
                if (ids[i] == divId)
                {
                    toHideDiv = divList[i];
                    break;
                }
            }
            if (toHideDiv == null)
            {
                return;
            }
            $.dialog.closeCurrentDialog();
            if (!remainHideDivInput)
            {
                var select = toHideDiv.getChild('select');
                select.disable();
                var input = toHideDiv.getChild('input');
                input.disable();
            }
            if (toHideDiv.length > 0 && onHideIsFn)
            {
                onHide.call(toHideDiv[0], { remainHideDivInput: remainHideDivInput });
            }
        }

        function createOption()
        {
            return {
                remainHideDivInput: false
            };
        }

        function show(ediv)
        {
            ediv.show();
            var select = ediv.getChild('select');
            select.enable();
            var input = ediv.getChild('input');
            input.enable();
        }

        function hide(ediv, remainHideDiv)
        {
            ediv.hide();
            if (remainHideDiv)
            {
                return;
            }
            var select = ediv.getChild('select');
            select.disable();
            var input = ediv.getChild('input');
            input.disable();
        }
    }

    return self;
}($.container || {}));
