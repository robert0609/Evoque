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
                if (positionError.code == 1)
                {
                    onFail.call(window, {
                        code: positionError.code,
                        message: '很抱歉系统禁用了定位功能'
                    });
                }
                else if (positionError.code == 3)
                {
                    onFail.call(window, {
                        code: positionError.code,
                        message: '地理定位响应超时'
                    });
                }
                else
                {
                    onFail.call(window, {
                        code: positionError.code,
                        message: '定位失败'
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
                code: 4,
                message: '很抱歉您的浏览器不支持地理定位'
            });
        }
    };

    return self;
}($.geo || {}));