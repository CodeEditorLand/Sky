var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
async function invokeTauri(command, args = {}) {
  try {
    if (typeof window.__TAURI__?.invoke !== "undefined") {
      return await window.__TAURI__.invoke(command, args);
    }
    if (typeof window.TAURI?.invoke !== "undefined") {
      return await window.TAURI.invoke(command, args);
    }
    throw new Error(`Tauri invoke not available for command: ${command}`);
  } catch (error) {
    console.error(`[FileSystemPolyfill] Tauri invoke failed for ${command}:`, error);
    throw error;
  }
}
__name(invokeTauri, "invokeTauri");
function mountainStatsToStats(mountainStats) {
  return {
    dev: 1,
    ino: 1,
    mode: mountainStats.is_file ? 33188 : 16877,
    nlink: 1,
    uid: 1e3,
    gid: 1e3,
    rdev: 0,
    size: mountainStats.size,
    atimeMs: new Date(mountainStats.accessed).getTime(),
    mtimeMs: new Date(mountainStats.modified).getTime(),
    ctimeMs: new Date(mountainStats.created).getTime(),
    birthtimeMs: new Date(mountainStats.created).getTime(),
    atime: new Date(mountainStats.accessed),
    mtime: new Date(mountainStats.modified),
    ctime: new Date(mountainStats.created),
    birthtime: new Date(mountainStats.created),
    isFile() {
      return mountainStats.is_file;
    },
    isDirectory() {
      return mountainStats.is_dir;
    },
    isBlockDevice() {
      return false;
    },
    isCharacterDevice() {
      return false;
    },
    isSymbolicLink() {
      return false;
    },
    isFIFO() {
      return false;
    },
    isSocket() {
      return false;
    }
  };
}
__name(mountainStatsToStats, "mountainStatsToStats");
function createDirent(name, path, isDir) {
  return {
    name,
    path,
    isFile() {
      return !isDir;
    },
    isDirectory() {
      return isDir;
    },
    isBlockDevice() {
      return false;
    },
    isCharacterDevice() {
      return false;
    },
    isSymbolicLink() {
      return false;
    },
    isFIFO() {
      return false;
    },
    isSocket() {
      return false;
    }
  };
}
__name(createDirent, "createDirent");
async function readFile(path, options) {
  console.log(`[FileSystemPolyfill] readFile: ${path}`);
  const encoding = typeof options === "string" ? options : options?.encoding ?? "utf8";
  try {
    const content = await invokeTauri("file:read", {
      path,
      encoding: encoding === null ? "base64" : encoding
    });
    return encoding === null ? Buffer.from(content, "base64") : content;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[FileSystemPolyfill] readFile error: ${path}`, err);
    throw err;
  }
}
__name(readFile, "readFile");
async function writeFile(path, data, options) {
  console.log(`[FileSystemPolyfill] writeFile: ${path}`);
  let encoding = "utf8";
  if (typeof options === "string") {
    encoding = options;
  } else if (options) {
    encoding = options.encoding ?? "utf8";
  }
  let content;
  if (Buffer.isBuffer(data)) {
    content = data.toString(encoding ?? "utf8");
  } else {
    content = data;
  }
  try {
    await invokeTauri("file:write", {
      path,
      data: content,
      encoding
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[FileSystemPolyfill] writeFile error: ${path}`, err);
    throw err;
  }
}
__name(writeFile, "writeFile");
async function unlink(path) {
  console.log(`[FileSystemPolyfill] unlink: ${path}`);
  try {
    await invokeTauri("file:delete", {
      path,
      recursive: false
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[FileSystemPolyfill] unlink error: ${path}`, err);
    throw err;
  }
}
__name(unlink, "unlink");
async function rm(path, options) {
  console.log(`[FileSystemPolyfill] rm: ${path}`);
  opts = {
    recursive: false,
    force: false,
    ...options
  };
  try {
    await invokeTauri("file:delete", {
      path,
      recursive: opts.recursive ?? false,
      force: opts.force ?? false
    });
  } catch (error) {
    if (!opts.force) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`[FileSystemPolyfill] rm error: ${path}`, err);
      throw err;
    }
  }
}
__name(rm, "rm");
async function rename(oldPath, newPath) {
  console.log(`[FileSystemPolyfill] rename: ${oldPath} -> ${newPath}`);
  try {
    await invokeTauri("file:move", {
      from: oldPath,
      to: newPath
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[FileSystemPolyfill] rename error: ${oldPath}`, err);
    throw err;
  }
}
__name(rename, "rename");
async function copyFile(src, dest, options) {
  console.log(`[FileSystemPolyfill] copyFile: ${src} -> ${dest}`);
  try {
    await invokeTauri("file:copy", {
      from: src,
      to: dest
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[FileSystemPolyfill] copyFile error: ${src}`, err);
    throw err;
  }
}
__name(copyFile, "copyFile");
async function mkdir(path, options) {
  console.log(`[FileSystemPolyfill] mkdir: ${path}`);
  let opts2 = { recursive: false };
  if (typeof options === "boolean") {
    opts2.recursive = options;
  } else if (typeof options === "number") {
    opts2.recursive = false;
    opts2.mode = options;
  } else if (options) {
    opts2.recursive = options.recursive ?? false;
    opts2.mode = options.mode;
  }
  try {
    await invokeTauri("file:mkdir", {
      path,
      recursive: opts2.recursive ?? false,
      mode: opts2.mode ?? 493
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[FileSystemPolyfill] mkdir error: ${path}`, err);
    throw err;
  }
}
__name(mkdir, "mkdir");
async function rmdir(path) {
  console.log(`[FileSystemPolyfill] rmdir: ${path}`);
  try {
    await invokeTauri("file:delete", {
      path,
      recursive: false,
      is_rmdir: true
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[FileSystemPolyfill] rmdir error: ${path}`, err);
    throw err;
  }
}
__name(rmdir, "rmdir");
async function readdir(path, options) {
  console.log(`[FileSystemPolyfill] readdir: ${path}`);
  try {
    const withFileTypes = options?.withFileTypes ?? false;
    const entries = await invokeTauri("file:readdir", {
      path
    });
    if (withFileTypes) {
      return entries.map(
        (entry) => createDirent(entry.name, `${path}/${entry.name}`, !entry.is_file)
      );
    } else {
      return entries.map((entry) => entry.name);
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[FileSystemPolyfill] readdir error: ${path}`, err);
    throw err;
  }
}
__name(readdir, "readdir");
async function stat(path) {
  console.log(`[FileSystemPolyfill] stat: ${path}`);
  try {
    const mountainStats = await invokeTauri("file:stat", {
      path
    });
    return mountainStatsToStats(mountainStats);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[FileSystemPolyfill] stat error: ${path}`, err);
    throw err;
  }
}
__name(stat, "stat");
async function exists(path) {
  console.log(`[FileSystemPolyfill] exists: ${path}`);
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
__name(exists, "exists");
function open() {
  throw new Error("fs.open() is not supported in browser/Tauri environment. No file descriptor operations available.");
}
__name(open, "open");
function read() {
  throw new Error("fs.read() is not supported in browser/Tauri environment. Use readFile() instead.");
}
__name(read, "read");
function write() {
  throw new Error("fs.write() is not supported in browser/Tauri environment. Use writeFile() instead.");
}
__name(write, "write");
function close() {
  throw new Error("fs.close() is not supported in browser/Tauri environment.");
}
__name(close, "close");
function readFileSync() {
  throw new Error("fs.readFileSync() is not supported in browser/Tauri environment. Use async readFile() instead.");
}
__name(readFileSync, "readFileSync");
function writeFileSync() {
  throw new Error("fs.writeFileSync() is not supported in browser/Tauri environment. Use async writeFile() instead.");
}
__name(writeFileSync, "writeFileSync");
function watch() {
  throw new Error("fs.watch() is not supported. Use the FileWatcher service instead.");
}
__name(watch, "watch");
function watchFile() {
  throw new Error("fs.watchFile() is not supported. Use the FileWatcher service instead.");
}
__name(watchFile, "watchFile");
function symlink() {
  throw new Error("fs.symlink() is not fully supported in browser/Tauri environment.");
}
__name(symlink, "symlink");
function readlink() {
  throw new Error("fs.readlink() is not fully supported in browser/Tauri environment.");
}
__name(readlink, "readlink");
function chmod() {
  throw new Error("fs.chmod() is not supported in browser/Tauri environment.");
}
__name(chmod, "chmod");
function chown() {
  throw new Error("fs.chown() is not supported in browser/Tauri environment.");
}
__name(chown, "chown");
const fs = {
  readFile,
  writeFile,
  unlink,
  rm,
  rename,
  copyFile,
  mkdir,
  rmdir,
  readdir,
  stat,
  exists,
  // Constants (partial)
  constants: {
    O_RDONLY: 0,
    O_WRONLY: 1,
    O_RDWR: 2,
    O_CREAT: 64,
    O_TRUNC: 512,
    O_APPEND: 1024
  },
  // Not supported but included for TypeScript compatibility
  open,
  read,
  write,
  close,
  readFileSync,
  writeFileSync,
  watch,
  watchFile,
  symlink,
  readlink,
  chmod,
  chown,
  // Promise-based API for modern Node.js code
  promises: {
    readFile,
    writeFile,
    unlink,
    rm,
    rename,
    copyFile,
    mkdir,
    rmdir,
    readdir,
    stat,
    exists
  }
};
function installFileSystemPolyfill() {
  if (typeof window === "undefined") {
    return;
  }
  if (window.__FILE_SYSTEM_POLYFILL_INSTALLED__) {
    console.log("[FileSystemPolyfill] Already installed, skipping");
    return;
  }
  window.__FILE_SYSTEM_POLYFILL_INSTALLED__ = true;
  console.log("[FileSystemPolyfill] Installing Node.js fs module polyfill...");
  window.fs = fs;
  window.require = createRequireShim();
  if (typeof window.vscode !== "undefined") {
    window.vscode.fs = fs;
  }
  console.log("[FileSystemPolyfill] \u2713 Node.js fs module polyfill installed");
}
__name(installFileSystemPolyfill, "installFileSystemPolyfill");
function createRequireShim() {
  return (id) => {
    if (id === "fs") {
      return fs;
    }
    throw new Error(`Require shim only supports 'fs' module. Got: ${id}`);
  };
}
__name(createRequireShim, "createRequireShim");
var FileSystemPolyfill_default = {
  install: installFileSystemPolyfill,
  module: fs,
  // Individual exports for convenience
  readFile,
  writeFile,
  unlink,
  rm,
  rename,
  copyFile,
  mkdir,
  rmdir,
  readdir,
  stat,
  exists
};
if (typeof window !== "undefined") {
  installFileSystemPolyfill();
}
export {
  FileSystemPolyfill_default as default,
  installFileSystemPolyfill
};
//# sourceMappingURL=FileSystemPolyfill.js.map
