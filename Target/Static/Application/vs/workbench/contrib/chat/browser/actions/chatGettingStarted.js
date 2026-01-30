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
var ChatGettingStartedContribution_1;
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
import { ExtensionIdentifier } from "../../../../../platform/extensions/common/extensions.js";
import { IExtensionManagementService } from "../../../../../platform/extensionManagement/common/extensionManagement.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { IChatWidgetService } from "../chat.js";
let ChatGettingStartedContribution = class ChatGettingStartedContribution2 extends Disposable {
  static {
    __name(this, "ChatGettingStartedContribution");
  }
  static {
    ChatGettingStartedContribution_1 = this;
  }
  static {
    this.ID = "workbench.contrib.chatGettingStarted";
  }
  static {
    this.hideWelcomeView = "workbench.chat.hideWelcomeView";
  }
  constructor(productService, extensionService, extensionManagementService, storageService, chatWidgetService) {
    super();
    this.productService = productService;
    this.extensionService = extensionService;
    this.extensionManagementService = extensionManagementService;
    this.storageService = storageService;
    this.chatWidgetService = chatWidgetService;
    this.recentlyInstalled = false;
    const defaultChatAgent = this.productService.defaultChatAgent;
    const hideWelcomeView = this.storageService.getBoolean(ChatGettingStartedContribution_1.hideWelcomeView, -1, false);
    if (!defaultChatAgent || hideWelcomeView) {
      return;
    }
    this.registerListeners(defaultChatAgent);
  }
  registerListeners(defaultChatAgent) {
    this._register(this.extensionManagementService.onDidInstallExtensions(async (result) => {
      for (const e of result) {
        if (ExtensionIdentifier.equals(defaultChatAgent.extensionId, e.identifier.id) && e.operation === 2) {
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
    this.chatWidgetService.revealWidget();
    this.storageService.store(
      ChatGettingStartedContribution_1.hideWelcomeView,
      true,
      -1,
      1
      /* StorageTarget.MACHINE */
    );
    this.recentlyInstalled = false;
  }
};
ChatGettingStartedContribution = ChatGettingStartedContribution_1 = __decorate([
  __param(0, IProductService),
  __param(1, IExtensionService),
  __param(2, IExtensionManagementService),
  __param(3, IStorageService),
  __param(4, IChatWidgetService)
], ChatGettingStartedContribution);
export {
  ChatGettingStartedContribution
};
//# sourceMappingURL=chatGettingStarted.js.map
