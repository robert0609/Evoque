//Dependency: Evoque.js
$.extend('browser', (function (self) {

    self.enableClickBackControl = function () {
        //查找文档元数据：<meta name="EvoqueClickBackControl" content="true" />
        var $meta = $('meta[name="EvoqueClickBackControl"]');
        if ($meta.length < 1)
        {
            return false;
        }
        else
        {
            var content = $meta.getAttr('content');
            if ($.isStringEmpty(content) || content.toLowerCase() !== 'true')
            {
                return false;
            }
            else
            {
                return true;
            }
        }
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