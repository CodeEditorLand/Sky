var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
import { VSBuffer } from "../../../../base/common/buffer.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { InMemoryFileSystemProvider } from "../../../../platform/files/common/inMemoryFilesystemProvider.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IURLService } from "../../../../platform/url/common/url.js";
import { McpAddConfigurationCommand } from "./mcpCommandsAddConfiguration.js";
const providerScheme = "mcp-install";
let McpUrlHandler = class McpUrlHandler2 extends Disposable {
  static {
    __name(this, "McpUrlHandler");
  }
  static {
    this.scheme = providerScheme;
  }
  constructor(urlService, _instaService, _fileService) {
    super();
    this._instaService = _instaService;
    this._fileService = _fileService;
    this._fileSystemProvider = new Lazy(() => {
      return this._instaService.invokeFunction((accessor) => {
        const fileService = accessor.get(IFileService);
        const filesystem = new InMemoryFileSystemProvider();
        this._register(fileService.registerProvider(providerScheme, filesystem));
        return providerScheme;
      });
    });
    this._register(urlService.registerHandler(this));
  }
  async handleURL(uri, options) {
    if (uri.path !== "mcp/install") {
      return false;
    }
    let parsed;
    try {
      parsed = JSON.parse(decodeURIComponent(uri.query));
    } catch (e) {
      return false;
    }
    const { name, ...rest } = parsed;
    const scheme = this._fileSystemProvider.value;
    const fileUri = URI.from({ scheme, path: `/${encodeURIComponent(name)}.json` });
    await this._fileService.writeFile(fileUri, VSBuffer.fromString(JSON.stringify(rest, null, "	")));
    const addConfigHelper = this._instaService.createInstance(McpAddConfigurationCommand, void 0);
    addConfigHelper.pickForUrlHandler(fileUri, true);
    return Promise.resolve(true);
  }
};
McpUrlHandler = __decorate([
  __param(0, IURLService),
  __param(1, IInstantiationService),
  __param(2, IFileService)
], McpUrlHandler);
export {
  McpUrlHandler
};
//# sourceMappingURL=mcpUrlHandler.js.map
