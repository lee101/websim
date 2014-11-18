require('../proof')(10, require('cadence')(function (step, assert) {
    var middleware = require('../../http/middleware')
    var Authenticator = require('../../http/authenticator'),
        Bouquet = require('../../net/bouquet'),
        Binder = require('../../net/binder'),
        UserAgent = require('../../http/ua'),
        pems = require('../../http/pems')

    var bouquet = new Bouquet,
        ua = new UserAgent

    function Service () {
    }

    Service.prototype.dispatch = function () {
        var authenticator = new Authenticator(this.binder)
        var authorize = authenticator.authorize
        return middleware.dispatch(this.binder, {
            'GET /guarded': middleware.authorize(authorize, this.guarded.bind(this)),
            'POST /token': middleware.handle(authenticator.tokenize)
        }, null, {
            addCustomParameter:   function (name, value) {},
            noticeError:          function (err)         {},
            createWebTransaction: function (url, handle) { return handle },
            endTransaction:       function ()            {}
        }, 'testing')
    }

    Service.prototype.guarded = function (request, callback) {
        callback(null, { a: 1 })
    }

    var service = new Service
    var binder = service.binder = new Binder('https://a:z@127.0.0.1:7779', pems)

    step(function () {
        bouquet.start(service, step())
    }, function () {
        ua.fetch(binder, {
            url: '/guarded'
        }, step())
    }, function (body, response) {
        assert(response.statusCode, 401, 'no token status')
        assert(body, { message: 'Forbidden' }, 'no token body')
        ua.fetch(binder, {
            url: '/guarded',
            token: 'x'
        }, step())
    }, function (body, response) {
        assert(response.statusCode, 401, 'bad token status')
        assert(body, { message: 'Forbidden' }, 'bad token body')
        ua.fetch({
            url: 'https://z:a@127.0.0.1:7779/token',
            ca: pems.ca,
            payload: {}
        }, step())
    }, function (body, response) {
        assert(response.statusCode, 401, 'bad token status')
        assert(body, { message: 'Forbidden' }, 'bad token body')
        ua.fetch({
            url: 'https://z:a@127.0.0.1:7779/guarded',
            ca: pems.ca,
            grant: 'cc'
        }, step())
    }, function (body, response) {
        assert(response.statusCode, 401, 'bad token status')
        assert(body, { message: 'Forbidden' }, 'bad token body')
        ua.fetch(binder, {
            url: '/guarded',
            grant: 'cc'
        }, step())
    }, function (body, response) {
        assert(response.statusCode, 200, 'allowed status')
        assert(body, { a: 1 }, 'allowed body')
        bouquet.stop(step())
    })
}))
