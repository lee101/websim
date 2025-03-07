// DOM-specific hints for CodeMirror
(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  var domElements = [
    "a", "abbr", "address", "area", "article", "aside", "audio", 
    "b", "base", "bdi", "bdo", "blockquote", "body", "br", "button", 
    "canvas", "caption", "cite", "code", "col", "colgroup", 
    "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", 
    "em", "embed", 
    "fieldset", "figcaption", "figure", "footer", "form", 
    "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", 
    "i", "iframe", "img", "input", "ins", 
    "kbd", 
    "label", "legend", "li", "link", 
    "main", "map", "mark", "menu", "menuitem", "meta", "meter", 
    "nav", "noscript", 
    "object", "ol", "optgroup", "option", "output", 
    "p", "param", "picture", "pre", "progress", 
    "q", 
    "rp", "rt", "ruby", 
    "s", "samp", "script", "section", "select", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "svg", 
    "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", 
    "u", "ul", 
    "var", "video", 
    "wbr"
  ];

  var domAttributes = [
    "accept", "accept-charset", "accesskey", "action", "align", "allow", "alt", "async", "autocapitalize", "autocomplete", "autofocus", "autoplay", 
    "bgcolor", "border", 
    "charset", "checked", "cite", "class", "color", "cols", "colspan", "content", "contenteditable", "controls", "coords", "crossorigin", 
    "data", "datetime", "default", "defer", "dir", "dirname", "disabled", "download", "draggable", 
    "enctype", 
    "for", "form", "formaction", "formenctype", "formmethod", "formnovalidate", "formtarget", 
    "headers", "height", "hidden", "high", "href", "hreflang", "http-equiv", 
    "id", "integrity", "ismap", "itemprop", 
    "kind", 
    "label", "lang", "list", "loop", "low", 
    "max", "maxlength", "media", "method", "min", "minlength", "multiple", 
    "name", "novalidate", 
    "onabort", "onafterprint", "onbeforeprint", "onbeforeunload", "onblur", "oncanplay", "oncanplaythrough", "onchange", "onclick", "oncontextmenu", "oncopy", "oncuechange", "oncut", "ondblclick", "ondrag", "ondragend", "ondragenter", "ondragleave", "ondragover", "ondragstart", "ondrop", "ondurationchange", "onemptied", "onended", "onerror", "onfocus", "onhashchange", "oninput", "oninvalid", "onkeydown", "onkeypress", "onkeyup", "onload", "onloadeddata", "onloadedmetadata", "onloadstart", "onmessage", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onmousewheel", "onoffline", "ononline", "onpagehide", "onpageshow", "onpaste", "onpause", "onplay", "onplaying", "onpopstate", "onprogress", "onratechange", "onreset", "onresize", "onscroll", "onsearch", "onseeked", "onseeking", "onselect", "onstalled", "onstorage", "onsubmit", "onsuspend", "ontimeupdate", "ontoggle", "onunload", "onvolumechange", "onwaiting", "onwheel", "open", "optimum", 
    "pattern", "placeholder", "poster", "preload", 
    "readonly", "rel", "required", "reversed", "rows", "rowspan", 
    "sandbox", "scope", "selected", "shape", "size", "sizes", "span", "spellcheck", "src", "srcdoc", "srclang", "srcset", "start", "step", "style", 
    "tabindex", "target", "title", "translate", "type", 
    "usemap", 
    "value", 
    "width", "wrap"
  ];

  var domObjects = [
    "document", "window", "navigator", "location", "history", "screen", "localStorage", "sessionStorage",
    "console", "performance", "event", "XMLHttpRequest", "fetch", "Promise", "setTimeout", "setInterval"
  ];

  var domProperties = [
    "innerHTML", "outerHTML", "textContent", "innerText", "outerText", "value", "checked", "disabled", 
    "selected", "id", "name", "className", "classList", "style", "dataset", "attributes", "tagName",
    "childNodes", "children", "firstChild", "lastChild", "nextSibling", "previousSibling", "parentNode", 
    "parentElement", "nodeType", "nodeValue", "nodeName"
  ];

  var domMethods = [
    "getElementById", "getElementsByClassName", "getElementsByTagName", "getElementsByName", "querySelector", "querySelectorAll",
    "createElement", "createTextNode", "createDocumentFragment", "appendChild", "removeChild", "replaceChild", "insertBefore",
    "setAttribute", "getAttribute", "removeAttribute", "hasAttribute", "addEventListener", "removeEventListener",
    "appendChild", "cloneNode", "focus", "blur", "click", "submit", "reset", "scrollIntoView"
  ];

  var documentEvents = [
    "click", "contextmenu", "dblclick", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseout", "mouseover", "mouseup",
    "keydown", "keypress", "keyup", "blur", "change", "focus", "focusin", "focusout", "input", "invalid", "reset", "search", "select", "submit",
    "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop",
    "scroll", "wheel", "copy", "cut", "paste"
  ];

  CodeMirror.registerHelper("hint", "dom", function(cm) {
    var cur = cm.getCursor();
    var token = cm.getTokenAt(cur);
    var line = cm.getLine(cur.line);

    var start = token.start;
    var end = token.end;
    var word = token.string;
    
    // For object properties/methods (after a dot)
    if (token.string === ".") {
      start = end;
      word = "";
    } else if (token.string.indexOf(".") === 0) {
      start += 1;
      word = token.string.substring(1);
    } else {
      // Look for the dot before the current word
      var dotPos = line.lastIndexOf(".", cur.ch - 1);
      if (dotPos >= 0) {
        var objToken = cm.getTokenAt(CodeMirror.Pos(cur.line, dotPos));
        var objName = objToken.string;
        
        // If we're after document. or element.
        if (objName === "document" || /[a-zA-Z]+Element/.test(objName)) {
          var list = [];
          
          // Add relevant methods and properties
          list = list.concat(domMethods.filter(function(item) {
            return item.indexOf(word) === 0;
          }));
          
          list = list.concat(domProperties.filter(function(item) {
            return item.indexOf(word) === 0;
          }));
          
          return {
            list: list,
            from: CodeMirror.Pos(cur.line, start),
            to: CodeMirror.Pos(cur.line, end)
          };
        }
        
        // If we're after document.getElementById or similar
        if (objName.indexOf("getElement") === 0 || objName === "querySelector") {
          return {
            list: domProperties.concat(domMethods).filter(function(item) {
              return item.indexOf(word) === 0;
            }),
            from: CodeMirror.Pos(cur.line, start),
            to: CodeMirror.Pos(cur.line, end)
          };
        }
      }
    }

    // Default completions
    var list = [];
    
    // DOM element tags
    if (token.type === "tag" || token.type === null) {
      list = list.concat(domElements.filter(function(item) {
        return item.indexOf(word) === 0;
      }));
    }
    
    // DOM objects
    list = list.concat(domObjects.filter(function(item) {
      return item.indexOf(word) === 0;
    }));
    
    // For attributes in HTML context
    if (token.type === "attribute") {
      list = domAttributes.filter(function(item) {
        return item.indexOf(word) === 0;
      });
    }
    
    return {
      list: list,
      from: CodeMirror.Pos(cur.line, start),
      to: CodeMirror.Pos(cur.line, end)
    };
  });
});