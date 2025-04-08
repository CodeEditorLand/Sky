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
import { IExtensionTipsService, IConfigBasedExtensionTip } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { ExtensionRecommendations, ExtensionRecommendation } from "./extensionRecommendations.js";
import { localize } from "../../../../nls.js";
import { ExtensionRecommendationReason } from "../../../services/extensionRecommendations/common/extensionRecommendations.js";
import { IWorkspaceContextService, IWorkspaceFoldersChangeEvent } from "../../../../platform/workspace/common/workspace.js";
import { Emitter } from "../../../../base/common/event.js";
let ConfigBasedRecommendations = class extends ExtensionRecommendations {
  constructor(extensionTipsService, workspaceContextService) {
    super();
    this.extensionTipsService = extensionTipsService;
    this.workspaceContextService = workspaceContextService;
  }
  static {
    __name(this, "ConfigBasedRecommendations");
  }
  importantTips = [];
  otherTips = [];
  _onDidChangeRecommendations = this._register(new Emitter());
  onDidChangeRecommendations = this._onDidChangeRecommendations.event;
  _otherRecommendations = [];
  get otherRecommendations() {
    return this._otherRecommendations;
  }
  _importantRecommendations = [];
  get importantRecommendations() {
    return this._importantRecommendations;
  }
  get recommendations() {
    return [...this.importantRecommendations, ...this.otherRecommendations];
  }
  async doActivate() {
    await this.fetch();
    this._register(this.workspaceContextService.onDidChangeWorkspaceFolders((e) => this.onWorkspaceFoldersChanged(e)));
  }
  async fetch() {
    const workspace = this.workspaceContextService.getWorkspace();
    const importantTips = /* @__PURE__ */ new Map();
    const otherTips = /* @__PURE__ */ new Map();
    for (const folder of workspace.folders) {
      const configBasedTips = await this.extensionTipsService.getConfigBasedTips(folder.uri);
      for (const tip of configBasedTips) {
        if (tip.important) {
          importantTips.set(tip.extensionId, tip);
        } else {
          otherTips.set(tip.extensionId, tip);
        }
      }
    }
    this.importantTips = [...importantTips.values()];
    this.otherTips = [...otherTips.values()].filter((tip) => !importantTips.has(tip.extensionId));
    this._otherRecommendations = this.otherTips.map((tip) => this.toExtensionRecommendation(tip));
    this._importantRecommendations = this.importantTips.map((tip) => this.toExtensionRecommendation(tip));
  }
  async onWorkspaceFoldersChanged(event) {
    if (event.added.length) {
      const oldImportantRecommended = this.importantTips;
      await this.fetch();
      if (this.importantTips.some((current) => oldImportantRecommended.every((old) => current.extensionId !== old.extensionId))) {
        this._onDidChangeRecommendations.fire();
      }
    }
  }
  toExtensionRecommendation(tip) {
    return {
      extension: tip.extensionId,
      reason: {
        reasonId: ExtensionRecommendationReason.WorkspaceConfig,
        reasonText: localize("exeBasedRecommendation", "This extension is recommended because of the current workspace configuration")
      },
      whenNotInstalled: tip.whenNotInstalled
    };
  }
};
ConfigBasedRecommendations = __decorateClass([
  __decorateParam(0, IExtensionTipsService),
  __decorateParam(1, IWorkspaceContextService)
], ConfigBasedRecommendations);
export {
  ConfigBasedRecommendations
};
//# sourceMappingURL=configBasedRecommendations.js.map
