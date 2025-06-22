var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { autorun, derived, observableFromEvent, ObservableMap, observableValue, transaction } from "../../../../base/common/observable.js";
import { observableMemento } from "../../../../platform/observable/common/observableMemento.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ChatMode } from "../common/constants.js";
import { ILanguageModelToolsService, ToolSet } from "../common/languageModelToolsService.js";
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
const storedTools = observableMemento({
  defaultValue: {},
  key: "chat/selectedTools"
});
let ChatSelectedTools = class ChatSelectedTools2 extends Disposable {
  static {
    __name(this, "ChatSelectedTools");
  }
  constructor(mode, _toolsService, storageService) {
    super();
    this._toolsService = _toolsService;
    this._sessionSelectedTools = observableValue(this, {});
    this.entriesMap = new ObservableMap();
    this.entries = this.entriesMap.observable.map(function(value) {
      const result = /* @__PURE__ */ new Set();
      for (const [item, enabled] of value) {
        if (enabled) {
          result.add(item);
        }
      }
      return result;
    });
    this._selectedTools = this._store.add(storedTools(1, 1, storageService));
    this._allTools = observableFromEvent(_toolsService.onDidChangeTools, () => Array.from(_toolsService.getTools()));
    const disabledDataObs = derived((r) => {
      const globalData = this._selectedTools.read(r);
      const sessionData = this._sessionSelectedTools.read(r);
      const toolSetIds = /* @__PURE__ */ new Set();
      const toolIds = /* @__PURE__ */ new Set();
      for (const data of [globalData, sessionData]) {
        if (data.disabledToolSets) {
          for (const id of data.disabledToolSets) {
            toolSetIds.add(id);
          }
        }
        if (data.disabledTools) {
          for (const id of data.disabledTools) {
            toolIds.add(id);
          }
        }
      }
      if (toolSetIds.size === 0 && toolIds.size === 0) {
        return void 0;
      }
      return { toolSetIds, toolIds };
    });
    this._store.add(autorun((r) => {
      const tools = this._allTools.read(r).filter((t) => t.canBeReferencedInPrompt);
      const toolSets = _toolsService.toolSets.read(r);
      const oldItems = new Set(this.entriesMap.keys());
      const disabledData = mode.read(r) === ChatMode.Agent ? disabledDataObs.read(r) : void 0;
      transaction((tx) => {
        for (const tool of tools) {
          const enabled = !disabledData || !disabledData.toolIds.has(tool.id);
          this.entriesMap.set(tool, enabled, tx);
          oldItems.delete(tool);
        }
        for (const toolSet of toolSets) {
          const enabled = !disabledData || !disabledData.toolSetIds.has(toolSet.id);
          this.entriesMap.set(toolSet, enabled, tx);
          oldItems.delete(toolSet);
        }
        for (const item of oldItems) {
          this.entriesMap.delete(item, tx);
        }
      });
    }));
  }
  resetSessionEnablementState() {
    this._sessionSelectedTools.set({}, void 0);
  }
  enable(toolSets, tools, sessionOnly) {
    const toolIds = new Set(tools.map((t) => t.id));
    const toolsetIds = new Set(toolSets.map((t) => t.id));
    const disabledTools = this._allTools.get().filter((tool) => !toolIds.has(tool.id));
    const disabledToolSets = Array.from(this._toolsService.toolSets.get()).filter((toolset) => !toolsetIds.has(toolset.id));
    this.disable(disabledToolSets, disabledTools, sessionOnly);
  }
  disable(disabledToolSets, disableTools, sessionOnly) {
    const target = sessionOnly ? this._sessionSelectedTools : this._selectedTools;
    target.set({
      disabledToolSets: disabledToolSets.map((t) => t.id),
      disabledTools: disableTools.map((t) => t.id)
    }, void 0);
  }
  asEnablementMap() {
    const result = /* @__PURE__ */ new Map();
    const map = this.entriesMap;
    const _set = /* @__PURE__ */ __name((tool, enabled) => {
      const enabledNow = result.get(tool);
      if (enabled || !enabledNow) {
        result.set(tool, enabled);
      }
    }, "_set");
    for (const [item, enabled] of map) {
      if (item instanceof ToolSet) {
        for (const tool of item.getTools()) {
          _set(tool, map.get(tool) ?? enabled);
        }
      } else {
        if (item.canBeReferencedInPrompt) {
          _set(item, enabled);
        }
      }
    }
    return result;
  }
};
ChatSelectedTools = __decorate([
  __param(1, ILanguageModelToolsService),
  __param(2, IStorageService)
], ChatSelectedTools);
export {
  ChatSelectedTools
};
//# sourceMappingURL=chatSelectedTools.js.map
