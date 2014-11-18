var cadence = require('cadence')
var url = require('url')
var ok = require('assert').ok
var assert = require('assert')
var logger = require('../monitor/logger')('http.ua')
var Binder = require('../net/binder')
var typer = require('media-typer')
var accum = require('accum')
var __slice = [].slice

function UserAgent (log) {
    this._log = arguments.length == 0 ? true : log
    this._tokens = {}
}

UserAgent.prototype.fetch = cadence(function (step) {
    var request = {
        options: { headers: {} }
    }
    __slice.call(arguments, 1).forEach(function (override) {
        if (override instanceof Binder) {
            override = { url: override.location, ca: (override.tls || {}).ca }
        }
        for (var key in override) {
            if (key == 'url') {
                if (request.options.url) {
                    request.options.url = url.resolve(request.options.url, override.url)
                } else {
                    request.options[key] = override[key]
                    request.baseUrl = url.parse(override.url)
                }
            } else if (key == 'headers') {
                for (var header in override.headers) {
                    request.options.headers[header.toLowerCase()] = override.headers[header]
                }
            } else if (/^(context|payload|grant|token|timeout)$/.test(key)) {
                request[key] = override[key]
            } else {
                request.options[key] = override[key]
            }
        }
    })
    if (!request.options.method) {
        request.options.method = request.payload ? 'POST' : 'GET'
    }
    if (request.options.method == 'POST' && !request.options.headers['content-type']) {
        request.options.headers['content-type'] = 'application/json'
    }
    request.options.headers['accept'] = 'application/json'
    request.url = url.parse(request.options.url)

    request.options.hostname = request.url.hostname
    request.options.port = request.url.port
    request.options.path = url.format({
        pathname: request.url.pathname,
        search: request.url.search,
        hash: request.url.hash
    })

    request.key = request.url.hostname + ':' + request.url.port

    if (request.grant == 'cc') {
        request.token = this._tokens[request.key]
    }

    step(function () {
        if (request.grant == 'cc' && !request.token) {
            assert.ok(request.baseUrl.auth)
            step(function () {
                this.fetch({
                    url: url.format(request.url),
                    ca: request.options.ca
                }, {
                    url: '/token',
                    headers: {
                        authorization: 'Basic ' + new Buffer(request.baseUrl.auth).toString('base64')
                    },
                    payload: {
                        grant_type: 'client_credentials'
                    }
                }, step())
            }, function (body, response) {
                if (body.token_type == 'Bearer' && body.access_token) {
                    request.token = this._tokens[request.key] = body.access_token
                }
            })
        } else {
            return [ null, { statusCode: 200 } ]
        }
    }, function (body, response) {
        if (Math.floor(response.statusCode / 100) != 2) return
        var http, options = {}
        if (request.token) {
            request.options.headers.authorization = 'Bearer ' + request.token
        }
        for (var key in request.options) {
            if (key == 'ca') {
                options[key] = true
            } else {
                options[key] = request.options[key]
            }
        }
        if (this._log) {
            logger.info('request', {
                url: request.url,
                options: options,
                sent: request.payload
            }, request.context || {})
        }
        if (request.url.protocol == 'https:') {
            http = require('https')
        } else {
            http = require('http')
        }
        http.globalAgent.maxSockets = 5000
        var payload = request.payload
        if (payload && !Buffer.isBuffer(payload)) {
            payload = new Buffer(JSON.stringify(payload))
        }
        if (payload) {
            request.options.headers['content-length'] = payload.length
        }
        var fetch = step([function () {
            var client = http.request(request.options, step(null))
                             .on('error', step(Error))
            if (payload) {
                client.write(payload)
            }
            if (request.timeout) {
                client.setTimeout(request.timeout, function () {
                    client.abort()
                })
            }
            client.end()
        }, function (errors, error) {
            var body = new Buffer(JSON.stringify({ message: error.message, errno: error.code }))
            var response = {
                statusCode: 599,
                errno: error.code,
                okay: false,
                headers: {
                    'content-length': body.length,
                    'content-type': 'application/json'
                }
            }
            if (this._log) {
                logger.info('response', {
                    status: 'exceptional',
                    options: options,
                    sent: request.payload,
                    received: JSON.parse(body.toString()),
                    statusCode: response.statusCode,
                    headers: response.headers
                }, request.context || {})
            }
            return [ fetch, JSON.parse(body.toString()), response, body ]
        }], function (response) {
            step(function () {
                response.pipe(accum(step(null)))
            }, function (body) {
                var parsed = body
                var display = null
                var type = typer.parse(response.headers['content-type'] || 'application/octet-stream')
                switch (type.type + '/' + type.subtype) {
                case 'application/json':
                    display = parsed = JSON.parse(body)
                    break
                case 'text/html':
                case 'text/plain':
                    display = body.toString()
                    break
                }
                response.okay = Math.floor(response.statusCode / 100) == 2
                if (this._log) {
                    logger.info('response', {
                        status: 'responded',
                        options: options,
                        sent: request.payload,
                        received: display,
                        statusCode: response.statusCode,
                        headers: response.headers
                    }, request.context || {})
                }
                return [ parsed, response, body ]
            })
        })(1)
    })
})

module.exports = UserAgent
