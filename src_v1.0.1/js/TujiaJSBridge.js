var TujiaJSBridge = (function (own) {
    var tjProtocol = 'tujiabridge://tj';
    var funcPrefix = 'TujiaJSBridge.';

    var __toString = Object.prototype.toString;

    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    function guid(len, radix) {
        var uuid = [], i;
        radix = radix || chars.length;

        if (len) {
            // Compact form
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
        } else {
            // rfc4122, version 4 form
            var r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data.  At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random()*16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }

        return uuid.join('');
    }

    function isFunction(fn) {
        var ty = typeof fn;
        if (ty === 'function') {
            return true;
        }
        ty = __toString.call(fn);
        if (ty === '[object Function]') {
            return true;
        }
        return false;
    }

    function isString(s) {
        var ty = typeof s;
        if (ty === 'string') {
            return true;
        }
        ty = __toString.call(fn);
        if (ty === '[object String]') {
            return true;
        }
        return false;
    }

    function isStringEmpty(s) {
        if (s) {
            if (isString(s)) {
                if (s === '') {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                throw 'Parameter is not a string!';
            }
        }
        else {
            return true;
        }
    }

    var iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = tjProtocol;
    document.documentElement.appendChild(iframe);

    function createInputFunc(onlyKey, bundleParam) {
        var inputFuncName = 'input' + onlyKey;
        var wholeInputFuncName = funcPrefix + inputFuncName;

        var inputFunc = function () {
            delete own[inputFuncName];
            return JSON.stringify(bundleParam);
        };

        own[inputFuncName] = inputFunc;

        return wholeInputFuncName;
    }

    function createOutputFunc(onlyKey, resultCallback) {
        var cb = resultCallback;
        if (!isFunction(cb)) {
            return '';
        }

        var outputFuncName = 'output' + onlyKey;
        var wholeOutputFuncName = funcPrefix + outputFuncName;

        var outputFunc = function (jsonStr) {
            delete own[outputFuncName];
            cb.call(window, { result: JSON.parse(jsonStr) });
        };

        own[outputFuncName] = outputFunc;

        return wholeOutputFuncName;
    }

    function requestApp(action, parameter, resultCallback) {
        var onlyKey = guid(16, 16);
        var bundleParam = { action: action };
        if (parameter instanceof Object && parameter != null) {
            bundleParam.parameter = parameter;
        }

        var outputFuncName = createOutputFunc(onlyKey, resultCallback);
        //针对android平台不能直接获得js函数返回值的情况，进行处理
        if (isFunction(own.androidInput)) {
            bundleParam.output = outputFuncName;
            own.androidInput.call(window, JSON.stringify(bundleParam));
        }
        else {
            var url = tjProtocol + '?input=' + createInputFunc(onlyKey, bundleParam);
            if (outputFuncName !== '') {
                url += '&output=' + outputFuncName;
            }
            iframe.src = url;
        }
    }

    /**
     * js调用app
     * @param option: { action: xx, parameter: { xx: xx }, resultCallback: function (json) {} }
     */
    own.callApp = function (option) {
        option = option || {};
        if (isStringEmpty(option.action)) {
            throw 'Action can not be null!';
        }
        requestApp(option.action, option.parameter, option.resultCallback);
    };

    /**
     * app调用js
     * @param option: { action: xx, parameter: { xx: xx }, resultAction: xx }
     */
    own.callJs = function (option) {
        option = option || {};
        var action = option.action;
        if (isStringEmpty(action)) {
            return;
        }
        var p = option.parameter;
        var ra = option.resultAction;

        if (isFunction(own[action])) {
            own[action].apply(window, {
                parameter: p,
                resultCallback: function (json) {
                    if (isStringEmpty(ra)) {
                        return;
                    }
                    own.callApp({ action: ra, parameterCallback: function () {
                        return json;
                    } });
                }
            });
        }
    };

    return own;
}(TujiaJSBridge || {}));