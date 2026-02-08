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
var CopilotAssignmentFilterProvider_1;
import { IExtensionService } from "../../extensions/common/extensions.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { Emitter } from "../../../../base/common/event.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IChatEntitlementService } from "../../chat/common/chatEntitlementService.js";
var ExtensionsFilter;
(function(ExtensionsFilter2) {
  ExtensionsFilter2["CopilotExtensionVersion"] = "X-Copilot-RelatedPluginVersion-githubcopilot";
  ExtensionsFilter2["CopilotChatExtensionVersion"] = "X-Copilot-RelatedPluginVersion-githubcopilotchat";
  ExtensionsFilter2["CompletionsVersionInCopilotChat"] = "X-VSCode-CompletionsInChatExtensionVersion";
  ExtensionsFilter2["CopilotSku"] = "X-GitHub-Copilot-SKU";
  ExtensionsFilter2["MicrosoftInternalOrg"] = "X-Microsoft-Internal-Org";
})(ExtensionsFilter || (ExtensionsFilter = {}));
var StorageVersionKeys;
(function(StorageVersionKeys2) {
  StorageVersionKeys2["CopilotExtensionVersion"] = "extensionsAssignmentFilterProvider.copilotExtensionVersion";
  StorageVersionKeys2["CopilotChatExtensionVersion"] = "extensionsAssignmentFilterProvider.copilotChatExtensionVersion";
  StorageVersionKeys2["CompletionsVersion"] = "extensionsAssignmentFilterProvider.copilotCompletionsVersion";
  StorageVersionKeys2["CopilotSku"] = "extensionsAssignmentFilterProvider.copilotSku";
  StorageVersionKeys2["CopilotInternalOrg"] = "extensionsAssignmentFilterProvider.copilotInternalOrg";
})(StorageVersionKeys || (StorageVersionKeys = {}));
let CopilotAssignmentFilterProvider = CopilotAssignmentFilterProvider_1 = class CopilotAssignmentFilterProvider2 extends Disposable {
  static {
    __name(this, "CopilotAssignmentFilterProvider");
  }
  constructor(_extensionService, _logService, _storageService, _chatEntitlementService) {
    super();
    this._extensionService = _extensionService;
    this._logService = _logService;
    this._storageService = _storageService;
    this._chatEntitlementService = _chatEntitlementService;
    this._onDidChangeFilters = this._register(new Emitter());
    this.onDidChangeFilters = this._onDidChangeFilters.event;
    this.copilotExtensionVersion = this._storageService.get(
      StorageVersionKeys.CopilotExtensionVersion,
      0
      /* StorageScope.PROFILE */
    );
    this.copilotChatExtensionVersion = this._storageService.get(
      StorageVersionKeys.CopilotChatExtensionVersion,
      0
      /* StorageScope.PROFILE */
    );
    this.copilotCompletionsVersion = this._storageService.get(
      StorageVersionKeys.CompletionsVersion,
      0
      /* StorageScope.PROFILE */
    );
    this.copilotSku = this._storageService.get(
      StorageVersionKeys.CopilotSku,
      0
      /* StorageScope.PROFILE */
    );
    this.copilotInternalOrg = this._storageService.get(
      StorageVersionKeys.CopilotInternalOrg,
      0
      /* StorageScope.PROFILE */
    );
    this._register(this._extensionService.onDidChangeExtensionsStatus((extensionIdentifiers) => {
      if (extensionIdentifiers.some((identifier) => ExtensionIdentifier.equals(identifier, "github.copilot") || ExtensionIdentifier.equals(identifier, "github.copilot-chat"))) {
        this.updateExtensionVersions();
      }
    }));
    this._register(this._chatEntitlementService.onDidChangeEntitlement(() => {
      this.updateCopilotEntitlementInfo();
    }));
    this.updateExtensionVersions();
    this.updateCopilotEntitlementInfo();
  }
  async updateExtensionVersions() {
    let copilotExtensionVersion;
    let copilotChatExtensionVersion;
    let copilotCompletionsVersion;
    try {
      const [copilotExtension, copilotChatExtension] = await Promise.all([
        this._extensionService.getExtension("github.copilot"),
        this._extensionService.getExtension("github.copilot-chat")
      ]);
      copilotExtensionVersion = copilotExtension?.version;
      copilotChatExtensionVersion = copilotChatExtension?.version;
      copilotCompletionsVersion = copilotChatExtension?.completionsCoreVersion;
    } catch (error) {
      this._logService.error("Failed to update extension version assignments", error);
    }
    if (this.copilotCompletionsVersion === copilotCompletionsVersion && this.copilotExtensionVersion === copilotExtensionVersion && this.copilotChatExtensionVersion === copilotChatExtensionVersion) {
      return;
    }
    this.copilotExtensionVersion = copilotExtensionVersion;
    this.copilotChatExtensionVersion = copilotChatExtensionVersion;
    this.copilotCompletionsVersion = copilotCompletionsVersion;
    this._storageService.store(
      StorageVersionKeys.CopilotExtensionVersion,
      this.copilotExtensionVersion,
      0,
      1
      /* StorageTarget.MACHINE */
    );
    this._storageService.store(
      StorageVersionKeys.CopilotChatExtensionVersion,
      this.copilotChatExtensionVersion,
      0,
      1
      /* StorageTarget.MACHINE */
    );
    this._storageService.store(
      StorageVersionKeys.CompletionsVersion,
      this.copilotCompletionsVersion,
      0,
      1
      /* StorageTarget.MACHINE */
    );
    this._onDidChangeFilters.fire();
  }
  updateCopilotEntitlementInfo() {
    const newSku = this._chatEntitlementService.sku;
    const newIsGitHubInternal = this._chatEntitlementService.organisations?.includes("github");
    const newIsMicrosoftInternal = this._chatEntitlementService.organisations?.includes("microsoft") || this._chatEntitlementService.organisations?.includes("ms-copilot") || this._chatEntitlementService.organisations?.includes("MicrosoftCopilot");
    const newIsVSCodeInternal = this._chatEntitlementService.organisations?.includes("Visual-Studio-Code");
    const newInternalOrg = newIsVSCodeInternal ? "vscode" : newIsGitHubInternal ? "github" : newIsMicrosoftInternal ? "microsoft" : void 0;
    if (this.copilotSku === newSku && this.copilotInternalOrg === newInternalOrg) {
      return;
    }
    this.copilotSku = newSku;
    this.copilotInternalOrg = newInternalOrg;
    this._storageService.store(
      StorageVersionKeys.CopilotSku,
      this.copilotSku,
      0,
      1
      /* StorageTarget.MACHINE */
    );
    this._storageService.store(
      StorageVersionKeys.CopilotInternalOrg,
      this.copilotInternalOrg,
      0,
      1
      /* StorageTarget.MACHINE */
    );
    this._onDidChangeFilters.fire();
  }
  /**
   * Returns a version string that can be parsed by the TAS client.
   * The tas client cannot handle suffixes lke "-insider"
   * Ref: https://github.com/microsoft/tas-client/blob/30340d5e1da37c2789049fcf45928b954680606f/vscode-tas-client/src/vscode-tas-client/VSCodeFilterProvider.ts#L35
   *
   * @param version Version string to be trimmed.
  */
  static trimVersionSuffix(version) {
    const regex = /\-[a-zA-Z0-9]+$/;
    const result = version.split(regex);
    return result[0];
  }
  getFilterValue(filter) {
    switch (filter) {
      case ExtensionsFilter.CopilotExtensionVersion:
        return this.copilotExtensionVersion ? CopilotAssignmentFilterProvider_1.trimVersionSuffix(this.copilotExtensionVersion) : null;
      case ExtensionsFilter.CompletionsVersionInCopilotChat:
        return this.copilotCompletionsVersion ? CopilotAssignmentFilterProvider_1.trimVersionSuffix(this.copilotCompletionsVersion) : null;
      case ExtensionsFilter.CopilotChatExtensionVersion:
        return this.copilotChatExtensionVersion ? CopilotAssignmentFilterProvider_1.trimVersionSuffix(this.copilotChatExtensionVersion) : null;
      case ExtensionsFilter.CopilotSku:
        return this.copilotSku ?? null;
      case ExtensionsFilter.MicrosoftInternalOrg:
        return this.copilotInternalOrg ?? null;
      default:
        return null;
    }
  }
  getFilters() {
    const filters = /* @__PURE__ */ new Map();
    const filterValues = Object.values(ExtensionsFilter);
    for (const value of filterValues) {
      filters.set(value, this.getFilterValue(value));
    }
    return filters;
  }
};
CopilotAssignmentFilterProvider = CopilotAssignmentFilterProvider_1 = __decorate([
  __param(0, IExtensionService),
  __param(1, ILogService),
  __param(2, IStorageService),
  __param(3, IChatEntitlementService)
], CopilotAssignmentFilterProvider);
export {
  CopilotAssignmentFilterProvider,
  ExtensionsFilter
};
//# sourceMappingURL=assignmentFilters.js.map
