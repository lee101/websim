var main = (function ($) {
    "use strict";
    var self = {};
    var defaultCodeMirrorOptions = {
        gutters: ["note-gutter", "CodeMirror-linenumbers"],
        tabSize: 4,
        indentUnit: 4,
        matchBrackets: true,
        autoCloseBrackets: true,
        lineNumbers: true,
        lineWrapping: true,
        extraKeys: {"Ctrl-Space": "autocomplete"},
//        completeSingle: false,
        tabMode: 'spaces' // or 'shift'
    };

    self.setup = function () {
        window.jsEditor = CodeMirror($('#js-editor')[0], $.extend({
            mode: {name: "javascript", globalVars: true}
        }, defaultCodeMirrorOptions));

        window.cssEditor = CodeMirror($('#css-editor')[0], $.extend({
            mode: "css"

        }, defaultCodeMirrorOptions));

        Inlet(jsEditor);
        Inlet(cssEditor);

        if (currentWebFiddle) {
            jsEditor.setValue(currentWebFiddle.script);
            cssEditor.setValue(currentWebFiddle.style);
            options.setTitle(currentWebFiddle.title);
            options.setDescription(currentWebFiddle.description);
            options.setStartUrl(currentWebFiddle.start_url);
        }

        webFrame.setUp();

        self.addEditorCompletion(jsEditor);
        self.addEditorCompletion(cssEditor);


        var setMainHeight = function () {
            var mainHeight = $(window).height() - $('.main-header').height();
            $('.main-content').height(mainHeight);
        };

        var refreshUI = function () {
            setMainHeight();
            viewport.doLayout()
        };

        $(window).resize(refreshUI);
        refreshUI();

        var saveFunc = function (evt) {
            var $el = $(evt.target);

            var currentFiddle = {
                script: window.jsEditor.getValue(),
                style: window.cssEditor.getValue(),

                script_language: 'js',
                style_language: 'css',

                id: webutils.uid(),
                title: options.getTitle(),
                description: options.getDescription(),
                start_url: options.getStartUrl()
            };

            $.ajax({
                url: '/createfiddle',
                data: currentFiddle,
                success: function (data) {
                    ;
                },
                "type": "GET",
                "cache": false,
                "error": function (xhr, error, thrown) {
                    //flash msg

                    if (error == "parsererror") {
                    }
                }
            })
        };
        $('#save').on('click', saveFunc)
    };

    self.addEditorCompletion = function (editor) {
        var times = 0;
        editor.on('keyup', function (codeMirror, event) {
            var isAlphabetical = event.which >= 65 && event.which <= 90;
            if (isAlphabetical) {
                times++
            }
            else {
                times = 0
            }
            if (times >= 2) {
                editor.showHint({completeSingle: false});
            }
        })
    };


    return self;
})(jQuery);


