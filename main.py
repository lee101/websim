#!/usr/bin/env python

import os
import webapp2
import jinja2

config = {}
config['webapp2_extras.sessions'] = dict(secret_key='93986c9cdd240540f70efaea56a9e3f2')

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'])


class BaseHandler(webapp2.RequestHandler):
    def render(self, view_name, extraParams={}):
        template_values = {
        }
        template_values.update(extraParams)

        template = JINJA_ENVIRONMENT.get_template(view_name)
        self.response.write(template.render(template_values))


class MainHandler(BaseHandler):
    def get(self):
        self.render('templates/index.jinja2', {})


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
    ('(.*)/$', SlashMurdererApp),

                              ], debug=True)
