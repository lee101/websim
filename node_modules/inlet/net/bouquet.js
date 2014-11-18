var cadence = require('cadence')
var http = require('http'), https = require('https')
var logger = require('../monitor/logger')('net.bouquet')

function Bouquet () {
    this._servers = []
}

Bouquet.prototype.start = cadence(function (step, object) {
    var protocol = require(object.binder.protocol.replace(/:$/, ''))
    var vargs = [ object.binder.tls, object.dispatch(object.binder) ]
    if (!vargs[0]) vargs.shift()
    var server = protocol.createServer.apply(protocol, vargs)
    server.listen(object.binder.port, step())
    this._servers.push(server)
    server.on('connection', function (socket) {
        logger.debug('connection', {
            endpoint: object.binder.location,
            socket: { address: socket.remoteAddress, port: socket.remotePort }
        })
    })
})

Bouquet.prototype.merge = function (bouquet) {
    this._servers.push.apply(this._servers, bouquet._servers)
    bouquet._servers.length = 0
}

Bouquet.prototype.stop = cadence(function (step) {
    step(function (server) {
        server.close(step())
    })(this._servers)
})

module.exports = Bouquet
