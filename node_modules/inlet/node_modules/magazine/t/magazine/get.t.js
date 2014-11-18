#!/usr/bin/env node

require('proof')(4, function (assert) {
    var Cache = require('../..')
    var cache = new Cache
    var magazine = cache.createMagazine()

    var cartridge = magazine.hold(1, { number: 1 })
    assert(cartridge.value.number, 1, 'initialize')
    assert(magazine.get(1).value.number, 1, 'get')
    cartridge.release()

    try {
        magazine.get(2)
    } catch (e) {
        assert(e.message, 'attempt to get a cartridge not held', 'get non existant')
    }

    try {
        magazine.get(1)
    } catch (e) {
        assert(e.message, 'attempt to get a cartridge not held', 'get non existant')
    }
})
