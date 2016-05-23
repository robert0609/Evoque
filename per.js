var per = (function (own) {
    var __resourceEntris;

    own.document = wrapperFunction(function () {
        return getDocPfm();
    });

    own.resource = wrapperFunction(function (name) {
        return getResPfm(name);
    });

    own.resourceNames = wrapperFunction(function () {
        return getResNames();
    });

    function getDocPfm() {
        var timing = performance.timing;
        var navigation = performance.navigation;
        return {
            navigationType: navigation.type,
            redirectCount: navigation.redirectCount,
            navigationStart: timing.navigationStart,
            //TODO:跨域重定向的时间是不准的
            redirectTime: timing.redirectEnd - timing.redirectStart,
            fetchStart: timing.fetchStart,
            dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
            connectTime: timing.connectEnd - timing.connectStart,
            requestTime: timing.responseStart - timing.requestStart,
            whiteScreenTime: timing.responseStart - timing.navigationStart,
            responseTime: timing.responseEnd - timing.responseStart,
            domparsingTime: timing.domInteractive - timing.domLoading,
            domreadyEventTime: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
            loadEventTime: timing.loadEventEnd - timing.loadEventStart,
            totalDocumentLoadTime: timing.loadEventEnd - timing.navigationStart
        };
    }

    function getResPfm(name) {
        if (!__resourceEntris)
        {
            __resourceEntris = performance.getEntries();
        }
        var results = __resourceEntris.filter(function (elem) {
            return elem.name.toLowerCase() === name.toLowerCase();
        });
        if (results.length === 0) {
            throw 'Not found resource performance whose name is ' + name;
        }

        var timing = results[0];
        return {
            initiatorType: timing.initiatorType,
            fetchStart: timing.fetchStart,
            dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
            connectTime: timing.connectEnd - timing.connectStart,
            requestTime: timing.responseStart - timing.requestStart,
            responseTime: timing.responseEnd - timing.responseStart,
            totalTime: timing.duration
        };
    }

    function getResNames() {
        if (!__resourceEntris) {
            __resourceEntris = performance.getEntries();
        }
        var results = __resourceEntris.map(function (elem) {
            return elem.name.toLowerCase();
        });
        return results;
    }

    function wrapperFunction(fn) {
        return function () {
            if (!isSupportPerfoemanceApi()) {
                throw 'Your user agent does not support Performance API!';
            }
            return fn.apply(this, arguments);
        };
    }

    function isSupportPerfoemanceApi() {
        return !!window.performance;
    }

    window.addEventListener('load', function () {
        //初始化bashUI
        var bashContainer = document.createElement('div');
        var ul = document.createElement('ul');
        bashContainer.appendChild(ul);

        var resNames = own.resourceNames();
        for (var i = 0; i < resNames.length; ++i)
        {
            ul.appendChild(genResli(resNames[i]));
        }

        document.body.insertBefore(bashContainer, document.body.firstElementChild);

        function genResli(resName) {
            var li = document.createElement('li');
            var p = document.createElement('p');
            var div = document.createElement('div');

            li.appendChild(p);
            li.appendChild(div);

            div.style.display = 'none';
            div.style.wordWrap = 'break-word';

            p.innerText = resName;
            div.innerText = JSON.stringify(own.resource(resName));

            p.addEventListener('click', function () {
                if (div.style.display === 'none')
                {
                    div.style.display = '';
                }
                else
                {
                    div.style.display = 'none';
                }
            });

            return li;
        }
    });

    return own;
}(per || {}));