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

    return self;
})();
