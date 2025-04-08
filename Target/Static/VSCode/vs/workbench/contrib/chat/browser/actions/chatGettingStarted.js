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
import { IWorkbenchContribution } from "../../../../common/contributions.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
import { ExtensionIdentifier } from "../../../../../platform/extensions/common/extensions.js";
import { IExtensionManagementService, InstallOperation } from "../../../../../platform/extensionManagement/common/extensionManagement.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../../platform/storage/common/storage.js";
import { IDefaultChatAgent } from "../../../../../base/common/product.js";
import { IViewDescriptorService } from "../../../../common/views.js";
import { IWorkbenchLayoutService } from "../../../../services/layout/browser/layoutService.js";
import { ensureSideBarChatViewSize, showCopilotView } from "../chat.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
import { IStatusbarService } from "../../../../services/statusbar/browser/statusbar.js";
let ChatGettingStartedContribution = class extends Disposable {
  constructor(productService, extensionService, viewsService, extensionManagementService, storageService, viewDescriptorService, layoutService, configurationService, statusbarService) {
    super();
    this.productService = productService;
    this.extensionService = extensionService;
    this.viewsService = viewsService;
    this.extensionManagementService = extensionManagementService;
    this.storageService = storageService;
    this.viewDescriptorService = viewDescriptorService;
    this.layoutService = layoutService;
    this.configurationService = configurationService;
    this.statusbarService = statusbarService;
    const defaultChatAgent = this.productService.defaultChatAgent;
    const hideWelcomeView = this.storageService.getBoolean(ChatGettingStartedContribution.hideWelcomeView, StorageScope.APPLICATION, false);
    if (!defaultChatAgent || hideWelcomeView) {
      return;
    }
    this.registerListeners(defaultChatAgent);
  }
  static {
    __name(this, "ChatGettingStartedContribution");
  }
  static ID = "workbench.contrib.chatGettingStarted";
  recentlyInstalled = false;
  static hideWelcomeView = "workbench.chat.hideWelcomeView";
  registerListeners(defaultChatAgent) {
    this._register(this.extensionManagementService.onDidInstallExtensions(async (result) => {
      for (const e of result) {
        if (ExtensionIdentifier.equals(defaultChatAgent.extensionId, e.identifier.id) && e.operation === InstallOperation.Install) {
          this.recentlyInstalled = true;
          return;
        }
      }
    }));
    this._register(this.extensionService.onDidChangeExtensionsStatus(async (event) => {
      for (const ext of event) {
        if (ExtensionIdentifier.equals(defaultChatAgent.extensionId, ext.value)) {
          const extensionStatus = this.extensionService.getExtensionsStatus();
          if (extensionStatus[ext.value].activationTimes && this.recentlyInstalled) {
            this.onDidInstallChat();
            return;
          }
        }
      }
    }));
  }
  async onDidInstallChat() {
    showCopilotView(this.viewsService, this.layoutService);
    const setupFromDialog = this.configurationService.getValue("chat.setupFromDialog");
    if (!setupFromDialog) {
      ensureSideBarChatViewSize(this.viewDescriptorService, this.layoutService, this.viewsService);
    }
    this.storageService.store(ChatGettingStartedContribution.hideWelcomeView, true, StorageScope.APPLICATION, StorageTarget.MACHINE);
    this.recentlyInstalled = false;
    this.statusbarService.updateEntryVisibility("chat.statusBarEntry", true);
    this.configurationService.updateValue("chat.commandCenter.enabled", true);
  }
};
ChatGettingStartedContribution = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, IViewsService),
  __decorateParam(3, IExtensionManagementService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IWorkbenchLayoutService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IStatusbarService)
], ChatGettingStartedContribution);
export {
  ChatGettingStartedContribution
};
//# sourceMappingURL=chatGettingStarted.js.map
