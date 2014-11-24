from google.appengine.ext import ndb
import json


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

        urlkey_last_dash_pos = urlkey.rfind('-')
        if urlkey_last_dash_pos == -1:
            urlkey_last_dash_pos = 0
        id = urlkey[urlkey_last_dash_pos:]
        return cls.query(cls.id == id).get()
