#!/usr/bin/env python
import json

import os

import webapp2
import jinja2
import fixtures

from mirror.mirror import MirrorHandler
from models import Fiddle


config = {}
config['webapp2_extras.sessions'] = dict(secret_key='93986c9cdd240540f70efaea56a9e3f2')

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'])


class BaseHandler(webapp2.RequestHandler):
    def render(self, view_name, extraParams={}):
        template_values = {
            'json': json,
            'fixtures': fixtures,
        }
        template_values.update(extraParams)

        template = JINJA_ENVIRONMENT.get_template(view_name)
        self.response.write(template.render(template_values))


class MainHandler(BaseHandler):
    def get(self):
        self.render('templates/index.jinja2', {
            'fiddle': None
        })


class WarmupHandler(BaseHandler):
    def get(self):
        pass


class CreateFiddleHandler(webapp2.RequestHandler):
    def get(self):
        fiddle = Fiddle()
        fiddle.start_url = self.request.get('start_url')
        fiddle.title = self.request.get('title')
        fiddle.description = self.request.get('description')

        fiddle.script = self.request.get('script')
        fiddle.style = self.request.get('style')

        fiddle.script_language = fixtures.SCRIPT_TYPES[self.request.get('script_language')]
        fiddle.style_language = fixtures.STYLE_TYPES[self.request.get('style_language')]

        self.response.write('success')


class GetFiddleHandler(BaseHandler):
    def get(self, fiddlekey):
        current_fiddle = Fiddle.byUrlKey(fiddlekey)
        self.render('templates/index.jinja2', {
            'fiddle': current_fiddle
        })


class SitemapHandler(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/xml'
        template = JINJA_ENVIRONMENT.get_template('sitemap.xml')
        self.response.write(template.render(template))


class SlashMurdererApp(webapp2.RequestHandler):
    def get(self, url):
        self.redirect(url)



app = webapp2.WSGIApplication([
                                  ('/', MainHandler),
                                  ('/_ah/warmup', WarmupHandler),
                                  ('(.*)/$', SlashMurdererApp),
                                  (r"/createfiddle", CreateFiddleHandler),
                                  (r"/(.*)/([^/]+).*", MirrorHandler),
                                  (r"/(.*)", GetFiddleHandler),


                              ], debug=True)
