var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../base/common/buffer.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { canceled } from "../../../base/common/errors.js";
import { IDataTransformer, IErrorTransformer, WriteableStream } from "../../../base/common/stream.js";
import { URI } from "../../../base/common/uri.js";
import { localize } from "../../../nls.js";
import { createFileSystemProviderError, ensureFileSystemProviderError, IFileReadStreamOptions, FileSystemProviderErrorCode, IFileSystemProviderWithOpenReadWriteCloseCapability } from "./files.js";
async function readFileIntoStream(provider, resource, target, transformer, options, token) {
  let error = void 0;
  try {
    await doReadFileIntoStream(provider, resource, target, transformer, options, token);
  } catch (err) {
    error = err;
  } finally {
    if (error && options.errorTransformer) {
      error = options.errorTransformer(error);
    }
    if (typeof error !== "undefined") {
      target.error(error);
    }
    target.end();
  }
}
__name(readFileIntoStream, "readFileIntoStream");
async function doReadFileIntoStream(provider, resource, target, transformer, options, token) {
  throwIfCancelled(token);
  const handle = await provider.open(resource, { create: false });
  try {
    throwIfCancelled(token);
    let totalBytesRead = 0;
    let bytesRead = 0;
    let allowedRemainingBytes = options && typeof options.length === "number" ? options.length : void 0;
    let buffer = VSBuffer.alloc(Math.min(options.bufferSize, typeof allowedRemainingBytes === "number" ? allowedRemainingBytes : options.bufferSize));
    let posInFile = options && typeof options.position === "number" ? options.position : 0;
    let posInBuffer = 0;
    do {
      bytesRead = await provider.read(handle, posInFile, buffer.buffer, posInBuffer, buffer.byteLength - posInBuffer);
      posInFile += bytesRead;
      posInBuffer += bytesRead;
      totalBytesRead += bytesRead;
      if (typeof allowedRemainingBytes === "number") {
        allowedRemainingBytes -= bytesRead;
      }
      if (posInBuffer === buffer.byteLength) {
        await target.write(transformer(buffer));
        buffer = VSBuffer.alloc(Math.min(options.bufferSize, typeof allowedRemainingBytes === "number" ? allowedRemainingBytes : options.bufferSize));
        posInBuffer = 0;
      }
    } while (bytesRead > 0 && (typeof allowedRemainingBytes !== "number" || allowedRemainingBytes > 0) && throwIfCancelled(token) && throwIfTooLarge(totalBytesRead, options));
    if (posInBuffer > 0) {
      let lastChunkLength = posInBuffer;
      if (typeof allowedRemainingBytes === "number") {
        lastChunkLength = Math.min(posInBuffer, allowedRemainingBytes);
      }
      target.write(transformer(buffer.slice(0, lastChunkLength)));
    }
  } catch (error) {
    throw ensureFileSystemProviderError(error);
  } finally {
    await provider.close(handle);
  }
}
__name(doReadFileIntoStream, "doReadFileIntoStream");
function throwIfCancelled(token) {
  if (token.isCancellationRequested) {
    throw canceled();
  }
  return true;
}
__name(throwIfCancelled, "throwIfCancelled");
function throwIfTooLarge(totalBytesRead, options) {
  if (typeof options?.limits?.size === "number" && totalBytesRead > options.limits.size) {
    throw createFileSystemProviderError(localize("fileTooLargeError", "File is too large to open"), FileSystemProviderErrorCode.FileTooLarge);
  }
  return true;
}
__name(throwIfTooLarge, "throwIfTooLarge");
export {
  readFileIntoStream
};
//# sourceMappingURL=io.js.map
