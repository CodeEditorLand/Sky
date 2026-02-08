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
import * as dom from "../../../../../../base/browser/dom.js";
import { renderIcon, renderLabelWithIcons } from "../../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { localize } from "../../../../../../nls.js";
import { IActionWidgetService } from "../../../../../../platform/actionWidget/browser/actionWidget.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import { IProductService } from "../../../../../../platform/product/common/productService.js";
import { ITelemetryService } from "../../../../../../platform/telemetry/common/telemetry.js";
import { TelemetryTrustedValue } from "../../../../../../platform/telemetry/common/telemetryUtils.js";
import { ChatEntitlement, IChatEntitlementService } from "../../../../../services/chat/common/chatEntitlementService.js";
import { MANAGE_CHAT_COMMAND_ID } from "../../../common/constants.js";
import { DEFAULT_MODEL_PICKER_CATEGORY } from "../../../common/widget/input/modelPickerWidget.js";
import { ChatInputPickerActionViewItem } from "./chatInputPickerActionItem.js";
function modelDelegateToWidgetActionsProvider(delegate, telemetryService, pickerOptions) {
  return {
    getActions: /* @__PURE__ */ __name(() => {
      const models = delegate.getModels();
      if (models.length === 0) {
        return [{
          id: "auto",
          enabled: true,
          checked: true,
          category: DEFAULT_MODEL_PICKER_CATEGORY,
          class: void 0,
          description: localize("chat.modelPicker.auto.detail", "Best for your request based on capacity and performance."),
          tooltip: localize("chat.modelPicker.auto", "Auto"),
          label: localize("chat.modelPicker.auto", "Auto"),
          hover: { content: localize("chat.modelPicker.auto.description", "Automatically selects the best model for your task based on context and complexity."), position: pickerOptions.hoverPosition },
          run: /* @__PURE__ */ __name(() => {
          }, "run")
        }];
      }
      return models.map((model) => {
        const hoverContent = model.metadata.tooltip;
        return {
          id: model.metadata.id,
          enabled: true,
          icon: model.metadata.statusIcon,
          checked: model.identifier === delegate.currentModel.get()?.identifier,
          category: model.metadata.modelPickerCategory || DEFAULT_MODEL_PICKER_CATEGORY,
          class: void 0,
          description: model.metadata.multiplier ?? model.metadata.detail,
          tooltip: hoverContent ? "" : model.metadata.name,
          hover: hoverContent ? { content: hoverContent, position: pickerOptions.hoverPosition } : void 0,
          label: model.metadata.name,
          run: /* @__PURE__ */ __name(() => {
            const previousModel = delegate.currentModel.get();
            telemetryService.publicLog2("chat.modelChange", {
              fromModel: previousModel?.metadata.vendor === "copilot" ? new TelemetryTrustedValue(previousModel.identifier) : "unknown",
              toModel: model.metadata.vendor === "copilot" ? new TelemetryTrustedValue(model.identifier) : "unknown"
            });
            delegate.setModel(model);
          }, "run")
        };
      });
    }, "getActions")
  };
}
__name(modelDelegateToWidgetActionsProvider, "modelDelegateToWidgetActionsProvider");
function getModelPickerActionBarActionProvider(commandService, chatEntitlementService, productService) {
  const actionProvider = {
    getActions: /* @__PURE__ */ __name(() => {
      const additionalActions = [];
      if (chatEntitlementService.entitlement === ChatEntitlement.Free || chatEntitlementService.entitlement === ChatEntitlement.Pro || chatEntitlementService.entitlement === ChatEntitlement.ProPlus || chatEntitlementService.entitlement === ChatEntitlement.Business || chatEntitlementService.entitlement === ChatEntitlement.Enterprise || chatEntitlementService.isInternal) {
        additionalActions.push({
          id: "manageModels",
          label: localize("chat.manageModels", "Manage Models..."),
          enabled: true,
          tooltip: localize("chat.manageModels.tooltip", "Manage Language Models"),
          class: void 0,
          run: /* @__PURE__ */ __name(() => {
            commandService.executeCommand(MANAGE_CHAT_COMMAND_ID);
          }, "run")
        });
      }
      const isNewOrAnonymousUser = !chatEntitlementService.sentiment.installed || chatEntitlementService.entitlement === ChatEntitlement.Available || chatEntitlementService.anonymous || chatEntitlementService.entitlement === ChatEntitlement.Unknown;
      if (isNewOrAnonymousUser || chatEntitlementService.entitlement === ChatEntitlement.Free) {
        additionalActions.push({
          id: "moreModels",
          label: isNewOrAnonymousUser ? localize("chat.moreModels", "Add Language Models") : localize("chat.morePremiumModels", "Add Premium Models"),
          enabled: true,
          tooltip: isNewOrAnonymousUser ? localize("chat.moreModels.tooltip", "Add Language Models") : localize("chat.morePremiumModels.tooltip", "Add Premium Models"),
          class: void 0,
          run: /* @__PURE__ */ __name(() => {
            const commandId = isNewOrAnonymousUser ? "workbench.action.chat.triggerSetup" : "workbench.action.chat.upgradePlan";
            commandService.executeCommand(commandId);
          }, "run")
        });
      }
      return additionalActions;
    }, "getActions")
  };
  return actionProvider;
}
__name(getModelPickerActionBarActionProvider, "getModelPickerActionBarActionProvider");
let ModelPickerActionItem = class ModelPickerActionItem2 extends ChatInputPickerActionViewItem {
  static {
    __name(this, "ModelPickerActionItem");
  }
  constructor(action, widgetOptions, delegate, pickerOptions, actionWidgetService, contextKeyService, commandService, chatEntitlementService, keybindingService, telemetryService, productService) {
    const actionWithLabel = {
      ...action,
      label: delegate.currentModel.get()?.metadata.name ?? localize("chat.modelPicker.auto", "Auto"),
      run: /* @__PURE__ */ __name(() => {
      }, "run")
    };
    const modelPickerActionWidgetOptions = {
      actionProvider: modelDelegateToWidgetActionsProvider(delegate, telemetryService, pickerOptions),
      actionBarActionProvider: getModelPickerActionBarActionProvider(commandService, chatEntitlementService, productService),
      reporter: { id: "ChatModelPicker", name: "ChatModelPicker", includeOptions: true }
    };
    super(actionWithLabel, widgetOptions ?? modelPickerActionWidgetOptions, pickerOptions, actionWidgetService, keybindingService, contextKeyService, telemetryService);
    this.currentModel = delegate.currentModel.get();
    this._register(autorun((t) => {
      const model = delegate.currentModel.read(t);
      this.currentModel = model;
      this.updateTooltip();
      if (this.element) {
        this.renderLabel(this.element);
      }
    }));
  }
  getHoverContents() {
    const label = `${localize("chat.modelPicker.label", "Pick Model")}${super.getHoverContents()}`;
    const { statusIcon, tooltip } = this.currentModel?.metadata || {};
    return statusIcon && tooltip ? `${label} \u2022 ${tooltip}` : label;
  }
  setAriaLabelAttributes(element) {
    super.setAriaLabelAttributes(element);
    const modelName = this.currentModel?.metadata.name ?? localize("chat.modelPicker.auto", "Auto");
    element.ariaLabel = localize("chat.modelPicker.ariaLabel", "Pick Model, {0}", modelName);
  }
  renderLabel(element) {
    const { name, statusIcon } = this.currentModel?.metadata || {};
    const domChildren = [];
    if (statusIcon) {
      const iconElement = renderIcon(statusIcon);
      domChildren.push(iconElement);
    }
    domChildren.push(dom.$("span.chat-input-picker-label", void 0, name ?? localize("chat.modelPicker.auto", "Auto")));
    domChildren.push(...renderLabelWithIcons(`$(chevron-down)`));
    dom.reset(element, ...domChildren);
    this.setAriaLabelAttributes(element);
    return null;
  }
};
ModelPickerActionItem = __decorate([
  __param(4, IActionWidgetService),
  __param(5, IContextKeyService),
  __param(6, ICommandService),
  __param(7, IChatEntitlementService),
  __param(8, IKeybindingService),
  __param(9, ITelemetryService),
  __param(10, IProductService)
], ModelPickerActionItem);
export {
  ModelPickerActionItem
};
//# sourceMappingURL=modelPickerActionItem.js.map
