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

        fiddle.setUp(currentSavedFiddle);

        webFrame.setUp(currentSavedFiddle);

        self.addEditorCompletion(jsEditor, 'js');
        self.addEditorCompletion(cssEditor, 'css');


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

        var saveFunc = function (evt, callback) {
            if (typeof callback == 'undefined') {
                callback = function () {
                }
            }
            var $el = $(evt.target);

            var currentFiddle = fiddle.getCurrentFiddle();

            $.ajax({
                url: '/createfiddle',
                data: currentFiddle,
                success: function (data) {

                    if (data === "success") {
                        fiddle.setSavedFiddle(currentFiddle);
                        history.replaceState({}, 'fiddle', '/' + webutils.urlencode(currentFiddle.title) + '-' + currentFiddle.id);
                        callback()
                    }
                },
                "type": "GET",
                "cache": false,
                "error": function (xhr, error, thrown) {
                    //flash msg

                    if (error == "parsererror") {
                    }
                }
            });
            return false;
        };
        $('#save').on('click', saveFunc);
        var shareFunction = function () {
            var currentFiddle = fiddle.getSavedFiddle();

            webutils.setModal(webutils.render('share-buttons.jinja2', {
                encoded_desc_short: currentFiddle.title,
                encoded_desc: currentFiddle.description
            }));
            webutils.showModal();
            return false;
        };
        $('#share').on('click', shareFunction);
        var runFunction = function (evt) {
            saveFunc(evt, function () {
                webFrame.navigateTo(fiddle.getSavedFiddle());
            });
            return false;
        };
        $('#webfiddle_run').on('click', runFunction);

    };

    self.addEditorCompletion = function (editor, type) {
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
            //INJECT INTO IFRAME
            if (type == 'css') {
                webFrame.setCSS(editor.getValue());
            }
        })
    };


    return self;
})(jQuery);


