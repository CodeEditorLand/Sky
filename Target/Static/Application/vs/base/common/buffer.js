var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Lazy } from "./lazy.js";
import * as streams from "./stream.js";
const hasBuffer = typeof Buffer !== "undefined";
const indexOfTable = new Lazy(() => new Uint8Array(256));
let textEncoder;
let textDecoder;
class VSBuffer {
  static {
    __name(this, "VSBuffer");
  }
  /**
   * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
   */
  static alloc(byteLength) {
    if (hasBuffer) {
      return new VSBuffer(Buffer.allocUnsafe(byteLength));
    } else {
      return new VSBuffer(new Uint8Array(byteLength));
    }
  }
  /**
   * When running in a nodejs context, if `actual` is not a nodejs Buffer, the backing store for
   * the returned `VSBuffer` instance might use a nodejs Buffer allocated from node's Buffer pool,
   * which is not transferrable.
   */
  static wrap(actual) {
    if (hasBuffer && !Buffer.isBuffer(actual)) {
      actual = Buffer.from(actual.buffer, actual.byteOffset, actual.byteLength);
    }
    return new VSBuffer(actual);
  }
  /**
   * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
   */
  static fromString(source, options) {
    const dontUseNodeBuffer = options?.dontUseNodeBuffer || false;
    if (!dontUseNodeBuffer && hasBuffer) {
      return new VSBuffer(Buffer.from(source));
    } else {
      if (!textEncoder) {
        textEncoder = new TextEncoder();
      }
      return new VSBuffer(textEncoder.encode(source));
    }
  }
  /**
   * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
   */
  static fromByteArray(source) {
    const result = VSBuffer.alloc(source.length);
    for (let i = 0, len = source.length; i < len; i++) {
      result.buffer[i] = source[i];
    }
    return result;
  }
  /**
   * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
   */
  static concat(buffers, totalLength) {
    if (typeof totalLength === "undefined") {
      totalLength = 0;
      for (let i = 0, len = buffers.length; i < len; i++) {
        totalLength += buffers[i].byteLength;
      }
    }
    const ret = VSBuffer.alloc(totalLength);
    let offset = 0;
    for (let i = 0, len = buffers.length; i < len; i++) {
      const element = buffers[i];
      ret.set(element, offset);
      offset += element.byteLength;
    }
    return ret;
  }
  constructor(buffer) {
    this.buffer = buffer;
    this.byteLength = this.buffer.byteLength;
  }
  /**
   * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
   */
  clone() {
    const result = VSBuffer.alloc(this.byteLength);
    result.set(this);
    return result;
  }
  toString() {
    if (hasBuffer) {
      return this.buffer.toString();
    } else {
      if (!textDecoder) {
        textDecoder = new TextDecoder();
      }
      return textDecoder.decode(this.buffer);
    }
  }
  slice(start, end) {
    return new VSBuffer(this.buffer.subarray(start, end));
  }
  set(array, offset) {
    if (array instanceof VSBuffer) {
      this.buffer.set(array.buffer, offset);
    } else if (array instanceof Uint8Array) {
      this.buffer.set(array, offset);
    } else if (array instanceof ArrayBuffer) {
      this.buffer.set(new Uint8Array(array), offset);
    } else if (ArrayBuffer.isView(array)) {
      this.buffer.set(new Uint8Array(array.buffer, array.byteOffset, array.byteLength), offset);
    } else {
      throw new Error(`Unknown argument 'array'`);
    }
  }
  readUInt32BE(offset) {
    return readUInt32BE(this.buffer, offset);
  }
  writeUInt32BE(value, offset) {
    writeUInt32BE(this.buffer, value, offset);
  }
  readUInt32LE(offset) {
    return readUInt32LE(this.buffer, offset);
  }
  writeUInt32LE(value, offset) {
    writeUInt32LE(this.buffer, value, offset);
  }
  readUInt8(offset) {
    return readUInt8(this.buffer, offset);
  }
  writeUInt8(value, offset) {
    writeUInt8(this.buffer, value, offset);
  }
  indexOf(subarray, offset = 0) {
    return binaryIndexOf(this.buffer, subarray instanceof VSBuffer ? subarray.buffer : subarray, offset);
  }
  equals(other) {
    if (this === other) {
      return true;
    }
    if (this.byteLength !== other.byteLength) {
      return false;
    }
    return this.buffer.every((value, index) => value === other.buffer[index]);
  }
}
function binaryIndexOf(haystack, needle, offset = 0) {
  const needleLen = needle.byteLength;
  const haystackLen = haystack.byteLength;
  if (needleLen === 0) {
    return 0;
  }
  if (needleLen === 1) {
    return haystack.indexOf(needle[0]);
  }
  if (needleLen > haystackLen - offset) {
    return -1;
  }
  const table = indexOfTable.value;
  table.fill(needle.length);
  for (let i2 = 0; i2 < needle.length; i2++) {
    table[needle[i2]] = needle.length - i2 - 1;
  }
  let i = offset + needle.length - 1;
  let j = i;
  let result = -1;
  while (i < haystackLen) {
    if (haystack[i] === needle[j]) {
      if (j === 0) {
        result = i;
        break;
      }
      i--;
      j--;
    } else {
      i += Math.max(needle.length - j, table[haystack[i]]);
      j = needle.length - 1;
    }
  }
  return result;
}
__name(binaryIndexOf, "binaryIndexOf");
function readUInt16LE(source, offset) {
  return source[offset + 0] << 0 >>> 0 | source[offset + 1] << 8 >>> 0;
}
__name(readUInt16LE, "readUInt16LE");
function writeUInt16LE(destination, value, offset) {
  destination[offset + 0] = value & 255;
  value = value >>> 8;
  destination[offset + 1] = value & 255;
}
__name(writeUInt16LE, "writeUInt16LE");
function readUInt32BE(source, offset) {
  return source[offset] * 2 ** 24 + source[offset + 1] * 2 ** 16 + source[offset + 2] * 2 ** 8 + source[offset + 3];
}
__name(readUInt32BE, "readUInt32BE");
function writeUInt32BE(destination, value, offset) {
  destination[offset + 3] = value;
  value = value >>> 8;
  destination[offset + 2] = value;
  value = value >>> 8;
  destination[offset + 1] = value;
  value = value >>> 8;
  destination[offset] = value;
}
__name(writeUInt32BE, "writeUInt32BE");
function readUInt32LE(source, offset) {
  return source[offset + 0] << 0 >>> 0 | source[offset + 1] << 8 >>> 0 | source[offset + 2] << 16 >>> 0 | source[offset + 3] << 24 >>> 0;
}
__name(readUInt32LE, "readUInt32LE");
function writeUInt32LE(destination, value, offset) {
  destination[offset + 0] = value & 255;
  value = value >>> 8;
  destination[offset + 1] = value & 255;
  value = value >>> 8;
  destination[offset + 2] = value & 255;
  value = value >>> 8;
  destination[offset + 3] = value & 255;
}
__name(writeUInt32LE, "writeUInt32LE");
function readUInt8(source, offset) {
  return source[offset];
}
__name(readUInt8, "readUInt8");
function writeUInt8(destination, value, offset) {
  destination[offset] = value;
}
__name(writeUInt8, "writeUInt8");
function readableToBuffer(readable) {
  return streams.consumeReadable(readable, (chunks) => VSBuffer.concat(chunks));
}
__name(readableToBuffer, "readableToBuffer");
function bufferToReadable(buffer) {
  return streams.toReadable(buffer);
}
__name(bufferToReadable, "bufferToReadable");
function streamToBuffer(stream) {
  return streams.consumeStream(stream, (chunks) => VSBuffer.concat(chunks));
}
__name(streamToBuffer, "streamToBuffer");
async function bufferedStreamToBuffer(bufferedStream) {
  if (bufferedStream.ended) {
    return VSBuffer.concat(bufferedStream.buffer);
  }
  return VSBuffer.concat([
    // Include already read chunks...
    ...bufferedStream.buffer,
    // ...and all additional chunks
    await streamToBuffer(bufferedStream.stream)
  ]);
}
__name(bufferedStreamToBuffer, "bufferedStreamToBuffer");
function bufferToStream(buffer) {
  return streams.toStream(buffer, (chunks) => VSBuffer.concat(chunks));
}
__name(bufferToStream, "bufferToStream");
function streamToBufferReadableStream(stream) {
  return streams.transform(stream, { data: /* @__PURE__ */ __name((data) => typeof data === "string" ? VSBuffer.fromString(data) : VSBuffer.wrap(data), "data") }, (chunks) => VSBuffer.concat(chunks));
}
__name(streamToBufferReadableStream, "streamToBufferReadableStream");
function newWriteableBufferStream(options) {
  return streams.newWriteableStream((chunks) => VSBuffer.concat(chunks), options);
}
__name(newWriteableBufferStream, "newWriteableBufferStream");
function prefixedBufferReadable(prefix, readable) {
  return streams.prefixedReadable(prefix, readable, (chunks) => VSBuffer.concat(chunks));
}
__name(prefixedBufferReadable, "prefixedBufferReadable");
function prefixedBufferStream(prefix, stream) {
  return streams.prefixedStream(prefix, stream, (chunks) => VSBuffer.concat(chunks));
}
__name(prefixedBufferStream, "prefixedBufferStream");
function decodeBase64(encoded) {
  let building = 0;
  let remainder = 0;
  let bufi = 0;
  const buffer = new Uint8Array(Math.floor(encoded.length / 4 * 3));
  const append = /* @__PURE__ */ __name((value) => {
    switch (remainder) {
      case 3:
        buffer[bufi++] = building | value;
        remainder = 0;
        break;
      case 2:
        buffer[bufi++] = building | value >>> 2;
        building = value << 6;
        remainder = 3;
        break;
      case 1:
        buffer[bufi++] = building | value >>> 4;
        building = value << 4;
        remainder = 2;
        break;
      default:
        building = value << 2;
        remainder = 1;
    }
  }, "append");
  for (let i = 0; i < encoded.length; i++) {
    const code = encoded.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      append(code - 65);
    } else if (code >= 97 && code <= 122) {
      append(code - 97 + 26);
    } else if (code >= 48 && code <= 57) {
      append(code - 48 + 52);
    } else if (code === 43 || code === 45) {
      append(62);
    } else if (code === 47 || code === 95) {
      append(63);
    } else if (code === 61) {
      break;
    } else {
      throw new SyntaxError(`Unexpected base64 character ${encoded[i]}`);
    }
  }
  const unpadded = bufi;
  while (remainder > 0) {
    append(0);
  }
  return VSBuffer.wrap(buffer).slice(0, unpadded);
}
__name(decodeBase64, "decodeBase64");
const base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const base64UrlSafeAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
function encodeBase64({ buffer }, padded = true, urlSafe = false) {
  const dictionary = urlSafe ? base64UrlSafeAlphabet : base64Alphabet;
  let output = "";
  const remainder = buffer.byteLength % 3;
  let i = 0;
  for (; i < buffer.byteLength - remainder; i += 3) {
    const a = buffer[i + 0];
    const b = buffer[i + 1];
    const c = buffer[i + 2];
    output += dictionary[a >>> 2];
    output += dictionary[(a << 4 | b >>> 4) & 63];
    output += dictionary[(b << 2 | c >>> 6) & 63];
    output += dictionary[c & 63];
  }
  if (remainder === 1) {
    const a = buffer[i + 0];
    output += dictionary[a >>> 2];
    output += dictionary[a << 4 & 63];
    if (padded) {
      output += "==";
    }
  } else if (remainder === 2) {
    const a = buffer[i + 0];
    const b = buffer[i + 1];
    output += dictionary[a >>> 2];
    output += dictionary[(a << 4 | b >>> 4) & 63];
    output += dictionary[b << 2 & 63];
    if (padded) {
      output += "=";
    }
  }
  return output;
}
__name(encodeBase64, "encodeBase64");
export {
  VSBuffer,
  binaryIndexOf,
  bufferToReadable,
  bufferToStream,
  bufferedStreamToBuffer,
  decodeBase64,
  encodeBase64,
  newWriteableBufferStream,
  prefixedBufferReadable,
  prefixedBufferStream,
  readUInt16LE,
  readUInt32BE,
  readUInt32LE,
  readUInt8,
  readableToBuffer,
  streamToBuffer,
  streamToBufferReadableStream,
  writeUInt16LE,
  writeUInt32BE,
  writeUInt32LE,
  writeUInt8
};
//# sourceMappingURL=buffer.js.map
