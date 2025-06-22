var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Barrier } from "../../../base/common/async.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { IProductService } from "../../product/common/productService.js";
import { ExtensionGalleryManifestService } from "./extensionGalleryManifestService.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
let ExtensionGalleryManifestIPCService = class ExtensionGalleryManifestIPCService2 extends ExtensionGalleryManifestService {
  static {
    __name(this, "ExtensionGalleryManifestIPCService");
  }
  constructor(server, productService) {
    super(productService);
    this._onDidChangeExtensionGalleryManifest = this._register(new Emitter());
    this.onDidChangeExtensionGalleryManifest = this._onDidChangeExtensionGalleryManifest.event;
    this.barrier = new Barrier();
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
ExtensionGalleryManifestIPCService = __decorate([
  __param(1, IProductService)
], ExtensionGalleryManifestIPCService);
export {
  ExtensionGalleryManifestIPCService
};
//# sourceMappingURL=extensionGalleryManifestServiceIpc.js.map
