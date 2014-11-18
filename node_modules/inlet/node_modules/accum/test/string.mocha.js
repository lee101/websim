/*global suite:false test:false */
'use strict';

var chai = require('chai-stack');
var crypto = require('crypto');
var domain = require('domain');
var accum = require('..'); // require('accum');
var passStream = require('pass-stream');

var t = chai.assert;

suite('string');

test('accum.string(listenerFn) with string data, results with concatenated string to listenerFn before end', function (done) {
  var DATA = 'abcdefghi';
  var stream = passStream();
  stream
    .pipe(accum.string(function (alldata) {
      t.typeOf(alldata, 'string');
      t.equal(alldata.length, DATA.length);
      t.equal(alldata, DATA);
      done();
    }));
  process.nextTick(function () {
    stream.write('abc');
    stream.write('def');
    stream.end('ghi');
  });
});

test('accum.string(listenerFn) with Buffer data, results with concatenated string to listenerFn before end', function (done) {
  var DATA = 'abcdefghi';
  var stream = passStream();
  stream
    .pipe(accum.string(function (alldata) {
      t.typeOf(alldata, 'string');
      t.equal(alldata.length, DATA.length);
      t.equal(alldata, DATA);
      done();
    }));
  process.nextTick(function () {
    stream.write(new Buffer('abc'));
    stream.write(new Buffer('def'));
    stream.end(new Buffer('ghi'));
  });
});

test('accum.string("utf8", listenerFn) with Buffer data, results with concatenated string to listenerFn before end', function (done) {
  var DATA = 'abcdefghi';
  var stream = passStream();
  stream
    .pipe(accum.string({ encoding: 'utf8' }, function (alldata) {
      t.typeOf(alldata, 'string');
      t.equal(alldata.length, DATA.length);
      t.equal(alldata, DATA);
      done();
    }));
  process.nextTick(function () {
    stream.write(new Buffer('abc'));
    stream.write(new Buffer('def'));
    stream.end(new Buffer('ghi'));
  });
});

test('accum.string("utf8", listenerFn) with Buffer data having multibyte utf8 split into separate packets, Buffer.concat before convert', function (done) {
  // http://en.wikipedia.org/wiki/UTF-8 \u20ac is € euro sign
  var DATA = '\u20ac'; // multibyte
  var stream = passStream();
  stream
    .pipe(accum.string({ encoding: 'utf8' }, function (alldata) {
      t.typeOf(alldata, 'string');
      t.equal(alldata.length, DATA.length);
      t.equal(alldata, DATA);
      done();
    }));
  process.nextTick(function () {
    var fullBuffer = new Buffer('\u20ac', 'utf8');
    t.ok(fullBuffer.length > 1);
    // make buffer packets split the multibyte string
    var firstPacket = fullBuffer.slice(0, 1);
    var secondPacket = fullBuffer.slice(1);
    stream.write(firstPacket);
    stream.end(secondPacket);
  });
});

test('accum.string(listenerFn) with throws to domain', function (done) {
  var d = domain.create();
  d.on('error', function (err) {
      t.equal(err.message, 'my error');
      done();
    })
    .run(function () {
      var stream = accum.string(function (alldata) { });
      process.nextTick(function () {
        stream.emit('error', new Error('my error'));
      });
    });
});

test('accum.string() missing listenerFn throws error', function () {
  function throwsErr() {
    var stream = accum.string();
  }
  t.throws(throwsErr, /accum requires a listenerFn function/);
});

