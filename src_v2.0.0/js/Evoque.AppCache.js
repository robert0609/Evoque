//Dependency: Evoque.js
lexus.extend('appCache', (function (self) {
    var defaultOption = {
        onShowUpdating: function (content) { },
        onComplete: function () { }
    };

    self.init = function (option) {
        if (lexus.isObjectNull(option)) {
            throw 'Parameter is null!';
        }
        option = lexus(option);
        _onShowUpdating = option.getValueOfProperty('onShowUpdating', defaultOption);
        _onComplete = option.getValueOfProperty('onComplete', defaultOption);
    }

    var _appCache = window.applicationCache;
    var _onShowUpdating;
    var _onComplete;

    _appCache.addEventListener('checking', function (e) {
        _onShowUpdating('正在检查更新......');
    });

    _appCache.addEventListener('downloading', function (e) {
        _onShowUpdating('开始下载更新......');
    });

    _appCache.addEventListener('progress', function (e) {
        _onShowUpdating('正在下载更新......(' + e.loaded + '/' + e.total + ')');
    });

    _appCache.addEventListener('cached', function (e) {
        location.reload();
    });

    _appCache.addEventListener('updateready', function (e) {
        location.reload();
    });

    _appCache.addEventListener('noupdate', function (e) {
        _onComplete.call(window);
    });

    _appCache.addEventListener('obsolete', function (e) {
        location.reload();
    });

    _appCache.addEventListener('error', function (e) {
        _onComplete.call(window);
    });

    return self;
}({})));