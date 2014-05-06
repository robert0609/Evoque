//Dependency: Evoque.js
$.extend('browser', (function (self) {
    var _enableClickBackControl = false;

    var clickBackHandles = [];

    self.clickBack = function (fn) {
        if ($.checkType(fn) === type.eFunction)
        {
            clickBackHandles.push(fn);
        }
    };

    window.addEventListener('popstate', function (e) {
        if (!_enableClickBackControl)
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

    self.enableClickBackControl = function () {
        window.history.replaceState(history.state, document.title, location.href);
        window.history.pushState(history.state, document.title, location.href);
        _enableClickBackControl = true;
    };

    return self;
}({})));