var options = (function ($) {
    "use strict";
    var self = {};
    self.setUp = function (fiddle) {
        self.$fiddleTitle = $('[name="fiddle_title"]');
        self.$fiddleDescription = $('[name="fiddle_description"]');
        self.$startUrl = $('[name="start_url"]');

        self.$fiddleTitle.attr('title', 'Title');
        self.$fiddleDescription.attr('title', 'Description');
        self.$startUrl.attr('title', 'Starting URL');

        self.$fiddleTitle.focus();
        window.setTimeout(function () {
            self.$fiddleTitle.select();
        }, 100);

        self.setTitle(fiddle.title);
        self.setDescription(fiddle.description);
        self.setStartUrl(fiddle.start_url);
    };
    self.getTitle = function () {
        return self.$fiddleTitle.val();
    };
    self.setTitle = function (val) {
        return self.$fiddleTitle.val(val);
    };
    self.getDescription = function () {
        return self.$fiddleDescription.val();
    };
    self.setDescription = function (val) {
        return self.$fiddleDescription.val(val);
    };
    self.getStartUrl = function () {
        return self.$startUrl.val();
    };
    self.setStartUrl = function (val) {
        return self.$startUrl.val(val);
    };

    return self;
})(jQuery);
