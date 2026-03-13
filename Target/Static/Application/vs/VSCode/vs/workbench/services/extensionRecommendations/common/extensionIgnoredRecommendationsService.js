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
import { distinct } from "../../../../base/common/arrays.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IExtensionIgnoredRecommendationsService } from "./extensionRecommendations.js";
import { IWorkspaceExtensionsConfigService } from "./workspaceExtensionsConfig.js";
const ignoredRecommendationsStorageKey = "extensionsAssistant/ignored_recommendations";
let ExtensionIgnoredRecommendationsService = class ExtensionIgnoredRecommendationsService2 extends Disposable {
  static {
    __name(this, "ExtensionIgnoredRecommendationsService");
  }
  get globalIgnoredRecommendations() {
    return [...this._globalIgnoredRecommendations];
  }
  get ignoredRecommendations() {
    return distinct([...this.globalIgnoredRecommendations, ...this.ignoredWorkspaceRecommendations]);
  }
  constructor(workspaceExtensionsConfigService, storageService) {
    super();
    this.workspaceExtensionsConfigService = workspaceExtensionsConfigService;
    this.storageService = storageService;
    this._onDidChangeIgnoredRecommendations = this._register(new Emitter());
    this.onDidChangeIgnoredRecommendations = this._onDidChangeIgnoredRecommendations.event;
    this._globalIgnoredRecommendations = [];
    this._onDidChangeGlobalIgnoredRecommendation = this._register(new Emitter());
    this.onDidChangeGlobalIgnoredRecommendation = this._onDidChangeGlobalIgnoredRecommendation.event;
    this.ignoredWorkspaceRecommendations = [];
    this._globalIgnoredRecommendations = this.getCachedIgnoredRecommendations();
    this._register(this.storageService.onDidChangeValue(0, ignoredRecommendationsStorageKey, this._store)(() => this.onDidStorageChange()));
    this.initIgnoredWorkspaceRecommendations();
  }
  async initIgnoredWorkspaceRecommendations() {
    this.ignoredWorkspaceRecommendations = await this.workspaceExtensionsConfigService.getUnwantedRecommendations();
    this._onDidChangeIgnoredRecommendations.fire();
    this._register(this.workspaceExtensionsConfigService.onDidChangeExtensionsConfigs(async () => {
      this.ignoredWorkspaceRecommendations = await this.workspaceExtensionsConfigService.getUnwantedRecommendations();
      this._onDidChangeIgnoredRecommendations.fire();
    }));
  }
  toggleGlobalIgnoredRecommendation(extensionId, shouldIgnore) {
    extensionId = extensionId.toLowerCase();
    const ignored = this._globalIgnoredRecommendations.indexOf(extensionId) !== -1;
    if (ignored === shouldIgnore) {
      return;
    }
    this._globalIgnoredRecommendations = shouldIgnore ? [...this._globalIgnoredRecommendations, extensionId] : this._globalIgnoredRecommendations.filter((id) => id !== extensionId);
    this.storeCachedIgnoredRecommendations(this._globalIgnoredRecommendations);
    this._onDidChangeGlobalIgnoredRecommendation.fire({ extensionId, isRecommended: !shouldIgnore });
    this._onDidChangeIgnoredRecommendations.fire();
  }
  getCachedIgnoredRecommendations() {
    const ignoredRecommendations = JSON.parse(this.ignoredRecommendationsValue);
    return ignoredRecommendations.map((e) => e.toLowerCase());
  }
  onDidStorageChange() {
    if (this.ignoredRecommendationsValue !== this.getStoredIgnoredRecommendationsValue()) {
      this._ignoredRecommendationsValue = void 0;
      this._globalIgnoredRecommendations = this.getCachedIgnoredRecommendations();
      this._onDidChangeIgnoredRecommendations.fire();
    }
  }
  storeCachedIgnoredRecommendations(ignoredRecommendations) {
    this.ignoredRecommendationsValue = JSON.stringify(ignoredRecommendations);
  }
  get ignoredRecommendationsValue() {
    if (!this._ignoredRecommendationsValue) {
      this._ignoredRecommendationsValue = this.getStoredIgnoredRecommendationsValue();
    }
    return this._ignoredRecommendationsValue;
  }
  set ignoredRecommendationsValue(ignoredRecommendationsValue) {
    if (this.ignoredRecommendationsValue !== ignoredRecommendationsValue) {
      this._ignoredRecommendationsValue = ignoredRecommendationsValue;
      this.setStoredIgnoredRecommendationsValue(ignoredRecommendationsValue);
    }
  }
  getStoredIgnoredRecommendationsValue() {
    return this.storageService.get(ignoredRecommendationsStorageKey, 0, "[]");
  }
  setStoredIgnoredRecommendationsValue(value) {
    this.storageService.store(
      ignoredRecommendationsStorageKey,
      value,
      0,
      0
      /* StorageTarget.USER */
    );
  }
};
ExtensionIgnoredRecommendationsService = __decorate([
  __param(0, IWorkspaceExtensionsConfigService),
  __param(1, IStorageService)
], ExtensionIgnoredRecommendationsService);
registerSingleton(
  IExtensionIgnoredRecommendationsService,
  ExtensionIgnoredRecommendationsService,
  1
  /* InstantiationType.Delayed */
);
export {
  ExtensionIgnoredRecommendationsService
};
//# sourceMappingURL=extensionIgnoredRecommendationsService.js.map
