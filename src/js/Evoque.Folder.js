//Dependency: Evoque.js
Evoque.folder = (function (self) {
    var titleClass = 'folder-title';
    var contentClass = 'folder-content';

    var defaultOption = {
        folderId: '',
        // 'fold' | 'unfold'
        status: 'fold',
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
        var status = option.getValueOfProperty('status', defaultOption).toLowerCase();
        var onFolded = option.getValueOfProperty('onFolded', defaultOption);
        var onUnfolded = option.getValueOfProperty('onUnfolded', defaultOption);
        return new folderClass(folder, status, onFolded, onUnfolded);
    };

    function folderClass(folder, status, onFolded, onUnfolded)
    {
        var $folder = $(folder);
        var $title = $folder.getChild('.' + titleClass);
        var $content = $folder.getChild('.' + contentClass);
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

        $title.addEventHandler('click', function () {
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
        });

        function fold() {
            $title.removeClass('folder-title-unfold');
            $title.addClass('folder-title-fold');
            $content.removeClass('folder-content-unfold');
            $content.addClass('folder-content-fold');
            onFolded.apply({ title: $title[0], content: $content[0]});
        }

        function unfold() {
            $title.removeClass('folder-title-fold');
            $title.addClass('folder-title-unfold');
            $content.removeClass('folder-content-fold');
            $content.addClass('folder-content-unfold');
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

    return self;
}(Evoque.folder || {}));