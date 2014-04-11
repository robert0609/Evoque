//Dependency: Evoque.js
Evoque.folder = (function (self) {
    var titleClass = 'folder-title';
    var contentClass = 'folder-content';
    var groupAttr = 'folder-group';

    var defaultOption = {
        folderId: '',
        // 'normal' | 'once' | 'disable'
        mode: 'normal',
        // 'fold' | 'unfold'
        status: 'fold',
        autoTop: true,
        onFolded: function () {},
        onUnfolded: function () {}
    };

    self.create = function (option, folderElement) {
        if ($.isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        option = $(option);
        var folder;
        if ($.checkType(folderElement) === type.eElement)
        {
            folder = folderElement;
        }
        else
        {
            var folderId = option.getValueOfProperty('folderId', defaultOption);
            if ($.isStringEmpty(folderId))
            {
                throw 'Parameter is error!';
            }
            var $folder = $('#' + folderId)
            if ($folder.length < 1)
            {
                throw 'Parameter is error!';
            }
            folder = $folder[0];
        }
        var mode = option.getValueOfProperty('mode', defaultOption).toLowerCase();
        var status = option.getValueOfProperty('status', defaultOption).toLowerCase();
        var autoTop = option.getValueOfProperty('autoTop', defaultOption);
        if (mode !== 'normal')
        {
            autoTop = false;
        }
        var onFolded = option.getValueOfProperty('onFolded', defaultOption);
        var onUnfolded = option.getValueOfProperty('onUnfolded', defaultOption);
        folder.__innerFolder = new folderClass(folder, mode, status, autoTop, onFolded, onUnfolded);
        return folder.__innerFolder;
    };

    function folderClass(folder, mode, status, autoTop, onFolded, onUnfolded)
    {
        var $folder = $(folder);
        var $title = $folder.getChild('.' + titleClass);
        var $content = $folder.getChild('.' + contentClass);
        var maxContentHeight = 0;

        if (mode !== 'normal')
        {
            status = 'fold';
        }

        var _isFolded = true;
        if (status === 'unfold')
        {
            _isFolded = false;
        }
        if (_isFolded)
        {
            $title.addClass('folder-title-fold');
            $content.addClass('folder-content-fold');
        }
        else
        {
            $title.addClass('folder-title-unfold');
            $content.addClass('folder-content-unfold');
        }

        if (mode === 'normal')
        {
            $title.addEventHandler('click', titleClick);
        }
        else if (mode === 'once')
        {
            $title.addEventHandler('click', titleClickOnce);
        }

        this.open = function () {
            if (_isFolded)
            {
                $title.dispatchClick();
            }
        };
        this.close = function () {
            if (!_isFolded)
            {
                $title.dispatchClick();
            }
        };

        function titleClick()
        {
            if (_isFolded)
            {
                unfold();
                _isFolded = false;
            }
            else
            {
                fold();
                _isFolded = true;
            }
        }

        function titleClickOnce()
        {
            if (_isFolded)
            {
                unfold();
                _isFolded = false;
            }
            else
            {
                fold();
                _isFolded = true;
            }
            $title.removeEventHandler('click', titleClickOnce);
        }

        function fold() {
            if (maxContentHeight > 0)
            {
                var speed = maxContentHeight / 3;
                var intervalId = window.setInterval(function () {
                    var curH = $content[0].clientHeight;
                    if (curH > 0)
                    {
                        curH -= speed;
                        if (curH < 0)
                        {
                            curH = 0;
                        }
                        $content.setStyle('height', curH + 'px');
                    }
                    else
                    {
                        window.clearInterval(intervalId);
                        $title.removeClass('folder-title-unfold');
                        $title.addClass('folder-title-fold');
                        $content.removeClass('folder-content-unfold');
                        $content.addClass('folder-content-fold');
                        onFolded.apply({ title: $title[0], content: $content[0]});
                    }
                }, 25);
            }
        }

        function unfold() {
            var grpAttr = $folder.getAttr(groupAttr);
            if (!$.isStringEmpty(grpAttr))
            {
                $('[' + groupAttr + '="' + grpAttr + '"]').each(function () {
                    if ($.isObjectNull(this.__innerFolder))
                    {
                        return;
                    }
                    this.__innerFolder.close();
                });
            }
            $title.removeClass('folder-title-fold');
            $title.addClass('folder-title-unfold');
            $content.removeClass('folder-content-fold');
            $content.addClass('folder-content-unfold');
            if (maxContentHeight == 0)
            {
                maxContentHeight = $content[0].clientHeight;
            }
            var speed = maxContentHeight / 3;
            $content.setStyle('height', '0px');
            var intervalId = window.setInterval(function () {
                var curH = $content[0].clientHeight;
                if (curH < maxContentHeight)
                {
                    curH += speed;
                    if (curH > maxContentHeight)
                    {
                        curH = maxContentHeight;
                    }
                    $content.setStyle('height', curH + 'px');
                }
                else
                {
                    window.clearInterval(intervalId);
                    if (autoTop)
                    {
                        $.scrollTo(0, $title[0].offsetTop);
                    }
                }
            }, 25);
            onUnfolded.apply({ title: $title[0], content: $content[0]});
        }
    }

    //API
    Evoque.createFolder = function (option)
    {
        option = option || {};
        this.each(function () {
            self.create(option, this);
        });
    };

    Evoque.openFolder = function () {
        this.each(function () {
            if ($.isObjectNull(this.__innerFolder))
            {
                return;
            }
            this.__innerFolder.open();
        });
    };

    Evoque.closeFolder = function () {
        this.each(function () {
            if ($.isObjectNull(this.__innerFolder))
            {
                return;
            }
            this.__innerFolder.close();
        });
    };

    return self;
}(Evoque.folder || {}));