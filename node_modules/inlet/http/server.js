var url = require('url')
var restify = require('restify')
var cadence = require('cadence')
var crypto = require('crypto')
var uuid = require('node-uuid')
var fs = require('fs')
var logger = require('../monitor/logger')('http.server')

function handle (object, authenticator, options) {
    var authorize = options.open ? (function (request, callback) {
        object[options.method](request.body, request, callback)
    }) : cadence(function (step, request) {
        step(function () {
            if (request.authorization && request.authorization.scheme == 'Bearer') {
                authenticator.authenticate(request.authorization.credentials, request, step())
            } else {
                return null
            }
        }, function (id) {
            if (id || options.unauthorized) {
                object[options.method](request.body, id, request, step())
            } else {
                return function (response) {
                    response.header('WWW-Authenticate', 'Bearer realm="Wink"')
                    response.send(401, 'Forbidden')
                }
            }
        })
    })
    var handler = cadence(function (step, request, response) {
        step(function () {
            authorize(request, step())
        }, function (body) {
            if (typeof body == 'function') {
                body(response, request)
            } else {
                response.contentType = options.contentType || 'application/json'
                response.send(body)
            }
        })
    })
    return function (request, response) {
        handler(request, response, function (error) {
            if (error) {
                logger.error('error', {
                    headers: request.headers,
                    body: request.body,
                    message: error.message,
                    stack: error.stack
                })
                throw error
            }
        })
    }
}

function Authenticator (binder) {
    this._binder = binder
    // TODO: FIXME: Expire.
    this._tokens = {}
}

Authenticator.prototype.token = cadence(function (step, body, request) {
    step(function () {
        var auth = new Buffer(this._binder.auth).toString('base64')
        return request.authorization.credentials == auth
    }, function (success) {
        if (success) {
            step(function () {
                crypto.randomBytes(16, step())
            }, function (bytes) {
    // FIXME: Put an error here and t/agent/publisher test will swallow it.
                var accessToken = uuid.v4(bytes)
                this._tokens[accessToken] = true
                return { token_type: 'Bearer', access_token: accessToken }
            })
        } else {
            return function (response) {
                response.send(401, 'Forbidden')
            }
        }
    })
})

Authenticator.prototype.authenticate = cadence(function (step, token) {
    return this._tokens[token]
})

exports.createOAuth2Server = cadence(function (step, options) {
    'use strict'

    // NB: we're using [HAL](http://stateless.co/hal_specification.html) here to
    // communicate RESTful links among our resources, but you could use any JSON
    // linking format, or XML, or even just Link headers.

    var configuration = {
        name: 'Wink Server',
        version: require('../package.json').version,
        formatters: {}
    }

    options.server.forEach(function (options) {
        for (var key in options) {
            configuration[key] = options[key]
        }
    })

    if (options.binder.tls) {
        configuration.key = options.binder.tls.key
        configuration.certificate = options.binder.tls.cert
    }

    var server = restify.createServer(configuration)

    server.use(restify.authorizationParser())
    server.use(restify.bodyParser({ mapParams: false }))

    var hooks = options.authenticator
    if (!hooks) {
        hooks = new Authenticator(options.binder)
    }

    server.get('/health', function (request, response) {
        var body = {"message": "Server is healthy."}
        response.send(body)
    })

    for (var name in options.actions) {
        var action = options.actions[name]
        action.method || (action.method = name)
        action.methods.split(/\s+/).forEach(function (method) {
            server[method]('/' + name, handle(options.object, hooks, action))
        })
    }
    if (!options.actions.token) {
        server.post('/token', handle(hooks, null, { method: 'token', open: true }))
    }

    server.get('/', handle({
        index: cadence(function (step, body, id) { return {} })
    }, hooks, { method: 'index', unauthorized: true }))

    server.on('connection', function (socket) {
        logger.debug('connection', { socket: {
            address: socket.remoteAddress, port: socket.remotePort
        } })
    })

    options.bouquet.start(server, options.binder, step())
})
