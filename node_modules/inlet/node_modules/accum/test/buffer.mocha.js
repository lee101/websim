/*global suite:false test:false */
'use strict';

var chai = require('chai-stack');
var crypto = require('crypto');
var domain = require('domain');
var accum = require('..'); // require('accum');
var passStream = require('pass-stream');

var t = chai.assert;

suite('buffer');

test('accum.buffer(listenerFn) with string data, results with concatenated Buffer to listenerFn before end', function (done) {
  var DATA = new Buffer('abcdefghi');
  var stream = passStream();
  stream
    .pipe(accum.buffer(function (alldata) {
      t.ok(Buffer.isBuffer(alldata));
      t.equal(alldata.length, DATA.length);
      var digest = crypto.createHash('sha1').update(alldata).digest('base64');
      var expectedDigest = crypto.createHash('sha1').update(DATA).digest('base64');
      t.equal(digest, expectedDigest);
      done();
    }));
  process.nextTick(function () {
    stream.write('abc');
    stream.write('def');
    stream.end('ghi');
  });
});

test('accum.buffer(listenerFn) with Buffer data, results with concatenated Buffer to listenerFn before end', function (done) {
  var DATA = new Buffer('abcdefghi');
  var stream = passStream();
  stream
    .pipe(accum.buffer(function (alldata) {
      t.ok(Buffer.isBuffer(alldata));
      t.equal(alldata.length, DATA.length);
      var digest = crypto.createHash('sha1').update(alldata).digest('base64');
      var expectedDigest = crypto.createHash('sha1').update(DATA).digest('base64');
      t.equal(digest, expectedDigest);
      done();
    }));
  process.nextTick(function () {
    stream.write(new Buffer('abc'));
    stream.write(new Buffer('def'));
    stream.end(new Buffer('ghi'));
  });
});

test('accum.buffer(listenerFn) with throws to domain', function (done) {
  var d = domain.create();
  d.on('error', function (err) {
      t.equal(err.message, 'my error');
      done();
    })
    .run(function () {
      var stream = accum.buffer(function (alldata) { });
      process.nextTick(function () {
        stream.emit('error', new Error('my error'));
      });
    });
});

test('accum.buffer() missing listenerFn throws error', function () {
  function throwsErr() {
    var stream = accum.buffer();
  }
  t.throws(throwsErr, /accum requires a listenerFn function/);
});

