//Dependency: Evoque.js, Evoque.Cache.js
Evoque.extend('validate', (function (self) {
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
    var compare_targetSelector = 'targetSelector';

    var errorMsg = "errorMessage";

    var container = null;

    function getValidJson(ele)
    {
        var eleCache = lexus(ele).cache();
        if (eleCache.containsKey(validAttrName))
        {
            return eleCache.get(validAttrName);
        }
        else
        {
            return null;
        }
    }

    function check(ele, validJson)
    {
        var obj = castArray(validJson[require]);
        for (var i = 0; i < obj.length; ++i)
        {
            if (!lexus.isObjectNull(obj[i]) && !validRequire(ele, obj[i]))
            {
                return false;
            }
        }
        obj = castArray(validJson[len]);
        for (i = 0; i < obj.length; ++i)
        {
            if (!lexus.isObjectNull(obj[i]) && !validLen(ele, obj[i]))
            {
                return false;
            }
        }
        obj = castArray(validJson[range]);
        for (i = 0; i < obj.length; ++i)
        {
            if (!lexus.isObjectNull(obj[i]) && !validRange(ele, obj[i]))
            {
                return false;
            }
        }
        obj = castArray(validJson[regex]);
        for (i = 0; i < obj.length; ++i)
        {
            if (!lexus.isObjectNull(obj[i]) && !validRegex(ele, obj[i]))
            {
                return false;
            }
        }
        obj = castArray(validJson[compare]);
        for (i = 0; i < obj.length; ++i)
        {
            if (!lexus.isObjectNull(obj[i]) && !validCompare(ele, obj[i]))
            {
                return false;
            }
        }
        return true;
    }

    function castArray(obj)
    {
        if (lexus.isObjectNull(obj))
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
        if (lexus.isStringEmpty(val))
        {
            container.alert(json[errorMsg]);
            ret = false;
        }
        else
        {
            if (!lexus.isStringEmpty(empty))
            {
                if (val == empty)
                {
                    container.alert(json[errorMsg]);
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

        if (!lexus.isStringEmpty(max))
        {
            if (val.length > Number(max))
            {
                container.alert(json[errorMsg]);
                ret = false;
            }
        }
        if (!lexus.isStringEmpty(min))
        {
            if (val.length < Number(min))
            {
                container.alert(json[errorMsg]);
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
        if (!lexus.isStringEmpty(max))
        {
            if (val > Number(max))
            {
                container.alert(json[errorMsg]);
                ret = false;
            }
        }
        if (!lexus.isStringEmpty(min))
        {
            if (val < Number(min))
            {
                container.alert(json[errorMsg]);
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
        if (!lexus.isStringEmpty(regStr))
        {
            var reg = new RegExp(regStr);
            if (!reg.test(val))
            {
                container.alert(json[errorMsg]);
                ret = false;
            }
        }
        return ret;
    }

    function validCompare(ele, json)
    {
        var ret = true;
        var val = ele.value;
        var tarVal = '';
        var tarId = json[compare_target];
        if (lexus.isStringEmpty(tarId))
        {
            var tarSelector = json[compare_targetSelector];
            if (!lexus.isStringEmpty(tarSelector))
            {
                tarVal = lexus(tarSelector).getVal();
            }
        }
        else
        {
            tarVal = lexus('#' + tarId).getVal();
        }
        if (!lexus.isStringEmpty(tarVal))
        {
            if (val != tarVal)
            {
                container.alert(json[errorMsg]);
                ret = false;
            }
        }

        return ret;
    }

    self.valid = function () {
        container = self.evoqueTarget;
        var selectArray = container.getChild('select');
        for (var i = 0; i < selectArray.length; ++i)
        {
            var sel = selectArray[i];
            var validJson = getValidJson(sel);
            if (validJson == null)
            {
                continue;
            }
            if (!check(sel, validJson))
            {
                return false;
            }
        }

        var inputArray = container.getChild('input');
        for (i = 0; i < inputArray.length; ++i)
        {
            var inp = inputArray[i];
            var validJson = getValidJson(inp);
            if (validJson == null)
            {
                continue;
            }
            if (!check(inp, validJson))
            {
                return false;
            }
        }

        return true;
    };

    self.validRule = function (rule) {
        if (lexus.isObjectNull(rule))
        {
            return;
        }
        self.evoqueTarget.each(function () {
            lexus(this).cache().push(validAttrName, rule);
        });
    };

    return self;
}({})));