var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Runtime } from "../../effect";
import { Emitter, Event } from "vs/base/common/event.js";
import {
  FileSystemProviderCapabilities
} from "vs/platform/files/common/files.js";
import {
  Delete,
  Mkdir,
  Readdir,
  ReadFile,
  Rename,
  Stat,
  Unwatch,
  Watch,
  WriteFile
} from "../../../Integration/Tauri/Wrapper.js";
class FileSystemProviderImpl {
  static {
    __name(this, "FileSystemProviderImpl");
  }
  WatchCorrelationId = 0;
  _onDidChangeFile = new Emitter();
  // --- IFileSystemProvider Implementation ---
  capabilities = FileSystemProviderCapabilities.FileReadWrite | FileSystemProviderCapabilities.PathCaseSensitive;
  onDidChangeCapabilities = Event.None;
  onDidChangeFile = this._onDidChangeFile.event;
  run = /* @__PURE__ */ __name((effect) => Runtime.runPromise(Runtime.defaultRuntime, effect), "run");
  stat = /* @__PURE__ */ __name((resource) => this.run(Stat(resource)), "stat");
  readdir = /* @__PURE__ */ __name((resource) => this.run(Readdir(resource)), "readdir");
  mkdir = /* @__PURE__ */ __name((resource) => this.run(Mkdir(resource)), "mkdir");
  readFile = /* @__PURE__ */ __name((resource) => this.run(ReadFile(resource)), "readFile");
  writeFile = /* @__PURE__ */ __name((resource, content, opts) => this.run(WriteFile(resource, content, opts)), "writeFile");
  delete = /* @__PURE__ */ __name((resource, opts) => this.run(Delete(resource, opts)), "delete");
  rename = /* @__PURE__ */ __name((from, to, opts) => this.run(Rename(from, to, opts)), "rename");
  watch = /* @__PURE__ */ __name((resource, opts) => {
    const CorrelationId = this.WatchCorrelationId++;
    Effect.runFork(Watch(resource, { ...opts, correlationId }));
    return {
      dispose: /* @__PURE__ */ __name(() => Effect.runFork(Unwatch(CorrelationId)), "dispose")
    };
  }, "watch");
}
const Definition = Effect.sync(() => new FileSystemProviderImpl());
var Definition_default = Definition;
export {
  Definition_default as default
};
//# sourceMappingURL=Definition.js.map
