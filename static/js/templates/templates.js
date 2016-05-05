(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["share-buttons.jinja2"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "<p class=\"mm-sharing-btns\">\n    <a href=\"#\" class=\"facebook-share-btn\" title=\"Share this fiddle\"><i class=\"fa fa-facebook-square mm-share-btn\"></i> </a>\n    <a href=\"https://twitter.com/intent/tweet?url=";
output += runtime.suppressValue((lineno = 2, colno = 60, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "urlencode"), "urlencode", context, [runtime.contextOrFrameLookup(context, frame, "url")])), env.opts.autoescape);
output += "&text=";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "encoded_desc_short"), env.opts.autoescape);
output += "\" target=\"_blank\" rel=\"nofollow\" title=\"Share this fiddle\">\n        <i class=\"fa fa-twitter-square mm-share-btn mm-share-btn--twitter\"></i>\n    </a>\n    <a href=\"https://pinterest.com/pin/create/bookmarklet/?url=";
output += runtime.suppressValue((lineno = 5, colno = 73, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "urlencode"), "urlencode", context, [runtime.contextOrFrameLookup(context, frame, "url")])), env.opts.autoescape);
output += "&description=";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "encoded_desc"), env.opts.autoescape);
output += "\" target=\"_blank\" rel=\"nofollow\" title=\"Share this fiddle\">\n        <i class=\"fa fa-pinterest-square mm-share-btn mm-share-btn--pinterest\"></i>\n    </a>\n    <a href=\"https://plus.google.com/share?url=";
output += runtime.suppressValue((lineno = 8, colno = 57, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "urlencode"), "urlencode", context, [runtime.contextOrFrameLookup(context, frame, "url")])), env.opts.autoescape);
output += "\" target=\"_blank\" rel=\"nofollow\" title=\"Share this fiddle\">\n        <i class=\"fa fa-google-plus-square mm-share-btn mm-share-btn--google-plus\"></i>\n    </a>\n    <a href=\"http://www.linkedin.com/shareArticle?url=";
output += runtime.suppressValue((lineno = 11, colno = 64, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "urlencode"), "urlencode", context, [runtime.contextOrFrameLookup(context, frame, "url")])), env.opts.autoescape);
output += "&title=";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "encoded_desc"), env.opts.autoescape);
output += "\" target=\"_blank\" rel=\"nofollow\" title=\"Share this fiddle\">\n        <i class=\"fa fa-linkedin-square mm-share-btn mm-share-btn--linked-in\"></i>\n    </a>\n    <a href=\"http://www.stumbleupon.com/submit?url=";
output += runtime.suppressValue((lineno = 14, colno = 61, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "urlencode"), "urlencode", context, [runtime.contextOrFrameLookup(context, frame, "url")])), env.opts.autoescape);
output += "&title=";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "encoded_desc"), env.opts.autoescape);
output += "\" target=\"_blank\" rel=\"nofollow\" title=\"Share this fiddle\">\n        <i class=\"fa fa-stumbleupon-circle mm-share-btn mm-share-btn--stumbleupon\"></i>\n    </a>\n    <a href=\"http://reddit.com/submit?url=";
output += runtime.suppressValue((lineno = 17, colno = 52, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "urlencode"), "urlencode", context, [runtime.contextOrFrameLookup(context, frame, "url")])), env.opts.autoescape);
output += "&title=";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "encoded_desc_short"), env.opts.autoescape);
output += "\" target=\"_blank\" rel=\"nofollow\" title=\"Share this fiddle\">\n        <i class=\"fa fa-reddit mm-share-btn\"></i>\n    </a>\n    <a href=\"http://news.ycombinator.com/submit?url=";
output += runtime.suppressValue((lineno = 20, colno = 62, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "urlencode"), "urlencode", context, [runtime.contextOrFrameLookup(context, frame, "url")])), env.opts.autoescape);
output += "&title=";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "encoded_desc_short"), env.opts.autoescape);
output += "\" target=\"_blank\" rel=\"nofollow\" title=\"Share this fiddle\">\n        <i class=\"fa fa-hacker-news mm-share-btn mm-share-btn--hackernews\"></i>\n    </a>\n</p>";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
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
