//Dependency: Evoque.js
Evoque.extend('binder', (function (self) {
    var defaultOption = {};

    var bindAttrName = 'data-bind';
    var bindSplitter = ':';

    var flowCmdForeach = 'foreach';
    var flowCmdWith = 'with';
    var flowCmdIf = 'if';
    var flowCmdIfnot = 'ifnot';
    var bindCmdText = 'text';
    var bindCmdValue = 'value';

    var contextFlowCmds = [flowCmdForeach, flowCmdWith];

    var containerName = '[root]';

    self.exec = function (viewModel, option) {
        var caller = self.evoqueTarget;
    };

    function generateBindManager(viewModel, container) {

        var bindContextList = getAllBindContext(container).bindContextDictionary;
        composeBindContext(bindContextList);

        var binderList = getAllBinder(container).binderDictionary;
        composeBinder(binderList, bindContextList);


        function bindContextClass(bindElement, isContainer) {
            if ($.checkType(bindElement) !== type.eElement) {
                throw 'Error [bindElement] parameter type!';
            }
            if ($.checkType(isContainer) === type.eBoolean && isContainer) {
                //根上下文的情况
                this.name = containerName;
                this.cmd = flowCmdWith;
            }
            else {
                var bindAttrValue = $(bindElement).getAttr(bindAttrName);
                if ($.isStringEmpty(bindAttrValue) || bindAttrValue.indexOf(bindSplitter) < 0) {
                    throw 'Error [data-bind] attribute value!';
                }
                var kvp = bindAttrValue.split(bindSplitter);
                this.name = kvp[1].trim();
                this.cmd = kvp[0].trim();
            }
            this.bindElement = bindElement;
        }
        bindContextClass.prototype = {
            name: '',
            cmd: '',
            bindElement: null,
            get bindModel() {
                if ($.isObjectNull(this.parentContext)) {
                    return viewModel;
                }
                else {
                    return this.parentContext[this.name];
                }
            },
            parentContext: null,
            childContextDictionary: {},
            binderDictionary: {},
            UpdateDOM: function () {}
        };

        function getAllBindContext(container) {
            //所有绑定上下文的集合
            var bindContexts = $.cache.create();

            var $container = $(container);
            var $contextNodes = $container.getChild('*[' + bindAttrName + '^="' + flowCmdForeach + '"],*[' + bindAttrName + '^="' + flowCmdForeach + '"]');
            $contextNodes.each(function () {
                var $this = $(this);
                var bindAttrValue = $this.getAttr(bindAttrName);
                if ($.isStringEmpty(bindAttrValue) || bindAttrValue.indexOf(bindSplitter) < 0) {
                    return;
                }
                var kvp = bindAttrValue.split(bindSplitter);
                var name = kvp[1].trim();
                bindContexts.push(name, new bindContextClass(this));
            });
            //把绑定根节点加入进去
            bindContexts.push(containerName, new bindContextClass(container, true));

            return {
                bindContextDictionary: bindContexts
            };
        }

        function composeBindContext(bindContexts) {
            var rootBindContext = bindContexts.get(containerName);
            $(bindContexts.keys()).each(function () {
                if (this === containerName) {
                    return;
                }
                var bindContext = bindContexts.get(this);
                //循环判断出该上下文的父上下文
                var flag = false;
                var parent = bindContext.bindElement.parentElement;
                while (parent !== rootBindContext.bindElement) {
                    var ret = isContextNode(parent);
                    if (!ret.result) {
                        parent = parent.parentElement;
                        continue;
                    }
                    //到此已可以判断出是上下文的node，追加到父上下文的子上下文集合中
                    var parentContext = bindContexts.get(ret.name);
                    parentContext.childContextDictionary[bindContext.name] = bindContext;
                    bindContext.parentContext = parentContext;
                    flag = true;
                    break;
                }
                if (!flag) {
                    rootBindContext.childContextDictionary[bindContext.name] = bindContext;
                    bindContext.parentContext = rootBindContext;
                }
            });
        }


        function binderClass(bindElement) {
            if ($.checkType(bindElement) !== type.eElement) {
                throw 'Error [bindElement] parameter type!';
            }
            var bindAttrValue = $(bindElement).getAttr(bindAttrName);
            if ($.isStringEmpty(bindAttrValue) || bindAttrValue.indexOf(bindSplitter) < 0) {
                throw 'Error [data-bind] attribute value!';
            }
            var kvp = bindAttrValue.split(bindSplitter);
            this.name = kvp[1].trim();
            this.cmd = kvp[0].trim();
            this.bindElement = bindElement;
        }
        binderClass.prototype = {
            name: '',
            cmd: '',
            bindElement: null,
            bindContext: null
        };

        function getAllBinder(container) {
            //所有绑定器的集合
            var binders = $.cache.create();

            var $container = $(container);
            var $nodes = $container.getChild('*[' + bindAttrName + '^="' + bindCmdText + '"],*[' + bindAttrName + '^="' + bindCmdValue + '"]');
            $nodes.each(function () {
                var $this = $(this);
                var bindAttrValue = $this.getAttr(bindAttrName);
                if ($.isStringEmpty(bindAttrValue) || bindAttrValue.indexOf(bindSplitter) < 0) {
                    return;
                }
                var kvp = bindAttrValue.split(bindSplitter);
                var name = kvp[1].trim();
                binders.push(name, new binderClass(this));
            });
            return {
                binderDictionary: binders
            };
        }

        function composeBinder(binders, bindContexts) {
            var rootBindContext = bindContexts.get(containerName);
            $(binders.keys()).each(function () {
                var binder = binders.get(this);
                var flag = false;
                var parent = binder.bindElement.parentElement;
                while (parent !== rootBindContext.bindElement) {
                    var ret = isContextNode(parent);
                    if (!ret.result) {
                        parent = parent.parentElement;
                        continue;
                    }
                    //到此已可以判断出该绑定器的所属绑定上下文，追加到绑定上下文的绑定器集合中
                    var bindContext = bindContexts.get(ret.name);
                    bindContext.binderDictionary[binder.name] = binder;
                    binder.bindContext = bindContext;
                    flag = true;
                    break;
                }
                if (!flag) {
                    rootBindContext.binderDictionary[binder.name] = binder;
                    binder.bindContext = rootBindContext;
                }
            });
        }
    }



    /**
     * 基础api
     * @param element
     * @return {Object}
     */
    function isContextNode(element) {
        var checkResult = {
            result: false,
            cmd: '',
            name: ''
        };

        var bindAttrValue = $(element).getAttr(bindAttrName);
        if ($.isStringEmpty(bindAttrValue) || bindAttrValue.indexOf(bindSplitter) < 0) {
            return checkResult;
        }
        var kvp = bindAttrValue.split(bindSplitter);
        var cmd = kvp[0].trim();
        var name = kvp[1].trim();
        if (!contextFlowCmds.contains(cmd)) {
            return checkResult;
        }
        checkResult.result = true;
        checkResult.cmd = cmd;
        checkResult.name = name;
        return checkResult;
    }

    return self;
}({})));