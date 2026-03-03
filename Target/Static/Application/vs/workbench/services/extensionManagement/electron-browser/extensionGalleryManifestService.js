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
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Emitter } from "../../../../base/common/event.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { IExtensionGalleryManifestService, ExtensionGalleryServiceUrlConfigKey } from "../../../../platform/extensionManagement/common/extensionGalleryManifest.js";
import { ExtensionGalleryManifestService } from "../../../../platform/extensionManagement/common/extensionGalleryManifestService.js";
import { resolveMarketplaceHeaders } from "../../../../platform/externalServices/common/marketplace.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ISharedProcessService } from "../../../../platform/ipc/electron-browser/services.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { asJson, IRequestService } from "../../../../platform/request/common/request.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IDefaultAccountService } from "../../../../platform/defaultAccount/common/defaultAccount.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IHostService } from "../../host/browser/host.js";
let WorkbenchExtensionGalleryManifestService = class WorkbenchExtensionGalleryManifestService2 extends ExtensionGalleryManifestService {
  static {
    __name(this, "WorkbenchExtensionGalleryManifestService");
  }
  get extensionGalleryManifestStatus() {
    return this.currentStatus;
  }
  constructor(productService, environmentService, fileService, telemetryService, storageService, remoteAgentService, sharedProcessService, configurationService, requestService, defaultAccountService, logService, dialogService, hostService) {
    super(productService);
    this.telemetryService = telemetryService;
    this.configurationService = configurationService;
    this.requestService = requestService;
    this.defaultAccountService = defaultAccountService;
    this.logService = logService;
    this.dialogService = dialogService;
    this.hostService = hostService;
    this.extensionGalleryManifest = null;
    this._onDidChangeExtensionGalleryManifest = this._register(new Emitter());
    this.onDidChangeExtensionGalleryManifest = this._onDidChangeExtensionGalleryManifest.event;
    this.currentStatus = "unavailable";
    this._onDidChangeExtensionGalleryManifestStatus = this._register(new Emitter());
    this.onDidChangeExtensionGalleryManifestStatus = this._onDidChangeExtensionGalleryManifestStatus.event;
    this.commonHeadersPromise = resolveMarketplaceHeaders(productService.version, productService, environmentService, configurationService, fileService, storageService, telemetryService);
    const channels = [sharedProcessService.getChannel("extensionGalleryManifest")];
    const remoteConnection = remoteAgentService.getConnection();
    if (remoteConnection) {
      channels.push(remoteConnection.getChannel("extensionGalleryManifest"));
    }
    this.getExtensionGalleryManifest().then((manifest) => {
      channels.forEach((channel) => channel.call("setExtensionGalleryManifest", [manifest]));
    });
  }
  async getExtensionGalleryManifest() {
    if (!this.extensionGalleryManifestPromise) {
      this.extensionGalleryManifestPromise = this.doGetExtensionGalleryManifest();
    }
    await this.extensionGalleryManifestPromise;
    return this.extensionGalleryManifest;
  }
  async doGetExtensionGalleryManifest() {
    const defaultServiceUrl = this.productService.extensionsGallery?.serviceUrl;
    if (!defaultServiceUrl) {
      return;
    }
    const configuredServiceUrl = this.configurationService.getValue(ExtensionGalleryServiceUrlConfigKey);
    if (configuredServiceUrl) {
      await this.handleDefaultAccountAccess(configuredServiceUrl);
      this._register(this.defaultAccountService.onDidChangeDefaultAccount(() => this.handleDefaultAccountAccess(configuredServiceUrl)));
    } else {
      const defaultExtensionGalleryManifest = await super.getExtensionGalleryManifest();
      this.update(defaultExtensionGalleryManifest);
    }
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (!e.affectsConfiguration(ExtensionGalleryServiceUrlConfigKey)) {
        return;
      }
      this.requestRestart();
    }));
  }
  async handleDefaultAccountAccess(configuredServiceUrl) {
    const account = await this.defaultAccountService.getDefaultAccount();
    if (!account) {
      this.logService.debug("[Marketplace] Enterprise marketplace configured but user not signed in");
      this.update(
        null,
        "requiresSignIn"
        /* ExtensionGalleryManifestStatus.RequiresSignIn */
      );
    } else if (!this.checkAccess(account)) {
      this.logService.debug("[Marketplace] User signed in but lacks access to enterprise marketplace");
      this.update(
        null,
        "accessDenied"
        /* ExtensionGalleryManifestStatus.AccessDenied */
      );
    } else if (this.currentStatus !== "available") {
      try {
        const manifest = await this.getExtensionGalleryManifestFromServiceUrl(configuredServiceUrl);
        this.update(manifest);
        this.telemetryService.publicLog2("galleryservice:custom:marketplace");
      } catch (error) {
        this.logService.error("[Marketplace] Error retrieving enterprise gallery manifest", error);
        this.update(
          null,
          "accessDenied"
          /* ExtensionGalleryManifestStatus.AccessDenied */
        );
      }
    }
  }
  update(manifest, status) {
    if (this.extensionGalleryManifest !== manifest) {
      this.extensionGalleryManifest = manifest;
      this._onDidChangeExtensionGalleryManifest.fire(manifest);
    }
    this.updateStatus(status ?? (this.extensionGalleryManifest ? "available" : "unavailable"));
  }
  updateStatus(status) {
    if (this.currentStatus !== status) {
      this.currentStatus = status;
      this._onDidChangeExtensionGalleryManifestStatus.fire(status);
    }
  }
  checkAccess(account) {
    this.logService.debug("[Marketplace] Checking Account SKU access for configured gallery", account.entitlementsData?.access_type_sku);
    if (account.entitlementsData?.access_type_sku && this.productService.extensionsGallery?.accessSKUs?.includes(account.entitlementsData.access_type_sku)) {
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
WorkbenchExtensionGalleryManifestService = __decorate([
  __param(0, IProductService),
  __param(1, IEnvironmentService),
  __param(2, IFileService),
  __param(3, ITelemetryService),
  __param(4, IStorageService),
  __param(5, IRemoteAgentService),
  __param(6, ISharedProcessService),
  __param(7, IConfigurationService),
  __param(8, IRequestService),
  __param(9, IDefaultAccountService),
  __param(10, ILogService),
  __param(11, IDialogService),
  __param(12, IHostService)
], WorkbenchExtensionGalleryManifestService);
registerSingleton(
  IExtensionGalleryManifestService,
  WorkbenchExtensionGalleryManifestService,
  0
  /* InstantiationType.Eager */
);
export {
  WorkbenchExtensionGalleryManifestService
};
//# sourceMappingURL=extensionGalleryManifestService.js.map
