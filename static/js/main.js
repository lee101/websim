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
        theme: "default",
        tabMode: 'spaces', // or 'shift'
        viewportMargin: Infinity
    };

    // Add fallback for currentSavedFiddle
    if (typeof currentSavedFiddle === 'undefined') {
        window.currentSavedFiddle = {
            id: '',
            title: '',
            description: '',
            start_url: '',
            script: '',
            style: '',
            script_language: 'javascript',
            style_language: 'css'
        };
    }

    // Ensure script and style are strings
    if (currentSavedFiddle && currentSavedFiddle.script === null) {
        currentSavedFiddle.script = '';
    }
    if (currentSavedFiddle && currentSavedFiddle.style === null) {
        currentSavedFiddle.style = '';
    }

    self.setup = function () {
        // Define DOM-specific hint options
        CodeMirror.registerHelper("hint", "javascript", function(cm) {
            var inner = {
                // Use our custom DOM hints along with standard JS hints
                js: CodeMirror.hint.javascript,
                dom: CodeMirror.hint.dom
            };
            
            return CodeMirror.resolveMode(inner);
        });

        window.jsEditor = CodeMirror($('#js-editor')[0], $.extend({
            mode: {name: "javascript", globalVars: true},
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "Alt-.": function(cm) { 
                    cm.showHint({hint: CodeMirror.hint.dom, completeSingle: false});
                }
            },
            hintOptions: {
                completeSingle: false,
                alignWithWord: true,
                closeOnUnfocus: false
            }
        }, defaultCodeMirrorOptions));

        window.cssEditor = CodeMirror($('#css-editor')[0], $.extend({
            mode: "css",
            extraKeys: {
                "Ctrl-Space": "autocomplete"
            }
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
                event.preventDefault();
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
        editor.on('keypress', function (codeMirror, event) {
            var isAlphabetical = event.which >= 97 && event.which <= 122;
            if (isAlphabetical) {
                times++;
            }
            else {
                times = 0;
            }
            
            // Show hints after dots (for property access) or periods
            var dotKey = event.which == 46;
            // Show hints after typing 'document.' or similar
            var cursor = editor.getCursor();
            var token = editor.getTokenAt(cursor);
            var line = editor.getLine(cursor.line);
            
            var showHint = false;
            
            // After a dot, always show hints
            if (dotKey) {
                showHint = true;
            }
            // After typing a few letters, show hints
            else if (times >= 2) {
                showHint = true;
            }
            // After typing 'document', 'window', 'element', etc. followed by a dot
            else if (token && token.type === "variable" && 
                    (token.string === "document" || 
                     token.string === "window" || 
                     /Element/.test(token.string))) {
                showHint = true;
            }
            
            if (showHint) {
                var hintOptions = {
                    completeSingle: false,
                    alignWithWord: true,
                    closeOnUnfocus: false
                };
                
                // For JavaScript, use our custom DOM hints
                if (type === 'js' && dotKey) {
                    hintOptions.hint = CodeMirror.hint.dom;
                }
                
                editor.showHint(hintOptions);
            }
            
            // INJECT INTO IFRAME
            if (type == 'css') {
                webFrame.setCSS(editor.getValue());
            }
        });
        
        // Also handle keydown for non-printable keys
        editor.on('change', function (codeMirror, changeObj) {
            // For auto-closing parentheses and brackets
            var cursor = editor.getCursor();
            var line = editor.getLine(cursor.line);
            
            // INJECT INTO IFRAME
            if (type == 'css') {
                webFrame.setCSS(editor.getValue());
            }
            
            // If text was pasted, check if we should show hints
            if (changeObj.origin === "paste") {
                setTimeout(function() {
                    editor.showHint({
                        completeSingle: false,
                        alignWithWord: true
                    });
                }, 100);
            }
        });
    };


    return self;
})(jQuery);



