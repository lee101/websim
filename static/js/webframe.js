var webFrame = (function ($) {
    "use strict";
    var self = {};
    self.setUp = function (fiddle) {
        self.setUrl(fiddle.start_url);
        self.navigateTo(fiddle.start_url);
        self.setUpNavBar(fiddle.start_url);
    };
    self.setUrl = function (url) {
        $('[name="current_url"]').val(url);
    };

    self.getPath = function (url) {
        url = url.substring(1);
        url = url.substring(url.indexOf('/') + 1);
        return url;
    };
    self.setUpNavBar = function (current_url) {
        var $navbar = $('[name="current_url"]');
        var previous_url = current_url;
        var change = function (evt) {
            var url = $(evt.target).val();
            if (previous_url !== url) {
                self.navigateTo(url);
                previous_url = url;
            }
        };
        $navbar.on('blur', change);
        $navbar.keyup(function (e) {
            if (e.keyCode == 13) {
                change(e);
            }
        });
    };

    self.navigateTo = function (url) {
        self.$frame = $('#web-frame');
        //TODO catch network error?

        self.$frame.html('<div id="web-iframe-loading" class="web-iframe-loading"><i class="web-bigspinner fa fa-spinner fa-spin"></i> </div>' +
            '<iframe id="web-iframe" name="web-iframe" class="web-iframe" ' +
            ' onLoad="webFrame.onFrameLoad(this)" ' +

            'src="/' + currentSavedFiddle.id + '/' + webutils.removeProtocol(url) + '"></iframe>');
    };

    self.reload = function () {
        $('#web-iframe-loading').css({'display': ''});
        frames['web-iframe'].window.location.reload();
    };

    self.onFrameLoad = function (iframe) {
        webFrame.setUrl(webFrame.getPath(iframe.contentWindow.location.pathname));
        $('#web-iframe-loading').hide();
    };

    self.setCSS = function (css) {
        frames['web-iframe'].window.document.getElementById('webfiddle-css').innerHTML = css;
    };


    return self;
})(jQuery);
