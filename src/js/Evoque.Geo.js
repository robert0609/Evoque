//Dependency: Evoque.js, Evoque.Ajax.js, json2.js
$.geo = (function (self)
{
    var defaultOption_getCity = {
        lat: 0,
        lng: 0
    };

    self.getCity = function (option) {
        if ($.isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        option = $(option);
        var lat = option.getValueOfProperty('lat', defaultOption_getCity);
        var lng = option.getValueOfProperty('lng', defaultOption_getCity);
    };

    var defaultOption_getCurrentLocation = {
        onSuccess: function () {},
        onFail: function () {}
    };

    self.getCurrentLocation = function (option) {
        if ($.isObjectNull(option))
        {
            throw 'Parameter is null!';
        }
        option = $(option);
        var onSuccess = option.getValueOfProperty('onSuccess', defaultOption_getCurrentLocation);
        var onFail = option.getValueOfProperty('onFail', defaultOption_getCurrentLocation);

        if (navigator.geolocation)
        {
            navigator.geolocation.getCurrentPosition(function (position) {
                onSuccess.call(window, {
                });
                position.coords.latitude
            }, function (positionError) {

            }, {
                enableHighAccuracy: true,
                timeout: 30000
            });
        }
        else
        {
            return {
                isSuccess: false,
                message: '您的浏览器不支持地理定位!'
            };
        }
    };

    return self;
}($.geo || {}));