var connect = require('connect'),
    url = require('url'),
    Binder = require('../net/binder'),
    bodyParser = require('body-parser'),
    getRawBody = require('raw-body'),
    typer = require('media-typer'),
    errorHandler = require('errorhandler'),
    assert = require('assert')

function Psuedo (binder) {
    assert(binder, 'binder is required')
    this.binder = binder
    this._responses = []
    this._received = []
}

Psuedo.prototype.dispatch = function () {
    return connect()
        .use(bodyParser.json())
        .use(function (req, res, next) {
            if (!req.headers['content-type']) return next()
            var type = typer.parse(req.headers['content-type'])
            if (type.type + '/' + type.subtype != 'application/json') {
                getRawBody(req, {
                    length: req.headers['content-length'],
                    limit: '1mb',
                    encoding: type.parameters.charset
                }, function (err, string) {
                    if (err) return next(err)
                    req.body = string.toString()
                    next()
                })
            } else {
                next()
            }
        })
        .use(function (request, response) {
            var headers = {}, received
            for (var header in request.headers) {
                headers[header] = request.headers[header]
            }
            this._received.push(received = {
                method: request.method,
                headers: headers,
                url: request.url,
                body: request.body
            })
            if (this.trace) {
                console.log(require('util').inspect(received, null, Infinity))
            }
            var data = this._responses.shift() || {}
            data.statusCode || (data.statusCode = 200)
            data.headers || (data.headers = { 'content-type': 'application/json' })
            data.payload || (data.payload = { 'message': 'Hello, World!' })
            if (data.headers['content-type'] == 'application/json') {
                data.payload = JSON.stringify(data.payload) + '\n'
            }
            var buffer = new Buffer(data.payload)
            data.headers['content-length'] = buffer.length
            setTimeout(function () {
                response.writeHeader(data.statusCode, data.headers)
                response.end(data.payload)
            }, data.delay || 0)
        }.bind(this))
        .use(errorHandler())
}

Psuedo.prototype.push = function (response) {
    this._responses.push(response)
}

Psuedo.prototype.shift = function () {
    return this._received.shift()
}

Psuedo.prototype.clear = function () {
    this._received.length = 0
}

module.exports = Psuedo
