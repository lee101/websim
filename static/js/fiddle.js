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
    self.getSavedFiddle = function () {
        if (!self.savedFiddle) {
            return savedWebFiddle;
        } else {
            return self.savedFiddle
        }
    };
    self.setSavedFiddle = function (fiddle) {
        self.savedFiddle = fiddle;
    }

    self.setUp = function (fiddle) {
        if (fiddle) {
            jsEditor.setValue(fiddle.script);
            cssEditor.setValue(fiddle.style);
            options.setUp(fiddle);
        }
    };

    return self;
})(jQuery);
