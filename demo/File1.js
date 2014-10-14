var obj = (function (self) {
    self.method1 = function () {
        console.debug('file1');
    };
    return self;
}(obj || {}));