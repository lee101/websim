var webFrame = (function ($) {
    "use strict";
    var self = {};
    self.setUp = function () {
        self.$frame = $('#web-frame');
        self.$frame.append('<iframe id="web-iframe" class="web-iframe" src="/'
            + currentWebFiddle.id + '/' + webutils.removeProtocol(currentWebFiddle.start_url) + '"></iframe>')
    };
    self.setUrl = function () {
        ;
    };
    return self;
})(jQuery);
