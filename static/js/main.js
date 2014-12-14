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
            viewport.doLayout();
        };

        $(window).resize(refreshUI);
        window.setTimeout(refreshUI, 2000);
        refreshUI();

        var saveFunction = function (evt, callback) {
            if (typeof callback == 'undefined') {
                callback = function () {
                }
            }
            webutils.setIconLoading('#save');

            var currentFiddle = fiddle.getCurrentFiddle();

            $.ajax({
                url: '/createfiddle',
                data: currentFiddle,
                success: function (data) {

                    if (data === "success") {
                        webutils.setIconDone('#save');
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
        $('#save').on('click', saveFunction);
        $(document).on('keydown', function (event) {
            if (event.which == 83 && event.ctrlKey) {
                saveFunction();
            }
        });
        var shareFunction = function () {
            var currentFiddle = fiddle.getSavedFiddle();

            webutils.setModal(
                '<h3>Editor Link: <input class="webfiddle-share-link x-form-field x-form-text" type="text" value="' + window.location.href + '"></h3>' +
                    webutils.render('share-buttons.jinja2', {
                        encoded_desc_short: currentFiddle.title,
                        encoded_desc: currentFiddle.description
                    }) +
                    '<h3>Fullscreen Link: <input class="webfiddle-share-link x-form-field x-form-text" type="text" value="' + fiddle.getFullScreenUrl(currentFiddle) + '"></h3>' +
                    webutils.render('share-buttons.jinja2', {
                        url: fiddle.getFullScreenUrl(currentFiddle),
                        encoded_desc_short: currentFiddle.title,
                        encoded_desc: currentFiddle.description
                    })
            );
            webutils.showModal();
            $('.webfiddle-share-link').eq(0).focus();
            window.setTimeout(function () {
                $('.webfiddle-share-link').eq(0).select();
            }, 100);
            return false;
        };
        $('#share').on('click', shareFunction);
        var runFunction = function (evt) {
            webutils.setIconLoading('#webfiddle_run');

            saveFunction(evt, function () {
                webutils.setIconDone('#webfiddle_run');

                webFrame.navigateTo(fiddle.getSavedFiddle());
            });
            return false;
        };
        $('#webfiddle_run').on('click', runFunction);
        $(document).on('keydown', function (event) {
            if (event.which == 13 && event.ctrlKey) {
                runFunction();
            }
        });
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


