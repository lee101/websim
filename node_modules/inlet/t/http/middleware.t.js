require('proof')(5, require('cadence')(function (step, assert) {
    var middleware = require('../../http/middleware'), request
    request = { headers: { authorization: 'Other x y' } }
    middleware.authorizationParser(request, {}, function () {})
    assert(!request.authorization, 'bad format')

    request.headers.authorization = 'Other x'
    middleware.authorizationParser(request, {}, function () {})
    assert(request.authorization.scheme, 'Other', 'scheme')

    request.headers.authorization = 'Bearer 0'
    middleware.authorizationParser(request, {}, function () {})
    assert(request.authorization.credentials, '0', 'has credentials')

    middleware.handle(function (request, callback) {
        callback(new Error('error'))
    })({}, {}, function (error) {
        assert(error.message, 'error', 'unexpected error')
    })

    middleware.handle(function (request, callback) {
        callback(null, function () {
            assert(1, 'proxied')
        })
    })({}, {}, function () {})
}))
