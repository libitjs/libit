import {HashLike} from './types';

export interface Reader {
  /**
   * Assertion.
   * @param {Number} size
   */

  check(size: number): void;

  /**
   * Get total size of passed-in Buffer.
   * @returns {Buffer}
   */

  getSize(): any;

  /**
   * Calculate number of bytes left to read.
   * @returns {Number}
   */

  left(): number;

  /**
   * Seek to a position to read from by offset.
   * @param {Number} off - Offset (positive or negative).
   */

  seek(off: number): this;

  /**
   * Mark the current starting position.
   */

  start(): any;

  /**
   * Stop reading. Pop the start position off the stack
   * and calculate the size of the data read.
   * @returns {Number} Size.
   * @throws on empty stack.
   */

  end(): number;

  /**
   * Stop reading. Pop the start position off the stack
   * and return the data read.
   * @param {Boolean?} zeroCopy - Do a fast buffer
   * slice instead of allocating a new buffer (warning:
   * may cause memory leaks if not used with care).
   * @returns {Buffer} Data read.
   * @throws on empty stack.
   */

  endData(zeroCopy?: boolean): any;

  /**
   * Destroy the reader. Remove references to the data.
   */

  destroy(): this;

  /**
   * Read uint8.
   * @returns {Number}
   */

  readU8(): any;

  /**
   * Read uint16le.
   * @returns {Number}
   */

  readU16(): number;

  /**
   * Read uint16be.
   * @returns {Number}
   */

  readU16BE(): number;

  /**
   * Read uint24le.
   * @returns {Number}
   */

  readU24(): number;

  /**
   * Read uint24be.
   * @returns {Number}
   */

  readU24BE(): number;

  /**
   * Read uint32le.
   * @returns {Number}
   */

  readU32(): number;

  /**
   * Read uint32be.
   * @returns {Number}
   */

  readU32BE(): number;

  /**
   * Read uint40le.
   * @returns {Number}
   */

  readU40(): number;

  /**
   * Read uint40be.
   * @returns {Number}
   */

  readU40BE(): number;

  /**
   * Read uint48le.
   * @returns {Number}
   */

  readU48(): number;

  /**
   * Read uint48be.
   * @returns {Number}
   */

  readU48BE(): number;

  /**
   * Read uint56le.
   * @returns {Number}
   */

  readU56(): number;

  /**
   * Read uint56be.
   * @returns {Number}
   */

  readU56BE(): number;

  /**
   * Read uint64le as a js number.
   * @returns {Number}
   * @throws on num > MAX_SAFE_INTEGER
   */

  readU64(): number;

  /**
   * Read uint64be as a js number.
   * @returns {Number}
   * @throws on num > MAX_SAFE_INTEGER
   */

  readU64BE(): number;

  /**
   * Read int8.
   * @returns {Number}
   */

  readI8(): number;

  /**
   * Read int16le.
   * @returns {Number}
   */

  readI16(): number;

  /**
   * Read int16be.
   * @returns {Number}
   */

  readI16BE(): number;

  /**
   * Read int24le.
   * @returns {Number}
   */

  readI24(): number;

  /**
   * Read int24be.
   * @returns {Number}
   */

  readI24BE(): number;

  /**
   * Read int32le.
   * @returns {Number}
   */

  readI32(): number;

  /**
   * Read int32be.
   * @returns {Number}
   */

  readI32BE(): number;

  /**
   * Read int40le.
   * @returns {Number}
   */

  readI40(): number;

  /**
   * Read int40be.
   * @returns {Number}
   */

  readI40BE(): number;

  /**
   * Read int48le.
   * @returns {Number}
   */

  readI48(): number;

  /**
   * Read int48be.
   * @returns {Number}
   */

  readI48BE(): number;

  /**
   * Read int56le.
   * @returns {Number}
   */

  readI56(): number;

  /**
   * Read int56be.
   * @returns {Number}
   */

  readI56BE(): number;

  /**
   * Read int64le as a js number.
   * @returns {Number}
   * @throws on num > MAX_SAFE_INTEGER
   */

  readI64(): number;

  /**
   * Read int64be as a js number.
   * @returns {Number}
   * @throws on num > MAX_SAFE_INTEGER
   */

  readI64BE(): number;

  /**
   * Read float le.
   * @returns {Number}
   */

  readFloat(): number;

  /**
   * Read float be.
   * @returns {Number}
   */

  readFloatBE(): number;

  /**
   * Read double float le.
   * @returns {Number}
   */

  readDouble(): number;

  /**
   * Read double float be.
   * @returns {Number}
   */

  readDoubleBE(): number;

  /**
   * Read a varint.
   * @returns {Number}
   */

  readVarint(): any;

  /**
   * Read a varint (type 2).
   * @returns {Number}
   */

  readVarint2(): any;

  /**
   * Read N bytes (will do a fast slice if zero copy).
   * @param {Number} size
   * @param {Boolean?} zeroCopy - Do a fast buffer
   * slice instead of allocating a new buffer (warning:
   * may cause memory leaks if not used with care).
   * @returns {Buffer}
   */

  readBytes(size: number, zeroCopy?: boolean): any;

  /**
   * Read a varint number of bytes (will do a fast slice if zero copy).
   * @param {Boolean?} zeroCopy - Do a fast buffer
   * slice instead of allocating a new buffer (warning:
   * may cause memory leaks if not used with care).
   * @returns {Buffer}
   */

  readVarBytes(zeroCopy?: boolean): any;

  /**
   * Slice N bytes and create a child reader.
   * @param {Number} size
   * @returns {BufferReader}
   */

  readChild(size: number): Reader;

  /**
   * Read a string.
   * @param {Number} size
   * @param {String} enc - Any buffer-supported encoding.
   * @returns {String}
   */

  readString(size: number, enc?: BufferEncoding): any;

  /**
   * Read a 32-byte hash.
   * @param {String} enc - `"hex"` or `null`.
   * @returns {Hash|Buffer}
   */

  readHash(enc?: BufferEncoding): any;

  /**
   * Read string of a varint length.
   * @param {String} enc - Any buffer-supported encoding.
   * @param {Number?} limit - Size limit.
   * @returns {String}
   */

  readVarString(enc?: BufferEncoding, limit?: number): any;

  /**
   * Read a null-terminated string.
   * @param {String} enc - Any buffer-supported encoding.
   * @returns {String}
   */

  readNullString(enc?: BufferEncoding): any;

  /**
   * Create a checksum from the last start position.
   * @param {HashLike} hash
   * @returns {Number} Checksum.
   */

  createChecksum(hash: HashLike): number;

  /**
   * Verify a 4-byte checksum against a calculated checksum.
   * @param {HashLike} hash
   * @returns {Number} checksum
   * @throws on bad checksum
   */

  verifyChecksum(hash: HashLike): any;
}
