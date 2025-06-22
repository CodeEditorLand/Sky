var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../nls.js";
import * as dom from "../../../../../base/browser/dom.js";
import { renderLabelWithIcons } from "../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { ActionWidgetDropdownActionViewItem } from "../../../../../platform/actions/browser/actionWidgetDropdownActionViewItem.js";
import { IActionWidgetService } from "../../../../../platform/actionWidget/browser/actionWidget.js";
import { IMenuService, MenuId } from "../../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { getFlatActionBarActions } from "../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { ChatEntitlement, IChatEntitlementService } from "../../common/chatEntitlementService.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
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
function modelDelegateToWidgetActionsProvider(delegate) {
  return {
    getActions: /* @__PURE__ */ __name(() => {
      return delegate.getModels().map((model) => {
        return {
          id: model.metadata.id,
          enabled: true,
          checked: model.metadata.id === delegate.getCurrentModel()?.metadata.id,
          category: model.metadata.modelPickerCategory,
          class: void 0,
          description: model.metadata.cost,
          tooltip: model.metadata.description ?? model.metadata.name,
          label: model.metadata.name,
          run: /* @__PURE__ */ __name(() => {
            delegate.setModel(model);
          }, "run")
        };
      });
    }, "getActions")
  };
}
__name(modelDelegateToWidgetActionsProvider, "modelDelegateToWidgetActionsProvider");
function getModelPickerActionBarActions(menuService, contextKeyService, commandService, chatEntitlementService) {
  const menuActions = menuService.createMenu(MenuId.ChatModelPicker, contextKeyService);
  const menuContributions = getFlatActionBarActions(menuActions.getActions());
  menuActions.dispose();
  const additionalActions = [];
  if (menuContributions.length > 0) {
    additionalActions.push(...menuContributions);
  }
  if (chatEntitlementService.entitlement === ChatEntitlement.Free) {
    additionalActions.push({
      id: "moreModels",
      label: localize("chat.moreModels", "Add Premium Models"),
      enabled: true,
      tooltip: localize("chat.moreModels.tooltip", "Add premium models"),
      class: void 0,
      run: /* @__PURE__ */ __name(() => {
        const commandId = "workbench.action.chat.upgradePlan";
        commandService.executeCommand(commandId);
      }, "run")
    });
  }
  return additionalActions;
}
__name(getModelPickerActionBarActions, "getModelPickerActionBarActions");
let ModelPickerActionItem = class ModelPickerActionItem2 extends ActionWidgetDropdownActionViewItem {
  static {
    __name(this, "ModelPickerActionItem");
  }
  constructor(action, currentModel, delegate, actionWidgetService, menuService, contextKeyService, commandService, chatEntitlementService, keybindingService) {
    const actionWithLabel = {
      ...action,
      label: currentModel.metadata.name,
      tooltip: localize("chat.modelPicker.label", "Pick Model"),
      run: /* @__PURE__ */ __name(() => {
      }, "run")
    };
    const modelPickerActionWidgetOptions = {
      actionProvider: modelDelegateToWidgetActionsProvider(delegate),
      actionBarActions: getModelPickerActionBarActions(menuService, contextKeyService, commandService, chatEntitlementService)
    };
    super(actionWithLabel, modelPickerActionWidgetOptions, actionWidgetService, keybindingService, contextKeyService);
    this.currentModel = currentModel;
    this._register(delegate.onDidChangeModel((model) => {
      this.currentModel = model;
      if (this.element) {
        this.renderLabel(this.element);
      }
    }));
  }
  renderLabel(element) {
    dom.reset(element, dom.$("span.chat-model-label", void 0, this.currentModel.metadata.name), ...renderLabelWithIcons(`$(chevron-down)`));
    this.setAriaLabelAttributes(element);
    return null;
  }
  render(container) {
    super.render(container);
    container.classList.add("chat-modelPicker-item");
  }
};
ModelPickerActionItem = __decorate([
  __param(3, IActionWidgetService),
  __param(4, IMenuService),
  __param(5, IContextKeyService),
  __param(6, ICommandService),
  __param(7, IChatEntitlementService),
  __param(8, IKeybindingService)
], ModelPickerActionItem);
export {
  ModelPickerActionItem
};
//# sourceMappingURL=modelPickerActionItem.js.map
