(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["share-buttons.jinja2"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<p class=\"mm-sharing-btns\">\n    ";
var t_1;
t_1 = "";
frame.set("encoded_desc", t_1, true);
if(!frame.parent) {
context.setVariable("encoded_desc", t_1);
context.addExport("encoded_desc");
}
var t_2;
t_2 = "";
frame.set("encoded_desc_short", t_2, true);
if(!frame.parent) {
context.setVariable("encoded_desc_short", t_2);
context.addExport("encoded_desc_short");
}
output += "Share <a href=\"#\" class=\"facebook-share-btn\" title=\"Share this fiddle\"><i class=\"fa fa-facebook-square mm-share-btn\"></i> </a>\n    <a href=\"https://twitter.com/intent/tweet?url=";
output += runtime.suppressValue((lineno = 4, colno = 60, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "urlencode"), "urlencode", [runtime.contextOrFrameLookup(context, frame, "url")])), env.autoesc);
output += "&text=";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "encoded_desc_short"), env.autoesc);
output += "\" target=\"_blank\" rel=\"nofollow\" title=\"Share this fiddle\">\n        <i class=\"fa fa-twitter-square mm-share-btn mm-share-btn--twitter\"></i>\n    </a>\n    <a href=\"https://pinterest.com/pin/create/bookmarklet/?url=";
output += runtime.suppressValue((lineno = 7, colno = 73, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "urlencode"), "urlencode", [runtime.contextOrFrameLookup(context, frame, "url")])), env.autoesc);
output += "&description=";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "encoded_desc"), env.autoesc);
output += "\" target=\"_blank\" rel=\"nofollow\" title=\"Share this fiddle\">\n        <i class=\"fa fa-pinterest-square mm-share-btn mm-share-btn--pinterest\"></i>\n    </a>\n    <a href=\"https://plus.google.com/share?url=";
output += runtime.suppressValue((lineno = 10, colno = 57, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "urlencode"), "urlencode", [runtime.contextOrFrameLookup(context, frame, "url")])), env.autoesc);
output += "\" target=\"_blank\" rel=\"nofollow\" title=\"Share this fiddle\">\n        <i class=\"fa fa-google-plus-square mm-share-btn mm-share-btn--google-plus\"></i>\n    </a>\n    <a href=\"http://www.linkedin.com/shareArticle?url=";
output += runtime.suppressValue((lineno = 13, colno = 64, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "urlencode"), "urlencode", [runtime.contextOrFrameLookup(context, frame, "url")])), env.autoesc);
output += "&title=";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "encoded_desc"), env.autoesc);
output += "\" target=\"_blank\" rel=\"nofollow\" title=\"Share this fiddle\">\n        <i class=\"fa fa-linkedin-square mm-share-btn mm-share-btn--linked-in\"></i>\n    </a>\n    <a href=\"http://www.stumbleupon.com/submit?url=";
output += runtime.suppressValue((lineno = 16, colno = 61, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "urlencode"), "urlencode", [runtime.contextOrFrameLookup(context, frame, "url")])), env.autoesc);
output += "&title=";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "encoded_desc"), env.autoesc);
output += "\" target=\"_blank\" rel=\"nofollow\" title=\"Share this fiddle\">\n        <i class=\"fa fa-stumbleupon-circle mm-share-btn mm-share-btn--stumbleupon\"></i>\n    </a>\n    <a href=\"http://reddit.com/submit?url=";
output += runtime.suppressValue((lineno = 19, colno = 52, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "urlencode"), "urlencode", [runtime.contextOrFrameLookup(context, frame, "url")])), env.autoesc);
output += "&title=";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "encoded_desc_short"), env.autoesc);
output += "\" target=\"_blank\" rel=\"nofollow\" title=\"Share this fiddle\">\n        <i class=\"fa fa-reddit mm-share-btn\"></i>\n    </a>\n</p>";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
