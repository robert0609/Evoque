//Dependency: Evoque.js, Evoque.Dialog.js
lexus.dialog = (function (self) {

    self.alert = function (message, onDialogClosed)
    {
        return lexus(document).dialog.alert(message, onDialogClosed);
    };

    self.prompt = function (message, onclickyes) {
        return lexus(document).dialog.prompt(message, onclickyes);
    };

    self.showLoading = function (loadingMsg, callback)
    {
        return lexus(document).dialog.showLoading(loadingMsg, callback);
    };

    self.showMessageBox = function (option) {
        return lexus(document).dialog.showMessageBox(option);
    };

    self.showModalDialog = function (option) {
        return lexus(document).dialog.showModalDialog(option);
    };

    self.closeCurrentDialog = function () {
        return lexus(document).dialog.closeCurrentDialog();
    };

    self.closeAll = function () {
        return lexus.closeAllDialogs();
    };

    Evoque.alert = function (message, onDialogClosed)
    {
        return this.dialog.alert(message, onDialogClosed);
    };

    Evoque.prompt = function (message, onclickyes)
    {
        return this.dialog.prompt(message, onclickyes);
    };

    Evoque.showLoading = function (loadingMsg, callback)
    {
        return this.dialog.showLoading(loadingMsg, callback);
    };

    Evoque.showMessageBox = function (option)
    {
        return this.dialog.showMessageBox(option);
    };

    Evoque.showModalDialog = function (option)
    {
        return this.dialog.showModalDialog(option);
    };

    Evoque.closeCurrentDialog = function ()
    {
        return this.dialog.closeCurrentDialog();
    };

    window.mDialogManager = {
        alert: function (message) {
            return lexus.dialog.alert(message);
        },
        showLoading: function (loadingMsg, callback) {
            return lexus.dialog.showLoading(loadingMsg, callback);
        },
        showMessageBox: function (option) {
            return lexus.dialog.showMessageBox(option);
        },
        showModalDialog: function (option) {
            return lexus.dialog.showModalDialog(option);
        }
    };

    return self;
}(lexus.dialog || {}));
