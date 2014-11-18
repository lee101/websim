var utf8Stream = require('utf8-stream')
var through = require('through')

module.exports = function (output, consumer) {
    var remainder = ''
    var u8 = utf8Stream()
    u8.pipe(through(function (buffer) {
        var string = buffer.toString('utf8')
        var lines = string.split(/\n/)
        lines[0] = remainder + lines[0]
        remainder = lines.pop()
        consumer(lines)
        this.queue(lines.join('\n') + '\n')
    })).pipe(output)
    return u8
}
