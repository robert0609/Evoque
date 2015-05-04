//Dependency: Evoque.js
lexus.extend('appcan', (function (self) {

    self.supportAppcan = function () {
        return !lexus.isObjectNull(window.uexWidgetOne)
    };

    function createFunction(fn)
    {
        return function () {
            if (!self.supportAppcan())
            {
                return;
            }
            return fn.apply(self, arguments);
        };
    }

    self.exit = createFunction(function () {
        uexWidgetOne.exit();
    });

    if (self.supportAppcan())
    {
        window.uexOnload = function(type){
            if(!type){
                uexWindow.onKeyPressed=function(keyCode){
                    if(keyCode==0){
                        uexWidgetOne.exit();
                    }
                }
                //监听android的返回键，点返回键则退出应用
                uexWindow.setReportKey(0,1);
            }
        }
    }

    return self;
}({})));