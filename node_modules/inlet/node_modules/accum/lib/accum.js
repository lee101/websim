'use strict';

var Stream = require('stream');
var util = require('util');
var ReadableStream = require('readable-stream');

// node 0.10+ has Writable stream so use it if available
// otherwise use readable-stream module
var Writable = Stream.Writable || ReadableStream.Writable;

function AccumStream(options, listenerFn) {
  Writable.apply(this, arguments);
  this._encoding = (options && options.encoding) ? options.encoding : 'utf8';
  this._accumType = (options && options.type) ? options.type : null;
  this._listenerFn = listenerFn;
  this._accumData = [];
}

util.inherits(AccumStream, Writable);

AccumStream.prototype._write = function _write(chunk, encoding, cb) {
  this._accumData.push(chunk);
  cb();
};

AccumStream.prototype.end = function end(chunk, encoding, cb) {
  Writable.prototype.end.apply(this, arguments);
  this._listenerFn.call(null, accumData(this._accumData, this._accumType, this._encoding));
};

function ensureBuffer(data) {
  return (Buffer.isBuffer(data)) ? data : new Buffer(data);
}

function ensureString(encoding, data) {
  return (typeof data === 'string') ? data :
    Buffer.isBuffer(data) ? data.toString(encoding) :
    data.toString();
}

var accumFns = {
  buffer: function (arrData) { return Buffer.concat(arrData.map(ensureBuffer)); },
  string: function (arrData, encoding) { return Buffer.concat(arrData.map(ensureBuffer)).toString(encoding); },
  array: function (arrData) { return arrData; }
};

function accumData(arrData, accumType, encoding) {
  if (!accumType) { // not provided need to detect
    var first = arrData[0];
    if (Buffer.isBuffer(first)) accumType = 'buffer';
    else if (typeof first === 'string') accumType = 'string';
    else accumType = 'array';
  }
  var fn = accumFns[accumType];
  return fn(arrData, encoding);
}



function accum(options, listenerFn) {
  if (arguments.length === 1) { // options is optional
    listenerFn = options;
    options = {};
  }
  options = options || {};
  if (typeof listenerFn !== 'function') throw new Error('accum requires a listenerFn function');
  if (options.type &&
      (options.type !== 'buffer' && options.type !== 'string' && options.type !== 'array')) {
    throw new Error('if options.type is provided to accum, it must be one of [buffer, string, array]');
  }
  return new AccumStream(options, listenerFn);
}

function buffer(options, listenerFn) {
  if (arguments.length === 1) {  // options not provided, shift
    listenerFn = options;
    options = {};
  }
  options = options || {};
  options.type = 'buffer';
  return accum(options, listenerFn);
}

function string(options, listenerFn) {
  if (arguments.length === 1) {  // options not provided, shift
    listenerFn = options;
    options = {};
  }
  options = options || {};
  if (!options.encoding) options.encoding = 'utf8';
  options.type = 'string';
  return accum(options, listenerFn);
}

function array(options, listenerFn) {
  if (arguments.length === 1) {  // options not provided, shift
    listenerFn = options;
    options = {};
  }
  options = options || {};
  options.type = 'array';
  return accum(options, listenerFn);
}

accum.buffer = buffer;
accum.string = string;
accum.array = array;
module.exports = accum;
