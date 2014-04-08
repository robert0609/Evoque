//Dependency: Evoque.js, knockout.js
$.knockout = (function (self)
{
    ko.extenders.dateFormat = function (target) {
        var result = ko.computed({
            read: function () {
                var curVal = target();
                if ($.isStringEmpty(curVal))
                {
                    return null;
                }
                else
                {
                    return Date.fromJSONDate(curVal).toCustomString();
                }
            },
            write: function (value) {
                if ($.isStringEmpty(value))
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
}($.knockout || {}));