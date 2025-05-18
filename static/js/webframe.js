var webFrame = (function ($) {
    "use strict";
    var self = {};
    self.setUp = function (fiddle) {
        self.setUrl(fiddle.start_url);
        self.navigateTo(fiddle, fiddle.start_url);
        self.setUpNavBar(fiddle.start_url);
    };
    self.setUrl = function (url) {
        $('[name="current_url"]').val(url);
    };
    self.getUrl = function () {
        return $('[name="current_url"]').val();
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
                self.navigateTo(fiddle.getSavedFiddle(), url);
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

    self.navigateTo = function (fiddle, url) {
        if (typeof url == 'undefined') {
            url = self.getUrl();
        }
        self.$frame = $('#web-frame');
        
        // Clean URL for safety and functionality
        let cleanUrl = url || '';
        if (cleanUrl && !cleanUrl.includes('://')) {
            cleanUrl = webutils.removeProtocol(cleanUrl);
        }
        
        const iframeSrc = '/' + fiddle.title + '-' + fiddle.id + '/' + cleanUrl;
        
        // Create iframe with proper attributes for content rendering
        self.$frame.html(
            '<div id="web-iframe-loading" class="web-iframe-loading">' +
            '<i class="web-bigspinner fa fa-spinner fa-spin"></i>' +
            '</div>' +
            '<iframe id="web-iframe" name="web-iframe" class="web-iframe" ' +
            'sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock" ' +
            'onLoad="webFrame.onFrameLoad(this)" ' +
            'src="' + iframeSrc + '" ' +
            'style="border: none; width: 100%; height: 100%;">' +
            '</iframe>'
        );
    };

    self.reload = function () {
        $('#web-iframe-loading').css({'display': ''});
        frames['web-iframe'].window.location.reload();
    };

    self.onFrameLoad = function (iframe) {
        webFrame.setUrl(webFrame.getPath(iframe.contentWindow.location.pathname) +
            iframe.contentWindow.location.search + iframe.contentWindow.location.hash);
        $('#web-iframe-loading').hide();
        self.updateHTMLView();
    };

    self.setCSS = function (css) {
        frames['web-iframe'].window.document.getElementById('webfiddle-css').innerHTML = css;
    };

    self.getHTML = function () {
        try {
            return frames['web-iframe'].document.documentElement.outerHTML;
        } catch (e) {
            console.error('Unable to get HTML from iframe:', e);
            return '';
        }
    };

    self.updateHTMLView = function () {
        if (window.htmlEditor) {
            window.htmlEditor.setValue(self.getHTML());
        }
    };


    return self;
})(jQuery);
