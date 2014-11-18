/*global suite:false test:false */
'use strict';

var chai = require('chai-stack');
var crypto = require('crypto');
var domain = require('domain');
var accum = require('..'); // require('accum');
var passStream = require('pass-stream');

var t = chai.assert;

suite('array');

test('accum.array(listenerFn) with string data, results with raw array of chunks to listenerFn', function (done) {
  var stream = passStream(null, null, { encoding: 'utf8' });
  stream
    .pipe(accum.array({ decodeStrings: false }, function (alldata) {
      t.deepEqual(alldata, ['abc', 'def', 'ghi']);
      done();
    }));
  process.nextTick(function () {
    stream.write('abc');
    stream.write('def');
    stream.end('ghi');
  });
});

test('accum.array(listenerFn) with Buffer data, results with raw array of chunks to listenerFn', function (done) {
  var stream = passStream();
  stream
    .pipe(accum.array(function (alldata) {
      t.deepEqual(alldata, [new Buffer('abc'), new Buffer('def'), new Buffer('ghi')]);
      done();
    }));
  process.nextTick(function () {
    stream.write(new Buffer('abc'));
    stream.write(new Buffer('def'));
    stream.end(new Buffer('ghi'));
  });
});

test('accum.array(listenerFn) with number data, results raw array to listenerFn', function (done) {
  var stream = passStream(null, null, { objectMode: true });
  stream
    .pipe(accum.array({ objectMode: true }, function (alldata) {
      t.ok(Array.isArray(alldata));
      t.deepEqual(alldata, [1, 2, 3]);
      done();
    }));
  process.nextTick(function () {
    stream.write(1);
    stream.write(2);
    stream.end(3);
  });
});

test('accum.array(listenerFn) w/various data, results with concatenated raw array to listenerFn', function (done) {
  var DATA = [
    1,
    true,
    false,
    'hello',
    [2, 3],
    { a: 1, b: 2 },
    new Buffer('buff'),
    'finished'
  ];
  var stream = passStream(null, null, { objectMode: true });
  stream
    .pipe(accum.array({objectMode: true }, function (alldata) {
      t.ok(Array.isArray(alldata));
      t.deepEqual(alldata, DATA);
      done();
    }));
  process.nextTick(function () {
    DATA.forEach(function (x) {
      stream.write(x);
    });
    stream.end();
  });
});

test('accum.array(listenerFn) with throws to domain', function (done) {
  var d = domain.create();
  d.on('error', function (err) {
      t.equal(err.message, 'my error');
      done();
    })
    .run(function () {
      var stream = accum.array(function (alldata) { });
      process.nextTick(function () {
        stream.emit('error', new Error('my error'));
      });
    });
});

test('missing listenerFn throws error', function () {
  function throwsErr() {
    var stream = accum.array();
  }
  t.throws(throwsErr, /accum requires a listenerFn function/);
});

