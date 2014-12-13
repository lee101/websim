import logging

from google.appengine.ext import ndb

from google.appengine.api import memcache

import fixtures


class BaseModel(ndb.Model):
    def default(self, o): return o.to_dict()


class Fiddle(BaseModel):
    id = ndb.StringProperty(required=True)

    script = ndb.StringProperty()
    style = ndb.StringProperty()

    script_language = ndb.IntegerProperty()
    style_language = ndb.IntegerProperty()

    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)

    title = ndb.StringProperty()
    description = ndb.StringProperty()

    start_url = ndb.StringProperty()

    @classmethod
    def byId(cls, id):
        return cls.query(cls.id == id).get()


    @classmethod
    def byUrlKey(cls, urlkey):
        if urlkey.endswith('d8c4vu'):
            return default_fiddle
        else:

            urlkey_last_dash_pos = urlkey.rfind('-')
            id = urlkey[urlkey_last_dash_pos + 1:]

            fiddle = memcache.get(id)
            if fiddle:
                return fiddle
            fiddle = cls.query(cls.id == id).get()
            if fiddle:
                if not memcache.add(id, fiddle, time=3600):
                    logging.error('memcache.add failed: key_name = "%s", '
                                  'original_url = "%s"', id, fiddle)
            return fiddle


default_fiddle = Fiddle()
default_fiddle.id = 'd8c4vu'
default_fiddle.style = 'body {\n' \
                       '    background-color: skyblue;\n' \
                       '}\n'

default_fiddle.script = "// replace the first image we see with a cat\n" \
                        "document.images[0].src = 'http://thecatapi.com/api/images/get?format=src&type=gif';\n\n" \
                        "// replace the google logo with a cat\n" \
                        "document.getElementById('lga').innerHTML = '<a href=\"http://thecatapi.com\">" \
                        "<img src=\"http://thecatapi.com/api/images/get?format=src&type=gif\"></a>';\n"

default_fiddle.style_language = fixtures.STYLE_TYPES['css']
default_fiddle.script_language = fixtures.SCRIPT_TYPES['js']
default_fiddle.title = 'cats'
default_fiddle.description = 'cats via the cat api'
default_fiddle.start_url = 'www.google.com'
