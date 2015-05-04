//Dependency: Evoque.js, knockout.js
lexus.extend('knockout', (function (self) {
    ko.extenders.dateFormat = function (target, format) {
        var result = ko.computed({
            read: function () {
                var curVal = target();
                if (lexus.isStringEmpty(curVal))
                {
                    return null;
                }
                else
                {
                    return Date.fromJSONDate(curVal).toCustomString(format);
                }
            },
            write: function (value) {
                if (lexus.isStringEmpty(value))
                {
                    target(null);
                }
                else
                {
                    target(value.toDate().toJSONDate());
                }
            }
        });

        return result;
    };

    return self;
}({})));