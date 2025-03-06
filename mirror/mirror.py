import hashlib
import logging
import os
import urllib.parse
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Request, Response, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates

from loguru import logger

from mirror.ai_wrapper import generate_with_claude
from models import CacheKey, Fiddle, default_fiddle

mirror_router = APIRouter()

templates = Jinja2Templates(directory=".")

DEBUG = False
EXPIRATION_DELTA_SECONDS = 3600 * 24 * 30

HTTP_PREFIX = "http://"

IGNORE_HEADERS = frozenset([
    "set-cookie",
    "expires",
    "cache-control",
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

_cache = {}

def get_url_key_name(url):
    url_hash = hashlib.sha256()
    url_hash.update(url.encode('utf-8'))
    return "hash_" + url_hash.hexdigest()

class MirroredContent:
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
        _cache[key_name] = content
        cache_key = CacheKey(lookup_key=key_name, value=content)
        CacheKey.save(cache_key)

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

def find_text_between_including(content, start_text, end_text):
    start_index = content.find(start_text)
    if start_index == -1:
        return None
    
    end_index = content.find(end_text, start_index)
    if end_index == -1:
        return None
        
    end_index += len(end_text)
    return content[start_index:end_index]

@mirror_router.get("/{fiddle_name}/{base_url:path}", response_class=HTMLResponse)
async def mirror_handler(request: Request, fiddle_name: str, base_url: str):
    if fiddle_name.rfind('-') == -1:
        raise HTTPException(status_code=500, detail="Invalid fiddle name")

    logger.info(f"base_url: {base_url}")

    base_url = fiddle_name + '/' + base_url

    translated_address = request.url.path[1:]  # remove leading /
    if translated_address.endswith('favicon.ico'):
        return RedirectResponse(url='/favicon.ico')
    translated_address = translated_address[translated_address.index('/') + 1:]
    mirrored_url = HTTP_PREFIX + translated_address

    fiddle = Fiddle.byUrlKey(fiddle_name)
    if not fiddle:
        fiddle = default_fiddle
        
    fiddle_title = fiddle.title if fiddle else ''
    fiddle_description = fiddle.description if fiddle else ''

    key_name = get_url_key_name(mirrored_url)

    content = MirroredContent.get_by_key_name(key_name)
    body = content
    if content is None:
        content = generate_with_claude(f"""{mirrored_url}
{fiddle_title}
{fiddle_description}
Working on this, please provide the full comprehensive html for everything i should put in the body tag - everything using tailwind/inline scripts
Dont describe the html, just give me the full html only
""", "<body")
        content = "<body " + content
        body = find_text_between_including(content, "<body", "</body>")
        if not body:
            body = content
    
    if body is None:
        raise HTTPException(status_code=404, detail="Content not found")
    if body:
        MirroredContent.save(key_name, body)

    response = templates.TemplateResponse("templates/genpage.jinja2", {
        "request": request,
        "fiddle": fiddle,
        "title": fiddle_title,
        "description": fiddle_description,
        "body": body,
        "request_blocker": request_blocker(fiddle_name),
        "add_code": "",
    })

    if not DEBUG:
        response.headers["cache-control"] = f"max-age={EXPIRATION_DELTA_SECONDS}"

    return response
