require('../proof')(1, require('cadence')(function (step, assert) {
    var stream = require('stream')
    var Pseudo = require('../../http/pseudo'),
        UserAgent = require('../../http/ua'),
        Binder = require('../../net/binder'),
        Bouquet = require('../../net/bouquet'),
        pems = require('../../http/pems')
    var pseudo = new Pseudo(new Binder('https://127.0.0.1:8080', pems)),
        bouquet = new Bouquet,
        ua = new UserAgent
    step(function () {
        bouquet.start(pseudo, step())
    }, function () {
        ua.fetch(pseudo.binder, {
            url: '/test',
            headers: {
                'content-type': 'text/plain'
            },
            payload: new Buffer(1024 * 1024 * 4)
        }, step())
    }, function (body, response) {
        assert(response.statusCode, 413, 'errored')
    }, function () {
        bouquet.stop(step())
    })
}))
