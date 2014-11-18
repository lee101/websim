#!/usr/bin/env node

require('proof')(2, function (assert) {
    var Cache = require('../..')
    var cache = new Cache
    var magazine = cache.createMagazine()

    var cartridge = magazine.hold(1, function () { return { number: 1 } })
    assert(cartridge.value.number, 1, 'initialize')
    cartridge.value.number++
    cartridge.release()

    var cartridge = magazine.hold(1, function () { throw new Error })
    assert(cartridge.value.number, 2, 'exists')
    cartridge.release()
})
