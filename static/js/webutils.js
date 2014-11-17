window.webutils = (function () {
    var self = {};
    self.uid = (function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(36)
                .substring(1);
        }

        return function () {
            return s4() + s4();
        };
    })();
    return self;
})();
