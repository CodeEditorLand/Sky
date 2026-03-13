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
import { StandardKeyboardEvent } from "../../../../../../base/browser/keyboardEvent.js";
import { renderIcon, renderLabelWithIcons } from "../../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { localize } from "../../../../../../nls.js";
import { IActionWidgetService } from "../../../../../../platform/actionWidget/browser/actionWidget.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { IProductService } from "../../../../../../platform/product/common/productService.js";
import { ITelemetryService } from "../../../../../../platform/telemetry/common/telemetry.js";
import { TelemetryTrustedValue } from "../../../../../../platform/telemetry/common/telemetryUtils.js";
import { MANAGE_CHAT_COMMAND_ID } from "../../../common/constants.js";
import { ILanguageModelsService } from "../../../common/languageModels.js";
import { ChatEntitlement, IChatEntitlementService, isProUser } from "../../../../../services/chat/common/chatEntitlementService.js";
import * as semver from "../../../../../../base/common/semver/semver.js";
import { IUpdateService } from "../../../../../../platform/update/common/update.js";
function isVersionAtLeast(current, required) {
  const currentSemver = semver.coerce(current);
  if (!currentSemver) {
    return false;
  }
  return semver.gte(currentSemver, required);
}
__name(isVersionAtLeast, "isVersionAtLeast");
function getUpdateHoverContent(updateState) {
  const hoverContent = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
  switch (updateState) {
    case "available for download":
      hoverContent.appendMarkdown(localize("chat.modelPicker.downloadUpdateHover", "This model requires a newer version of VS Code. [Download Update](command:update.downloadUpdate) to access it."));
      break;
    case "downloaded":
    case "ready":
      hoverContent.appendMarkdown(localize("chat.modelPicker.restartUpdateHover", "This model requires a newer version of VS Code. [Restart to Update](command:update.restartToUpdate) to access it."));
      break;
    default:
      hoverContent.appendMarkdown(localize("chat.modelPicker.checkUpdateHover", "This model requires a newer version of VS Code. [Update VS Code](command:update.checkForUpdate) to access it."));
      break;
  }
  return hoverContent;
}
__name(getUpdateHoverContent, "getUpdateHoverContent");
const ModelPickerSection = {
  Other: "other"
};
function createModelItem(action, model, hoverPosition) {
  return {
    item: action,
    kind: "action",
    label: action.label,
    description: action.description,
    group: { title: "", icon: action.icon ?? ThemeIcon.fromId(action.checked ? Codicon.check.id : Codicon.blank.id) },
    hideIcon: false,
    section: action.section,
    hover: model ? { content: getModelHoverContent(model), position: hoverPosition } : void 0
  };
}
__name(createModelItem, "createModelItem");
function createModelAction(model, selectedModelId, onSelect, section) {
  return {
    id: model.identifier,
    enabled: true,
    icon: model.metadata.statusIcon,
    checked: model.identifier === selectedModelId,
    class: void 0,
    description: model.metadata.multiplier ?? model.metadata.detail,
    tooltip: model.metadata.name,
    label: model.metadata.name,
    section,
    run: /* @__PURE__ */ __name(() => onSelect(model), "run")
  };
}
__name(createModelAction, "createModelAction");
function shouldShowManageModelsAction(chatEntitlementService) {
  return chatEntitlementService.entitlement === ChatEntitlement.Free || chatEntitlementService.entitlement === ChatEntitlement.Pro || chatEntitlementService.entitlement === ChatEntitlement.ProPlus || chatEntitlementService.entitlement === ChatEntitlement.Business || chatEntitlementService.entitlement === ChatEntitlement.Enterprise || chatEntitlementService.isInternal;
}
__name(shouldShowManageModelsAction, "shouldShowManageModelsAction");
function createManageModelsAction(commandService) {
  return {
    id: "manageModels",
    enabled: true,
    checked: false,
    class: ThemeIcon.asClassName(Codicon.gear),
    tooltip: localize("chat.manageModels.tooltip", "Manage Language Models"),
    label: localize("chat.manageModels", "Manage Models..."),
    run: /* @__PURE__ */ __name(() => {
      commandService.executeCommand(MANAGE_CHAT_COMMAND_ID);
    }, "run")
  };
}
__name(createManageModelsAction, "createManageModelsAction");
function buildModelPickerItems(models, selectedModelId, recentModelIds, controlModels, currentVSCodeVersion, updateStateType, onSelect, manageSettingsUrl, useGroupedModelPicker, manageModelsAction, chatEntitlementService, showUnavailableFeatured, showFeatured, hoverPosition) {
  const items = [];
  if (models.length === 0) {
    items.push(createModelItem({
      id: "auto",
      enabled: true,
      checked: true,
      class: void 0,
      tooltip: localize("chat.modelPicker.auto", "Auto"),
      label: localize("chat.modelPicker.auto", "Auto"),
      run: /* @__PURE__ */ __name(() => {
      }, "run")
    }));
  }
  if (useGroupedModelPicker) {
    const isPro = isProUser(chatEntitlementService.entitlement);
    let otherModels = [];
    if (models.length) {
      const allModelsMap = /* @__PURE__ */ new Map();
      const modelsByMetadataId = /* @__PURE__ */ new Map();
      for (const model of models) {
        allModelsMap.set(model.identifier, model);
        modelsByMetadataId.set(model.metadata.id, model);
      }
      const placed = /* @__PURE__ */ new Set();
      const markPlaced = /* @__PURE__ */ __name((identifierOrId, metadataId) => {
        placed.add(identifierOrId);
        if (metadataId) {
          placed.add(metadataId);
        }
      }, "markPlaced");
      const resolveModel = /* @__PURE__ */ __name((id) => allModelsMap.get(id) ?? modelsByMetadataId.get(id), "resolveModel");
      const getUnavailableReason = /* @__PURE__ */ __name((entry) => {
        if (!isPro) {
          return "upgrade";
        }
        if (entry.minVSCodeVersion && !isVersionAtLeast(currentVSCodeVersion, entry.minVSCodeVersion)) {
          return "update";
        }
        return "admin";
      }, "getUnavailableReason");
      const autoModel = models.find((m) => m.metadata.id === "auto" && m.metadata.vendor === "copilot");
      if (autoModel) {
        markPlaced(autoModel.identifier, autoModel.metadata.id);
        items.push(createModelItem(createModelAction(autoModel, selectedModelId, onSelect), autoModel, hoverPosition));
      }
      const promotedItems = [];
      const tryPlaceModel = /* @__PURE__ */ __name((id) => {
        if (placed.has(id)) {
          return false;
        }
        const model = resolveModel(id);
        if (model && !placed.has(model.identifier)) {
          markPlaced(model.identifier, model.metadata.id);
          const entry = controlModels[model.metadata.id];
          if (entry?.minVSCodeVersion && !isVersionAtLeast(currentVSCodeVersion, entry.minVSCodeVersion)) {
            promotedItems.push({ kind: "unavailable", id: model.metadata.id, entry, reason: "update" });
          } else {
            promotedItems.push({ kind: "available", model });
          }
          return true;
        }
        if (!model) {
          const entry = controlModels[id];
          if (entry && !entry.exists) {
            markPlaced(id);
            promotedItems.push({ kind: "unavailable", id, entry, reason: getUnavailableReason(entry) });
            return true;
          }
        }
        return false;
      }, "tryPlaceModel");
      if (selectedModelId && selectedModelId !== autoModel?.identifier) {
        tryPlaceModel(selectedModelId);
      }
      for (const id of recentModelIds) {
        tryPlaceModel(id);
      }
      if (showFeatured) {
        for (const [entryId, entry] of Object.entries(controlModels)) {
          if (!entry.featured || placed.has(entryId)) {
            continue;
          }
          const model = resolveModel(entryId);
          if (model && !placed.has(model.identifier)) {
            if (entry.minVSCodeVersion && !isVersionAtLeast(currentVSCodeVersion, entry.minVSCodeVersion)) {
              if (showUnavailableFeatured) {
                markPlaced(model.identifier, model.metadata.id);
                promotedItems.push({ kind: "unavailable", id: entryId, entry, reason: "update" });
              }
            } else {
              markPlaced(model.identifier, model.metadata.id);
              promotedItems.push({ kind: "available", model });
            }
          } else if (!model && !entry.exists) {
            if (showUnavailableFeatured) {
              markPlaced(entryId);
              promotedItems.push({ kind: "unavailable", id: entryId, entry, reason: getUnavailableReason(entry) });
            }
          }
        }
      }
      if (promotedItems.length > 0) {
        promotedItems.sort((a, b) => {
          const aAvail = a.kind === "available" ? 0 : 1;
          const bAvail = b.kind === "available" ? 0 : 1;
          if (aAvail !== bAvail) {
            return aAvail - bAvail;
          }
          const aName = a.kind === "available" ? a.model.metadata.name : a.entry.label;
          const bName = b.kind === "available" ? b.model.metadata.name : b.entry.label;
          return aName.localeCompare(bName);
        });
        for (const item of promotedItems) {
          if (item.kind === "available") {
            items.push(createModelItem(createModelAction(item.model, selectedModelId, onSelect), item.model, hoverPosition));
          } else {
            items.push(createUnavailableModelItem(item.id, item.entry, item.reason, manageSettingsUrl, updateStateType, void 0, hoverPosition));
          }
        }
      }
      otherModels = models.filter((m) => !placed.has(m.identifier) && !placed.has(m.metadata.id)).sort((a, b) => {
        const aEntry = controlModels[a.metadata.id] ?? controlModels[a.identifier];
        const bEntry = controlModels[b.metadata.id] ?? controlModels[b.identifier];
        const aAvail = aEntry?.minVSCodeVersion && !isVersionAtLeast(currentVSCodeVersion, aEntry.minVSCodeVersion) ? 1 : 0;
        const bAvail = bEntry?.minVSCodeVersion && !isVersionAtLeast(currentVSCodeVersion, bEntry.minVSCodeVersion) ? 1 : 0;
        if (aAvail !== bAvail) {
          return aAvail - bAvail;
        }
        const aCopilot = a.metadata.vendor === "copilot" ? 0 : 1;
        const bCopilot = b.metadata.vendor === "copilot" ? 0 : 1;
        if (aCopilot !== bCopilot) {
          return aCopilot - bCopilot;
        }
        const vendorCmp = a.metadata.vendor.localeCompare(b.metadata.vendor);
        return vendorCmp !== 0 ? vendorCmp : a.metadata.name.localeCompare(b.metadata.name);
      });
      if (otherModels.length > 0) {
        if (items.length > 0) {
          items.push({
            kind: "separator"
            /* ActionListItemKind.Separator */
          });
        }
        items.push({
          item: {
            id: "otherModels",
            enabled: true,
            checked: false,
            class: void 0,
            tooltip: localize("chat.modelPicker.otherModels", "Other Models"),
            label: localize("chat.modelPicker.otherModels", "Other Models"),
            run: /* @__PURE__ */ __name(() => {
            }, "run")
          },
          kind: "action",
          label: localize("chat.modelPicker.otherModels", "Other Models"),
          group: { title: "", icon: Codicon.chevronDown },
          hideIcon: false,
          section: ModelPickerSection.Other,
          isSectionToggle: true
        });
        for (const model of otherModels) {
          const entry = controlModels[model.metadata.id] ?? controlModels[model.identifier];
          if (entry?.minVSCodeVersion && !isVersionAtLeast(currentVSCodeVersion, entry.minVSCodeVersion)) {
            items.push(createUnavailableModelItem(model.metadata.id, entry, "update", manageSettingsUrl, updateStateType, ModelPickerSection.Other, hoverPosition));
          } else {
            items.push(createModelItem(createModelAction(model, selectedModelId, onSelect, ModelPickerSection.Other), model, hoverPosition));
          }
        }
      }
    }
    if (manageModelsAction) {
      items.push({ kind: "separator", section: otherModels.length ? ModelPickerSection.Other : void 0 });
      items.push({
        item: manageModelsAction,
        kind: "action",
        label: manageModelsAction.label,
        group: { title: "", icon: Codicon.blank },
        hideIcon: false,
        section: otherModels.length ? ModelPickerSection.Other : void 0,
        showAlways: true
      });
    }
  } else {
    const autoModel = models.find((m) => m.metadata.id === "auto" && m.metadata.vendor === "copilot");
    if (autoModel) {
      items.push(createModelItem(createModelAction(autoModel, selectedModelId, onSelect), autoModel, hoverPosition));
    }
    const sortedModels = models.filter((m) => m !== autoModel).sort((a, b) => {
      const vendorCmp = a.metadata.vendor.localeCompare(b.metadata.vendor);
      return vendorCmp !== 0 ? vendorCmp : a.metadata.name.localeCompare(b.metadata.name);
    });
    for (const model of sortedModels) {
      items.push(createModelItem(createModelAction(model, selectedModelId, onSelect), model, hoverPosition));
    }
  }
  return items;
}
__name(buildModelPickerItems, "buildModelPickerItems");
function getModelPickerAccessibilityProvider() {
  return {
    isChecked(element) {
      return element.kind === "action" ? !!element?.item?.checked : void 0;
    },
    getRole: /* @__PURE__ */ __name((element) => {
      switch (element.kind) {
        case "action":
          return "menuitemradio";
        case "separator":
          return "separator";
        default:
          return "separator";
      }
    }, "getRole"),
    getWidgetRole: /* @__PURE__ */ __name(() => "menu", "getWidgetRole")
  };
}
__name(getModelPickerAccessibilityProvider, "getModelPickerAccessibilityProvider");
function createUnavailableModelItem(id, entry, reason, manageSettingsUrl, updateStateType, section, hoverPosition) {
  let description;
  if (reason === "upgrade") {
    description = new MarkdownString(localize("chat.modelPicker.upgradeLink", '[Upgrade](command:workbench.action.chat.upgradePlan " ")'), { isTrusted: true });
  } else if (reason === "update") {
    description = localize("chat.modelPicker.updateDescription", "Update VS Code");
  } else {
    description = manageSettingsUrl ? new MarkdownString(localize("chat.modelPicker.adminLink", "[Contact your admin]({0})", manageSettingsUrl), { isTrusted: true }) : localize("chat.modelPicker.adminDescription", "Contact your admin");
  }
  let hoverContent;
  if (reason === "upgrade") {
    hoverContent = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
    hoverContent.appendMarkdown(localize("chat.modelPicker.upgradeHover", '[Upgrade to GitHub Copilot Pro](command:workbench.action.chat.upgradePlan " ") with a free 30-day trial to use the best models.'));
  } else if (reason === "update") {
    hoverContent = getUpdateHoverContent(updateStateType);
  } else {
    hoverContent = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
    hoverContent.appendMarkdown(localize("chat.modelPicker.adminHover", "This model is not available. Contact your administrator to enable it."));
  }
  return {
    item: {
      id,
      enabled: false,
      checked: false,
      class: void 0,
      tooltip: entry.label,
      label: entry.label,
      description: typeof description === "string" ? description : void 0,
      run: /* @__PURE__ */ __name(() => {
      }, "run")
    },
    kind: "action",
    label: entry.label,
    description,
    group: { title: "", icon: ThemeIcon.fromId(Codicon.blank.id) },
    disabled: true,
    hideIcon: false,
    className: "chat-model-picker-unavailable",
    section,
    hover: { content: hoverContent, position: hoverPosition }
  };
}
__name(createUnavailableModelItem, "createUnavailableModelItem");
let ModelPickerWidget = class ModelPickerWidget2 extends Disposable {
  static {
    __name(this, "ModelPickerWidget");
  }
  get selectedModel() {
    return this._selectedModel;
  }
  get domNode() {
    return this._domNode;
  }
  constructor(_delegate, _hoverPosition, _actionWidgetService, _commandService, _telemetryService, _languageModelsService, _productService, _entitlementService, _updateService) {
    super();
    this._delegate = _delegate;
    this._hoverPosition = _hoverPosition;
    this._actionWidgetService = _actionWidgetService;
    this._commandService = _commandService;
    this._telemetryService = _telemetryService;
    this._languageModelsService = _languageModelsService;
    this._productService = _productService;
    this._entitlementService = _entitlementService;
    this._updateService = _updateService;
    this._onDidChangeSelection = this._register(new Emitter());
    this.onDidChangeSelection = this._onDidChangeSelection.event;
  }
  setHideChevrons(hideChevrons) {
    this._hideChevrons = hideChevrons;
    this._register(autorun((reader) => {
      const hide = hideChevrons.read(reader);
      if (this._domNode) {
        this._domNode.classList.toggle("hide-chevrons", hide);
      }
      this._renderLabel();
    }));
  }
  setSelectedModel(model) {
    this._selectedModel = model;
    this._renderLabel();
  }
  setBadge(badge) {
    this._badge = badge;
    this._updateBadge();
  }
  render(container) {
    this._domNode = dom.append(container, dom.$("a.action-label"));
    this._domNode.tabIndex = 0;
    this._domNode.setAttribute("role", "button");
    this._domNode.setAttribute("aria-haspopup", "true");
    this._domNode.setAttribute("aria-expanded", "false");
    if (this._hideChevrons?.get()) {
      this._domNode.classList.toggle("hide-chevrons", true);
    }
    this._badgeIcon = dom.append(this._domNode, dom.$("span.model-picker-badge"));
    this._updateBadge();
    this._renderLabel();
    this._register(dom.addDisposableListener(this._domNode, dom.EventType.MOUSE_DOWN, (e) => {
      if (e.button !== 0) {
        return;
      }
      dom.EventHelper.stop(e, true);
      this.show();
    }));
    this._register(dom.addDisposableListener(this._domNode, dom.EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(
        3
        /* KeyCode.Enter */
      ) || event.equals(
        10
        /* KeyCode.Space */
      )) {
        dom.EventHelper.stop(e, true);
        this.show();
      }
    }));
  }
  show(anchor) {
    const anchorElement = anchor ?? this._domNode;
    if (!anchorElement) {
      return;
    }
    const previousModel = this._selectedModel;
    const onSelect = /* @__PURE__ */ __name((model) => {
      this._telemetryService.publicLog2("chat.modelChange", {
        fromModel: previousModel?.metadata.vendor === "copilot" ? new TelemetryTrustedValue(previousModel.identifier) : "unknown",
        toModel: model.metadata.vendor === "copilot" ? new TelemetryTrustedValue(model.identifier) : "unknown"
      });
      this._selectedModel = model;
      this._renderLabel();
      this._onDidChangeSelection.fire(model);
    }, "onSelect");
    const models = this._delegate.getModels();
    const showFilter = models.length >= 10;
    const isPro = isProUser(this._entitlementService.entitlement);
    const manifest = this._languageModelsService.getModelsControlManifest();
    const controlModelsForTier = isPro ? manifest.paid : manifest.free;
    const canShowManageModelsAction = this._delegate.showManageModelsAction() && shouldShowManageModelsAction(this._entitlementService);
    const manageModelsAction = canShowManageModelsAction ? createManageModelsAction(this._commandService) : void 0;
    const items = buildModelPickerItems(models, this._selectedModel?.identifier, this._languageModelsService.getRecentlyUsedModelIds(), controlModelsForTier, this._productService.version, this._updateService.state.type, onSelect, this._productService.defaultChatAgent?.manageSettingsUrl, this._delegate.useGroupedModelPicker(), !showFilter ? manageModelsAction : void 0, this._entitlementService, this._delegate.showUnavailableFeatured(), this._delegate.showFeatured(), this._hoverPosition);
    const listOptions = {
      showFilter,
      filterPlaceholder: localize("chat.modelPicker.search", "Search models"),
      filterActions: showFilter && manageModelsAction ? [manageModelsAction] : void 0,
      focusFilterOnOpen: true,
      collapsedByDefault: /* @__PURE__ */ new Set([ModelPickerSection.Other]),
      minWidth: 200
    };
    const previouslyFocusedElement = dom.getActiveElement();
    const delegate = {
      onSelect: /* @__PURE__ */ __name((action) => {
        this._actionWidgetService.hide();
        action.run();
      }, "onSelect"),
      onHide: /* @__PURE__ */ __name(() => {
        this._domNode?.setAttribute("aria-expanded", "false");
        if (dom.isHTMLElement(previouslyFocusedElement)) {
          previouslyFocusedElement.focus();
        }
      }, "onHide")
    };
    this._domNode?.setAttribute("aria-expanded", "true");
    this._actionWidgetService.show("ChatModelPicker", false, items, delegate, anchorElement, void 0, [], getModelPickerAccessibilityProvider(), listOptions);
    const activeElement = dom.getActiveElement();
    if (dom.isHTMLInputElement(activeElement) && activeElement.classList.contains("action-list-filter-input")) {
      activeElement.classList.add("chat-model-picker-filter-input");
    }
  }
  _updateBadge() {
    if (this._badgeIcon) {
      if (this._badge) {
        const icon = this._badge === "info" ? Codicon.info : Codicon.warning;
        dom.reset(this._badgeIcon, renderIcon(icon));
        this._badgeIcon.style.display = "";
        this._badgeIcon.classList.toggle("info", this._badge === "info");
        this._badgeIcon.classList.toggle("warning", this._badge === "warning");
      } else {
        this._badgeIcon.style.display = "none";
      }
    }
  }
  _renderLabel() {
    if (!this._domNode) {
      return;
    }
    const { name, statusIcon } = this._selectedModel?.metadata || {};
    const domChildren = [];
    if (statusIcon) {
      const iconElement = renderIcon(statusIcon);
      domChildren.push(iconElement);
    }
    domChildren.push(dom.$("span.chat-input-picker-label", void 0, name ?? localize("chat.modelPicker.auto", "Auto")));
    if (this._badgeIcon) {
      domChildren.push(this._badgeIcon);
    }
    domChildren.push(...renderLabelWithIcons(`$(chevron-down)`));
    dom.reset(this._domNode, ...domChildren);
    const modelName = this._selectedModel?.metadata.name ?? localize("chat.modelPicker.auto", "Auto");
    this._domNode.ariaLabel = localize("chat.modelPicker.ariaLabel", "Pick Model, {0}", modelName);
  }
};
ModelPickerWidget = __decorate([
  __param(2, IActionWidgetService),
  __param(3, ICommandService),
  __param(4, ITelemetryService),
  __param(5, ILanguageModelsService),
  __param(6, IProductService),
  __param(7, IChatEntitlementService),
  __param(8, IUpdateService)
], ModelPickerWidget);
function getModelHoverContent(model) {
  const isAuto = model.metadata.id === "auto" && model.metadata.vendor === "copilot";
  const markdown = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
  markdown.appendMarkdown(`**${model.metadata.name}**`);
  markdown.appendText(`
`);
  if (model.metadata.statusIcon && model.metadata.tooltip) {
    if (model.metadata.statusIcon) {
      markdown.appendMarkdown(`$(${model.metadata.statusIcon.id})&nbsp;`);
    }
    markdown.appendMarkdown(`${model.metadata.tooltip}`);
    markdown.appendText(`
`);
  }
  if (model.metadata.multiplier) {
    markdown.appendMarkdown(`${localize("multiplier.tooltip", "Each chat message counts {0} toward your premium request quota", model.metadata.multiplier)}`);
    markdown.appendText(`
`);
  }
  if (!isAuto && (model.metadata.maxInputTokens || model.metadata.maxOutputTokens)) {
    const totalTokens = (model.metadata.maxInputTokens ?? 0) + (model.metadata.maxOutputTokens ?? 0);
    markdown.appendMarkdown(`${localize("models.contextSize", "Context Size")}: `);
    markdown.appendMarkdown(`${formatTokenCount(totalTokens)}`);
    markdown.appendText(`
`);
  }
  return markdown;
}
__name(getModelHoverContent, "getModelHoverContent");
function formatTokenCount(count) {
  if (count >= 1e6) {
    return `${(count / 1e6).toFixed(1)}M`;
  } else if (count >= 1e3) {
    return `${(count / 1e3).toFixed(0)}K`;
  }
  return count.toString();
}
__name(formatTokenCount, "formatTokenCount");
export {
  ModelPickerWidget,
  buildModelPickerItems,
  getModelPickerAccessibilityProvider
};
//# sourceMappingURL=chatModelPicker.js.map
