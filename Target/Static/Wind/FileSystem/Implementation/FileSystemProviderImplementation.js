var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer, Context } from "effect";
import { URI } from "../Type/URI.js";
import { FileType } from "../Type/FileType.js";
import {
  FileNotFoundError,
  FileExistsError,
  PermissionError,
  InvalidPathError,
  NotSupportedError,
  UnknownFileSystemError,
  toFileSystemProviderError
} from "../Error/FileSystemProviderError.js";
import { IPC } from "../../Effect/IPC.js";
const MountainCommands = {
  READ: "file:read",
  WRITE: "file:write",
  STAT: "file:stat",
  DELETE: "file:delete",
  MKDIR: "file:mkdir",
  RMDIR: "file:delete",
  // Mountain doesn't have rmdir, uses delete
  READDIR: "file:readdir",
  COPY: "file:copy",
  MOVE: "file:move"
};
const FileSystemProviderTag = Context.GenericTag("FileSystemProvider");
function uriToPath(uri) {
  const path = uri.fsPath();
  if (path === null) {
    throw new InvalidPathError(uri.toString());
  }
  return path;
}
__name(uriToPath, "uriToPath");
function pathToUri(path) {
  return URI.file(path);
}
__name(pathToUri, "pathToUri");
function toIStat(stats) {
  let type;
  if (stats.is_directory) {
    type = FileType.Directory;
  } else if (stats.is_file) {
    type = FileType.File;
  } else {
    type = FileType.Unknown;
  }
  return {
    type,
    size: stats.size ?? 0,
    ctime: stats.created ?? stats.modified ?? Date.now(),
    mtime: stats.modified ?? Date.now()
  };
}
__name(toIStat, "toIStat");
function toDirectoryEntries(entries) {
  return entries.map((entry) => {
    let type;
    if (entry.is_directory) {
      type = FileType.Directory;
    } else if (entry.is_file) {
      type = FileType.File;
    } else {
      type = FileType.Unknown;
    }
    return [entry.name, type];
  });
}
__name(toDirectoryEntries, "toDirectoryEntries");
const createProvider = /* @__PURE__ */ __name((invoke) => {
  class MountainFileSystemProvider {
    static {
      __name(this, "MountainFileSystemProvider");
    }
    async readFile(uri) {
      const path = uriToPath(uri);
      try {
        const result = await invoke(MountainCommands.READ, path);
        if (typeof result === "string") {
          return new TextEncoder().encode(result);
        }
        if (result instanceof Uint8Array) {
          return result;
        }
        if (Array.isArray(result)) {
          return new Uint8Array(result);
        }
        throw new UnknownFileSystemError("Unexpected result format from file:read");
      } catch (error) {
        throw toFileSystemProviderError(error, "readFile", path);
      }
    }
    async writeFile(uri, content, options) {
      const path = uriToPath(uri);
      try {
        const contentStr = new TextDecoder().decode(content);
        await invoke(MountainCommands.WRITE, path, contentStr);
      } catch (error) {
        throw toFileSystemProviderError(error, "writeFile", path);
      }
    }
    async delete(uri) {
      const path = uriToPath(uri);
      try {
        await invoke(MountainCommands.DELETE, path);
      } catch (error) {
        throw toFileSystemProviderError(error, "delete", path);
      }
    }
    async copy(source, destination) {
      const sourcePath = uriToPath(source);
      const destPath = uriToPath(destination);
      try {
        await invoke(MountainCommands.COPY, sourcePath, destPath);
      } catch (error) {
        throw toFileSystemProviderError(error, "copy", `${sourcePath} -> ${destPath}`);
      }
    }
    async move(source, destination) {
      const sourcePath = uriToPath(source);
      const destPath = uriToPath(destination);
      try {
        await invoke(MountainCommands.MOVE, sourcePath, destPath);
      } catch (error) {
        throw toFileSystemProviderError(error, "move", `${sourcePath} -> ${destPath}`);
      }
    }
    async readdir(uri) {
      const path = uriToPath(uri);
      try {
        const result = await invoke(MountainCommands.READDIR, path);
        if (!Array.isArray(result)) {
          throw new UnknownFileSystemError("Unexpected result format from file:readdir");
        }
        return toDirectoryEntries(result);
      } catch (error) {
        throw toFileSystemProviderError(error, "readdir", path);
      }
    }
    async mkdir(uri, options = {}) {
      const path = uriToPath(uri);
      try {
        await invoke(MountainCommands.MKDIR, path, options.recursive ?? true);
      } catch (error) {
        throw toFileSystemProviderError(error, "mkdir", path);
      }
    }
    async rmdir(uri) {
      const path = uriToPath(uri);
      try {
        await invoke(MountainCommands.RMDIR, path);
      } catch (error) {
        throw toFileSystemProviderError(error, "rmdir", path);
      }
    }
    async stat(uri) {
      const path = uriToPath(uri);
      try {
        const result = await invoke(MountainCommands.STAT, path);
        if (!result || typeof result !== "object") {
          throw new UnknownFileSystemError("Unexpected result format from file:stat");
        }
        return toIStat(result);
      } catch (error) {
        throw toFileSystemProviderError(error, "stat", path);
      }
    }
    watch(uri, options) {
      return {
        dispose: /* @__PURE__ */ __name(() => {
        }, "dispose")
      };
    }
  }
  return new MountainFileSystemProvider();
}, "createProvider");
const FileSystemProviderLive = Layer.effect(
  FileSystemProviderTag,
  Effect.gen(function* () {
    const IPCService = yield* IPC;
    const provider = createProvider(
      (command, ...args) => Effect.runPromise(IPCService.invoke(command)(args))
    );
    return {
      getProvider: Effect.succeed(provider),
      readFile: /* @__PURE__ */ __name((uri) => Effect.tryPromise({
        try: /* @__PURE__ */ __name(() => provider.readFile(URI.parse(uri)), "try"),
        catch: /* @__PURE__ */ __name((error) => toFileSystemProviderError(error, "readFile", uri), "catch")
      }), "readFile"),
      writeFile: /* @__PURE__ */ __name((uri, content, options = {}) => Effect.tryPromise({
        try: /* @__PURE__ */ __name(() => provider.writeFile(URI.parse(uri), content, {
          create: options.create ?? true,
          overwrite: options.overwrite ?? true
        }), "try"),
        catch: /* @__PURE__ */ __name((error) => toFileSystemProviderError(error, "writeFile", uri), "catch")
      }), "writeFile"),
      delete: /* @__PURE__ */ __name((uri) => Effect.tryPromise({
        try: /* @__PURE__ */ __name(() => provider.delete(URI.parse(uri)), "try"),
        catch: /* @__PURE__ */ __name((error) => toFileSystemProviderError(error, "delete", uri), "catch")
      }), "delete"),
      copy: /* @__PURE__ */ __name((source, destination) => Effect.tryPromise({
        try: /* @__PURE__ */ __name(() => provider.copy(URI.parse(source), URI.parse(destination)), "try"),
        catch: /* @__PURE__ */ __name((error) => toFileSystemProviderError(error, "copy", `${source} -> ${destination}`), "catch")
      }), "copy"),
      move: /* @__PURE__ */ __name((source, destination) => Effect.tryPromise({
        try: /* @__PURE__ */ __name(() => provider.move(URI.parse(source), URI.parse(destination)), "try"),
        catch: /* @__PURE__ */ __name((error) => toFileSystemProviderError(error, "move", `${source} -> ${destination}`), "catch")
      }), "move"),
      readdir: /* @__PURE__ */ __name((uri) => Effect.tryPromise({
        try: /* @__PURE__ */ __name(() => provider.readdir(URI.parse(uri)), "try"),
        catch: /* @__PURE__ */ __name((error) => toFileSystemProviderError(error, "readdir", uri), "catch")
      }).pipe(
        Effect.map(
          (entries) => entries.map(([name, type]) => [name, type])
        )
      ), "readdir"),
      mkdir: /* @__PURE__ */ __name((uri, options = {}) => Effect.tryPromise({
        try: /* @__PURE__ */ __name(() => provider.mkdir(URI.parse(uri), options), "try"),
        catch: /* @__PURE__ */ __name((error) => toFileSystemProviderError(error, "mkdir", uri), "catch")
      }), "mkdir"),
      rmdir: /* @__PURE__ */ __name((uri) => Effect.tryPromise({
        try: /* @__PURE__ */ __name(() => provider.rmdir(URI.parse(uri)), "try"),
        catch: /* @__PURE__ */ __name((error) => toFileSystemProviderError(error, "rmdir", uri), "catch")
      }), "rmdir"),
      stat: /* @__PURE__ */ __name((uri) => Effect.tryPromise({
        try: /* @__PURE__ */ __name(() => provider.stat(URI.parse(uri)), "try"),
        catch: /* @__PURE__ */ __name((error) => toFileSystemProviderError(error, "stat", uri), "catch")
      }), "stat")
    };
  })
);
var FileSystemProviderImplementation_default = FileSystemProviderLive;
export {
  FileSystemProviderLive,
  FileSystemProviderTag,
  MountainCommands,
  FileSystemProviderImplementation_default as default
};
//# sourceMappingURL=FileSystemProviderImplementation.js.map
