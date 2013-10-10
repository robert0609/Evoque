//Dependency: Evoque.js, Evoque.Dialog.js
Evoque.adapter = (function (self)
{
    window.mDialogManager = {
        alert: function (message) {
            return $.dialog.alert(message);
        },
        showLoading: function (loadingMsg, callback) {
            return $.dialog.showLoading(loadingMsg, callback);
        },
        showMessageBox: function (option) {
            return $.dialog.showMessageBox(option);
        },
        showModalDialog: function (option) {
            return $.dialog.showModalDialog(option);
        }
    };

    return self;
}(Evoque.adapter || {}));