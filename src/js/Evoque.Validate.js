//Dependency: Evoque.js, json2.js, Evoque.Dialog.js
$.validate = (function (self)
{
    var validAttrName = 'mvalid';

    var require = 'require';
    var require_empty = 'emptyValue'

    var len = 'length'
    var len_max = 'max';
    var len_min = 'min';

    var range = 'range';
    var range_max = 'max';
    var range_min = 'min';

    var regex = 'regex';
    var regex_expression = 'expression';

    var compare = 'compare';
    var compare_target = 'target';

    var errorMsg = "errorMessage"

    self.valid = function (containerId)
    {
        var selectArray = $('#' + containerId + ' select[' + validAttrName + ']');
        for (var i = 0; i < selectArray.length; ++i)
        {
            var sel = selectArray[i];
            var validJson = getValidJson(sel);
            if (!check(sel, validJson))
            {
                return false;
            }
        }

        var inputArray = $('#' + containerId + ' input[' + validAttrName + ']');
        for (i = 0; i < inputArray.length; ++i)
        {
            var inp = inputArray[i];
            var validJson = getValidJson(inp);
            if (!check(inp, validJson))
            {
                return false;
            }
        }

        return true;
    };

    function getValidJson(ele)
    {
        var str = ele.getAttribute(validAttrName);
        try
        {
            return JSON.parse(str);
        }
        catch (ex)
        {
            return JSON.parse(str.replace(/\'/g, '"'));
        }
    }

    function check(ele, validJson)
    {
        var obj = castArray(validJson[require]);
        for (var i = 0; i < obj.length; ++i)
        {
            if (!$.isObjectNull(obj[i]) && !validRequire(ele, obj[i]))
            {
                return false;
            }
        }
        obj = castArray(validJson[len]);
        for (i = 0; i < obj.length; ++i)
        {
            if (!$.isObjectNull(obj[i]) && !validLen(ele, obj[i]))
            {
                return false;
            }
        }
        obj = castArray(validJson[range]);
        for (i = 0; i < obj.length; ++i)
        {
            if (!$.isObjectNull(obj[i]) && !validRange(ele, obj[i]))
            {
                return false;
            }
        }
        obj = castArray(validJson[regex]);
        for (i = 0; i < obj.length; ++i)
        {
            if (!$.isObjectNull(obj[i]) && !validRegex(ele, obj[i]))
            {
                return false;
            }
        }
        obj = castArray(validJson[compare]);
        for (i = 0; i < obj.length; ++i)
        {
            if (!$.isObjectNull(obj[i]) && !validCompare(ele, obj[i]))
            {
                return false;
            }
        }
        return true;
    }

    function castArray(obj)
    {
        if ($.isObjectNull(obj))
        {
            return [];
        }
        if (obj instanceof Array)
        {
            return obj;
        }
        else
        {
            var arr = [];
            arr.push(obj);
            return arr;
        }
    }

    function validRequire(ele, json)
    {
        var ret = true;
        var val = ele.value;
        var empty = json[require_empty];
        if ($.isStringEmpty(val))
        {
            $.dialog.alert(json[errorMsg]);
            ret = false;
        }
        else
        {
            if (!$.isStringEmpty(empty))
            {
                if (val == empty)
                {
                    $.dialog.alert(json[errorMsg]);
                    ret = false;
                }
            }
        }
        return ret;
    }

    function validLen(ele, json)
    {
        var ret = true;
        var val = ele.value;
        var max = json[len_max];
        var min = json[len_min];

        if (!$.isStringEmpty(max))
        {
            if (val.length > Number(max))
            {
                $.dialog.alert(json[errorMsg]);
                ret = false;
            }
        }
        if (!$.isStringEmpty(min))
        {
            if (val.length < Number(min))
            {
                $.dialog.alert(json[errorMsg]);
                ret = false;
            }
        }
        return ret;
    }

    function validRange(ele, json)
    {
        var ret = true;
        var val = Number(ele.value);
        var max = json[range_max];
        var min = json[range_min];
        if (!$.isStringEmpty(max))
        {
            if (val > Number(max))
            {
                $.dialog.alert(json[errorMsg]);
                ret = false;
            }
        }
        if (!$.isStringEmpty(min))
        {
            if (val < Number(min))
            {
                $.dialog.alert(json[errorMsg]);
                ret = false;
            }
        }

        return ret;
    }

    function validRegex(ele, json)
    {
        var ret = true;
        var val = ele.value;
        var regStr = json[regex_expression];
        if (!$.isStringEmpty(regStr))
        {
            var reg = new RegExp(regStr);
            if (!reg.test(val))
            {
                $.dialog.alert(json[errorMsg]);
                ret = false;
            }
        }
        return ret;
    }

    function validCompare(ele, json)
    {
        var ret = true;
        var val = ele.value;
        var tarId = json[compare_target];
        if (!$.isStringEmpty(tarId))
        {
            var tarVal = $('#' + tarId).getVal();
            if (!$.isStringEmpty(tarVal))
            {
                if (val != tarVal)
                {
                    $.dialog.alert(json[errorMsg]);
                    ret = false;
                }
            }
        }

        return ret;
    }

    return self;
}($.validate || {}));