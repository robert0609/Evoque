//Dependency: Evoque.js
Evoque.extend('imageLoader', (function (self) {

    var imgSrcAttrName = 'evo-imgSrc';

    self.load = function () {
        var caller = self.evoqueTarget;
        caller.each(function () {
            createLoadingDiv.call(this);
        });
    };

    function createLoadingDiv()
    {
        var that = this;
        var $this = $(this);
        var imgSrc = $this.getAttr(imgSrcAttrName);
        if ($.isStringEmpty(imgSrc))
        {
            return;
        }
        var div = document.createElement('div');
        var $div = $(div);
        $div.text('正在加载中...');
        this.appendChild(div);
        var img = document.createElement('img');
        var $img = $(img);
        $img.addEventHandler('load', function () {
            that.removeChild(div);
            that.appendChild(img);
        });
        img.src = imgSrc;
    }

    return self;
}({})));