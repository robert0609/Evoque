//Dependency: Evoque.js, json2.js, Evoque.Ajax.js
Evoque.adapter = (function (self)
{
    window.majax = {
        get: function (option) {
            $.ajax.get(option);
        },
        post: function (option) {
            $.ajax.post(option);
        }
    };

    return self;
}(Evoque.adapter || {}));