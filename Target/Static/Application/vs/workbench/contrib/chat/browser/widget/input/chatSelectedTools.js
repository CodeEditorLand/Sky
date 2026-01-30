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
import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { derived, ObservableMap } from "../../../../../../base/common/observable.js";
import { isObject } from "../../../../../../base/common/types.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { observableMemento } from "../../../../../../platform/observable/common/observableMemento.js";
import { IStorageService } from "../../../../../../platform/storage/common/storage.js";
import { ChatModeKind } from "../../../common/constants.js";
import { ILanguageModelToolsService, ToolSet } from "../../../common/tools/languageModelToolsService.js";
import { PromptsStorage } from "../../../common/promptSyntax/service/promptsService.js";
import { PromptFileRewriter } from "../../promptSyntax/promptFileRewriter.js";
var ToolEnablementStates;
(function(ToolEnablementStates2) {
  function fromMap(map) {
    const toolSets = /* @__PURE__ */ new Map(), tools = /* @__PURE__ */ new Map();
    for (const [entry, enabled] of map.entries()) {
      if (entry instanceof ToolSet) {
        toolSets.set(entry.id, enabled);
      } else {
        tools.set(entry.id, enabled);
      }
    }
    return { toolSets, tools };
  }
  __name(fromMap, "fromMap");
  ToolEnablementStates2.fromMap = fromMap;
  function isStoredDataV1(data) {
    return isObject(data) && data.version === void 0 && (data.disabledTools === void 0 || Array.isArray(data.disabledTools)) && (data.disabledToolSets === void 0 || Array.isArray(data.disabledToolSets));
  }
  __name(isStoredDataV1, "isStoredDataV1");
  function isStoredDataV2(data) {
    return isObject(data) && data.version === 2 && Array.isArray(data.toolSetEntries) && Array.isArray(data.toolEntries);
  }
  __name(isStoredDataV2, "isStoredDataV2");
  function fromStorage(storage) {
    try {
      const parsed = JSON.parse(storage);
      if (isStoredDataV2(parsed)) {
        return { toolSets: new Map(parsed.toolSetEntries), tools: new Map(parsed.toolEntries) };
      } else if (isStoredDataV1(parsed)) {
        const toolSetEntries = parsed.disabledToolSets?.map((id) => [id, false]);
        const toolEntries = parsed.disabledTools?.map((id) => [id, false]);
        return { toolSets: new Map(toolSetEntries), tools: new Map(toolEntries) };
      }
    } catch {
    }
    return { toolSets: /* @__PURE__ */ new Map(), tools: /* @__PURE__ */ new Map() };
  }
  __name(fromStorage, "fromStorage");
  ToolEnablementStates2.fromStorage = fromStorage;
  function toStorage(state) {
    const storageData = {
      version: 2,
      toolSetEntries: Array.from(state.toolSets.entries()),
      toolEntries: Array.from(state.tools.entries())
    };
    return JSON.stringify(storageData);
  }
  __name(toStorage, "toStorage");
  ToolEnablementStates2.toStorage = toStorage;
})(ToolEnablementStates || (ToolEnablementStates = {}));
var ToolsScope;
(function(ToolsScope2) {
  ToolsScope2[ToolsScope2["Global"] = 0] = "Global";
  ToolsScope2[ToolsScope2["Session"] = 1] = "Session";
  ToolsScope2[ToolsScope2["Agent"] = 2] = "Agent";
  ToolsScope2[ToolsScope2["Agent_ReadOnly"] = 3] = "Agent_ReadOnly";
})(ToolsScope || (ToolsScope = {}));
let ChatSelectedTools = class ChatSelectedTools2 extends Disposable {
  static {
    __name(this, "ChatSelectedTools");
  }
  constructor(_mode, _toolsService, _storageService, _instantiationService) {
    super();
    this._mode = _mode;
    this._toolsService = _toolsService;
    this._instantiationService = _instantiationService;
    this._sessionStates = new ObservableMap();
    this.entriesMap = derived((r) => {
      const map = /* @__PURE__ */ new Map();
      const currentMode = this._mode.read(r);
      let currentMap = this._sessionStates.observable.read(r).get(currentMode.id);
      if (!currentMap && currentMode.kind === ChatModeKind.Agent) {
        const modeTools = currentMode.customTools?.read(r);
        if (modeTools) {
          const target = currentMode.target?.read(r);
          currentMap = ToolEnablementStates.fromMap(this._toolsService.toToolAndToolSetEnablementMap(modeTools, target));
        }
      }
      if (!currentMap) {
        currentMap = this._globalState.read(r);
      }
      for (const tool of this._toolsService.toolsObservable.read(r)) {
        if (tool.canBeReferencedInPrompt) {
          map.set(tool, currentMap.tools.get(tool.id) !== false);
        }
      }
      for (const toolSet of this._toolsService.toolSets.read(r)) {
        const toolSetEnabled = currentMap.toolSets.get(toolSet.id) !== false;
        map.set(toolSet, toolSetEnabled);
        for (const tool of toolSet.getTools(r)) {
          map.set(tool, toolSetEnabled || currentMap.tools.get(tool.id) === true);
        }
      }
      return map;
    });
    this.userSelectedTools = derived((r) => {
      const result = {};
      const map = this.entriesMap.read(r);
      for (const [item, enabled] of map) {
        if (!(item instanceof ToolSet)) {
          result[item.id] = enabled;
        }
      }
      return result;
    });
    const globalStateMemento = observableMemento({
      key: "chat/selectedTools",
      defaultValue: { toolSets: /* @__PURE__ */ new Map(), tools: /* @__PURE__ */ new Map() },
      fromStorage: ToolEnablementStates.fromStorage,
      toStorage: ToolEnablementStates.toStorage
    });
    this._globalState = this._store.add(globalStateMemento(0, 1, _storageService));
  }
  get entriesScope() {
    const mode = this._mode.get();
    if (this._sessionStates.has(mode.id)) {
      return ToolsScope.Session;
    }
    if (mode.kind === ChatModeKind.Agent && mode.customTools?.get() && mode.uri) {
      return mode.source?.storage !== PromptsStorage.extension ? ToolsScope.Agent : ToolsScope.Agent_ReadOnly;
    }
    return ToolsScope.Global;
  }
  get currentMode() {
    return this._mode.get();
  }
  resetSessionEnablementState() {
    const mode = this._mode.get();
    this._sessionStates.delete(mode.id);
  }
  set(enablementMap, sessionOnly) {
    const mode = this._mode.get();
    if (sessionOnly || this._sessionStates.has(mode.id)) {
      this._sessionStates.set(mode.id, ToolEnablementStates.fromMap(enablementMap));
      return;
    }
    if (mode.kind === ChatModeKind.Agent && mode.customTools?.get() && mode.uri) {
      if (mode.source?.storage !== PromptsStorage.extension) {
        this.updateCustomModeTools(mode.uri.get(), enablementMap);
        return;
      } else {
        this._sessionStates.set(mode.id, ToolEnablementStates.fromMap(enablementMap));
        return;
      }
    }
    this._globalState.set(ToolEnablementStates.fromMap(enablementMap), void 0);
  }
  async updateCustomModeTools(uri, enablementMap) {
    await this._instantiationService.createInstance(PromptFileRewriter).openAndRewriteTools(uri, enablementMap, CancellationToken.None);
  }
};
ChatSelectedTools = __decorate([
  __param(1, ILanguageModelToolsService),
  __param(2, IStorageService),
  __param(3, IInstantiationService)
], ChatSelectedTools);
export {
  ChatSelectedTools,
  ToolsScope
};
//# sourceMappingURL=chatSelectedTools.js.map
