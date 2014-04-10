//Dependency: Evoque.js
$.history = (function (self)
{
    var _currentUrl = location.href;
    var _currentTitle = document.title;
    var _stack = [];
    var _dic = {};

    self.bindBackHandle = function (id, fn) {
        if ($.checkType(fn) === type.eFunction && (!_dic.hasOwnProperty(id) || $.isObjectNull(_dic[id])))
        {
            history.replaceState({ backIsClicked: true }, _currentTitle, _currentUrl);
            history.pushState({ backIsClicked: true }, _currentTitle, _currentUrl);
            if (_stack.length == 0)
            {
                window.addEventListener('popstate', winPopStateHandle);
            }
            _stack.push(id);
            _dic[id] = fn;
        }
    };

    self.unbindBackHandle = function (id) {
        var idx = -1;
        for (var i = 0; i < _stack.length; ++i)
        {
            if (_stack[i] == id)
            {
                idx = i;
                break;
            }
        }
        if (idx < 0)
        {
            return;
        }
        _stack.splice(idx, 1);
        _dic[id] = null;
        history.go(-1);
        if (_stack.length == 0)
        {
            window.removeEventListener('popstate', winPopStateHandle);
        }
    };

    function winPopStateHandle(e)
    {
        if ($.isObjectNull(e.state))
        {
            return;
        }
        if (e.state.backIsClicked)
        {
            var id = _stack.pop();
            var backHandleByBrowser = _dic[id];
            _dic[id] = null;
            if (_stack.length == 0)
            {
                window.removeEventListener('popstate', winPopStateHandle);
            }
            backHandleByBrowser();
        }
    }

    return self;
}($.history || {}));
