var processes = require('child_process')
var cadence = require('cadence')
var turnstile = require('turnstile')
var logger = require('../monitor/logger')('monitor.run')
var Sender = require('./ship')
var tee = require('./tee')

module.exports = cadence(function (step, io, file, loggly, tags, config) {
    var child, killed, terminal = null
    var sender = new Sender(loggly)
    var stdout = []

    function terminated (error) {
        if (!killed) {
            killed = true
            if (error instanceof Error) {
                terminal = error
            }
            if (child) {
                child.kill()
            }
        }
    }

    process.on('SIGINT', terminated)
    process.on('SIGTERM', terminated)
    process.on('exit', terminated)

    send = turnstile(function () {
        return stdout.splice(0, stdout.length)
    }, cadence(function (step, lines) {
        step([function () {
            sender.send(true, tags, lines.join('\n') + '\n', step())
        }, /^ECONNREFUSED$/, function () {
            return [ null, { statusCode: 500 } ]
        }], function (body, response) {
            if (Math.floor(response.statusCode / 100) != 2) {
                if (lines.length < 2048) { // <- todo: configure?
                    stdout.unshift.apply(stdout, lines)
                } else {
                    console.log('loggly failing')
                }
            }
        })
    }), function (error) {
        if (error) terminated(error)
    })

    step(function () {
        var stderr = []
        var context = {
            file: file,
            loggly: {
                url: loggly,
                tags: tags
            }
        }
        step(function () {
            logger.info('start', context)
            child = processes.spawn('node', [ '--max_old_space_size=8912', '--nouse_idle_notification', file ])
            child.stdout.pipe(tee(io.stdout, function (lines) {
                stdout.push.apply(stdout, lines)
                send()
            }))
            child.stderr.pipe(tee(io.stderr, function (lines) {
                stderr.push.apply(stderr, lines)
            }))
            child.stdin.write(JSON.stringify(config))
            child.stdin.end()
            child.on('close', step(-1))
        }, function (code, signal) {
            child = null
            logger.info('shutdown', context, {
                code: code, signal: signal
            })
        }, function () {
            send(step())
            if (stderr.length) {
                sender.send(false, tags, stderr.join('\n') + '\n', step())
            }
        })
    }) /* , function () {
        if (killed) step(terminal)
        else setTimeout(step(), 1000)
    })() */
})
