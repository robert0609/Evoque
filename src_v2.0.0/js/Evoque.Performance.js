//Dependency: Evoque.js, Evoque.Dialog.js
lexus.extend('performance', (function (self) {

    var panel = null;

    self.report = function () {
        initPanel();
        var timing = performance.timing;
        var navigation = performance.navigation;
        panel.appendChild(outputObj('PerformanceNavigationTiming', timing));
        panel.appendChild(outputObj('PerformanceNavigation', navigation));

        var perfEntries = performance.getEntries();
        for (var i = 0; i < perfEntries.length; i++)
        {
            panel.appendChild(outputObj(perfEntries[i].name, perfEntries[i]));
        }


        lexus.dialog.showModalDialog({
            //对话框内容，可以是文本字符串，也可以是要显示的div的id
            content:'performance_panel',
            autoClose: false
        });
    };

    function outputObj(oName, obj)
    {
        var div = document.createElement('div');
        var title = document.createElement('div');
        var content = document.createElement('ul');
        div.appendChild(title);
        div.appendChild(content);
        title.innerHTML = oName;
        for (var pName in obj)
        {
            var li = document.createElement('li');
            content.appendChild(li);
            li.innerHTML = pName + ': ' + obj[pName];
        }
        return div;
    }

    function initPanel() {
        if (!lexus.isObjectNull(panel))
        {
            return;
        }
        panel = document.createElement('div');
        panel.id = 'performance_panel';
        panel.style.textAlign = 'left';
        panel.style.height = document.documentElement.clientHeight * 0.8 + 'px';
        panel.style.backgroundColor = '#FFF';
        panel.style.overflow = 'auto';
        document.body.appendChild(panel);
    }

    return self;
}({})));