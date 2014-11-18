var connect = require('connect'),
    cadence = require('cadence'),
    quip = require('quip'),
    dispatch = require('dispatch'),
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler'),
    logger = require('../monitor/logger')('http.middleware')

function HTTPError (code, message, headers) {
    this.code = code
    this.message = message
    this.headers = headers || {}
}

var newrelic

exports.dispatch = function (binder, structure, remote, nr, prefix) {
    if (!binder) throw new Error
    newrelic = nr
    if (!!nr) structure = reliquary(prefix, structure)
    return connect()
        .use(function (request, response, next) {
            request.binder = binder
            request.context = {
                endpoint: binder.location,
                socket: {
                    address: request.socket.remoteAddress,
                    port: request.socket.remotePort
                }
            }
            if (remote) {
                request.context.remote = {
                    address: request.headers['x-forwarded-for'] || request.socket.remoteAddress,
                    port: request.headers['x-forwarded-port'] || request.socket.remotePort
                }
            }
            logger.info('request', {
                headers: request.headers
            }, request.context)
            next()
        })
        .use(authorizationParser)
        .use(quip)
        .use(jump)
        .use(bodyParser.json())
        .use(dispatch(structure))
        .use(function (request, response, next) {
            response.status(404).json({ message: 'Not found' })
        })
        .use(errorHandler())
}

function reliquary(prefix, structure) {
    var result = {}

    var callback = function(prop) {
        return function(request, next) {
            var err, m, method

            m = prop.indexOf(' ')
            method = m > 0 ? prop.substr(0, m) : prop
            newrelic.addCustomParameter('method', method)
            try {
                structure[prop](request, next)
            } catch(ex) {
                newrelic.noticeError(ex, {})
                err = ex
            }
            newrelic.endTransaction()
            if (!!err) throw(err)
        }
    }

    for (var prop in structure) if (structure.hasOwnProperty(prop)) {
        var p, path

        p = prop.indexOf('/')
        path = p !== -1 ? prop.substr(p + 1) : prop
        if (!!prefix) path = prefix + '/' + path
        result[prop] = newrelic.createWebTransaction(path, callback(prop))
    }

    return result
}

var jump = exports.jump = function (request, response, next) {
    request.raise = function (code, message, headers) {
        throw new HTTPError(code, message, headers)
    }
    next()
}

var authorizationParser = exports.authorizationParser = function (request, response, next) {
    if (request.headers.authorization) {
        var auth = request.headers.authorization.split(' ')
        if (auth.length == 2) {
            request.authorization = { scheme: auth[0], credentials: auth[1] }
        }
    }
    next()
}

var handle = exports.handle = function (handler) {
    return function (request, response, next) {
        handler(request, function (error, result) {
            if (error) {
                if (!!newrelic) newrelic.noticeError(error, {})

                if (error instanceof HTTPError) {
                    response.status(error.code).headers(error.headers).json({ message: error.message })
                } else if (!next) {
                    logger.error('error', { message: error.message, stack: error.stack })
                } else {
                    next(error)
                }
            } else {
                switch (typeof result) {
                case 'function':
                    result(response)
                    break
                case 'string':
                    response.ok().text(result)
                    break
                default:
                    response.ok().json(result)
                    break
                }
            }
        })
    }
}

exports.authorize = function (authorizer, handler) {
    return handle(cadence(function (step, request) {
        step(function () {
            authorizer(request, step())
        }, function (identity) {
            if (identity) {
                request.authorization.identity = identity
                handler(request, step())
            } else {
                request.raise(401, 'Forbidden')
            }
        })
    }))
}

exports.send = function (statusCode, headers, body) {
    return function (response) {
        var h = {
            'content-type': headers['content-type'],
            'content-length': body.length
        }
        logger.info('send', {
            statusCode: statusCode,
            headers: h,
            body: JSON.parse(body.toString())
        })
        response.status(statusCode).headers(h)
        response.write(body)
        response.end()
    }
}

exports.isBearer = function (request) {
    return request.authorization && request.authorization.scheme == 'Bearer'
}
