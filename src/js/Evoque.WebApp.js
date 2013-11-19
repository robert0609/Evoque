//Dependency: Evoque.js
Evoque.webApp = (function (self)
{
    /*self.autoHideAddressBar = function ()
    {

    };

    self.back2LastPage = function ()
    {

    };

    self.HrefAnchor = function ()
    {

    };

    self.autoSize = function ()
    {

    };

    self.cookie = function ()
    {

    };*/

    var noHistory = 'nohistory';

    $.loadPageWithoutHistory = function (url) {
        location.replace(url);
    };

    function enableNoHistoryHref()
    {
        var $nohishref = $('a[' + noHistory + '][href]');
        $nohishref.each(function (i) {
            var $this = $(this);
            var desUrl = $this.getAttr('href');
            if ($.isStringEmpty(desUrl) || desUrl.toLowerCase().indexOf('javascript:') > -1)
            {
                return;
            }
            $this.setAttr('href', 'javascript:void(0);');
            $this.addEventHandler('click', function () {
                $.loadPageWithoutHistory(desUrl);
            });
        })
    }

    $(function () {
        enableNoHistoryHref.call();
    });

    return self;
}(Evoque.webApp || {}));