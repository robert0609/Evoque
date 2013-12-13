//Dependency: Evoque.js
Evoque.folder = (function (self) {
    var defaultOption = {
        folderTitleId: '',
        folderContentId: '',
        onFolded: function () {},
        onUnfolded: function () {}
    };

    function folderClass(folderTitleId, folderContentId, onFolded, onUnfolded)
    {
        var $title = $('#' + folderTitleId);
        var $content = $('#' + folderContentId);
        $title.addClass('folder-title-init');
        $content.addClass('folder-content-init');
        $title.show();
        $content.hide();
        var _isFolded = true;

        $title.addEventHandler('click', function () {
            if (_isFolded)
            {

            }
            else
            {}
        });

        function fold() {}

        function unfold() {};
    }

    //API
    //Evoque.

    return self;
}(Evoque.folder || {}));