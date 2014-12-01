var webFrame = (function ($) {
    "use strict";
    var self = {};
    self.setUp = function () {
        self.setUrl(currentWebFiddle.start_url);
        self.navigateTo(currentWebFiddle.start_url);
        self.setUpNavBar();
    };
    self.setUrl = function (url) {
        $('[name="current_url"]').val(url);
    };

    self.getPath = function (url) {
        url = url.substring(1);
        url = url.substring(url.indexOf('/') + 1);
        return url;
    };
    self.setUpNavBar = function () {
        var $navbar = $('[name="current_url"]');
        $navbar.on('blur', function(evt) {
            var url = $(evt.target).val();
            self.navigateTo(url)
        })
    };

    self.navigateTo = function(url) {
        self.$frame = $('#web-frame');
        //TODO catch network error?
        self.$frame.html('<iframe id="web-iframe" name="web-iframe" class="web-iframe" ' +
            ' onLoad="webFrame.setUrl(webFrame.getPath(this.contentWindow.location.pathname))" ' +

            'src="/' + currentWebFiddle.id + '/' + webutils.removeProtocol(url) + '"></iframe>');
    };

    self.setCSS = function (css) {
        frames['web-iframe'].window.document.getElementById('webfiddle-css').innerHTML = css;
    };


    return self;
})(jQuery);
