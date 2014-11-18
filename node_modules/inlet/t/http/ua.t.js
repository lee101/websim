require('../proof')(29, require('cadence')(function (step, assert) {
    var Pseudo = require('../../http/pseudo'),
        UserAgent = require('../../http/ua'),
        Bouquet = require('../../net/bouquet'),
        Binder = require('../../net/binder'),
        pems = require('../../http/pems')

    var pseudo = new Pseudo(new Binder('http://127.0.0.1:7779')),
        bouquet = new Bouquet,
        ua = new UserAgent

    step(function () {
        bouquet.start(pseudo, step())
    }, function () {
        ua.fetch({
            url: 'http://127.0.0.1:9999/here',
        }, step())
    }, function (body, response) {
        assert(response.statusCode, 599, 'refused status')
        assert(response.errno, 'ECONNREFUSED', 'refused errno')
        assert(body, { message: 'connect ECONNREFUSED', errno: 'ECONNREFUSED' }, 'refused body')
        ua.fetch({
            url: 'http://127.0.0.1:9999/here',
        }, step())
    }, function (body, response, buffer) {
        assert(response.statusCode, 599, 'unparsed refused status')
        assert(response.errno, 'ECONNREFUSED', 'unparsed refused errno')
        assert(buffer.toString(),
            JSON.stringify({ message: 'connect ECONNREFUSED', errno: 'ECONNREFUSED' }), 'unparsed refused body')
        ua.fetch({
            grant: 'cc',
            url: 'http://a:z@127.0.0.1:9999/here',
        }, step())
    }, function (body, response, buffer) {
        assert(response.statusCode, 599, 'unparsed refused cc status')
        assert(response.errno, 'ECONNREFUSED', 'unparsed refused cc errno')
        assert(buffer.toString(), JSON.stringify({
            message: 'connect ECONNREFUSED',
            errno: 'ECONNREFUSED'
        }), 'unparsed refused cc body')
        pseudo.push({ delay: 1000 })
        ua.fetch({
            url: 'http://127.0.0.1:7779/here',
            timeout: 250
        }, step())
    }, function (body, response) {
        assert(response.statusCode, 599, 'timeout status')
        assert(response.errno, 'ECONNRESET', 'timeout errno')
        assert(body, { message: 'socket hang up', errno: 'ECONNRESET' }, 'timeout body')
        pseudo.clear()
        ua.fetch({
            url: 'http://127.0.0.1:7779/here'
        }, {
            method: 'GET',
            url: '/there?1'
        }, step())
    }, function () {
        assert(pseudo.shift(), {
            method: 'GET',
            headers: {
                accept: 'application/json',
                host: '127.0.0.1:7779',
                connection: 'keep-alive'
            },
            url: '/there?1',
            body: {}
        }, 'get')
        pseudo.push({ payload: {} })
        ua.fetch({
            url: 'http://127.0.0.1:7779/here'
        }, {
            method: 'GET',
            url: '/there'
        }, step())
    }, function (body, response, buffer) {
        assert(buffer.toString(), '{}\n', 'unparsed')
    }, function () {
        pseudo.clear()
        ua.fetch({
            url: 'http://127.0.0.1:7779/here'
        }, {
            url: '/there',
            payload: { a: 1 }
        }, {
            headers: {
                greeting: 'Hello, World!'
            }
        }, step())
    }, function () {
        assert(pseudo.shift(), {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'content-length': '7',
                accept: 'application/json',
                host: '127.0.0.1:7779',
                greeting: 'Hello, World!',
                connection: 'keep-alive'
            },
            url: '/there',
            body: { a: 1 }
        }, 'post')
        pseudo.push({
            headers: {},
            payload: 'Hello, World!'
        })
        ua.fetch({
            url: 'http://127.0.0.1:7779/here'
        }, {
            method: 'GET',
            url: '/there'
        }, step())
    }, function () {
        assert(pseudo.shift().headers['content-type'] == null, 'null content-type')
        pseudo.push({
            statusCode: 200,
            headers: {
                'content-type': 'text/plain'
            },
            payload: 'Hello, World!'
        })
        ua.fetch({ url: 'http://127.0.0.1:7779' }, step())
    }, function (body, response) {
        assert(body.toString(), 'Hello, World!', 'text')
        assert(response.headers['content-type'], 'text/plain', 'text content-type')
        pseudo.push({
            statusCode: 200,
            headers: {
                'content-type': 'text/html'
            },
            payload: 'Hello, World!'
        })
        ua.fetch({ url: 'http://127.0.0.1:7779' }, step())
    }, function (body, response) {
        assert(body.toString(), 'Hello, World!', 'html')
        assert(response.headers['content-type'], 'text/html', 'html content-type')
        pseudo.push({
            statusCode: 200,
            headers: {
                'content-type': 'application/octet-stream'
            },
            payload: 'Hello, World!'
        })
        ua.fetch({ url: 'http://127.0.0.1:7779' }, step())
    }, function (body, response) {
        assert(body.toString(), 'Hello, World!', 'unknown')
        assert(response.headers['content-type'], 'application/octet-stream', 'unknown content-type')
        pseudo.push({ statusCode: 401 })
        ua.fetch({
            url: 'http://a:z@127.0.0.1:7779/here'
        }, {
            grant: 'cc',
            url: '/there',
        }, step())
    }, function (body, response) {
        assert(response.statusCode, 401, 'bad authentication')
        pseudo.clear()
        pseudo.push({
            payload: {
                token_type: 'Bearer',
                access_token: 'x'
            }
        })
        ua.fetch({
            url: 'http://a:z@127.0.0.1:7779/here'
        }, {
            grant: 'cc',
            url: '/there',
        }, step())
    }, function (body, response) {
        assert(response.statusCode, 200, 'good authentication')
        assert(pseudo.shift(), {
            method: 'POST',
            headers: {
                authorization: 'Basic YTp6',
                'content-type': 'application/json',
                accept: 'application/json',
                'content-length': '35',
                host: '127.0.0.1:7779',
                connection: 'keep-alive'
            },
            url: '/token',
            body: { grant_type: 'client_credentials' }
        }, 'token request')
        assert(pseudo.shift(), {
            method: 'GET',
            headers: {
                accept: 'application/json',
                authorization: 'Bearer x',
                host: '127.0.0.1:7779',
                connection: 'keep-alive'
            },
            url: '/there',
            body: {}
        }, 'request with token')
    }, function () {
        bouquet.stop(step())
    }, function () {
// SSL!
        bouquet = new Bouquet
        pseudo = new Pseudo(new Binder('http://127.0.0.1:7779', pems))
        bouquet.start(pseudo, step())
    }, function () {
        ua.fetch(pseudo.binder, step())
    }, function (body, response) {
        assert(response.statusCode, 200, 'https code')
        assert(body, { message: 'Hello, World!' }, 'https body')
        ua.fetch({ url: 'https://www.google.com/' }, step())
    }, function (body, response) {
        assert(response.statusCode, 200, 'https fetch without pinned CA')
        bouquet.stop(step())
    })
}))
