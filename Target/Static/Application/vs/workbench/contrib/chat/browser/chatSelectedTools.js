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
import { reset } from "../../../../base/browser/dom.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { autorun, derived, observableFromEvent } from "../../../../base/common/observable.js";
import { assertType } from "../../../../base/common/types.js";
import { localize } from "../../../../nls.js";
import { MenuEntryActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { MenuItemAction } from "../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { observableMemento } from "../../../../platform/observable/common/observableMemento.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ILanguageModelToolsService, ToolDataSource } from "../common/languageModelToolsService.js";
const storedTools = observableMemento({
  defaultValue: {},
  key: "chat/selectedTools"
});
let ChatSelectedTools = class ChatSelectedTools2 extends Disposable {
  static {
    __name(this, "ChatSelectedTools");
  }
  constructor(toolsService, instaService, storageService) {
    super();
    this._selectedTools = this._register(storedTools(1, 1, storageService));
    this._allTools = observableFromEvent(toolsService.onDidChangeTools, () => Array.from(toolsService.getTools()));
    const disabledData = this._selectedTools.map((data) => {
      return (data.disabledBuckets?.length || data.disabledTools?.length) && {
        buckets: new Set(data.disabledBuckets),
        toolIds: new Set(data.disabledTools)
      };
    });
    this.tools = derived((r) => {
      const disabled = disabledData.read(r);
      const tools = this._allTools.read(r);
      if (!disabled) {
        return tools;
      }
      return tools.filter((t) => !(disabled.toolIds.has(t.id) || disabled.buckets.has(ToolDataSource.toKey(t.source))));
    });
    const toolsCount = derived((r) => {
      const count = this._allTools.read(r).length;
      const enabled = this.tools.read(r).length;
      return { count, enabled };
    });
    const onDidRender = this._store.add(new Emitter());
    this.toolsActionItemViewItemProvider = Object.assign((action, options) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      return instaService.createInstance(class extends MenuEntryActionViewItem {
        render(container) {
          this.options.icon = false;
          this.options.label = true;
          container.classList.add("chat-mcp", "chat-attachment-button");
          super.render(container);
        }
        updateLabel() {
          this._store.add(autorun((r) => {
            assertType(this.label);
            const { enabled, count } = toolsCount.read(r);
            const message = count === 0 ? "$(tools)" : enabled !== count ? localize("tool.1", "{0} {1} of {2}", "$(tools)", enabled, count) : localize("tool.0", "{0} {1}", "$(tools)", count);
            reset(this.label, ...renderLabelWithIcons(message));
            if (this.element?.isConnected) {
              onDidRender.fire();
            }
          }));
        }
      }, action, { ...options, keybindingNotRenderedWithLabel: true });
    }, { onDidRender: onDidRender.event });
  }
  selectOnly(toolIds) {
    const uniqueTools = new Set(toolIds);
    const disabledTools = this._allTools.get().filter((tool) => !uniqueTools.has(tool.id));
    this.update([], disabledTools);
  }
  update(disableBuckets, disableTools) {
    this._selectedTools.set({
      disabledBuckets: disableBuckets.map(ToolDataSource.toKey),
      disabledTools: disableTools.map((t) => t.id)
    }, void 0);
  }
  asEnablementMap() {
    const result = /* @__PURE__ */ new Map();
    const enabledTools = new Set(this.tools.get().map((t) => t.id));
    for (const tool of this._allTools.get()) {
      if (tool.supportsToolPicker) {
        result.set(tool, enabledTools.has(tool.id));
      }
    }
    return result;
  }
};
ChatSelectedTools = __decorate([
  __param(0, ILanguageModelToolsService),
  __param(1, IInstantiationService),
  __param(2, IStorageService)
], ChatSelectedTools);
export {
  ChatSelectedTools
};
//# sourceMappingURL=chatSelectedTools.js.map
