var slice = [].slice
var number = 0
var base = 0
var filters = {}

var cadence = require('cadence')
var Staccato = require('staccato')

function Queue () {
    this.entries = []
    this.out = new Staccato(process.stdout, false)
    this.interval = 5
}

Queue.prototype.setOutput = function (out) {
    this.out = new Staccato(out, false)
}

Queue.prototype.pump = cadence(function (async) {
    this._shutdown = false

    var previous = Math.floor(Date.now() / 1000) * 1000

    var message
    async(function () {

        if (this._shutdown) return [ async ]
                                  // ^^^^^ break forever loop.

    }, function () {

        // a logging message for our log flush.
        message = {
            duration: Date.now()
        }

        // track entries.
        message.entries = this.entries.length

        // Convert gathered entries into a great big string.
        this.entries.push('')
        var blob = this.entries.join('\n')
        this.entries.length = 0

        // track write length.
        message.length = blob.length

        // Write string and wait to drain.
        this.out.write(blob, async())

    }, function () {

        var start = message.duration
        message.duration = Date.now() - message.duration

        var next = previous + (this.interval * 1000)
        var now = Date.now()
        var offset = next - now

        previous = message.next = next

        logger.info('pump', 'written', message)

        if (offset < 0) {
            logger.error('pump', 'overflow')
            logger.hush = true
        }

        setTimeout(async(), offset)

    })()
   // ^^ forever loop.
})

Queue.prototype.shutdown = function () {
    if (this._timeout) {
        this._shutdown = true
        cancelTimeout(this._timeout.handle)
        this._timeout.callback()
        this._timeout = null
    }
}

// Our levels.
var levels = 'fatal error warn info debug trace'.split(/\s+/)

// Translate level to ordinal.
var order = {}
levels.forEach(function (level, index) { order[level] = index })

// Used to generate a unique id that will align nicely in a char table.
function pad (number) { return ('000000' + number).substring(-7) }

if (process.env.WINK_NO_LOGGING == 'YES') {
    module.exports.hush = true
}

function log (context, level, vargs) {
    if (module.exports.hush) return
    if (number === 0) {
        base = Date.now()
    }
    var object = {}
    object.level = level
    object.context = context
    object.timestamp = new Date().toISOString()
    object.id = base + '/' + pad(number++)
    object.name = vargs.shift()
    var tags = []
    TAGS: while (vargs.length) {
        switch (typeof vargs[0]) {
        case 'string':
            tags.push.apply(tags, vargs[0].split(/\s*,\s*/))
            break
        case 'object':
            if (!Array.isArray(vargs[0])) break TAGS
            tags.push.apply(tags, vargs[0])
            break
        }
        vargs.shift()
    }
    object.tags = tags
    while (vargs.length) {
        var properties = vargs.shift()
        if (typeof properties == 'object') {
            for (var key in properties) {
                object[key] = properties[key]
            }
        }
    }

    context.forEach(function(context1) {
        var f, filter

        if ((!object) || (!filters[context1]) || (!filters[context1][object.name])) return

        filter = filters[context1][object.name]
        f = { object:   function(object) { return undefined }
//          , string:   for inquiry string & action
            , function: filter
            }[typeof filter]
        if (!!f) object = f(object)
    })
    if (!object) return

    queue.entries.push(JSON.stringify(object, function (key, value) {
        if (key == 'tls') return true
        return value
    }))
}

module.exports = function (context, stdout) {
    context = context.split(/\./)
    var object = {}
    'fatal error warn info debug trace'.split(/\s+/).forEach(function (level) {
        object[level] = function () { log(context, level, slice.call(arguments)) }
    })

    return object
}

var queue = module.exports.queue = new Queue()
var logger = module.exports('monitor.logger')

module.exports.filter = function(contexts, name, filter) {
    var deleteP = typeof filter === 'undefined'

    if ((!deleteP) && (typeof filter !== 'string') && (typeof filter !== 'function') && (filter === null)) {
        throw new Error('invalid filter')
    }

    contexts.split(/\./).forEach(function (context) {
        if (!filters[context]) {
            if (deleteP) return
            filters[context] = {}
        }

        if (!filters[context][name]) {
            if (deleteP) return
        } else if (deleteP) {
            delete(filters[context][name])
            return
        }

        filters[context][name] = filter
    })

    return module.exports
}

module.exports.context = {}
