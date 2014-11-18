#!/usr/bin/env node

require('proof')(9, function (assert) {
    var Cache = require('../..')
    var cache = new Cache
    var magazine = cache.createMagazine()

    var cartridge = magazine.hold(1, {})
    cartridge.value.number++
    cartridge.adjustHeft(1)
    cartridge.release()

    var cartridge = magazine.hold(2, {})
    cartridge.adjustHeft(1)
    assert(cache.heft, 2, 'cache full')
    cache.purge(0)
    assert(cache.heft, 1, 'cache purged')
    cartridge.release()

    var cartridge = cache.createMagazine().hold(1, {})
    cartridge.adjustHeft(1)
    cartridge.release()

    var cartridge = magazine.hold(1, {}), gather = []
    cartridge.adjustHeft(1)
    assert(magazine.heft, 2, 'magazine full')
    magazine.purge(0, function () { return false })
    assert(magazine.heft, 2, 'no conditions matched')
    magazine.purge(function () { return true })
    assert(magazine.heft, 2, 'stoped')
    magazine.purge(0, gather)
    assert(magazine.heft, 1, 'magazine purged')
    assert(gather.length, 1, 'gathered')
    cartridge.release()

    assert(cache.heft, 2, 'cache at end')

    cache.purge().release()

    var purge = cache.purge()
    while (purge.cartridge) {
        purge.cartridge.release()
        purge.next()
    }
    purge.release()

    var purge = cache.purge()
    assert(purge.cartridge, 'purge cartridge')
    purge.release()
})
