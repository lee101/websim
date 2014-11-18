var stream = require('stream'),
    cadence = require('cadence'),
    ev = require('cadence/event')

function Staccato (stream, opening) {
    this._opened = !opening
    this._stream = stream
    this._catcher = function (error) { this._error = error }.bind(this)
    if (!this._opened) {
        this._stream.once('open', function () {
            this._opened = true
        }.bind(this))
    }
    this._stream.once('error', this._catcher)
}

Staccato.prototype.ready = cadence(function (step) {
    this._checkError()
    if (!this._opened) {
        step(function () {
            this._stream.removeListener('error', this._catcher)
            step(ev, this._stream).on('open').on(Error)
        }, function () {
            this._stream.once('error', this._catcher)
        })
    }
})

Staccato.prototype._checkError = function () {
    if (this._error) {
        var error = this._error
        this._error = new Error('already errored')
        throw error
    }
}

Staccato.prototype.write = cadence(function (step, buffer) {
    this._checkError()
    if (!this._stream.write(buffer)) { // <- does this 'error' if `true`?
        step(function () {
            this._stream.removeListener('error', this._catcher)
            step(ev, this._stream).on('drain').on(Error)
        }, function () {
            this._stream.once('error', this._catcher)
        })
    }
})

Staccato.prototype.close = cadence(function (step) {
    this._checkError() // <- would `error` be here?
    step(function () {
        this._stream.removeListener('error', this._catcher)
        step(ev, this._stream).on('finish').on(Error)
        this._stream.end()
    }, function () {
        this._error = new Error('closed')
    })
})

module.exports = Staccato
