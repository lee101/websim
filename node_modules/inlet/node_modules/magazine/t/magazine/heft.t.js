#!/usr/bin/env node

require('proof')(4, function (assert) {
    var Cache = require('../..')
    var cache = new Cache
    var magazine = cache.createMagazine()

    var cartridge = magazine.hold(1, { number: 1 })
    cartridge.adjustHeft(1)
    cartridge.release()

    assert(cache.heft, 1, 'cache heft adjusted')
    assert(magazine.heft, 1, 'magazine heft adjusted')

    cache.purge(0)

    assert(cache.heft, 0, 'cache heft purged')
    assert(magazine.heft, 0, 'magazine heft purged')
})
