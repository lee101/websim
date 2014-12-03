var fiddle = (function ($) {
    "use strict";
    var self = {};
    self.getCurrentFiddle = function () {
        return {
            script: window.jsEditor.getValue(),
            style: window.cssEditor.getValue(),

            script_language: 'js',
            style_language: 'css',

            id: webutils.uid(),
            title: options.getTitle(),
            description: options.getDescription(),
            start_url: options.getStartUrl()
        };
    };

    self.setUp = function (fiddle) {
        if (fiddle) {
            jsEditor.setValue(fiddle.script);
            cssEditor.setValue(fiddle.style);
            options.setTitle(fiddle.title);
            options.setDescription(fiddle.description);
            options.setStartUrl(fiddle.start_url);
        }
    };

    return self;
})(jQuery);
