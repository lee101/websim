var cadence = require('cadence'),
    Binder = require('inlet/net/binder'),
    middleware = require('inlet/http/middleware'),
    binder = new Binder('127.0.0.1:3000')

function WorkerBee(binder) {
    this.binder = binder
}

WorkerBee.prototype.dispatch = function() {
    return middleware.dispatch(this.binder, {
        'GET /': middleware.handle(this.index.bind(this))
    })
}

WorkerBee.prototype.index = cadence(function() {
  return 'Hello from WorkerBee'
})

module.exports = WorkerBee
