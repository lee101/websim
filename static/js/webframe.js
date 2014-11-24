var webFrame = (function ($) {
    "use strict";
    var self = {};
    self.setUp = function () {
        self.setUrl(currentWebFiddle.start_url);
        self.$frame = $('#web-frame');
        self.$frame.append('<iframe id="web-iframe" class="web-iframe" src="/'
            + currentWebFiddle.id + '/' + webutils.removeProtocol(currentWebFiddle.start_url) + '"></iframe>');

    };
    self.setUrl = function (url) {
        $('[name="current_url"]').val(url);
    };
    return self;
})(jQuery);
