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
import { VSBuffer } from "../../../../base/common/buffer.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { InMemoryFileSystemProvider } from "../../../../platform/files/common/inMemoryFilesystemProvider.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { McpConfigurationServer } from "../../../../platform/mcp/common/mcpPlatformTypes.js";
import { IOpenURLOptions, IURLHandler, IURLService } from "../../../../platform/url/common/url.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { McpAddConfigurationCommand } from "./mcpCommandsAddConfiguration.js";
const providerScheme = "mcp-install";
let McpUrlHandler = class extends Disposable {
  constructor(urlService, _instaService, _fileService) {
    super();
    this._instaService = _instaService;
    this._fileService = _fileService;
    this._register(urlService.registerHandler(this));
  }
  static {
    __name(this, "McpUrlHandler");
  }
  static scheme = providerScheme;
  _fileSystemProvider = new Lazy(() => {
    return this._instaService.invokeFunction((accessor) => {
      const fileService = accessor.get(IFileService);
      const filesystem = new InMemoryFileSystemProvider();
      this._register(fileService.registerProvider(providerScheme, filesystem));
      return providerScheme;
    });
  });
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
    await this._fileService.writeFile(
      fileUri,
      VSBuffer.fromString(JSON.stringify(rest, null, "	"))
    );
    const addConfigHelper = this._instaService.createInstance(McpAddConfigurationCommand, void 0);
    addConfigHelper.pickForUrlHandler(fileUri, true);
    return Promise.resolve(true);
  }
};
McpUrlHandler = __decorateClass([
  __decorateParam(0, IURLService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IFileService)
], McpUrlHandler);
export {
  McpUrlHandler
};
//# sourceMappingURL=mcpUrlHandler.js.map
