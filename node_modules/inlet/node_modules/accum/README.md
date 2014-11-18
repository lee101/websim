# accum

Simple write stream which accumulates or collects the data from a stream. Pipe your stream into this to get all the data as buffer, string, or raw array. (streams2)

[![Build Status](https://secure.travis-ci.org/jeffbski/accum.png?branch=master)](http://travis-ci.org/jeffbski/accum)

## Installation


```bash
npm install accum
```

## Usage

`accum` provides several factory methods for use:

 - The default automatic method - `accum([options], listenerFn)` constructs a write stream which checks if the first chunk is a Buffer and if so returns a concatenated Buffer of all the data, otherwise if it is a string then returns a concatenated string, otherwise returns a raw array. The `listenerFn` signature is `function(alldata)`. The `listenerFn` is called after all the data is received just prior to the `end` event being emitted. The `options` parameter can be omitted.

```javascript
var accum = require('accum');
rstream
  .pipe(accum(function (alldata) {
    // use the accumulated data - alldata will be Buffer, string, or []
  }));
```

For a more deterministic result use one of the following:

 - `accum.buffer([options], listenerFn)` - constructs a write stream which converts everything into a Buffer, concatenates, and calls the `listenerFn` with the buffer. The `listenerFn` signature is `function(buffer)`. The `listenerFn` is called after all the data is received just prior to the `end` event being emitted. The `options` parameter can be omitted.

```javascript
var accum = require('accum');
rstream
  .pipe(accum.buffer(function (buffer) {
    // use the accumulated data - buffer which is a Buffer
  }));
```

 - `accum.string([options], listenerFn)` - constructs a write stream which concatenates everything into a string. Buffer data is converted to string using the optional `encoding` which defaults to 'utf8'. Other data is simply converted using `.toString()`. The `listenerFn` signature is `function(string)`. The `listenerFn` is called after all the data is received just prior to the `end` event being emitted. The `options` parameter can be omitted.

```javascript
var accum = require('accum');
rstream
  .pipe(accum.string({ encoding: 'utf8'}, function (string) {
    // use the accumulated data - string which is a utf8 string
  }));
```

 - `accum.array([options], listenerFn)` - constructs a write stream which concatenates everything into an array without any conversion, which the `listenerFn` receives the accumulated data on end. The `listenerFn` signature is `function(arr)`. The `listenerFn` is called after all the data is received just prior to the `end` event being emitted. The `options` parameter can be omitted.

```javascript
var accum = require('accum');
rstream
  .pipe(accum.array(function (array) {
    // use the accumulated data - array which is a raw unconverted array of data chunks
  }));
```

### Error handling

Node.js stream.pipe does not forward errors and neither do many pass-through stream implementations so the recommended way to catch errors is either to attach error handlers at each stream or to use domains.

```javascript
 var d = domain.create();
    d.on('error', handleAllErrors);
    d.run(function() {
      rstream.pipe(accum(function (alldata) {
        // use alldata
      });
    });
```

## Goals

 - Easy to use write stream which accumulates the data from a stream
 - uses streams2 functionality from node 0.10+ but is backwards compatible with node 0.8
 - Ability to automatically adapt to type of first data packet or coerce the data to a particular format
 - Ability to receive just the raw array of data chunks
 - Tested with binary data

## Why

Rather than manually accumulating streams, put all the best practices into this one module. There are subtle errors that can occur if utf8 strings happen to be split in the middle of a character, so conversion and concatenation needs to be done properly.

There were several existing projects that also accumululate in slightly different ways:

 - https://github.com/polotek/data-collector-stream
 - https://github.com/Weltschmerz/Accumulate

## Tested with Node versions

 - 0.8
 - 0.10
 - 0.11

## Get involved

If you have input or ideas or would like to get involved, you may:

 - contact me via twitter @jeffbski  - <http://twitter.com/jeffbski>
 - open an issue on github to begin a discussion - <https://github.com/jeffbski/accum/issues>
 - fork the repo and send a pull request (ideally with tests) - <https://github.com/jeffbski/accum>

## License

 - [MIT license](http://github.com/jeffbski/accum/raw/master/LICENSE)

