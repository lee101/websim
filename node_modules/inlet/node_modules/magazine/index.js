var ok = require('assert').ok,
    __slice = [].slice

function detach (cartridge) {
    var magazine = cartridge._magazine, cache = magazine._cache
    magazine.heft -= cartridge.heft
    cache.heft -= cartridge.heft
    delete cache._cache[cartridge._compoundKey]
    magazine.count--
    cache.count--
    unlink(cartridge)
}

function unlink (cartridge, prefix) {
    if (!prefix) {
        unlink(cartridge, 'cache')
        unlink(cartridge, 'magazine')
    } else {
        var prev = '_' + prefix + 'Previous'
        var next = '_' + prefix + 'Next'
        cartridge[prev][next] = cartridge[next]
        cartridge[next][prev] = cartridge[prev]
    }
}

function link (cartridge, previous, prefix) {
    var prev = '_' + prefix + 'Previous'
    var next = '_' + prefix + 'Next'
    cartridge[next] = previous[next]
    cartridge[prev] = previous
    cartridge[next][prev] = cartridge
    previous[next] = cartridge
}

function Cache (constructor) {
    var head = {}
    head._cachePrevious = head._cacheNext = head

    this._constructor = constructor // todo bad
    this._cache = {}
    this._head = head
    this._nextKey = 0

    this.count = 0
    this.holds = 0
    this.heft = 0
}

Cache.prototype.createMagazine = function () {
    var key = ':' + (++this._nextKey) + ':'
    return new Magazine(this, key)
}

Cache.prototype.purge = function () {
    return purge.call(this, '_cachePrevious', __slice.call(arguments))
}

function Magazine (cache, key) {
    var head = {}
    head._magazinePrevious = head._magazineNext = head

    this._cache = cache
    this._key = key
    this._head = head

    this.count = 0
    this.holds = 0
    this.heft = 0
}

Magazine.prototype.hold = function (key, defaultValue) {
    var compoundKey = this._key + key
    var cartridge = this._cache._cache[compoundKey]
    if (!cartridge) {
        if (typeof defaultValue == 'function') {
            defaultValue = defaultValue()
        }
        cartridge = this._cache._cache[compoundKey] =
            new Cartridge(this, key, defaultValue, compoundKey)
        this.count++
        this._cache.count++
    } else {
        unlink(cartridge)
    }
    link(cartridge, this._cache._head, 'cache')
    link(cartridge, this._head, 'magazine')
    cartridge.holds++
    this.holds++
    this._cache.holds++
    cartridge.when = Date.now()
    return cartridge
}

Magazine.prototype.get = function (key) {
    var compoundKey = this._key + key
    var cartridge = this._cache._cache[compoundKey]
    if (!cartridge || !cartridge.holds) {
        throw new Error('attempt to get a cartridge not held')
    }
    return cartridge
}

function purge (next, vargs) {
    var downTo, condition, gather, stop, head, iterator, cache, magazine
    if (vargs.length == 0) {
        return new Purge(this, next)
    }
    downTo = vargs.shift()
    if (typeof vargs[0] == 'function') {
        condition = vargs.shift()
    }
    if (Array.isArray(vargs[0])) {
        gather = vargs.shift()
    }
    condition || (condition = function () { return true })
    stop = downTo
    head = this._head
    iterator = head
    if (typeof downTo == 'number') {
        downTo = Math.max(downTo, -1)
        stop = function () { return this.heft <= downTo }.bind(this)
    }
    while (iterator[next] !== head && !stop(iterator[next])) {
        var cartridge = iterator[next]
        if (!cartridge.holds && condition(cartridge)) {
            magazine = cartridge._magazine, cache = magazine._cache
            if (gather) {
                gather.push(cartridge.value)
            }
            detach(cartridge)
        } else {
            iterator = cartridge
        }
    }
}

Magazine.prototype.purge = function () {
    return purge.call(this, '_magazinePrevious', __slice.call(arguments))
}

function Cartridge (magazine, key, value, compoundKey) {
    this.key = key
    this.value = value

    this._magazine = magazine
    this._compoundKey = compoundKey

    this.heft = 0
    this.holds = 0
}

Cartridge.prototype.adjustHeft = function (heft) {
    this.heft += heft
    this._magazine.heft += heft
    this._magazine._cache.heft += heft
    return this
}

Cartridge.prototype.release = function () {
    if (!this.holds) {
        throw new Error('attempt to release a cartridge not held')
    }
    if (--this.holds == 0) {
        this._magazine.holds--
        this._magazine._cache.holds--
    }
}

Cartridge.prototype.remove = function () {
    if (this.holds != 1) {
        throw new Error('attempt to remove cartridge held by others')
    }
    detach(this)
}

function Purge (object, next) {
    this._object = object
    this._next = next
    this.cartridge = this._object._head
//    console.log(object, next, this.cartridge)
    this.next()
}

Purge.prototype.next = function () {
    do {
        this.cartridge = this.cartridge[this._next] === this._object._head
                       ? null : this.cartridge[this._next]
    } while (this.cartridge && this.cartridge.holds)
    if (this.cartridge) {
        this.cartridge.holds = 1
    }
}

Purge.prototype.release = function () {
    if (this.cartridge) {
        this.cartridge.release()
    }
}

module.exports = Cache
