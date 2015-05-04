//Dependency: Evoque.js, json2.js, Evoque.Ajax.js
Evoque.adapter = (function (self)
{
    window.majax = {
        get: function (option) {
            lexus.ajax.get(option);
        },
        post: function (option) {
            lexus.ajax.post(option);
        }
    };

    return self;
}(Evoque.adapter || {}));