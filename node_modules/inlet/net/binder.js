var url = require('url')

function Binder (location, tls) {
    var parsed = url.parse(location)
    this.location = location
    for (var key in parsed) {
        this[key] = parsed[key]
    }
    this.port = +(this.port)
    this.tls = /^(tls|https):$/.test(parsed.protocol) && tls
}

module.exports = Binder
