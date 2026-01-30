var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Barrier } from "../../../base/common/async.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
class McpGalleryManifestIPCService extends Disposable {
  static {
    __name(this, "McpGalleryManifestIPCService");
  }
  get mcpGalleryManifestStatus() {
    return this._mcpGalleryManifest ? "available" : "unavailable";
  }
  constructor(server) {
    super();
    this._onDidChangeMcpGalleryManifest = this._register(new Emitter());
    this.onDidChangeMcpGalleryManifest = this._onDidChangeMcpGalleryManifest.event;
    this._onDidChangeMcpGalleryManifestStatus = this._register(new Emitter());
    this.onDidChangeMcpGalleryManifestStatus = this._onDidChangeMcpGalleryManifestStatus.event;
    this.barrier = new Barrier();
    server.registerChannel("mcpGalleryManifest", {
      listen: /* @__PURE__ */ __name(() => Event.None, "listen"),
      call: /* @__PURE__ */ __name(async (context, command, args) => {
        switch (command) {
          case "setMcpGalleryManifest": {
            const manifest = Array.isArray(args) ? args[0] : null;
            return Promise.resolve(this.setMcpGalleryManifest(manifest));
          }
        }
        throw new Error("Invalid call");
      }, "call")
    });
  }
  async getMcpGalleryManifest() {
    await this.barrier.wait();
    return this._mcpGalleryManifest ?? null;
  }
  setMcpGalleryManifest(manifest) {
    this._mcpGalleryManifest = manifest;
    this._onDidChangeMcpGalleryManifest.fire(manifest);
    this._onDidChangeMcpGalleryManifestStatus.fire(this.mcpGalleryManifestStatus);
    this.barrier.open();
  }
}
export {
  McpGalleryManifestIPCService
};
//# sourceMappingURL=mcpGalleryManifestServiceIpc.js.map
