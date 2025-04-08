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
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Emitter } from "../../../../base/common/event.js";
import { IHeaders } from "../../../../base/parts/request/common/request.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { IExtensionGalleryManifestService, IExtensionGalleryManifest, ExtensionGalleryServiceUrlConfigKey } from "../../../../platform/extensionManagement/common/extensionGalleryManifest.js";
import { ExtensionGalleryManifestService } from "../../../../platform/extensionManagement/common/extensionGalleryManifestService.js";
import { resolveMarketplaceHeaders } from "../../../../platform/externalServices/common/marketplace.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ISharedProcessService } from "../../../../platform/ipc/electron-sandbox/services.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { asJson, IRequestService } from "../../../../platform/request/common/request.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IDefaultAccount, IDefaultAccountService } from "../../accounts/common/defaultAccount.js";
import { IHostService } from "../../host/browser/host.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
let WorkbenchExtensionGalleryManifestService = class extends ExtensionGalleryManifestService {
  constructor(productService, environmentService, fileService, telemetryService, storageService, remoteAgentService, sharedProcessService, configurationService, requestService, defaultAccountService, dialogService, hostService, logService) {
    super(productService);
    this.configurationService = configurationService;
    this.requestService = requestService;
    this.defaultAccountService = defaultAccountService;
    this.dialogService = dialogService;
    this.hostService = hostService;
    this.logService = logService;
    this.commonHeadersPromise = resolveMarketplaceHeaders(
      productService.version,
      productService,
      environmentService,
      configurationService,
      fileService,
      storageService,
      telemetryService
    );
    const channels = [sharedProcessService.getChannel("extensionGalleryManifest")];
    const remoteConnection = remoteAgentService.getConnection();
    if (remoteConnection) {
      channels.push(remoteConnection.getChannel("extensionGalleryManifest"));
    }
    this.getExtensionGalleryManifest().then((manifest) => {
      channels.forEach((channel) => channel.call("setExtensionGalleryManifest", [manifest]));
      this._register(this.onDidChangeExtensionGalleryManifest((manifest2) => channels.forEach((channel) => channel.call("setExtensionGalleryManifest", [manifest2]))));
    });
  }
  static {
    __name(this, "WorkbenchExtensionGalleryManifestService");
  }
  commonHeadersPromise;
  extensionGalleryManifest = null;
  _onDidChangeExtensionGalleryManifest = this._register(new Emitter());
  onDidChangeExtensionGalleryManifest = this._onDidChangeExtensionGalleryManifest.event;
  extensionGalleryManifestPromise;
  async getExtensionGalleryManifest() {
    if (!this.extensionGalleryManifestPromise) {
      this.extensionGalleryManifestPromise = this.doGetExtensionGalleryManifest();
    }
    await this.extensionGalleryManifestPromise;
    return this.extensionGalleryManifest ? this.extensionGalleryManifest[1] : null;
  }
  async doGetExtensionGalleryManifest() {
    const defaultServiceUrl = this.productService.extensionsGallery?.serviceUrl;
    if (!defaultServiceUrl) {
      this.extensionGalleryManifest = null;
      return;
    }
    const configuredServiceUrl = this.configurationService.getValue(ExtensionGalleryServiceUrlConfigKey);
    if (configuredServiceUrl && this.checkAccess(await this.defaultAccountService.getDefaultAccount())) {
      this.extensionGalleryManifest = [configuredServiceUrl, await this.getExtensionGalleryManifestFromServiceUrl(configuredServiceUrl)];
    }
    if (!this.extensionGalleryManifest) {
      const defaultExtensionGalleryManifest = await super.getExtensionGalleryManifest();
      if (defaultExtensionGalleryManifest) {
        this.extensionGalleryManifest = [defaultServiceUrl, defaultExtensionGalleryManifest];
      }
    }
    this._register(this.defaultAccountService.onDidChangeDefaultAccount((account) => {
      if (!configuredServiceUrl) {
        return;
      }
      const canAccess = this.checkAccess(account);
      if (canAccess && this.extensionGalleryManifest?.[0] === configuredServiceUrl) {
        return;
      }
      if (!canAccess && this.extensionGalleryManifest?.[0] === defaultServiceUrl) {
        return;
      }
      this.extensionGalleryManifest = null;
      this._onDidChangeExtensionGalleryManifest.fire(null);
      this.requestRestart();
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (!e.affectsConfiguration(ExtensionGalleryServiceUrlConfigKey)) {
        return;
      }
      const configuredServiceUrl2 = this.configurationService.getValue(ExtensionGalleryServiceUrlConfigKey);
      if (!configuredServiceUrl2 && this.extensionGalleryManifest?.[0] === defaultServiceUrl) {
        return;
      }
      if (configuredServiceUrl2 && this.extensionGalleryManifest?.[0] === configuredServiceUrl2) {
        return;
      }
      this.extensionGalleryManifest = null;
      this._onDidChangeExtensionGalleryManifest.fire(null);
      this.requestRestart();
    }));
  }
  checkAccess(account) {
    if (!account) {
      this.logService.debug("[Marketplace] Checking account access for configured gallery: No account found");
      return false;
    }
    this.logService.debug("[Marketplace] Checking Account SKU access for configured gallery", account.access_type_sku);
    if (account.access_type_sku && this.productService.extensionsGallery?.accessSKUs?.includes(account.access_type_sku)) {
      this.logService.debug("[Marketplace] Account has access to configured gallery");
      return true;
    }
    this.logService.debug("[Marketplace] Checking enterprise account access for configured gallery", account.enterprise);
    return account.enterprise;
  }
  async requestRestart() {
    const confirmation = await this.dialogService.confirm({
      message: localize("extensionGalleryManifestService.accountChange", "{0} is now configured to a different Marketplace. Please restart to apply the changes.", this.productService.nameLong),
      primaryButton: localize({ key: "restart", comment: ["&& denotes a mnemonic"] }, "&&Restart")
    });
    if (confirmation.confirmed) {
      return this.hostService.restart();
    }
  }
  async getExtensionGalleryManifestFromServiceUrl(url) {
    const commonHeaders = await this.commonHeadersPromise;
    const headers = {
      ...commonHeaders,
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip"
    };
    try {
      const context = await this.requestService.request({
        type: "GET",
        url,
        headers
      }, CancellationToken.None);
      const extensionGalleryManifest = await asJson(context);
      if (!extensionGalleryManifest) {
        throw new Error("Unable to retrieve extension gallery manifest.");
      }
      return extensionGalleryManifest;
    } catch (error) {
      this.logService.error("[Marketplace] Error retrieving extension gallery manifest", error);
      throw error;
    }
  }
};
WorkbenchExtensionGalleryManifestService = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IEnvironmentService),
  __decorateParam(2, IFileService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IRemoteAgentService),
  __decorateParam(6, ISharedProcessService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IRequestService),
  __decorateParam(9, IDefaultAccountService),
  __decorateParam(10, IDialogService),
  __decorateParam(11, IHostService),
  __decorateParam(12, ILogService)
], WorkbenchExtensionGalleryManifestService);
registerSingleton(IExtensionGalleryManifestService, WorkbenchExtensionGalleryManifestService, InstantiationType.Eager);
export {
  WorkbenchExtensionGalleryManifestService
};
//# sourceMappingURL=extensionGalleryManifestService.js.map
