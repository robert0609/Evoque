var obj = (function (self) {
    self.method2 = function () {
        console.debug('file2');
    };
    return self;
}(obj || {}));