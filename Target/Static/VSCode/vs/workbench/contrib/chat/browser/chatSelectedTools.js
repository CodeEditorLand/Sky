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
import { reset } from "../../../../base/browser/dom.js";
import { IActionViewItemProvider } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { IActionViewItemOptions } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { IAction } from "../../../../base/common/actions.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { autorun, derived, IObservable, observableFromEvent } from "../../../../base/common/observable.js";
import { assertType } from "../../../../base/common/types.js";
import { localize } from "../../../../nls.js";
import { MenuEntryActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { MenuItemAction } from "../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ObservableMemento, observableMemento } from "../../../../platform/observable/common/observableMemento.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { ILanguageModelToolsService, IToolData, ToolDataSource } from "../common/languageModelToolsService.js";
const storedTools = observableMemento({
  defaultValue: {},
  key: "chat/selectedTools"
});
let ChatSelectedTools = class extends Disposable {
  static {
    __name(this, "ChatSelectedTools");
  }
  _selectedTools;
  tools;
  toolsActionItemViewItemProvider;
  constructor(toolsService, instaService, storageService) {
    super();
    this._selectedTools = this._register(storedTools(StorageScope.WORKSPACE, StorageTarget.MACHINE, storageService));
    const allTools = observableFromEvent(
      toolsService.onDidChangeTools,
      () => Array.from(toolsService.getTools()).filter((t) => t.supportsToolPicker)
    );
    const disabledData = this._selectedTools.map((data) => {
      return (data.disabledBuckets?.length || data.disabledTools?.length) && {
        buckets: new Set(data.disabledBuckets),
        toolIds: new Set(data.disabledTools)
      };
    });
    this.tools = derived((r) => {
      const disabled = disabledData.read(r);
      const tools = allTools.read(r);
      if (!disabled) {
        return tools;
      }
      return tools.filter(
        (t) => !(disabled.toolIds.has(t.id) || disabled.buckets.has(ToolDataSource.toKey(t.source)))
      );
    });
    const toolsCount = derived((r) => {
      const count = allTools.read(r).length;
      const enabled = this.tools.read(r).length;
      return { count, enabled };
    });
    const onDidRender = this._store.add(new Emitter());
    this.toolsActionItemViewItemProvider = Object.assign(
      (action, options) => {
        if (!(action instanceof MenuItemAction)) {
          return void 0;
        }
        return instaService.createInstance(class extends MenuEntryActionViewItem {
          render(container) {
            this.options.icon = false;
            this.options.label = true;
            container.classList.add("chat-mcp");
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
      },
      { onDidRender: onDidRender.event }
    );
  }
  update(disableBuckets, disableTools) {
    this._selectedTools.set({
      disabledBuckets: disableBuckets.map(ToolDataSource.toKey),
      disabledTools: disableTools.map((t) => t.id)
    }, void 0);
  }
};
ChatSelectedTools = __decorateClass([
  __decorateParam(0, ILanguageModelToolsService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IStorageService)
], ChatSelectedTools);
export {
  ChatSelectedTools
};
//# sourceMappingURL=chatSelectedTools.js.map
