//Dependency: Evoque.js
$.extend('browser', (function (self) {

    var _enableClickBackControl;

    self.enableClickBackControl = function () {
        if ($.checkType(_enableClickBackControl) === type.eBoolean)
        {
            return _enableClickBackControl;
        }
        //查找文档元数据：<meta name="EvoqueClickBackControl" content="true" />
        var $meta = $('meta[name="EvoqueClickBackControl"]');
        if ($meta.length < 1)
        {
            _enableClickBackControl = false;
        }
        else
        {
            var content = $meta.getAttr('content');
            if ($.isStringEmpty(content) || content.toLowerCase() !== 'true')
            {
                _enableClickBackControl = false;
            }
            else
            {
                _enableClickBackControl = true;
            }
        }
        return _enableClickBackControl;
    };

    var clickBackHandles = [];
    var isTriggerPushed = false;

    self.clickBack = function (fn) {
        if (self.enableClickBackControl() && $.checkType(fn) === type.eFunction)
        {
            clickBackHandles.push(fn);
        }
    };

    window.addEventListener('popstate', function (e) {
        if (!self.enableClickBackControl() || !isTriggerPushed)
        {
            return;
        }
        try
        {
            $(clickBackHandles).each(function () {
                this.call();
            });
        }
        finally
        {
            window.history.pushState(e.state, document.title, location.href);
        }
    });

    self.pushBackHandleTrigger = function () {
        if (self.enableClickBackControl())
        {
            window.history.replaceState(history.state, document.title, location.href);
            window.history.pushState(history.state, document.title, location.href);
            isTriggerPushed = true;
        }
    };

    return self;
}({})));