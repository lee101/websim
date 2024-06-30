import hashlib
import logging
import os
import urllib
from pathlib import Path

import jinja2
import webapp2

from mirror.ai_wrapper import generate_with_claude
from models import CacheKey, Fiddle

config = {}
config['webapp2_extras.sessions'] = dict(
    secret_key='93986c9cdd240540f70efaea56a9e3f2')

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(os.path.dirname(__file__))))


_cache = {}
# ##############################################################################

DEBUG = False
EXPIRATION_DELTA_SECONDS = 3600 * 24 * 30

# DEBUG = True
# EXPIRATION_DELTA_SECONDS = 1

HTTP_PREFIX = "http://"

IGNORE_HEADERS = frozenset([
    "set-cookie",
    "expires",
    "cache-control",

    # Ignore hop-by-hop headers
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "x-frame-options",
    "content-security-policy",
    "x-xss-protection",
])

TRANSFORMED_CONTENT_TYPES = frozenset([
    "text/html",
    "text/css",
])

MAX_CONTENT_SIZE = 10 ** 64

###############################################################################

def get_url_key_name(url):
    url_hash = hashlib.sha256()
    url_hash.update(url.encode('utf-8'))
    return "hash_" + url_hash.hexdigest()


###############################################################################

class MirroredContent(object):
    def __init__(self, original_address, translated_address,
                 status, headers, data, base_url):
        self.original_address = original_address
        self.translated_address = translated_address
        self.status = status
        self.headers = headers
        self.data = data
        self.base_url = base_url

    @staticmethod
    def get_by_key_name(key_name):
        value = _cache.get(key_name)
        if not value:
            cache_key = CacheKey.byKey(key_name)
            if cache_key:
                value = cache_key.value
                if value:
                    _cache[key_name] = value
        return value
    
    @staticmethod
    def save(key_name: str, content: str):
        """
        Save the object to the cache and datastore.
        
        Args:
            key_name (str): The key name to use for storing the content.
            content (str): The str object to save.
        """
        
        # Save to memcache
        _cache[key_name] = content
        
        # Save to datastore
        cache_key = CacheKey(key=key_name, value=content)
        CacheKey.save(cache_key)



###############################################################################

class WarmupHandler(webapp2.RequestHandler):
    def get(self):
        pass


class BaseHandler(webapp2.RequestHandler):
    def get_relative_url(self):
        slash = self.request.url.find("/", len(self.request.scheme + "://"))
        if slash == -1:
            return "/"
        return self.request.url[slash:]

    def is_recursive_request(self):
        if "AppEngine-Google" in self.request.headers.get("User-Agent", ""):
            logging.warning("Ignoring recursive request by user-agent=%r; ignoring")
            self.error(404)
            return True
        return False
    
    
    def render(self, view_name, extraParams={}):
        template_values = {
            # 'json': json,
            # 'fixtures': fixtures,
            # 'GameOnUtils': GameOnUtils,
            'url': self.request.url,
        }
        template_values.update(extraParams)

        template = JINJA_ENVIRONMENT.get_template(view_name)
        self.response.write(template.render(template_values))
    



class HomeHandler(BaseHandler):
    def get(self):
        if self.is_recursive_request():
            return

        # Handle the input form to redirect the user to a relative url
        form_url = self.request.get("url")
        if form_url:
            # Accept URLs that still have a leading 'http://'
            inputted_url = urllib.unquote(form_url)
            if inputted_url.startswith(HTTP_PREFIX):
                inputted_url = inputted_url[len(HTTP_PREFIX):]
            return self.redirect("/" + inputted_url)

        # Do this dictionary construction here, to decouple presentation from
        # how we store data.
        secure_url = None
        if self.request.scheme == "http":
            secure_url = "https://%s%s" % (self.request.host, self.request.path_qs)
        context = {
            "secure_url": secure_url,
        }
        
        template = JINJA_ENVIRONMENT.get_template("main.html")
        self.response.write(template.render(context))


add_code = """"""

big_add_code = """<iframe style="min-width:600px;min-height:300px;width:100%;border:none" src="http://v5games.com/">
    </iframe>"""

