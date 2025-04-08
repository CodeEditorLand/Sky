var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createWriteStream, WriteStream, promises } from "fs";
import { Readable } from "stream";
import { createCancelablePromise, Sequencer } from "../common/async.js";
import { CancellationToken } from "../common/cancellation.js";
import * as path from "../common/path.js";
import { assertIsDefined } from "../common/types.js";
import { Promises } from "./pfs.js";
import * as nls from "../../nls.js";
const CorruptZipMessage = "end of central directory record signature not found";
const CORRUPT_ZIP_PATTERN = new RegExp(CorruptZipMessage);
class ExtractError extends Error {
  static {
    __name(this, "ExtractError");
  }
  type;
  constructor(type, cause) {
    let message = cause.message;
    switch (type) {
      case "CorruptZip":
        message = `Corrupt ZIP: ${message}`;
        break;
    }
    super(message);
    this.type = type;
    this.cause = cause;
  }
}
function modeFromEntry(entry) {
  const attr = entry.externalFileAttributes >> 16 || 33188;
  return [
    448,
    56,
    7
    /* S_IRWXO */
  ].map((mask) => attr & mask).reduce(
    (a, b) => a + b,
    attr & 61440
    /* S_IFMT */
  );
}
__name(modeFromEntry, "modeFromEntry");
function toExtractError(err) {
  if (err instanceof ExtractError) {
    return err;
  }
  let type = void 0;
  if (CORRUPT_ZIP_PATTERN.test(err.message)) {
    type = "CorruptZip";
  }
  return new ExtractError(type, err);
}
__name(toExtractError, "toExtractError");
function extractEntry(stream, fileName, mode, targetPath, options, token) {
  const dirName = path.dirname(fileName);
  const targetDirName = path.join(targetPath, dirName);
  if (!targetDirName.startsWith(targetPath)) {
    return Promise.reject(new Error(nls.localize("invalid file", "Error extracting {0}. Invalid file.", fileName)));
  }
  const targetFileName = path.join(targetPath, fileName);
  let istream;
  token.onCancellationRequested(() => {
    istream?.destroy();
  });
  return Promise.resolve(promises.mkdir(targetDirName, { recursive: true })).then(() => new Promise((c, e) => {
    if (token.isCancellationRequested) {
      return;
    }
    try {
      istream = createWriteStream(targetFileName, { mode });
      istream.once("close", () => c());
      istream.once("error", e);
      stream.once("error", e);
      stream.pipe(istream);
    } catch (error) {
      e(error);
    }
  }));
}
__name(extractEntry, "extractEntry");
function extractZip(zipfile, targetPath, options, token) {
  let last = createCancelablePromise(() => Promise.resolve());
  let extractedEntriesCount = 0;
  const listener = token.onCancellationRequested(() => {
    last.cancel();
    zipfile.close();
  });
  return new Promise((c, e) => {
    const throttler = new Sequencer();
    const readNextEntry = /* @__PURE__ */ __name((token2) => {
      if (token2.isCancellationRequested) {
        return;
      }
      extractedEntriesCount++;
      zipfile.readEntry();
    }, "readNextEntry");
    zipfile.once("error", e);
    zipfile.once("close", () => last.then(() => {
      if (token.isCancellationRequested || zipfile.entryCount === extractedEntriesCount) {
        c();
      } else {
        e(new ExtractError("Incomplete", new Error(nls.localize("incompleteExtract", "Incomplete. Found {0} of {1} entries", extractedEntriesCount, zipfile.entryCount))));
      }
    }, e));
    zipfile.readEntry();
    zipfile.on("entry", (entry) => {
      if (token.isCancellationRequested) {
        return;
      }
      if (!options.sourcePathRegex.test(entry.fileName)) {
        readNextEntry(token);
        return;
      }
      const fileName = entry.fileName.replace(options.sourcePathRegex, "");
      if (/\/$/.test(fileName)) {
        const targetFileName = path.join(targetPath, fileName);
        last = createCancelablePromise((token2) => promises.mkdir(targetFileName, { recursive: true }).then(() => readNextEntry(token2)).then(void 0, e));
        return;
      }
      const stream = openZipStream(zipfile, entry);
      const mode = modeFromEntry(entry);
      last = createCancelablePromise((token2) => throttler.queue(() => stream.then((stream2) => extractEntry(stream2, fileName, mode, targetPath, options, token2).then(() => readNextEntry(token2)))).then(null, e));
    });
  }).finally(() => listener.dispose());
}
__name(extractZip, "extractZip");
async function openZip(zipFile, lazy = false) {
  const { open } = await import("yauzl");
  return new Promise((resolve, reject) => {
    open(zipFile, lazy ? { lazyEntries: true } : void 0, (error, zipfile) => {
      if (error) {
        reject(toExtractError(error));
      } else {
        resolve(assertIsDefined(zipfile));
      }
    });
  });
}
__name(openZip, "openZip");
function openZipStream(zipFile, entry) {
  return new Promise((resolve, reject) => {
    zipFile.openReadStream(entry, (error, stream) => {
      if (error) {
        reject(toExtractError(error));
      } else {
        resolve(assertIsDefined(stream));
      }
    });
  });
}
__name(openZipStream, "openZipStream");
async function zip(zipPath, files) {
  const { ZipFile } = await import("yazl");
  return new Promise((c, e) => {
    const zip2 = new ZipFile();
    files.forEach((f) => {
      if (f.contents) {
        zip2.addBuffer(typeof f.contents === "string" ? Buffer.from(f.contents, "utf8") : f.contents, f.path);
      } else if (f.localPath) {
        zip2.addFile(f.localPath, f.path);
      }
    });
    zip2.end();
    const zipStream = createWriteStream(zipPath);
    zip2.outputStream.pipe(zipStream);
    zip2.outputStream.once("error", e);
    zipStream.once("error", e);
    zipStream.once("finish", () => c(zipPath));
  });
}
__name(zip, "zip");
function extract(zipPath, targetPath, options = {}, token) {
  const sourcePathRegex = new RegExp(options.sourcePath ? `^${options.sourcePath}` : "");
  let promise = openZip(zipPath, true);
  if (options.overwrite) {
    promise = promise.then((zipfile) => Promises.rm(targetPath).then(() => zipfile));
  }
  return promise.then((zipfile) => extractZip(zipfile, targetPath, { sourcePathRegex }, token));
}
__name(extract, "extract");
function read(zipPath, filePath) {
  return openZip(zipPath).then((zipfile) => {
    return new Promise((c, e) => {
      zipfile.on("entry", (entry) => {
        if (entry.fileName === filePath) {
          openZipStream(zipfile, entry).then((stream) => c(stream), (err) => e(err));
        }
      });
      zipfile.once("close", () => e(new Error(nls.localize("notFound", "{0} not found inside zip.", filePath))));
    });
  });
}
__name(read, "read");
function buffer(zipPath, filePath) {
  return read(zipPath, filePath).then((stream) => {
    return new Promise((c, e) => {
      const buffers = [];
      stream.once("error", e);
      stream.on("data", (b) => buffers.push(b));
      stream.on("end", () => c(Buffer.concat(buffers)));
    });
  });
}
__name(buffer, "buffer");
export {
  CorruptZipMessage,
  ExtractError,
  buffer,
  extract,
  zip
};
//# sourceMappingURL=zip.js.map
