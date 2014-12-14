window.webutils = (function () {
    var self = {};

    var loadingElToIconMap = {};
    self.setIconLoading = function (el) {
        var $el = $(el);
        loadingElToIconMap[el] = $el.find('i').attr('class');
        $el.attr('disabled', 'disabled')
            .find('i').attr('class', 'fa fa-spinner fa-spin');
    };
    self.setIconDone = function (el) {
        var $el = $(el);
        $el.removeAttr('disabled')
            .find('i').attr('class', loadingElToIconMap[el]);
        delete loadingElToIconMap[$el];
    };

    self.urlencode = function (name) {
        return name.replace(/\s/g, '-')
            .replace(/[\.\t\,\:;\(\)'@!\\\?#/<>&]/g, '')
            .replace(/[^\x00-\x7F]/g, "")
            .toLowerCase();
    };

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

    //Modals
    self.modalHidden = true;
    $(document).ready(function () {

        var $modal = $('#modal');
        $modal.on('hide.bs.modal', function (e) {
            self.modalHidden = true;
        });

        $modal.on('show.bs.modal', function (e) {
            self.modalHidden = false;
        });
    });
    self.showModal = function () {
        $('#modal').modal('show');
    };
    self.hideModal = function () {
        $('#modal').modal('hide');
    };
    self.setModal = function (content) {
        $('#modal').find('.modal-body').html(content);
        self.showModal();
    };

    self.render = function (template, opts) {
//TODO on load?
        if (typeof opts === 'undefined') {
            opts = {};
        }
        $.extend(opts, {
            url: window.location.href,
            urlencode: encodeURIComponent,
            window: window,
            client_side: true
        });
        return nunjucks.render(template, opts);
    };

    // facebook and twitter share buttons
    $(document).on('click', '.facebook-share-btn', function () {
        FB.ui({
            method: 'share',
            href: window.location.href
        }, function (response) {
        });
    });

    (function () {
        if (window.__twitterIntentHandler) return;
        var intentRegex = /twitter\.com(\:\d{2,4})?\/intent\/(\w+)/,
            windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes',
            width = 550,
            height = 420,
            winHeight = screen.height,
            winWidth = screen.width;

        function handleIntent(e) {
            e = e || window.event;
            var target = e.target || e.srcElement,
                m, left, top;

            while (target && target.nodeName.toLowerCase() !== 'a') {
                target = target.parentNode;
            }

            if (target && target.nodeName.toLowerCase() === 'a' && target.href) {
                m = target.href.match(intentRegex);
                if (m) {
                    left = Math.round((winWidth / 2) - (width / 2));
                    top = 0;

                    if (winHeight > height) {
                        top = Math.round((winHeight / 2) - (height / 2));
                    }

                    window.open(target.href, 'intent', windowOptions + ',width=' + width +
                        ',height=' + height + ',left=' + left + ',top=' + top);
                    e.returnValue = false;
                    e.preventDefault && e.preventDefault();
                }
            }
        }

        if (document.addEventListener) {
            document.addEventListener('click', handleIntent, false);
        } else if (document.attachEvent) {
            document.attachEvent('onclick', handleIntent);
        }
        window.__twitterIntentHandler = true;
    }());

    return self;
})();

nunjucks.configure({ autoescape: true });
