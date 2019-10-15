/**
 * @fileoverview PNG file manipulation.
 *
 * Adapted from saveSvgAsPng in App Inventor
 * Copyright 2015 Massachusetts Institute of Technology
 * Copyright 2014 Eric Shull
 * Released under The MIT License (MIT)
 */
'use strict';

/**
 * @name Blockly.utils.png
 * @namespace
 */
goog.provide('Blockly.utils.PNG');

/**
 * PNG represents a parsed sequence of chunks from a PNG file.
 * @constructor
 */
Blockly.utils.PNG = function() {
  /** @type {?Blockly.utils.PNG.Chunk[]} */
  this.chunks = null;
};

/**
 * Construct a table needed for computing PNG CRC32 fields.
 */
function makeCRCTable() {
  var c;
  var crcTable = [];
  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }
  return crcTable;
}

/**
 * Compute the CRC32 for the given data.
 * @param data {Array|ArrayBuffer|Uint8Array} the array-like entity for which to compute the CRC32
 */
function crc32(data) {
  var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
  var crc = 0 ^ (-1);

  for (var i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xFF];
  }

  return (crc ^ (-1)) >>> 0;
}

/**
 * The 4-byte type used to identify code chunks in the PNG file.
 * @type {string}
 * @const
 * @private
 */
Blockly.utils.PNG.CODE_CHUNK = 'coDe';

/**
 * PNG magic number
 * @type {number[]}
 * @const
 */
Blockly.utils.PNG.HEADER = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

/**
 * Chunk represents the four components of a PNG file chunk.
 * @param {number} length The length of the chunk data
 * @param {string} type The type of the chunk
 * @param {Uint8Array} data The chunk data
 * @param {number} crc The CRC32 over the type + data
 * @constructor
 */
Blockly.utils.PNG.Chunk = function(length, type, data, crc) {
  this.length = length;
  this.type = type;
  this.data = data;
  this.crc = crc;
};

/**
 * Reads the image data of the {@code canvas} element.
 * On completion, {@code callback} is called with the PNG object.
 * @param {HTMLCanvasElement} canvas the canvas
 * @param {?function(Blockly.utils.PNG)} callback the callback for completion
 */
Blockly.utils.PNG.fromCanvas = function(canvas, callback) {
  if (canvas.toBlob === undefined) {
    var src = canvas.toDataURL('image/png');
    var base64img = src.split(',')[1];
    var decoded = window.atob(base64img);
    var rawLength = decoded.length;
    var buffer = new Uint8Array(new ArrayBuffer(rawLength));
    for (var i = 0; i < rawLength; i++) {
      buffer[i] = decoded.charCodeAt(i);
    }
    var blob = new Blob([buffer], {'type': 'image/png'});
    Blockly.utils.PNG.fromBlob(blob, callback);
  } else {
    canvas.toBlob(function(blob) {
      Blockly.utils.PNG.fromBlob(blob, callback);
    });
  }
};

/**
 * Reads teh contents of the {@code blob} and parses the chunks into the PNG
 * object. On completion, {@code callback} is called with the PNG object.
 * @param {Blob} blob the blob representing the PNG content
 * @param {?function(Blockly.utils.PNG)} callback the callback for completion
 */
Blockly.utils.PNG.fromBlob = function(blob, callback) {
  var reader = new FileReader();
  var png = new Blockly.utils.PNG();
  reader.addEventListener('loadend', function() {
    png.processData_(new Uint8Array(reader.result));
    if (callback instanceof Function) {
      callback(png);
    }
  });
  reader.readAsArrayBuffer(blob);
};

/**
 * Extracts the code chunk from the PNG, if any.
 * @returns {?PNG.Chunk}
 */
Blockly.utils.PNG.prototype.getCodeChunk = function() {
  if (!this.chunks) {
    return null;
  }
  for (var i = 0; i < this.chunks.length; i++) {
    if (this.chunks[i].type === Blockly.utils.PNG.CODE_CHUNK) {
      return this.chunks[i];
    }
  }
  return null;
};

/**
 * Processes the data from the PNG file into its component chunks.
 * @param {Uint8Array} data the data from the PNG file as a UInt8Array
 * @private
 */
Blockly.utils.PNG.prototype.processData_ = function(data) {
  var chunkStart = Blockly.utils.PNG.HEADER.length;

  function decode4() {
    var num;
    num = data[chunkStart++];
    num = num * 256 + data[chunkStart++];
    num = num * 256 + data[chunkStart++];
    num = num * 256 + data[chunkStart++];
    return num;
  }

  function read4() {
    var str = '';
    for (var i = 0; i < 4; i++, chunkStart++) {
      str += String.fromCharCode(data[chunkStart]);
    }
    return str;
  }

  function readData(length) {
    return data.slice(chunkStart, chunkStart + length);
  }

  this.chunks = [];
  while (chunkStart < data.length) {
    var length = decode4();
    var type = read4();
    var chunkData = readData(length);
    chunkStart += length;
    var crc = decode4();
    this.chunks.push(new Blockly.utils.PNG.Chunk(length, type, chunkData, crc));
  }
};

/**
 * Sets the contents of the code chunk.
 * @param {string} code the block XML to embed in the PNG, as a string
 */
Blockly.utils.PNG.prototype.setCodeChunk = function(code) {
  var text = new TextEncoder().encode(Blockly.utils.PNG.CODE_CHUNK + code);
  var length = text.length - 4;
  var crc = crc32(text);
  text = text.slice(4);
  for (var i = 0, chunk; (chunk = this.chunks[i]); i++) {
    if (chunk.type === Blockly.utils.PNG.CODE_CHUNK) {
      chunk.length = length;
      chunk.data = text;
      chunk.crc = crc;
      return;
    }
  }
  chunk = new Blockly.utils.PNG.Chunk(length, Blockly.utils.PNG.CODE_CHUNK, text, crc);
  this.chunks.splice(this.chunks.length - 1, 0, chunk);
};

/**
 * Serializes the PNG object into a Blob.
 * @returns {Blob}
 */
Blockly.utils.PNG.prototype.toBlob = function() {
  var length = Blockly.utils.PNG.HEADER.length;
  this.chunks.forEach(function(chunk) {
    length += chunk.length + 12;
  });
  var buffer = new Uint8Array(length);
  var index = 0;

  function write4(value) {
    if (typeof value === 'string') {
      var text = new TextEncoder().encode(value);
      buffer.set(text, index);
      index += text.length;
    } else {
      buffer[index + 3] = value & 0xFF;
      value >>= 8;
      buffer[index + 2] = value & 0xFF;
      value >>= 8;
      buffer[index + 1] = value & 0xFF;
      value >>= 8;
      buffer[index] = value & 0xFF;
      index += 4;
    }
  }

  function writeData(data) {
    buffer.set(data, index);
    index += data.length;
  }

  writeData(Blockly.utils.PNG.HEADER);
  this.chunks.forEach(function(chunk) {
    write4(chunk.length);
    write4(chunk.type);
    writeData(chunk.data);
    write4(chunk.crc);
  });
  return new Blob([buffer], {'type': 'image/png'});
};
