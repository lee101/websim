#!/usr/bin/env node

require('proof')(6, function (assert) {
    var Cache = require('../..')
    var cache = new Cache
    var magazine = cache.createMagazine()

    var cartridge = magazine.hold(1, { number: 1 })
    var other = magazine.hold(1, { number: 1 })
    cartridge.adjustHeft(1)
    cartridge.value.number++
    try {
        cartridge.remove()
    } catch (e) {
        assert(e.message, 'attempt to remove cartridge held by others', 'remove held cartridge')
    }
    cartridge.release()
    other.release()

    assert(cache.heft, 1, 'cache heft')
    assert(magazine.heft, 1, 'magazine heft')

    magazine.hold(1, null).remove()

    cartridge = magazine.hold(1, { number: 1 })
    assert(cartridge.value.number, 1, 'was removed')

    assert(cache.heft, 0, 'cache heft reduced')
    assert(magazine.heft, 0, 'magazine heft reduced')
})
