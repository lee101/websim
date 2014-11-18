require('proof')(module, require('cadence')(function (step, body, assert) {
    require('../monitor/logger').hush = true
    var exec = require('child_process').exec
    step(function () {
        exec('make -C t/fixtures/certs', step())
    }, function () {
        body(assert, step())
    })
}))
