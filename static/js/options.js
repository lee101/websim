var options = (function ($) {
    "use strict";
    var self = {};
    self.getTitle = function () {
        return $('[name="fiddle_title"]').val();
    };
    self.setTitle = function (val) {
        return $('[name="fiddle_title"]').val(val);
    };
    self.getDescription = function () {
        return $('[name="fiddle_description"]').val();
    };
    self.setDescription = function (val) {
        return $('[name="fiddle_description"]').val(val);
    };
    self.getStartUrl = function () {
        return $('[name="start_url"]').val();
    };
    self.setStartUrl = function (val) {
        return $('[name="start_url"]').val(val);
    };

    return self;
})(jQuery);
