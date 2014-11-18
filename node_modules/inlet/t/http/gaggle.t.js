require('proof')(13, require('cadence')(function (step, assert) {
    var cadence = require('cadence'),
        Gaggle = require('../../http/gaggle'),
        UserAgent = require('../../http/ua')

    var ua = new UserAgent

    function Goose (token) {
        this.id = ++Goose._id
        this.token = token
    }
    Goose._id = 0
    Goose.prototype.connect = cadence(function () {
        return { id: this.id }
    })
    Goose.prototype.inspect = function () {
        return { id: this.id, token: this.token }
    }
    Goose.prototype.honk = cadence(function () {
        return { honked: true }
    })
    Goose.prototype.nil = cadence(function () {
        return null
    })
    Goose.prototype.abend = cadence(function () {
        throw new Error('abend')
    })

    var Gaggle = require('../../http/gaggle'),
        gaggle = new Gaggle(Goose, 'z'),
        server = gaggle.createServer(),
        session = { url: 'http://127.0.0.1:7776' }

    assert(Gaggle, 'require')

    assert(Gaggle.order(10, 1), 1, 'number greater than')
    assert(Gaggle.order(1, 10), -1, 'number less than')
    assert(Gaggle.order(10, 10), 0, 'number equal')
    assert(Gaggle.order('a', 'a'), 0, 'string equal')
    assert(Gaggle.order('a', 'b'), -1, 'string less than')
    assert(Gaggle.order('b', 'a'), 1, 'string greater than')

    step(function () {
        server.listen(7776, step())
    }, function () {
        ua.fetch(session, { url: '/connect' }, step())
    }, function (body, response) {
        assert(body, { id: 1 }, 'connect')
        ua.fetch(session, { url: '/list' }, step())
    }, function (body, response) {
        assert(body, [{ id: 1, token: 'z' }], 'list')
        ua.fetch(session, { url: '/1/honk' }, step())
    }, function (body, response) {
        assert(body, { honked: true }, 'honk')
        ua.fetch(session, { url: '/1/nil' }, step())
    }, function (body, response) {
        assert(body, {}, 'honk')
        ua.fetch(session, { url: '/1/quack' }, step())
    }, function (body, response) {
        assert(response.statusCode, 404, '404')
        ua.fetch(session, { url: '/1/abend' }, step())
    }, function (body, response) {
        assert(response.statusCode, 500, '500')
        server.close(step())
    })
}))
