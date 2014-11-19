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

    self.removeProtocol = function (url) {
        var protocolPos = url.indexOf('//');
        if (protocolPos == -1) {
            return url;
        }
        return url.substring(protocolPos + 2);
    };
    return self;
})();
