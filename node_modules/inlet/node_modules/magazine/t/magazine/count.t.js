#!/usr/bin/env node

require('proof')(8, function (assert) {
    var Cache = require('../..')
    var cache = new Cache
    var magazine = cache.createMagazine()

    var cartridge = magazine.hold(1, {})
    cartridge.release()

    cartridge = magazine.hold(2, {})
    assert(magazine.count, 2, 'magazine count')
    cache.purge(-1)
    cartridge.release()

    assert(magazine.count, 1, 'magazine count purge cache')

    cartridge = magazine.hold(2, {})
    magazine.purge(-1)
    cartridge.release()

    assert(magazine.count, 1, 'magazine count purge magazine')

    magazine.hold(2).remove()

    assert(magazine.count, 0, 'magazine count remove')

    cartridge = magazine.hold(1, {})
    cartridge.release()

    cartridge = magazine.hold(2, {})
    assert(cache.count, 2, 'cache count')
    cache.purge(-1)
    cartridge.release()

    assert(cache.count, 1, 'cache count purge cache')

    cartridge = magazine.hold(2, {})
    magazine.purge(-1)
    cartridge.release()

    assert(cache.count, 1, 'cache count purge magazine')

    magazine.hold(2).remove()

    assert(cache.count, 0, 'cache count remove')
})
