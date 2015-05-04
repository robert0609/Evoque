//Dependency: Evoque.js, Evoque.Dialog.js
$.container = (function (self)
{
    var defaultOption = {
        divIdList: [],
        startDivId: '',
        onShow: function () {},
        onHide: function () {},
        enableHistory: false,
        //不同的div切换的特效: 'none'、'bottom2top'、'right2left'.default: 'none'
        switchEffect: 'none',
        getFinalScrollAxis: function () { return 44; },
        autoTop: true
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
        var autoTop = option.getValueOfProperty('autoTop', defaultOption);
        var getFinalScrollAxis = option.getValueOfProperty('getFinalScrollAxis', defaultOption);
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
        var obj = new containerClass(divIdList, startDivId, onShowMtd, onHideMtd, enableHistory, switchEffect, autoTop, getFinalScrollAxis);
        if (!$.isStringEmpty(startDivId))
        {
            obj.disableSwitchEffect();
            obj.display(startDivId);
            obj.enableSwitchEffect();
        }
        return obj;
    };

    function containerClass(divIdList, startDivId, onShow, onHide, enableHistory, switchEffect, autoTop, getFinalScrollAxis)
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

        if (enableHistory)
        {
            var that = this;
            window.addEventListener('popstate', function (e) {
                if ($.isObjectNull(e.state))
                {
                    return;
                }
                //判断如果要显示的id不在当前container中，则直接跳出
                if (!ids.contains(e.state.toShowId)) {
                    return;
                }

                var parameter = createOption();
                if ($.checkType(e.state.remainHideDivInput) === type.eBoolean)
                {
                    parameter.remainHideDivInput = e.state.remainHideDivInput;
                }
                innerDisplay.call(that, e.state.toShowId, parameter, true);
                if (autoTop)
                {
                    //window.scrollTo(0, 0);
                }
            });
        }

        this.display = function(divId, option)
        {
            //判断如果要显示的id不在当前container中，则直接跳出
            if (!ids.contains(divId)) {
                return;
            }

            var parameter = createOption();
            var isOptionNull = $.isObjectNull(option);
            if (!isOptionNull)
            {
                if ($.checkType(option.remainHideDivInput) === type.eBoolean)
                {
                    parameter.remainHideDivInput = option.remainHideDivInput;
                }
            }
            innerDisplay.call(this, divId, parameter, false, isOptionNull ? undefined : option.switchEffect, isOptionNull ? undefined : option.getFinalScrollAxis);
            if (autoTop)
            {
                window.scrollTo(0, 0);
            }
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

        /**
         * 针对同一个容器下的层，有些层想呈现特殊的切换效果，与其他层不同，那么这个特殊效果通过innerDisplay的effect参数传入，缓存在这里
         * @type {Object: { string, string }}
         */
        var divSpecialEffect = {};
        function getEffect(divId) {
            var effect = switchEffect;
            if (!$.isStringEmpty(divSpecialEffect[divId])) {
                effect = divSpecialEffect[divId];
            }
            return effect;
        }

        var divSpecialFinalAxis = {};
        function getFinalAxisCallback(divId) {
            var cb = getFinalScrollAxis;
            if ($.checkType(divSpecialFinalAxis[divId]) === type.eFunction) {
                cb = divSpecialFinalAxis[divId];
            }
            return cb;
        }

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

        function innerDisplay(divId, parameter, isBack, effect, getFinalAxis)
        {
            if (!isBack) {
                if (!$.isStringEmpty(effect) && [ 'bottom2top', 'right2left' ].contains(effect)) {
                    divSpecialEffect[divId] = effect;
                }
                if ($.checkType(getFinalAxis) === type.eFunction) {
                    divSpecialFinalAxis[divId] = getFinalAxis;
                }
            }
            var that = this;
            var backFlag = false;
            if ($.checkType(isBack) === type.eBoolean && isBack)
            {
                backFlag = true;
            }
            var toShowId = divId;
            var toShowDiv = null;
            var toHideDiv = null;
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
                        toHideDiv = this.currentDisplay;
                    }
                }
            }
            var finalEffect = '';
            var finalAxisCallback = null;
            if (toHideDiv != null) {
                finalEffect = getEffect(toHideDiv[0].id);
                delete divSpecialEffect[toHideDiv[0].id];
                finalAxisCallback = getFinalAxisCallback(toHideDiv[0].id);
                delete divSpecialFinalAxis[toHideDiv[0].id];

                currentDisplayId = '';
                this.currentDisplay = null;
                if (backFlag && finalEffect === 'bottom2top') {
                    toHideDiv.addClass('top-bottom');
                    var windowHeight = document.documentElement.clientHeight;
                    var top1 = windowHeight;
                    //去除header的高度
                    var headerTop = finalAxisCallback();
                    var top2 = top1 - headerTop;
                    toHideDiv.setStyle('top', headerTop + 'px');
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
                            //有特效并且是后退的情况下，在此时显示要显示的div
                            if (toShowDiv != null)
                            {
                                currentDisplayId = toShowId;
                                that.currentDisplay = toShowDiv;
                                show(toShowDiv);
                                if (toShowDiv.length > 0 && onShowIsFn)
                                {
                                    onShow.call(toShowDiv[0], { backMode: backFlag });
                                }
                            }
                        }, 400);
                    }, 10);
                }
                else if (backFlag && finalEffect === 'right2left') {
                    toHideDiv.addClass('left-right');
                    //toHideDiv.setStyle('top', '44px');
                    var windowWidth = document.documentElement.clientWidth;
                    window.setTimeout(function () {
                        toHideDiv.setStyle('webkitTransform', 'translateX(' + windowWidth + 'px)');
                        window.setTimeout(function () {
                            hide(toHideDiv, parameter.remainHideDivInput);
                            if (toHideDiv.length > 0 && onHideIsFn) {
                                //toHideDiv[0].style.removeProperty('top');
                                toHideDiv[0].style.removeProperty('-webkit-transform');
                                toHideDiv.removeClass('left-right');
                                parameter.backMode = backFlag;
                                onHide.call(toHideDiv[0], parameter);
                            }
                            //有特效并且是后退的情况下，在此时显示要显示的div
                            if (toShowDiv != null)
                            {
                                currentDisplayId = toShowId;
                                that.currentDisplay = toShowDiv;
                                show(toShowDiv);
                                if (toShowDiv.length > 0 && onShowIsFn)
                                {
                                    onShow.call(toShowDiv[0], { backMode: backFlag });
                                }
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
            if (toShowDiv != null) {
                finalEffect = getEffect(toShowId);
                finalAxisCallback = getFinalAxisCallback(toShowId);

                currentDisplayId = toShowId;
                this.currentDisplay = toShowDiv;
                //如果开启特效的情况
                if (finalEffect !== 'none') {
                    if (!backFlag) {
                        if (finalEffect === 'bottom2top') {
                            toShowDiv.addClass('bottom-top');
                            var windowHeight = document.documentElement.clientHeight;
                            var top1 = windowHeight;
                            //去除header的高度
                            var top2 = top1 - finalAxisCallback();
                            toShowDiv.setStyle('top', top1 + 'px');
                            //暴力解决上到下动画的宽度坍缩问题
                            toShowDiv.setStyle('width', document.documentElement.clientWidth + 'px');
                            show(toShowDiv);
                            if (toShowDiv.length > 0 && onShowIsFn)
                            {
                                onShow.call(toShowDiv[0], { backMode: backFlag });
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
                        else if (finalEffect === 'right2left') {
                            toShowDiv.addClass('right-left');
                            //toShowDiv.setStyle('top', '44px');
                            //toShowDiv.setStyle('left', windowWidth + 'px');
                            var windowWidth = document.documentElement.clientWidth;
                            toShowDiv.setStyle('width', windowWidth + 'px');
                            show(toShowDiv);
                            if (toShowDiv.length > 0 && onShowIsFn)
                            {
                                onShow.call(toShowDiv[0], { backMode: backFlag });
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
                    }
                }
                else {
                    show(toShowDiv);
                    if (toShowDiv.length > 0 && onShowIsFn)
                    {
                        onShow.call(toShowDiv[0], { backMode: backFlag });
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
