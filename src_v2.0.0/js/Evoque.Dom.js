//Dependency: Evoque.js
Evoque.extend('domOperation', (function () {
    var emptyArray = [],
        slice = emptyArray.slice,

        class2type = {},
        toString = class2type.toString,

        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,

        table = document.createElement('table'),
        tableRow = document.createElement('tr'),
        containers = {
            'tr': document.createElement('tbody'),
            'tbody': table, 'thead': table, 'tfoot': table,
            'td': tableRow, 'th': tableRow,
            '*': document.createElement('div')
        },

        adjacencyOperators = ['after', 'prepend', 'before', 'append'];

    function type(obj) {
        return obj == null ? String(obj) :
          class2type[toString.call(obj)] || "object";
    }

    function likeArray(obj) {
        return typeof obj.length == 'number';
    }

    function each(elements, callback) {
        var i, key;
        if (likeArray(elements)) {
            for (i = 0; i < elements.length; i++) {
                if (callback.call(elements[i], i, elements[i]) === false) return elements;
            }
        } else {
            for (key in elements) {
                if (callback.call(elements[key], key, elements[key]) === false) return elements;
            }
        }

        return elements;
    }

    function flatten(array) {
        return array.length > 0 ? emptyArray.concat.apply([], array) : array;
    }

    function map(elements, callback) {
        var value, values = [], i, key
        if (likeArray(elements)) {
            for (i = 0; i < elements.length; i++) {
                value = callback(elements[i], i);
                if (value != null) {
                    values.push(value);
                }
            }
        }
        else {
            for (key in elements) {
                value = callback(elements[key], key);
                if (value != null) {
                    values.push(value);
                }
            }
        }

        return flatten(values)
    }

    var contains = document.documentElement.contains ?
          function (parent, node) {
              return parent !== node && parent.contains(node)
          } :
          function (parent, node) {
              while (node && (node = node.parentNode))
                  if (node === parent) return true
              return false
          };

    function traverseNode(node, fun) {
        fun(node)
        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            traverseNode(node.childNodes[i], fun)
        }
    }

    function initialize(selector) {
        if (typeof selector == 'string') {
            selector = selector.trim()
            if (selector[0] == '<' && fragmentRE.test(selector)) {
                var dom = fragment(selector, RegExp.$1);
                return window.lexus(dom);
            }
            else {
                return window.lexus(selector);
            }
        }
        else {
            return window.lexus(selector);
        }
    }

    function likeArray(obj) { return typeof obj.length == 'number' }
    function flatten(array) { return array.length > 0 ? [].concat.apply([], array) : array }

    // Populate the class2type map
    each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    })

    var fragment = function (html, name) {
        var dom, nodes, container;

        // A special case optimization for a single tag
        if (singleTagRE.test(html)) dom = document.createElement(RegExp.$1);

        if (!dom) {
            if (html.replace) {
                html = html.replace(tagExpanderRE, "<$1></$2>");
            }

            if (name === undefined) {
                name = fragmentRE.test(html) && RegExp.$1;
            }

            if (!(name in containers)) {
                name = '*';
            }
            container = containers[name];
            container.innerHTML = '' + html;
            dom = each(slice.call(container.childNodes), function () {
                container.removeChild(this);
            });
        }

        return dom;
    }

    lexus.createNodes = fragment;

    lexus.map = function(elements, callback){
        var value, values = [], i, key
        if (likeArray(elements))
            for (i = 0; i < elements.length; i++) {
                value = callback(elements[i], i)
                if (value != null) values.push(value)
            }
        else
            for (key in elements) {
                value = callback(elements[key], key)
                if (value != null) values.push(value)
            }
        return flatten(values)
    }

    Evoque.remove = function () {
        return this.each(function () {
            if (this.parentNode != null) {
                this.parentNode.removeChild(this);
            }
        });
    };

    Evoque.get = function (idx) {
        return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length];
    };

    // Generate the `after`, `prepend`, `before`, `append`,
    // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
    adjacencyOperators.forEach(function (operator, operatorIndex) {
        var inside = operatorIndex % 2 //=> prepend, append

        Evoque[operator] = function () {

            var prepareNodes = [];

            each(arguments, function () {
                if (this.FrameworkName && this.FrameworkName.indexOf("Evoque") > -1) {
                    prepareNodes.push(this.get());
                }
                else {
                    prepareNodes.push(this);
                }
            });

            // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
            var argType, nodes = map(prepareNodes, function (arg) {
                argType = type(arg);
                return argType == "object" || argType == "array" || arg == null ?
                    arg : fragment(arg)
            }),
                parent, copyByClone = this.length > 1
            if (nodes.length < 1) return this

            return this.each(function () {
                var target = this;
                parent = inside ? target : target.parentNode;

                // convert all methods to a "before" operation
                target = operatorIndex == 0 ? target.nextSibling :
                         operatorIndex == 1 ? target.firstChild :
                         operatorIndex == 2 ? target :
                         null

                var parentInDocument = contains(document.documentElement, parent)

                nodes.forEach(function (node) {
                    if (copyByClone) node = node.cloneNode(true);
                    else if (!parent) return lexus(node).remove();

                    parent.insertBefore(node, target);
                    if (parentInDocument) traverseNode(node, function (el) {
                        if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
                           (!el.type || el.type === 'text/javascript') && !el.src)
                            window['eval'].call(window, el.innerHTML);
                    })
                })
            })
        };

        // after    => insertAfter
        // prepend  => prependTo
        // before   => insertBefore
        // append   => appendTo
        Evoque[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function (html) {
            lexus(html)[operator](this);
            return this;
        }

        Evoque["map"] = function (fn) {
            return lexus.map(this, function (el, i) { return fn.call(el, i, el) });
        },

        Evoque["clone"] = function () {
            return lexus(this.map(function () { return this.cloneNode(true) }));
        };

    });
}()));