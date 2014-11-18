var http = require('http'),
    url = require('url')

// http://stackoverflow.com/a/14378462
function applyToConstructor(constructor, argArray) {
    var args = [null].concat(argArray);
    var factoryFunction = constructor.bind.apply(constructor, args);
    return new factoryFunction();
}

function Gaggle (constructor) {
    this._constructor = constructor
    this._objects = {}
    this._arguments = Array.prototype.slice.call(arguments, 1)
}

Gaggle.order = function (a, b) {
    if (a < b) return -1
    if (a > b) return 1
    return 0
}

Gaggle.prototype.createServer = function () {
    return http.createServer(function (request, response) {
        var parsed = url.parse(request.url)
        var path = parsed.path.split('/').slice(1)
        var object
        if (path[0] == 'list') {
            var objects = []
            for (var key in this._objects) {
                var object = this._objects[key]
                objects.push(object.inspect())
            }
            objects.sort(this._constructor.order || Gaggle.order)
            objects = new Buffer(JSON.stringify(objects))
            response.writeHead(200, {
                'Content-Type': 'application/json',
                'Content-Length': objects.length
            })
            response.end(objects)
        } else if (path[0] == 'connect') {
            object = applyToConstructor(this._constructor, this._arguments)
            this._objects[object.id] = object
        } else {
            object = this._objects[path[0]]
            path.shift()
        }
        if (!object || path.length == 0 || typeof object[path[0]] != 'function') {
            response.writeHead(404, { 'Content-Type': 'application/json' })
            response.end(JSON.stringify({ message: 'non found' }))
            return
        }
        object[path.shift()].apply(object, path.concat(function (error, body) {
            if (error) {
                response.writeHead(500, { 'Content-Type': 'text/plain' })
                response.end(error.toString())
            } else {
                response.writeHead(200, { 'Content-Type': 'application/json' })
                response.end(JSON.stringify(body || {}, null, 2))
            }
        }))
    }.bind(this))
}

module.exports = Gaggle
