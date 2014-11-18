var proof = require('proof'),
    cadence = require('cadence'),
    logger = require('inlet/monitor/logger'),
    Pseudo = require('inlet/http/pseudo'),
    Binder = require('inlet/net/binder'),
    Bouquet = require('inlet/net/bouquet'),
    UserAgent = require('inlet/http/ua'),
    WorkerBee = require('../../index.js')

proof(3, cadence(function(async, assert) {
    var binder = new Binder('http://127.0.0.1:3000'),
        bee = new WorkerBee(binder),
        bouquet = new Bouquet(),
        ua = new UserAgent()

    logger.hush = true

    async(function() {
        bouquet.start(bee, async())
    }, function() {
        ua.fetch(bee.binder, { url: '/' }, async())
    }, function(body) {
        assert(body.toString(), 'Hello from WorkerBee', 'workerbee root endpoint')

        ua.fetch({ url: 'https://api.github.com/repos/bigeasy/inlet/readme', headers: { 'User-Agent': 'WorkerBee' } }, async())
    }, function(body, response) {
        assert(response.statusCode, 200, 'readme response status')
        assert(body.name, 'README.md', 'readme name')
    }, function() {
      bouquet.stop(async())
    })
}))
