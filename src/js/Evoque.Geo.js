//Dependency: Evoque.js
$.geo = (function (self)
{
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
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            }, function (positionError) {
                if (positionError == 1)
                {
                    onFail.call(window, {
                        message: '您的设备禁止了地理定位服务!'
                    });
                }
                else if (positionError == 3)
                {
                    onFail.call(window, {
                        message: '地理定位响应超时!'
                    });
                }
                else
                {
                    onFail.call(window, {
                        message: '定位失败!'
                    });
                }
            }, {
                enableHighAccuracy: true,
                timeout: 30000
            });
        }
        else
        {
            onFail.call(window, {
                message: '您的浏览器不支持地理定位!'
            });
        }
    };

    return self;
}($.geo || {}));