var eDebugger = (function (self)
{
    var divConsole = document.createElement('div');
    divConsole.id = 'divConsole';
    var deepthDef = 1;
    var template = '{0}&nbsp;@&nbsp;{1}:&nbsp;{2}';
    var cusTabChar = '|&nbsp;&nbsp;&nbsp;';

    var maxDeepth = 0;

    self.outputVar = function (name, obj, deepth)
    {
        var ele = document.getElementById('divConsole');
        if (ele != undefined && ele != null)
        {
            document.body.removeChild(divConsole);
            divConsole.innerHTML = '';
        }

        try
        {
            if (deepth === undefined || deepth === null || Number(deepth) < deepthDef)
            {
                deepth = deepthDef;
            }
            else
            {
                deepth = Number(deepth);
            }
            maxDeepth = deepth;
            divConsole.innerHTML = detectVar(name, obj, 0);
        }
        catch (ex)
        {
            divConsole.innerHTML = ex;
        }
        finally
        {
            document.body.appendChild(divConsole);
        }
    };

    self.output = function (msg)
    {
        var isConsoleAppend = false;
        var ele = document.getElementById('divConsole');
        if (ele != undefined && ele != null)
        {
            isConsoleAppend = true;
        }

        divConsole.innerHTML += '<br>';
        try
        {
            divConsole.innerHTML += msg;
        }
        catch (ex)
        {
            divConsole.innerHTML = ex;
        }
        finally
        {
            if (!isConsoleAppend)
            {
                document.body.appendChild(divConsole);
            }
        }
    }

    function detectVar(name, obj, deep)
    {
        var ty = typeof obj;
        if (ty === 'undefined' || ty === 'boolean' || ty === 'number' || ty === 'string')
        {
            return formatStr(ty, name, obj, deep);
        }
        else if (ty === 'function')
        {
            return formatStr(ty, name, obj.toString(), deep);
        }
        else
        {
            if (obj === null)
            {
                return formatStr(ty, name, 'null', deep);
            }
            if (isArrayLike(obj))
            {
                var ty1 = '';
                if (obj instanceof Array)
                {
                    ty1 = 'Array';
                }
                else
                {
                    ty1 = 'ArrayLike';
                }
                if (deep < maxDeepth)
                {
                    var strT = formatStr(ty1, name, obj, deep);
                    for (var i = 0; i < obj.length; ++i)
                    {
                        strT += '<br/>';
                        strT += detectVar(name + '[' + i + ']', obj[i], deep + 1);
                    }
                    return strT;
                }
                else
                {
                    return formatStr(ty1, name, obj, deep);
                }
            }
            else
            {
                if (deep < maxDeepth)
                {
                    var strR = formatStr(ty, name, obj, deep);
                    for (var p in obj)
                    {
                        strR += '<br/>';
                        strR += detectVar(p, obj[p], deep + 1);
                    }
                    return strR;
                }
                else
                {
                    return formatStr(ty, name, obj, deep);
                }
            }
        }
    }

    function formatStr(typ, name, val, deep)
    {
        var str = '';
        for (var j = 0; j < deep; ++j)
        {
            str += cusTabChar;
        }
        str += template;
        str = str.replace(new RegExp('\\{0\\}'), typ);
        str = str.replace(new RegExp('\\{1\\}'), name);
        str = str.replace(new RegExp('\\{2\\}'), val);
        return str;
    }

    function isArrayLike(obj)
    {
        // Real arrays are array-like
        if (obj instanceof Array)
        {
            return true;
        }
        // Arrays must have a length property
        if (!('length' in obj))
        {
            return false;
        }
        // Length must be a number
        if (typeof obj.length != 'number')
        {
            return false;
        }
        // and nonnegative
        if (obj.length < 0)
        {
            return false;
        }
        if (obj.length > 0)
        {
            // If the array is nonempty, it must at a minimum
            // have a property defined whose name is the number length-1
            if (!((obj.length - 1) in obj))
            {
                return false;
            }
        }
        return true;
    }

    return self;
}(eDebugger || {}));
