//Dependency: Evoque.js
Evoque.extend('folder', (function (self) {
    var titleClass = 'folder-title';
    var contentClass = 'folder-content';
    var groupAttr = 'folder-group';

    var defaultOption = {
        // 'normal' | 'once' | 'disable'
        mode: 'normal',
        // 'fold' | 'unfold'
        status: 'fold',
        autoTop: true,
        onFolded: function () {},
        onUnfolded: function () {}
    };

    self.create = function (option) {
        option = option || {};
        option = $(option);
        var mode = option.getValueOfProperty('mode', defaultOption).toLowerCase();
        var status = option.getValueOfProperty('status', defaultOption).toLowerCase();
        var autoTop = option.getValueOfProperty('autoTop', defaultOption);
        if (mode !== 'normal')
        {
            autoTop = false;
        }
        var onFolded = option.getValueOfProperty('onFolded', defaultOption);
        var onUnfolded = option.getValueOfProperty('onUnfolded', defaultOption);
        var caller = self.evoqueTarget;
        caller.each(function () {
            var folder = this;
            if ($.isObjectNull(this.__innerFolder))
            {
                folder.__innerFolder = new folderClass(folder, mode, status, autoTop, onFolded, onUnfolded);
            }
        });
    };

    function folderClass(folder, mode, status, autoTop, onFolded, onUnfolded)
    {
        var $folder = $(folder);
        var $title = $folder.getChild('.' + titleClass);
        var $content = $folder.getChild('.' + contentClass);

        if (mode === 'normal')
        {
            var clsList = $title.getClassList();
            if (clsList.contains('folder-title-unfold')) {
                status = 'unfold';
            }
        }
        else
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

        $content.addEventHandler('transitionEnd', onTransitionEnd);
        $content.addEventHandler('webkitTransitionEnd', onTransitionEnd);
        $content.addEventHandler('msTransitionEnd', onTransitionEnd);
        $content.addEventHandler('mozTransitionEnd', onTransitionEnd);
        function onTransitionEnd(e) {
            if (e.propertyName === 'height') {
                if (this.clientHeight === 0) {
                    $title.removeClass('folder-title-unfold');
                    $title.addClass('folder-title-fold');
                    $content.removeClass('folder-content-unfold');
                    $content.addClass('folder-content-fold');
                }
            }
        }

        function fold() {
            $content.setStyle('height', '0px');
            onFolded.apply({ title: $title[0], content: $content[0]});
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
            $content.setStyle('height', '0px');
            $title.removeClass('folder-title-fold');
            $title.addClass('folder-title-unfold');
            $content.removeClass('folder-content-fold');
            $content.addClass('folder-content-unfold');
            setContentUnfoldHeight();
            if (autoTop)
            {
                $.scrollTo(0, $title[0].offsetTop);
            }
            onUnfolded.apply({ title: $title[0], content: $content[0], setContentHeight: setContentUnfoldHeight});
        }

        function setContentUnfoldHeight() {
            var maxHeight = 0;
            $content.getChild().each(function () {
                //TODO:为何这样的高度就会将border的宽度包含进来了？
                maxHeight += this.getBoundingClientRect().height;
            });
            if (maxHeight === 0) {
                maxHeight = 1;
            }
            $content.setStyle('height', maxHeight + 'px');
        }
    }

    //API
    Evoque.createFolder = function (option)
    {
        this.folder.create(option);
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
}({})));