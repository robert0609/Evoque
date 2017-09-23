//Dependency: Evoque.js, json2.js
(function () {
    var keyFormat = /evoque_\d+_.+/g;

    /**
     *
     * @param kind: 'session' || 'storage'
     */
    function wrapper(kind) {
        var dataStorage = null;
        if (kind === 'storage') {
            dataStorage = window.localStorage;
        }
        else {
            dataStorage = window.sessionStorage;
        }

        function createFunction(fn)
        {
            return function () {
                var support = false;
                if (kind === 'storage') {
                    if (!!window.localStorage) {
                        support = true;
                    }
                }
                else {
                    if (!!window.sessionStorage) {
                        support = true;
                    }
                }
                if (!support)
                {
                    throw 'Your device does not support WebStorage!';
                }
                return fn.apply(this, arguments);
            };
        }


        /**
         * 判断是否包含指定Key的数据
         * @type {*}
         */
        this.containsKey = createFunction(function (key) {
            return __seqStorer.contains(key);
        });

        /**
         * 获取指定Key的字符串数据
         * @type {*}
         */
        this.getString = createFunction(function (key) {
            return this.get(key);
        });

        /**
         * 设置指定Key的字符串数据
         * @type {*}
         */
        this.setString = createFunction(function (key, val) {
            this.set(key, val);
        });

        /**
         * 获取指定Key的Json数据
         * @type {*}
         */
        this.getJson = createFunction(function (key) {
            return this.get(key);
        });

        /**
         * 设置指定Key的Json数据
         * @type {*}
         */
        this.setJson = createFunction(function (key, val) {
            this.set(key, val);
        });

        /**
         * 移除指定Key的数据
         * @type {*}
         */
        this.remove = createFunction(function (key) {
            this.del(key);
        });

        //以下是增加的缓存统一接口
        var __seqStorer = [];
        for (var i = 0; i < dataStorage.length; ++i) {
            var rawKey = dataStorage.key(i);
            keyFormat.lastIndex = 0;
            if (keyFormat.test(rawKey)) {
                var r = rawKey2real(rawKey);
                __seqStorer[r.seq] = r.realKey;
            }
        }

        function realKey2Raw(realKey) {
            var seq = __seqStorer.indexOf(realKey);
            if (seq < 0) {
                seq = __seqStorer.length;
            }
            return 'evoque_' + seq + '_' + realKey;
        }

        function rawKey2real(rawKey) {
            var spliterIndex0 = rawKey.indexOf('_');
            var spliterIndex1 = rawKey.indexOf('_', spliterIndex0 + 1);
            var seq = Number(rawKey.substring(spliterIndex0 + 1, spliterIndex1));
            var realKey = rawKey.substr(spliterIndex1 + 1);
            return {
                seq: seq,
                realKey: realKey
            };
        }

        function getJsonData(key) {
            var val = dataStorage.getItem(realKey2Raw(key));
            if (lexus.isStringEmpty(val))
            {
                return null;
            }
            return JSON.parse(val, dateReviver);
        }

        function setJsonData(key, val) {
            if (__seqStorer.indexOf(key) < 0) {
                __seqStorer.push(key);
            }
            dataStorage.setItem(realKey2Raw(key), JSON.stringify(val));
        }

        function delJsonData(key) {
            var seq = __seqStorer.indexOf(key);
            if (seq < 0) {
                return;
            }
            dataStorage.removeItem(realKey2Raw(key));
            delete __seqStorer[seq];
        }

        function popJsonData() {
            var filterSeq = __seqStorer.filter(function (loop) {
                return lexus.checkType(loop) !== type.eUndefined;
            });
            if (filterSeq.length < 1)
            {
                return null;
            }
            var key = filterSeq.pop();
            var obj = getJsonData(key);
            delJsonData(key);
            return obj;
        }

        function realData2Raw(obj) {
            var ty = typeof obj;
            switch (ty) {
                case 'boolean':
                case 'number':
                case 'string':
                    break;
                case 'object':
                    if (obj === null) {
                        throw '不能缓存null值';
                    }
                    break;
                default:
                    throw '不能缓存undefined值';
                    break;
            }
            return {
                dataType: ty,
                timestamp: (new Date()).getTime(),
                value: obj
            };
        }

        function rawData2Real(obj) {
            return obj.value;
        }

        this.get = createFunction(function (key) {
            if (!this.containsKey(key))
            {
                throw '缓存中不存在键为[' + key + ']的对象';
            }
            var obj = getJsonData(key);
            if (!lexus.isObjectNull(obj)) {
                obj = rawData2Real(obj);
            }
            return obj;
        });

        this.set = createFunction(function (key, obj) {
            setJsonData(key, realData2Raw(obj));
        });

        this.del = createFunction(function (key) {
            if (this.containsKey(key))
            {
                delJsonData(key);
            }
        });

        this.push = createFunction(function (key, obj) {
            if (this.containsKey(key))
            {
                throw '缓存中已经存在键为[' + key + ']的对象';
            }
            this.set(key, obj);
        });

        this.pop = createFunction(function () {
            var obj = popJsonData();
            if (!lexus.isObjectNull(obj)) {
                obj = rawData2Real(obj);
            }
            return obj;
        });

        this.keys = function () {
            return __seqStorer.filter(function (loop) {
                return lexus.checkType(loop) !== type.eUndefined;
            });
        };
    }

    function dateReviver(key, value) {
        var a;
        if (typeof value === 'string')
        {
            a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)/.exec(value);
            if (a)
            {
                var utc = new Date(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]);
                var offset = (new Date()).getTimezoneOffset();
                var localMinute = utc.getMinutes() - offset;
                utc.setMinutes(localMinute);
                return utc;
            }
        }
        return value;
    }

    lexus.extend('session', new wrapper('session'));
    lexus.extend('storage', new wrapper('storage'));
}());