//Dependency: Evoque.js
Evoque.extend('dockMenu', (function (self) {

    var defaultOption = {
        menuElementId: ''
    };

    self.create = function (option) {
        option = option || {};
        var $option = lexus(option);
        var menuElementId = $option.getValueOfProperty('menuElementId', defaultOption);
        if (lexus.isStringEmpty(menuElementId)) {
            return;
        }
        var $menuElement = lexus('#' + menuElementId);
        if ($menuElement.length < 1) {
            return;
        }
        var menuElement = $menuElement[0];
        var caller = self.evoqueTarget;
        caller.each(function () {
            var dockMenu = new dockMenuClass(this, menuElement);
        });
    };

    function dockMenuClass(dockElement, menuElement) {

    }

    return self;
}({})));