def request_blocker(fiddle_name):
    return """
<script>
var oldOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url) {

function getPosition(str, m, i) {
   return str.split(m, i).join(m).length;
}
    var fiddle_name = '""" + fiddle_name + """';
    var fiddle_domain = window.location.pathname.substring(0, getPosition(window.location.pathname, '/', 3))
    if (url.indexOf(fiddle_name) != -1 || ((/.*http.*/.test(url) || /.*\/\/.*/.test(url)) && (url.indexOf(window.location.hostname) == -1))) {
        oldOpen.apply(this, arguments);
    }
    else if (/.*http.*/.test(url) || /.*\/\/.*/.test(url)) {
	var host_index = url.indexOf(window.location.host);
        if (host_index != -1) {
		//on our url needing fiddle name in the url
		var start_url = url.slice(0, host_index + window.location.host.length)
		var end_url = url.slice(host_index + window.location.host.length)
		url = start_url + fiddle_domain + end_url
		oldOpen.apply(this, arguments);
	} else {
        oldOpen.apply(this, arguments);
	}
    }
    else if (url.indexOf('/') == 0) {
        url = fiddle_domain + url;
        oldOpen.apply(this, arguments);
    }
    else {
        console.error("webfiddle doesn't support this type of request")
    }
}
</script>
"""
def find_text_between(content, start_text, end_text):
    start_index = content.find(start_text)
    if start_index == -1:
        return None # this is a bit aggressive?
    
    start_index += len(start_text)
    end_index = content.find(end_text, start_index)
    
    if end_index == -1:
        return None
    
    return content[start_index:end_index]


class MirrorHandler(BaseHandler):
    def get(self, fiddle_name, base_url):
        if self.is_recursive_request():
            return
        if fiddle_name.rfind('-') == -1:
            return self.error(500)


        assert base_url

        base_url = fiddle_name + '/' + base_url

        translated_address = self.get_relative_url()[1:]  # remove leading /
        if translated_address.endswith('favicon.ico'):
            return self.redirect('/favicon.ico', True)
        translated_address = translated_address[translated_address.index('/') + 1:]
        mirrored_url = HTTP_PREFIX + translated_address

        fiddle = Fiddle.byUrlKey(fiddle_name)
        # fiddle_body = fiddle.body
        fiddle_description = ''
        fiddle_title = ''
        if fiddle:
            fiddle_title = fiddle.title
            fiddle_description = fiddle.description

        # fiddle_style = fiddle.style # todo should we regen based on js/css? - 
        # fiddle_script = fiddle.script
        # todo routes for regen css/js


        # Use sha256 hash instead of mirrored url for the key name, since key
        # names can only be 500 bytes in length; URLs may be up to 2KB.
        key_name = get_url_key_name(mirrored_url)

        content = MirroredContent.get_by_key_name(key_name)
        body = content
        if content is None:
            #generate html by claude
            content = generate_with_claude(f"""{mirrored_url}
{fiddle_title}
{fiddle_description}
Working on this, please provide the full comprehensive html for everything i should put in the body tag - everything using tailwind/inline scripts
Dont describe the html, just give me the full html only
""")
            body = find_text_between(content, "<body", "</body>")
            if not body:
                #yolo
                body = content
            # content = f"""<html><body>{body}</body></html>"""
        
        if body is None:
            return self.error(404)
        if body:
            MirroredContent.save(key_name, body)
        # for key, value in content.headers.iteritems():
        #     self.response.headers[key] = value
        if not DEBUG:
            self.response.headers["cache-control"] = \
                "max-age=%d" % EXPIRATION_DELTA_SECONDS


        # TODO rewrite data here
        
        # full_content = f"""<html><head>{fiddle.title}</head><body>{body}</body></html>"""
        self.render('templates/genpage.jinja2', {
            'fiddle': fiddle,
            'title': fiddle.title,
            'description': fiddle.description,
            'body': body,
            'request_blocker': request_blocker(fiddle_name),
            'add_code': add_code,
        })

###############################################################################

app = webapp2.WSGIApplication([
                                  (r"/", HomeHandler),
                                  (r"/main", HomeHandler),
                                  (r"/([^/]+).*", MirrorHandler),
                                  (r"/warmup", WarmupHandler),
                              ], debug=DEBUG)
