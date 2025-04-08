var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Barrier } from "../../../base/common/async.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { IPCServer } from "../../../base/parts/ipc/common/ipc.js";
import { IProductService } from "../../product/common/productService.js";
import { IExtensionGalleryManifest, IExtensionGalleryManifestService } from "./extensionGalleryManifest.js";
import { ExtensionGalleryManifestService } from "./extensionGalleryManifestService.js";
let ExtensionGalleryManifestIPCService = class extends ExtensionGalleryManifestService {
  static {
    __name(this, "ExtensionGalleryManifestIPCService");
  }
  _onDidChangeExtensionGalleryManifest = this._register(new Emitter());
  onDidChangeExtensionGalleryManifest = this._onDidChangeExtensionGalleryManifest.event;
  extensionGalleryManifest;
  barrier = new Barrier();
  constructor(server, productService) {
    super(productService);
    server.registerChannel("extensionGalleryManifest", {
      listen: /* @__PURE__ */ __name(() => Event.None, "listen"),
      call: /* @__PURE__ */ __name(async (context, command, args) => {
        switch (command) {
          case "setExtensionGalleryManifest":
            return Promise.resolve(this.setExtensionGalleryManifest(args[0]));
        }
        throw new Error("Invalid call");
      }, "call")
    });
  }
  async getExtensionGalleryManifest() {
    await this.barrier.wait();
    return this.extensionGalleryManifest ?? null;
  }
  setExtensionGalleryManifest(manifest) {
    this.extensionGalleryManifest = manifest;
    this._onDidChangeExtensionGalleryManifest.fire(manifest);
    this.barrier.open();
  }
};
ExtensionGalleryManifestIPCService = __decorateClass([
  __decorateParam(1, IProductService)
], ExtensionGalleryManifestIPCService);
export {
  ExtensionGalleryManifestIPCService
};
//# sourceMappingURL=extensionGalleryManifestServiceIpc.js.map
