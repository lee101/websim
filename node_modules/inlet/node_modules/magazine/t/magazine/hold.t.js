#!/usr/bin/env node

require('proof')(5, function (assert) {
    var Cache = require('../..')
    var cache = new Cache
    var magazine = cache.createMagazine()

    assert(magazine.holds, 0, 'no holds')
    var cartridge = magazine.hold(1, { number: 1 })
    assert(cartridge.value.number, 1, 'initialize')
    cartridge.value.number++
    assert(magazine.holds, 1, 'one hold')
    cartridge.release()

    var cartridge = magazine.hold(1, { number: 1 })
    assert(cartridge.value.number, 2, 'exists')
    cartridge.release()

    try {
        cartridge.release()
    } catch (e) {
        assert(e.message, 'attempt to release a cartridge not held', 'release not held')
    }
})
