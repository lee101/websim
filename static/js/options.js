var options = (function ($) {
    "use strict";
    var self = {};
    self.getTitle = function () {
        return $('[name="title"]').val();
    };
    self.setTitle = function (val) {
        return $('[name="title"]').val(val);
    };
    self.getDescription = function () {
        return $('[name="description"]').val();
    };
    self.setDescription = function (val) {
        return $('[name="description"]').val(val);
    };
    self.getStartUrl = function () {
        return $('[name="start_url"]').val();
    };
    self.setStartUrl = function (val) {
        $('[name="current_url"]').val(val);
        return $('[name="start_url"]').val(val);
    };

    return self;
})(jQuery);
