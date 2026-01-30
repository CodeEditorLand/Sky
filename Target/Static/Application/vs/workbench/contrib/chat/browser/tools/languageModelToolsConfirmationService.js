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
import { Codicon } from "../../../../../base/common/codicons.js";
import { Lazy } from "../../../../../base/common/lazy.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { LRUCache } from "../../../../../base/common/map.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize } from "../../../../../nls.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IQuickInputService, QuickInputButtonLocation } from "../../../../../platform/quickinput/common/quickInput.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
const RUN_WITHOUT_APPROVAL = localize("runWithoutApproval", "without approval");
const CONTINUE_WITHOUT_REVIEWING_RESULTS = localize("continueWithoutReviewingResults", "without reviewing result");
class GenericConfirmStore extends Disposable {
  static {
    __name(this, "GenericConfirmStore");
  }
  constructor(_storageKey, _instantiationService) {
    super();
    this._storageKey = _storageKey;
    this._instantiationService = _instantiationService;
    this._memoryStore = /* @__PURE__ */ new Set();
    this._workspaceStore = new Lazy(() => this._register(this._instantiationService.createInstance(ToolConfirmStore, 1, this._storageKey)));
    this._profileStore = new Lazy(() => this._register(this._instantiationService.createInstance(ToolConfirmStore, 0, this._storageKey)));
  }
  setAutoConfirmation(id, scope) {
    this._workspaceStore.value.setAutoConfirm(id, false);
    this._profileStore.value.setAutoConfirm(id, false);
    this._memoryStore.delete(id);
    if (scope === "workspace") {
      this._workspaceStore.value.setAutoConfirm(id, true);
    } else if (scope === "profile") {
      this._profileStore.value.setAutoConfirm(id, true);
    } else if (scope === "session") {
      this._memoryStore.add(id);
    }
  }
  getAutoConfirmation(id) {
    if (this._workspaceStore.value.getAutoConfirm(id)) {
      return "workspace";
    }
    if (this._profileStore.value.getAutoConfirm(id)) {
      return "profile";
    }
    if (this._memoryStore.has(id)) {
      return "session";
    }
    return "never";
  }
  getAutoConfirmationIn(id, scope) {
    if (scope === "workspace") {
      return this._workspaceStore.value.getAutoConfirm(id);
    } else if (scope === "profile") {
      return this._profileStore.value.getAutoConfirm(id);
    } else {
      return this._memoryStore.has(id);
    }
  }
  reset() {
    this._workspaceStore.value.reset();
    this._profileStore.value.reset();
    this._memoryStore.clear();
  }
  checkAutoConfirmation(id) {
    if (this._workspaceStore.value.getAutoConfirm(id)) {
      return { type: 3, scope: "workspace" };
    }
    if (this._profileStore.value.getAutoConfirm(id)) {
      return { type: 3, scope: "profile" };
    }
    if (this._memoryStore.has(id)) {
      return { type: 3, scope: "session" };
    }
    return void 0;
  }
  getAllConfirmed() {
    const all = /* @__PURE__ */ new Set();
    for (const key of this._workspaceStore.value.getAll()) {
      all.add(key);
    }
    for (const key of this._profileStore.value.getAll()) {
      all.add(key);
    }
    for (const key of this._memoryStore) {
      all.add(key);
    }
    return all;
  }
}
let ToolConfirmStore = class ToolConfirmStore2 extends Disposable {
  static {
    __name(this, "ToolConfirmStore");
  }
  constructor(_scope, _storageKey, storageService) {
    super();
    this._scope = _scope;
    this._storageKey = _storageKey;
    this.storageService = storageService;
    this._autoConfirmTools = new LRUCache(100);
    this._didChange = false;
    const stored = storageService.getObject(this._storageKey, this._scope);
    if (stored) {
      for (const key of stored) {
        this._autoConfirmTools.set(key, true);
      }
    }
    this._register(storageService.onWillSaveState(() => {
      if (this._didChange) {
        this.storageService.store(
          this._storageKey,
          [...this._autoConfirmTools.keys()],
          this._scope,
          1
          /* StorageTarget.MACHINE */
        );
        this._didChange = false;
      }
    }));
  }
  reset() {
    this._autoConfirmTools.clear();
    this._didChange = true;
  }
  getAutoConfirm(id) {
    if (this._autoConfirmTools.get(id)) {
      this._didChange = true;
      return true;
    }
    return false;
  }
  setAutoConfirm(id, autoConfirm) {
    if (autoConfirm) {
      this._autoConfirmTools.set(id, true);
    } else {
      this._autoConfirmTools.delete(id);
    }
    this._didChange = true;
  }
  getAll() {
    return [...this._autoConfirmTools.keys()];
  }
};
ToolConfirmStore = __decorate([
  __param(2, IStorageService)
], ToolConfirmStore);
let LanguageModelToolsConfirmationService = class LanguageModelToolsConfirmationService2 extends Disposable {
  static {
    __name(this, "LanguageModelToolsConfirmationService");
  }
  constructor(_instantiationService, _quickInputService) {
    super();
    this._instantiationService = _instantiationService;
    this._quickInputService = _quickInputService;
    this._contributions = /* @__PURE__ */ new Map();
    this._preExecutionToolConfirmStore = this._register(new GenericConfirmStore("chat/autoconfirm", this._instantiationService));
    this._postExecutionToolConfirmStore = this._register(new GenericConfirmStore("chat/autoconfirm-post", this._instantiationService));
    this._preExecutionServerConfirmStore = this._register(new GenericConfirmStore("chat/servers/autoconfirm", this._instantiationService));
    this._postExecutionServerConfirmStore = this._register(new GenericConfirmStore("chat/servers/autoconfirm-post", this._instantiationService));
  }
  getPreConfirmAction(ref) {
    const contribution = this._contributions.get(ref.toolId);
    if (contribution?.getPreConfirmAction) {
      const result = contribution.getPreConfirmAction(ref);
      if (result) {
        return result;
      }
    }
    if (contribution && contribution.canUseDefaultApprovals === false) {
      return void 0;
    }
    const toolResult = this._preExecutionToolConfirmStore.checkAutoConfirmation(ref.toolId);
    if (toolResult) {
      return toolResult;
    }
    if (ref.source.type === "mcp") {
      const serverResult = this._preExecutionServerConfirmStore.checkAutoConfirmation(ref.source.definitionId);
      if (serverResult) {
        return serverResult;
      }
    }
    return void 0;
  }
  getPostConfirmAction(ref) {
    const contribution = this._contributions.get(ref.toolId);
    if (contribution?.getPostConfirmAction) {
      const result = contribution.getPostConfirmAction(ref);
      if (result) {
        return result;
      }
    }
    if (contribution && contribution.canUseDefaultApprovals === false) {
      return void 0;
    }
    const toolResult = this._postExecutionToolConfirmStore.checkAutoConfirmation(ref.toolId);
    if (toolResult) {
      return toolResult;
    }
    if (ref.source.type === "mcp") {
      const serverResult = this._postExecutionServerConfirmStore.checkAutoConfirmation(ref.source.definitionId);
      if (serverResult) {
        return serverResult;
      }
    }
    return void 0;
  }
  getPreConfirmActions(ref) {
    const actions = [];
    const contribution = this._contributions.get(ref.toolId);
    if (contribution?.getPreConfirmActions) {
      actions.push(...contribution.getPreConfirmActions(ref));
    }
    if (contribution && contribution.canUseDefaultApprovals === false) {
      return actions;
    }
    actions.push({
      label: localize("allowSession", "Allow in this Session"),
      detail: localize("allowSessionTooltip", "Allow this tool to run in this session without confirmation."),
      divider: !!actions.length,
      select: /* @__PURE__ */ __name(async () => {
        this._preExecutionToolConfirmStore.setAutoConfirmation(ref.toolId, "session");
        return true;
      }, "select")
    }, {
      label: localize("allowWorkspace", "Allow in this Workspace"),
      detail: localize("allowWorkspaceTooltip", "Allow this tool to run in this workspace without confirmation."),
      select: /* @__PURE__ */ __name(async () => {
        this._preExecutionToolConfirmStore.setAutoConfirmation(ref.toolId, "workspace");
        return true;
      }, "select")
    }, {
      label: localize("allowGlobally", "Always Allow"),
      detail: localize("allowGloballyTooltip", "Always allow this tool to run without confirmation."),
      select: /* @__PURE__ */ __name(async () => {
        this._preExecutionToolConfirmStore.setAutoConfirmation(ref.toolId, "profile");
        return true;
      }, "select")
    });
    if (ref.source.type === "mcp") {
      const { serverLabel, definitionId } = ref.source;
      actions.push({
        label: localize("allowServerSession", "Allow Tools from {0} in this Session", serverLabel),
        detail: localize("allowServerSessionTooltip", "Allow all tools from this server to run in this session without confirmation."),
        divider: true,
        select: /* @__PURE__ */ __name(async () => {
          this._preExecutionServerConfirmStore.setAutoConfirmation(definitionId, "session");
          return true;
        }, "select")
      }, {
        label: localize("allowServerWorkspace", "Allow Tools from {0} in this Workspace", serverLabel),
        detail: localize("allowServerWorkspaceTooltip", "Allow all tools from this server to run in this workspace without confirmation."),
        select: /* @__PURE__ */ __name(async () => {
          this._preExecutionServerConfirmStore.setAutoConfirmation(definitionId, "workspace");
          return true;
        }, "select")
      }, {
        label: localize("allowServerGlobally", "Always Allow Tools from {0}", serverLabel),
        detail: localize("allowServerGloballyTooltip", "Always allow all tools from this server to run without confirmation."),
        select: /* @__PURE__ */ __name(async () => {
          this._preExecutionServerConfirmStore.setAutoConfirmation(definitionId, "profile");
          return true;
        }, "select")
      });
    }
    return actions;
  }
  getPostConfirmActions(ref) {
    const actions = [];
    const contribution = this._contributions.get(ref.toolId);
    if (contribution?.getPostConfirmActions) {
      actions.push(...contribution.getPostConfirmActions(ref));
    }
    if (contribution && contribution.canUseDefaultApprovals === false) {
      return actions;
    }
    actions.push({
      label: localize("allowSessionPost", "Allow Without Review in this Session"),
      detail: localize("allowSessionPostTooltip", "Allow results from this tool to be sent without confirmation in this session."),
      divider: !!actions.length,
      select: /* @__PURE__ */ __name(async () => {
        this._postExecutionToolConfirmStore.setAutoConfirmation(ref.toolId, "session");
        return true;
      }, "select")
    }, {
      label: localize("allowWorkspacePost", "Allow Without Review in this Workspace"),
      detail: localize("allowWorkspacePostTooltip", "Allow results from this tool to be sent without confirmation in this workspace."),
      select: /* @__PURE__ */ __name(async () => {
        this._postExecutionToolConfirmStore.setAutoConfirmation(ref.toolId, "workspace");
        return true;
      }, "select")
    }, {
      label: localize("allowGloballyPost", "Always Allow Without Review"),
      detail: localize("allowGloballyPostTooltip", "Always allow results from this tool to be sent without confirmation."),
      select: /* @__PURE__ */ __name(async () => {
        this._postExecutionToolConfirmStore.setAutoConfirmation(ref.toolId, "profile");
        return true;
      }, "select")
    });
    if (ref.source.type === "mcp") {
      const { serverLabel, definitionId } = ref.source;
      actions.push({
        label: localize("allowServerSessionPost", "Allow Tools from {0} Without Review in this Session", serverLabel),
        detail: localize("allowServerSessionPostTooltip", "Allow results from all tools from this server to be sent without confirmation in this session."),
        divider: true,
        select: /* @__PURE__ */ __name(async () => {
          this._postExecutionServerConfirmStore.setAutoConfirmation(definitionId, "session");
          return true;
        }, "select")
      }, {
        label: localize("allowServerWorkspacePost", "Allow Tools from {0} Without Review in this Workspace", serverLabel),
        detail: localize("allowServerWorkspacePostTooltip", "Allow results from all tools from this server to be sent without confirmation in this workspace."),
        select: /* @__PURE__ */ __name(async () => {
          this._postExecutionServerConfirmStore.setAutoConfirmation(definitionId, "workspace");
          return true;
        }, "select")
      }, {
        label: localize("allowServerGloballyPost", "Always Allow Tools from {0} Without Review", serverLabel),
        detail: localize("allowServerGloballyPostTooltip", "Always allow results from all tools from this server to be sent without confirmation."),
        select: /* @__PURE__ */ __name(async () => {
          this._postExecutionServerConfirmStore.setAutoConfirmation(definitionId, "profile");
          return true;
        }, "select")
      });
    }
    return actions;
  }
  registerConfirmationContribution(toolName, contribution) {
    this._contributions.set(toolName, contribution);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this._contributions.delete(toolName);
      }, "dispose")
    };
  }
  manageConfirmationPreferences(tools, options) {
    const trackServerTool = /* @__PURE__ */ __name((serverId, label, toolId, serversWithTools2) => {
      if (!serversWithTools2.has(serverId)) {
        serversWithTools2.set(serverId, { label, tools: /* @__PURE__ */ new Set() });
      }
      serversWithTools2.get(serverId).tools.add(toolId);
    }, "trackServerTool");
    const addServerToolFromSource = /* @__PURE__ */ __name((source, toolId, serversWithTools2) => {
      if (source.type === "mcp") {
        trackServerTool(source.definitionId, source.serverLabel || source.label, toolId, serversWithTools2);
      } else if (source.type === "extension") {
        trackServerTool(source.extensionId.value, source.label, toolId, serversWithTools2);
      }
    }, "addServerToolFromSource");
    const relevantTools = /* @__PURE__ */ new Set();
    const serversWithTools = /* @__PURE__ */ new Map();
    for (const tool of tools) {
      if (tool.canRequestPreApproval || tool.canRequestPostApproval || this._contributions.has(tool.id)) {
        relevantTools.add(tool.id);
        addServerToolFromSource(tool.source, tool.id, serversWithTools);
      }
    }
    for (const id of this._preExecutionToolConfirmStore.getAllConfirmed()) {
      if (!relevantTools.has(id)) {
        const tool = tools.find((t) => t.id === id);
        if (tool) {
          relevantTools.add(id);
          addServerToolFromSource(tool.source, id, serversWithTools);
        }
      }
    }
    for (const id of this._postExecutionToolConfirmStore.getAllConfirmed()) {
      if (!relevantTools.has(id)) {
        const tool = tools.find((t) => t.id === id);
        if (tool) {
          relevantTools.add(id);
          addServerToolFromSource(tool.source, id, serversWithTools);
        }
      }
    }
    if (relevantTools.size === 0) {
      return;
    }
    let currentScope = options?.defaultScope ?? "workspace";
    const buildTreeItems = /* @__PURE__ */ __name(() => {
      const treeItems = [];
      for (const [serverId, serverInfo] of serversWithTools) {
        const serverChildren = [];
        const hasAnyPre = Array.from(serverInfo.tools).some((toolId) => {
          const tool = tools.find((t) => t.id === toolId);
          return tool?.canRequestPreApproval;
        });
        const hasAnyPost = Array.from(serverInfo.tools).some((toolId) => {
          const tool = tools.find((t) => t.id === toolId);
          return tool?.canRequestPostApproval;
        });
        const serverPreConfirmed = this._preExecutionServerConfirmStore.getAutoConfirmationIn(serverId, currentScope);
        const serverPostConfirmed = this._postExecutionServerConfirmStore.getAutoConfirmationIn(serverId, currentScope);
        for (const toolId of serverInfo.tools) {
          const tool = tools.find((t) => t.id === toolId);
          if (!tool) {
            continue;
          }
          const toolChildren = [];
          const hasPre = !serverPreConfirmed && (tool.canRequestPreApproval || this._preExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope));
          const hasPost = !serverPostConfirmed && (tool.canRequestPostApproval || this._postExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope));
          if (hasPre && hasPost) {
            toolChildren.push({
              type: "tool-pre",
              toolId: tool.id,
              label: RUN_WITHOUT_APPROVAL,
              checked: this._preExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope)
            });
            toolChildren.push({
              type: "tool-post",
              toolId: tool.id,
              label: CONTINUE_WITHOUT_REVIEWING_RESULTS,
              checked: this._postExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope)
            });
          }
          const preApproval = this._preExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope);
          const postApproval = this._postExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope);
          let checked;
          let description;
          if (hasPre && hasPost) {
            checked = preApproval && postApproval ? true : !preApproval && !postApproval ? false : "mixed";
          } else if (hasPre) {
            checked = preApproval;
            description = RUN_WITHOUT_APPROVAL;
          } else if (hasPost) {
            checked = postApproval;
            description = CONTINUE_WITHOUT_REVIEWING_RESULTS;
          } else {
            continue;
          }
          serverChildren.push({
            type: "tool",
            toolId: tool.id,
            label: tool.displayName || tool.id,
            description,
            checked,
            collapsed: true,
            children: toolChildren.length > 0 ? toolChildren : void 0
          });
        }
        serverChildren.sort((a, b) => a.label.localeCompare(b.label));
        if (hasAnyPost) {
          serverChildren.unshift({
            type: "server-post",
            serverId,
            iconClass: ThemeIcon.asClassName(Codicon.play),
            label: localize("continueWithoutReviewing", "Continue without reviewing any tool results"),
            checked: serverPostConfirmed
          });
        }
        if (hasAnyPre) {
          serverChildren.unshift({
            type: "server-pre",
            serverId,
            iconClass: ThemeIcon.asClassName(Codicon.play),
            label: localize("runToolsWithoutApproval", "Run any tool without approval"),
            checked: serverPreConfirmed
          });
        }
        const serverHasPre = this._preExecutionServerConfirmStore.getAutoConfirmationIn(serverId, currentScope);
        const serverHasPost = this._postExecutionServerConfirmStore.getAutoConfirmationIn(serverId, currentScope);
        let serverChecked;
        if (hasAnyPre && hasAnyPost) {
          serverChecked = serverHasPre && serverHasPost ? true : !serverHasPre && !serverHasPost ? false : "mixed";
        } else if (hasAnyPre) {
          serverChecked = serverHasPre;
        } else if (hasAnyPost) {
          serverChecked = serverHasPost;
        } else {
          serverChecked = false;
        }
        const existingItem = quickTree.itemTree.find((i) => i.serverId === serverId);
        treeItems.push({
          type: "server",
          serverId,
          label: serverInfo.label,
          checked: serverChecked,
          children: serverChildren,
          collapsed: existingItem ? quickTree.isCollapsed(existingItem) : true,
          pickable: false
        });
      }
      const sortedTools = tools.slice().sort((a, b) => a.displayName.localeCompare(b.displayName));
      for (const tool of sortedTools) {
        if (!relevantTools.has(tool.id)) {
          continue;
        }
        if (tool.source.type === "mcp" || tool.source.type === "extension") {
          continue;
        }
        const contributed = this._contributions.get(tool.id);
        const toolChildren = [];
        const manageActions = contributed?.getManageActions?.();
        if (manageActions) {
          toolChildren.push(...manageActions.map((action) => ({
            type: "manage",
            ...action
          })));
        }
        let checked = false;
        let description;
        let pickable = false;
        if (contributed?.canUseDefaultApprovals !== false) {
          pickable = true;
          const hasPre = tool.canRequestPreApproval || this._preExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope);
          const hasPost = tool.canRequestPostApproval || this._postExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope);
          if (hasPre && hasPost) {
            toolChildren.push({
              type: "tool-pre",
              toolId: tool.id,
              label: RUN_WITHOUT_APPROVAL,
              checked: this._preExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope)
            });
            toolChildren.push({
              type: "tool-post",
              toolId: tool.id,
              label: CONTINUE_WITHOUT_REVIEWING_RESULTS,
              checked: this._postExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope)
            });
          }
          const preApproval = this._preExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope);
          const postApproval = this._postExecutionToolConfirmStore.getAutoConfirmationIn(tool.id, currentScope);
          if (hasPre && hasPost) {
            checked = preApproval && postApproval ? true : !preApproval && !postApproval ? false : "mixed";
          } else if (hasPre) {
            checked = preApproval;
            description = RUN_WITHOUT_APPROVAL;
          } else if (hasPost) {
            checked = postApproval;
            description = CONTINUE_WITHOUT_REVIEWING_RESULTS;
          } else {
            checked = false;
          }
        }
        treeItems.push({
          type: "tool",
          toolId: tool.id,
          label: tool.displayName || tool.id,
          description,
          checked,
          pickable,
          collapsed: true,
          children: toolChildren.length > 0 ? toolChildren : void 0
        });
      }
      return treeItems;
    }, "buildTreeItems");
    const disposables = new DisposableStore();
    const quickTree = disposables.add(this._quickInputService.createQuickTree());
    quickTree.ignoreFocusOut = true;
    quickTree.sortByLabel = false;
    if (currentScope !== "session") {
      const scopeButton = {
        iconClass: ThemeIcon.asClassName(Codicon.folder),
        tooltip: localize("workspaceScope", "Configure for this workspace only"),
        toggle: { checked: currentScope === "workspace" },
        location: QuickInputButtonLocation.Input
      };
      quickTree.buttons = [scopeButton];
      disposables.add(quickTree.onDidTriggerButton((button) => {
        if (button === scopeButton) {
          currentScope = currentScope === "workspace" ? "profile" : "workspace";
          updatePlaceholder();
          quickTree.setItemTree(buildTreeItems());
        }
      }));
    }
    const updatePlaceholder = /* @__PURE__ */ __name(() => {
      if (currentScope === "session") {
        quickTree.placeholder = localize("configureSessionToolApprovals", "Configure session tool approvals");
      } else {
        quickTree.placeholder = currentScope === "workspace" ? localize("configureWorkspaceToolApprovals", "Configure workspace tool approvals") : localize("configureGlobalToolApprovals", "Configure global tool approvals");
      }
    }, "updatePlaceholder");
    updatePlaceholder();
    quickTree.setItemTree(buildTreeItems());
    disposables.add(quickTree.onDidChangeCheckboxState((item) => {
      const newState = item.checked ? currentScope : "never";
      if (item.type === "server" && item.serverId) {
        const serverInfo = serversWithTools.get(item.serverId);
        if (serverInfo) {
          this._preExecutionServerConfirmStore.setAutoConfirmation(item.serverId, newState);
          this._postExecutionServerConfirmStore.setAutoConfirmation(item.serverId, newState);
        }
      } else if (item.type === "tool" && item.toolId) {
        const tool = tools.find((t) => t.id === item.toolId);
        if (tool?.canRequestPostApproval || newState === "never") {
          this._postExecutionToolConfirmStore.setAutoConfirmation(item.toolId, newState);
        }
        if (tool?.canRequestPreApproval || newState === "never") {
          this._preExecutionToolConfirmStore.setAutoConfirmation(item.toolId, newState);
        }
      } else if (item.type === "tool-pre" && item.toolId) {
        this._preExecutionToolConfirmStore.setAutoConfirmation(item.toolId, newState);
      } else if (item.type === "tool-post" && item.toolId) {
        this._postExecutionToolConfirmStore.setAutoConfirmation(item.toolId, newState);
      } else if (item.type === "server-pre" && item.serverId) {
        this._preExecutionServerConfirmStore.setAutoConfirmation(item.serverId, newState);
        quickTree.setItemTree(buildTreeItems());
      } else if (item.type === "server-post" && item.serverId) {
        this._postExecutionServerConfirmStore.setAutoConfirmation(item.serverId, newState);
        quickTree.setItemTree(buildTreeItems());
      } else if (item.type === "manage") {
        item.onDidChangeChecked?.(!!item.checked);
      }
    }));
    disposables.add(quickTree.onDidTriggerItemButton((i) => {
      if (i.item.type === "manage") {
        i.item.onDidTriggerItemButton?.(i.button);
      }
    }));
    disposables.add(quickTree.onDidAccept(() => {
      for (const item of quickTree.activeItems) {
        if (item.type === "manage") {
          item.onDidOpen?.();
          quickTree.hide();
        }
      }
    }));
    disposables.add(quickTree.onDidHide(() => {
      disposables.dispose();
    }));
    quickTree.show();
  }
  resetToolAutoConfirmation() {
    this._preExecutionToolConfirmStore.reset();
    this._postExecutionToolConfirmStore.reset();
    this._preExecutionServerConfirmStore.reset();
    this._postExecutionServerConfirmStore.reset();
    for (const contribution of this._contributions.values()) {
      contribution.reset?.();
    }
  }
};
LanguageModelToolsConfirmationService = __decorate([
  __param(0, IInstantiationService),
  __param(1, IQuickInputService)
], LanguageModelToolsConfirmationService);
export {
  LanguageModelToolsConfirmationService
};
//# sourceMappingURL=languageModelToolsConfirmationService.js.map
