#!/usr/bin/env python
# Copyright 2008-2014 Brett Slatkin
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
from models import Fiddle

__author__ = "Brett Slatkin (bslatkin@gmail.com)"

import hashlib
import logging
import re
import urllib

from google.appengine.api import memcache
from google.appengine.api import urlfetch
import webapp2
from google.appengine.ext.webapp import template
from google.appengine.runtime import apiproxy_errors

import transform_content


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
])

TRANSFORMED_CONTENT_TYPES = frozenset([
    "text/html",
    "text/css",
])

MAX_CONTENT_SIZE = 10 ** 64

###############################################################################

def get_url_key_name(url):
    url_hash = hashlib.sha256()
    url_hash.update(url)
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
        return memcache.get(key_name)

    @staticmethod
    def fetch_and_store(key_name, base_url, translated_address, mirrored_url):
        """Fetch and cache a page.

        Args:
          key_name: Hash to use to store the cached page.
          base_url: The hostname of the page that's being mirrored.
          translated_address: The URL of the mirrored page on this site.
          mirrored_url: The URL of the original page. Hostname should match
            the base_url.

        Returns:
          A new MirroredContent object, if the page was successfully retrieved.
          None if any errors occurred or the content could not be retrieved.
        """
        try:
            response = urlfetch.fetch(mirrored_url)
        except (urlfetch.Error, apiproxy_errors.Error):
            logging.exception("Could not fetch URL")
            return None

        adjusted_headers = {}
        for key, value in response.headers.iteritems():
            adjusted_key = key.lower()
            if adjusted_key not in IGNORE_HEADERS:
                adjusted_headers[adjusted_key] = value

        content = response.content
        page_content_type = adjusted_headers.get("content-type", "")
        for content_type in TRANSFORMED_CONTENT_TYPES:
            # startswith() because there could be a 'charset=UTF-8' in the header.
            if page_content_type.startswith(content_type):
                content = transform_content.TransformContent(base_url, mirrored_url,
                                                             content)
                break

        # If the transformed content is over MAX_CONTENT_SIZE, truncate it (yikes!)
        if len(content) > MAX_CONTENT_SIZE:
            logging.warning("Content is over MAX_CONTENT_SIZE; truncating")
            content = content[:MAX_CONTENT_SIZE]

        new_content = MirroredContent(
            base_url=base_url,
            original_address=mirrored_url,
            translated_address=translated_address,
            status=response.status_code,
            headers=adjusted_headers,
            data=content)
        try:
            if not memcache.add(key_name, new_content, time=EXPIRATION_DELTA_SECONDS):
                logging.error('memcache.add failed: key_name = "%s", '
                              'original_url = "%s"', key_name, mirrored_url)
        except ValueError:
            logging.error('memcache.add failed: key_name = "%s", '
                          'original_url = "%s"', key_name, mirrored_url)

        return new_content


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
        self.response.out.write(template.render("main.html", context))


add_code = """"""

big_add_code = """<iframe style="min-width:600px;min-height:800px;width:100%" src="http://www.addictingwordgames.com">
    </iframe>"""

def request_blocker(fiddle_name):
    return """
<script>
var oldOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url) {
    if (/.*""" + fiddle_name + """.*/.test(url) || ((/.*http.*/.test(url) || /.*\/\/.*/.test(url)) && (url.indexOf(window.location.hostname) == -1))) {
        oldOpen.apply(this, arguments);
    }
    else {
        console.error("webfiddle doesn't support this type of request")
    }
}
</script>
"""


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

        # Use sha256 hash instead of mirrored url for the key name, since key
        # names can only be 500 bytes in length; URLs may be up to 2KB.
        key_name = get_url_key_name(mirrored_url)

        content = MirroredContent.get_by_key_name(key_name)
        if content is None:
            content = MirroredContent.fetch_and_store(key_name, base_url,
                                                      translated_address,
                                                      mirrored_url)
        if content is None:
            return self.error(404)

        for key, value in content.headers.iteritems():
            self.response.headers[key] = value
        if not DEBUG:
            self.response.headers["cache-control"] = \
                "max-age=%d" % EXPIRATION_DELTA_SECONDS


        # TODO rewrite data here
        if content.headers['content-type'].startswith('text/html'):
            request_blocked_data = re.sub('(?P<tag><head[\w\W]*?>)', '\g<tag>' + request_blocker(fiddle_name), content.data, 1)
            add_data = re.sub('(?P<tag><body[\w\W]*?>)', '\g<tag>' + add_code, request_blocked_data, 1)
            self.response.out.write(add_data)

            fiddle = Fiddle.byUrlKey(fiddle_name)
            self.response.out.write('<script id="webfiddle-js">' + fiddle.script + '</script>')
            self.response.out.write('<style id="webfiddle-css">' + fiddle.style + '</style>')

            self.response.out.write("""
<script>
    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date();
        a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m)
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

    ga('create', 'UA-57646272-1', 'auto');
    ga('require', 'displayfeatures');
    ga('send', 'pageview');

</script>"""
                                    +
                                    (big_add_code))
        else:
            self.response.out.write(content.data)

###############################################################################

app = webapp2.WSGIApplication([
                                  (r"/", HomeHandler),
                                  (r"/main", HomeHandler),
                                  (r"/([^/]+).*", MirrorHandler),
                                  (r"/warmup", WarmupHandler),
                              ], debug=DEBUG)
