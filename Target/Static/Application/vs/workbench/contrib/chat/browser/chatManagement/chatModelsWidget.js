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
var ModelNameColumnRenderer_1, MultiplierColumnRenderer_1, TokenLimitsColumnRenderer_1, ActionsColumnRenderer_1, ChatModelsWidget_1;
import "./media/chatModelsWidget.css";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { Emitter } from "../../../../../base/common/event.js";
import * as DOM from "../../../../../base/browser/dom.js";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { ILanguageModelsService } from "../../../chat/common/languageModels.js";
import { localize } from "../../../../../nls.js";
import { defaultButtonStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { WorkbenchTable } from "../../../../../platform/list/browser/listService.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { toAction, Action, Separator, SubmenuAction } from "../../../../../base/common/actions.js";
import { ActionBar } from "../../../../../base/browser/ui/actionbar/actionbar.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { ChatModelsViewModel, SEARCH_SUGGESTIONS, isLanguageModelProviderEntry, isLanguageModelGroupEntry, isStatusEntry } from "./chatModelsViewModel.js";
import { HighlightedLabel } from "../../../../../base/browser/ui/highlightedlabel/highlightedLabel.js";
import { SuggestEnabledInput } from "../../../codeEditor/browser/suggestEnabledInput/suggestEnabledInput.js";
import { Delayer } from "../../../../../base/common/async.js";
import { settingsTextInputBorder } from "../../../preferences/common/settingsEditorColorRegistry.js";
import { IChatEntitlementService, ChatEntitlement } from "../../../../services/chat/common/chatEntitlementService.js";
import { DropdownMenuActionViewItem } from "../../../../../base/browser/ui/dropdown/dropdownActionViewItem.js";
import { ToolBar } from "../../../../../base/browser/ui/toolbar/toolbar.js";
import { preferencesClearInputIcon } from "../../../preferences/browser/preferencesIcons.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IEditorProgressService } from "../../../../../platform/progress/common/progress.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { CONTEXT_MODELS_SEARCH_FOCUS } from "../../common/constants.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import Severity from "../../../../../base/common/severity.js";
const $ = DOM.$;
const HEADER_HEIGHT = 30;
const VENDOR_ROW_HEIGHT = 30;
const MODEL_ROW_HEIGHT = 26;
function getModelHoverContent(model) {
  const markdown = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
  markdown.appendMarkdown(`**${model.metadata.name}**`);
  if (model.metadata.id !== model.metadata.version) {
    markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">&nbsp;_${model.metadata.id}@${model.metadata.version}_&nbsp;</span>`);
  } else {
    markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">&nbsp;_${model.metadata.id}_&nbsp;</span>`);
  }
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
  if (model.metadata.detail) {
    markdown.appendMarkdown(`${localize("models.cost", "Multiplier")}: `);
    markdown.appendMarkdown(model.metadata.detail);
    markdown.appendText(`
`);
  }
  if (model.metadata.maxInputTokens || model.metadata.maxOutputTokens) {
    markdown.appendMarkdown(`${localize("models.contextSize", "Context Size")}: `);
    let addSeparator = false;
    if (model.metadata.maxInputTokens) {
      markdown.appendMarkdown(`$(arrow-down) ${formatTokenCount(model.metadata.maxInputTokens)} (${localize("models.input", "Input")})`);
      addSeparator = true;
    }
    if (model.metadata.maxOutputTokens) {
      if (addSeparator) {
        markdown.appendText(`  |  `);
      }
      markdown.appendMarkdown(`$(arrow-up) ${formatTokenCount(model.metadata.maxOutputTokens)} (${localize("models.output", "Output")})`);
    }
    markdown.appendText(`
`);
  }
  if (model.metadata.capabilities) {
    markdown.appendMarkdown(`${localize("models.capabilities", "Capabilities")}: `);
    if (model.metadata.capabilities?.toolCalling) {
      markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">&nbsp;_${localize("models.toolCalling", "Tools")}_&nbsp;</span>`);
    }
    if (model.metadata.capabilities?.vision) {
      markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">&nbsp;_${localize("models.vision", "Vision")}_&nbsp;</span>`);
    }
    if (model.metadata.capabilities?.agentMode) {
      markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">&nbsp;_${localize("models.agentMode", "Agent Mode")}_&nbsp;</span>`);
    }
    for (const editTool of model.metadata.capabilities.editTools ?? []) {
      markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">&nbsp;_${editTool}_&nbsp;</span>`);
    }
    markdown.appendText(`
`);
  }
  return markdown;
}
__name(getModelHoverContent, "getModelHoverContent");
class ModelsFilterAction extends Action {
  static {
    __name(this, "ModelsFilterAction");
  }
  constructor() {
    super("workbench.models.filter", localize("filter", "Filter"), ThemeIcon.asClassName(Codicon.filter));
  }
  async run() {
  }
}
function toggleFilter(currentQuery, query, alternativeQueries = []) {
  const allQueries = [query, ...alternativeQueries];
  const isChecked = allQueries.some((q) => currentQuery.includes(q));
  if (!isChecked) {
    const trimmedQuery = currentQuery.trim();
    return trimmedQuery ? `${trimmedQuery} ${query}` : query;
  } else {
    let queryWithRemovedFilter = currentQuery;
    for (const q of allQueries) {
      queryWithRemovedFilter = queryWithRemovedFilter.replace(q, "");
    }
    return queryWithRemovedFilter.replace(/\s+/g, " ").trim();
  }
}
__name(toggleFilter, "toggleFilter");
let ModelsSearchFilterDropdownMenuActionViewItem = class ModelsSearchFilterDropdownMenuActionViewItem2 extends DropdownMenuActionViewItem {
  static {
    __name(this, "ModelsSearchFilterDropdownMenuActionViewItem");
  }
  constructor(action, options, searchWidget, viewModel, contextMenuService) {
    super(action, { getActions: /* @__PURE__ */ __name(() => this.getActions(), "getActions") }, contextMenuService, {
      ...options,
      classNames: action.class,
      anchorAlignmentProvider: /* @__PURE__ */ __name(() => 1, "anchorAlignmentProvider"),
      menuAsChild: true
    });
    this.searchWidget = searchWidget;
    this.viewModel = viewModel;
  }
  createGroupByAction(grouping, label) {
    return {
      id: `groupBy.${grouping}`,
      label,
      class: void 0,
      enabled: true,
      tooltip: localize("groupByTooltip", "Group by {0}", label),
      checked: this.viewModel.groupBy === grouping,
      run: /* @__PURE__ */ __name(() => {
        this.viewModel.groupBy = grouping;
      }, "run")
    };
  }
  createProviderAction(vendor, displayName) {
    const query = `@provider:"${displayName}"`;
    const currentQuery = this.searchWidget.getValue();
    const isChecked = currentQuery.includes(query) || currentQuery.includes(`@provider:${vendor}`);
    return {
      id: `provider-${vendor}`,
      label: displayName,
      tooltip: localize("filterByProvider", "Filter by {0}", displayName),
      class: void 0,
      enabled: true,
      checked: isChecked,
      run: /* @__PURE__ */ __name(() => this.toggleFilterAndSearch(query, [`@provider:${vendor}`]), "run")
    };
  }
  createCapabilityAction(capability, label) {
    const query = `@capability:${capability}`;
    const currentQuery = this.searchWidget.getValue();
    const isChecked = currentQuery.includes(query);
    return {
      id: `capability-${capability}`,
      label,
      tooltip: localize("filterByCapability", "Filter by {0}", label),
      class: void 0,
      enabled: true,
      checked: isChecked,
      run: /* @__PURE__ */ __name(() => this.toggleFilterAndSearch(query), "run")
    };
  }
  createVisibleAction(visible, label) {
    const query = `@visible:${visible}`;
    const oppositeQuery = `@visible:${!visible}`;
    const currentQuery = this.searchWidget.getValue();
    const isChecked = currentQuery.includes(query);
    return {
      id: `visible-${visible}`,
      label,
      tooltip: localize("filterByVisible", "Filter by {0}", label),
      class: void 0,
      enabled: true,
      checked: isChecked,
      run: /* @__PURE__ */ __name(() => this.toggleFilterAndSearch(query, [oppositeQuery]), "run")
    };
  }
  toggleFilterAndSearch(query, alternativeQueries = []) {
    const currentQuery = this.searchWidget.getValue();
    const newQuery = toggleFilter(currentQuery, query, alternativeQueries);
    this.searchWidget.setValue(newQuery);
    this.searchWidget.focus();
  }
  getActions() {
    const actions = [];
    actions.push(this.createVisibleAction(true, localize("filter.visible", "Visible")));
    actions.push(this.createVisibleAction(false, localize("filter.hidden", "Hidden")));
    actions.push(new Separator());
    actions.push(this.createCapabilityAction("tools", localize("capability.tools", "Tools")), this.createCapabilityAction("vision", localize("capability.vision", "Vision")), this.createCapabilityAction("agent", localize("capability.agent", "Agent Mode")));
    const configuredVendors = this.viewModel.getConfiguredVendors();
    if (configuredVendors.length > 1) {
      actions.push(new Separator());
      actions.push(...configuredVendors.map((vendor) => this.createProviderAction(vendor.vendor.vendor, vendor.group.name)));
    }
    actions.push(new Separator());
    const groupByActions = [];
    groupByActions.push(this.createGroupByAction("vendor", localize("groupBy.provider", "Provider")));
    groupByActions.push(this.createGroupByAction("visibility", localize("groupBy.visibility", "Visibility")));
    actions.push(new SubmenuAction("groupBy", localize("groupBy", "Group By"), groupByActions));
    return actions;
  }
};
ModelsSearchFilterDropdownMenuActionViewItem = __decorate([
  __param(4, IContextMenuService)
], ModelsSearchFilterDropdownMenuActionViewItem);
class Delegate {
  static {
    __name(this, "Delegate");
  }
  constructor() {
    this.headerRowHeight = HEADER_HEIGHT;
  }
  getHeight(element) {
    return isLanguageModelProviderEntry(element) || isLanguageModelGroupEntry(element) ? VENDOR_ROW_HEIGHT : MODEL_ROW_HEIGHT;
  }
}
class ModelsTableColumnRenderer {
  static {
    __name(this, "ModelsTableColumnRenderer");
  }
  renderElement(element, index, templateData) {
    templateData.elementDisposables.clear();
    const isVendor = isLanguageModelProviderEntry(element);
    const isGroup = isLanguageModelGroupEntry(element);
    const isStatus = isStatusEntry(element);
    templateData.container.classList.add("models-table-column");
    templateData.container.parentElement.classList.toggle("models-vendor-row", isVendor || isGroup);
    templateData.container.parentElement.classList.toggle("models-model-row", !isVendor && !isGroup);
    templateData.container.parentElement.classList.toggle("models-status-row", isStatus);
    templateData.container.parentElement.classList.toggle("model-hidden", !isVendor && !isGroup && !isStatus && !element.model.metadata.isUserSelectable);
    if (isVendor) {
      this.renderVendorElement(element, index, templateData);
    } else if (isGroup) {
      this.renderGroupElement(element, index, templateData);
    } else if (isStatus) {
      this.renderStatusElement(element, index, templateData);
    } else {
      this.renderModelElement(element, index, templateData);
    }
  }
  renderStatusElement(element, index, templateData) {
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.disposables.dispose();
  }
}
class GutterColumnRenderer extends ModelsTableColumnRenderer {
  static {
    __name(this, "GutterColumnRenderer");
  }
  static {
    this.TEMPLATE_ID = "gutter";
  }
  constructor(viewModel) {
    super();
    this.viewModel = viewModel;
    this.templateId = GutterColumnRenderer.TEMPLATE_ID;
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    container.classList.add("models-gutter-column");
    const actionBar = disposables.add(new ActionBar(container));
    return {
      listRowElement: container.parentElement?.parentElement ?? null,
      container,
      actionBar,
      disposables,
      elementDisposables
    };
  }
  renderElement(entry, index, templateData) {
    templateData.actionBar.clear();
    super.renderElement(entry, index, templateData);
  }
  renderVendorElement(entry, index, templateData) {
    this.renderCollapsableElement(entry, templateData);
  }
  renderGroupElement(entry, index, templateData) {
    this.renderCollapsableElement(entry, templateData);
  }
  renderCollapsableElement(entry, templateData) {
    if (templateData.listRowElement) {
      templateData.listRowElement.setAttribute("aria-expanded", entry.collapsed ? "false" : "true");
    }
    const label = entry.collapsed ? localize("expand", "Expand") : localize("collapse", "Collapse");
    const toggleCollapseAction = {
      id: "toggleCollapse",
      label,
      tooltip: label,
      enabled: true,
      class: ThemeIcon.asClassName(entry.collapsed ? Codicon.chevronRight : Codicon.chevronDown),
      run: /* @__PURE__ */ __name(() => this.viewModel.toggleCollapsed(entry), "run")
    };
    templateData.actionBar.push(toggleCollapseAction, { icon: true, label: false });
  }
  renderModelElement(entry, index, templateData) {
    const { model: modelEntry } = entry;
    const isVisible = modelEntry.metadata.isUserSelectable ?? false;
    const toggleVisibilityAction = toAction({
      id: "toggleVisibility",
      label: isVisible ? localize("models.hide", "Hide") : localize("models.show", "Show"),
      class: `model-visibility-toggle ${isVisible ? `${ThemeIcon.asClassName(Codicon.eye)} model-visible` : `${ThemeIcon.asClassName(Codicon.eyeClosed)} model-hidden`}`,
      tooltip: isVisible ? localize("models.visible", "Hide in the chat model picker") : localize("models.hidden", "Show in the chat model picker"),
      checked: !isVisible,
      run: /* @__PURE__ */ __name(async () => this.viewModel.toggleVisibility(entry), "run")
    });
    templateData.actionBar.push(toggleVisibilityAction, { icon: true, label: false });
  }
}
let ModelNameColumnRenderer = class ModelNameColumnRenderer2 extends ModelsTableColumnRenderer {
  static {
    __name(this, "ModelNameColumnRenderer");
  }
  static {
    ModelNameColumnRenderer_1 = this;
  }
  static {
    this.TEMPLATE_ID = "modelName";
  }
  constructor(hoverService) {
    super();
    this.hoverService = hoverService;
    this.templateId = ModelNameColumnRenderer_1.TEMPLATE_ID;
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    const nameContainer = DOM.append(container, $(".model-name-container"));
    const statusIcon = DOM.append(nameContainer, $(".status-icon"));
    const nameLabel = disposables.add(new HighlightedLabel(DOM.append(nameContainer, $(".model-name"))));
    const modelStatusIcon = DOM.append(nameContainer, $(".model-status-icon"));
    const actionBar = disposables.add(new ActionBar(DOM.append(nameContainer, $(".model-name-actions"))));
    return {
      container,
      statusIcon,
      nameLabel,
      modelStatusIcon,
      actionBar,
      disposables,
      elementDisposables
    };
  }
  renderElement(entry, index, templateData) {
    DOM.clearNode(templateData.modelStatusIcon);
    templateData.actionBar.clear();
    templateData.nameLabel.element.classList.remove("error-status", "warning-status", "info-status");
    super.renderElement(entry, index, templateData);
  }
  renderVendorElement(entry, index, templateData) {
    templateData.nameLabel.set(entry.vendorEntry.group.name, void 0);
  }
  renderGroupElement(entry, index, templateData) {
    templateData.nameLabel.set(entry.label, void 0);
  }
  renderModelElement(entry, index, templateData) {
    const { model: modelEntry, modelNameMatches } = entry;
    templateData.statusIcon.style.display = "none";
    templateData.modelStatusIcon.className = "model-status-icon";
    if (modelEntry.metadata.statusIcon) {
      templateData.modelStatusIcon.classList.add(...ThemeIcon.asClassNameArray(modelEntry.metadata.statusIcon));
      templateData.modelStatusIcon.style.display = "";
    } else {
      templateData.modelStatusIcon.style.display = "none";
    }
    templateData.nameLabel.set(modelEntry.metadata.name, modelNameMatches);
    const markdown = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
    markdown.appendMarkdown(`**${entry.model.metadata.name}**`);
    if (entry.model.metadata.id !== entry.model.metadata.version) {
      markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">&nbsp;_${entry.model.metadata.id}@${entry.model.metadata.version}_&nbsp;</span>`);
    } else {
      markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">&nbsp;_${entry.model.metadata.id}_&nbsp;</span>`);
    }
    markdown.appendText(`
`);
    if (entry.model.metadata.statusIcon && entry.model.metadata.tooltip) {
      if (entry.model.metadata.statusIcon) {
        markdown.appendMarkdown(`$(${entry.model.metadata.statusIcon.id})&nbsp;`);
      }
      markdown.appendMarkdown(`${entry.model.metadata.tooltip}`);
      markdown.appendText(`
`);
    }
    if (!entry.model.metadata.isUserSelectable) {
      markdown.appendMarkdown(`

${localize("models.userSelectable", "This model is hidden in the chat model picker")}`);
    }
    templateData.elementDisposables.add(this.hoverService.setupDelayedHoverAtMouse(templateData.container, () => ({
      content: markdown,
      appearance: {
        compact: true,
        skipFadeInAnimation: true
      }
    })));
  }
  renderStatusElement(entry, index, templateData) {
    templateData.statusIcon.style.display = "";
    templateData.statusIcon.className = "status-icon";
    switch (entry.severity) {
      case Severity.Error:
        templateData.nameLabel.element.classList.add("error-status");
        templateData.statusIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.error));
        break;
      case Severity.Warning:
        templateData.nameLabel.element.classList.add("warning-status");
        templateData.statusIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.warning));
        break;
      case Severity.Info:
        templateData.nameLabel.element.classList.add("info-status");
        templateData.statusIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.info));
        break;
    }
    templateData.nameLabel.set(entry.message, void 0, entry.message);
  }
};
ModelNameColumnRenderer = ModelNameColumnRenderer_1 = __decorate([
  __param(0, IHoverService)
], ModelNameColumnRenderer);
let MultiplierColumnRenderer = class MultiplierColumnRenderer2 extends ModelsTableColumnRenderer {
  static {
    __name(this, "MultiplierColumnRenderer");
  }
  static {
    MultiplierColumnRenderer_1 = this;
  }
  static {
    this.TEMPLATE_ID = "multiplier";
  }
  constructor(hoverService) {
    super();
    this.hoverService = hoverService;
    this.templateId = MultiplierColumnRenderer_1.TEMPLATE_ID;
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    const multiplierElement = DOM.append(container, $(".model-multiplier"));
    return {
      container,
      multiplierElement,
      disposables,
      elementDisposables
    };
  }
  renderElement(entry, index, templateData) {
    templateData.multiplierElement.textContent = "";
    super.renderElement(entry, index, templateData);
  }
  renderGroupElement(element, index, templateData) {
  }
  renderVendorElement(element, index, templateData) {
  }
  renderModelElement(entry, index, templateData) {
    const multiplierText = entry.model.metadata.detail && entry.model.metadata.detail.trim().toLowerCase() !== entry.model.provider.group.name.trim().toLowerCase() ? entry.model.metadata.detail : "-";
    templateData.multiplierElement.textContent = multiplierText;
    if (multiplierText !== "-") {
      templateData.elementDisposables.add(this.hoverService.setupDelayedHoverAtMouse(templateData.container, () => ({
        content: localize("multiplier.tooltip", "Every chat message counts {0} towards your premium model request quota", multiplierText),
        appearance: {
          compact: true,
          skipFadeInAnimation: true
        }
      })));
    }
  }
};
MultiplierColumnRenderer = MultiplierColumnRenderer_1 = __decorate([
  __param(0, IHoverService)
], MultiplierColumnRenderer);
let TokenLimitsColumnRenderer = class TokenLimitsColumnRenderer2 extends ModelsTableColumnRenderer {
  static {
    __name(this, "TokenLimitsColumnRenderer");
  }
  static {
    TokenLimitsColumnRenderer_1 = this;
  }
  static {
    this.TEMPLATE_ID = "tokenLimits";
  }
  constructor(hoverService) {
    super();
    this.hoverService = hoverService;
    this.templateId = TokenLimitsColumnRenderer_1.TEMPLATE_ID;
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    const tokenLimitsElement = DOM.append(container, $(".model-token-limits"));
    return {
      container,
      tokenLimitsElement,
      disposables,
      elementDisposables
    };
  }
  renderElement(entry, index, templateData) {
    DOM.clearNode(templateData.tokenLimitsElement);
    super.renderElement(entry, index, templateData);
  }
  renderVendorElement(entry, index, templateData) {
  }
  renderGroupElement(entry, index, templateData) {
  }
  renderModelElement(entry, index, templateData) {
    const { model: modelEntry } = entry;
    const markdown = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
    if (modelEntry.metadata.maxInputTokens || modelEntry.metadata.maxOutputTokens) {
      let addSeparator = false;
      markdown.appendMarkdown(`${localize("models.contextSize", "Context Size")}: `);
      if (modelEntry.metadata.maxInputTokens) {
        const inputDiv = DOM.append(templateData.tokenLimitsElement, $(".token-limit-item"));
        DOM.append(inputDiv, $("span.codicon.codicon-arrow-down"));
        const inputText = DOM.append(inputDiv, $("span"));
        inputText.textContent = formatTokenCount(modelEntry.metadata.maxInputTokens);
        markdown.appendMarkdown(`$(arrow-down) ${modelEntry.metadata.maxInputTokens} (${localize("models.input", "Input")})`);
        addSeparator = true;
      }
      if (modelEntry.metadata.maxOutputTokens) {
        const outputDiv = DOM.append(templateData.tokenLimitsElement, $(".token-limit-item"));
        DOM.append(outputDiv, $("span.codicon.codicon-arrow-up"));
        const outputText = DOM.append(outputDiv, $("span"));
        outputText.textContent = formatTokenCount(modelEntry.metadata.maxOutputTokens);
        if (addSeparator) {
          markdown.appendText(`  |  `);
        }
        markdown.appendMarkdown(`$(arrow-up) ${modelEntry.metadata.maxOutputTokens} (${localize("models.output", "Output")})`);
      }
    }
    templateData.elementDisposables.add(this.hoverService.setupDelayedHoverAtMouse(templateData.container, () => ({
      content: markdown,
      appearance: {
        compact: true,
        skipFadeInAnimation: true
      }
    })));
  }
};
TokenLimitsColumnRenderer = TokenLimitsColumnRenderer_1 = __decorate([
  __param(0, IHoverService)
], TokenLimitsColumnRenderer);
class CapabilitiesColumnRenderer extends ModelsTableColumnRenderer {
  static {
    __name(this, "CapabilitiesColumnRenderer");
  }
  constructor() {
    super(...arguments);
    this.templateId = CapabilitiesColumnRenderer.TEMPLATE_ID;
    this._onDidClickCapability = new Emitter();
    this.onDidClickCapability = this._onDidClickCapability.event;
  }
  static {
    this.TEMPLATE_ID = "capabilities";
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    container.classList.add("model-capability-column");
    const metadataRow = DOM.append(container, $(".model-capabilities"));
    return {
      container,
      metadataRow,
      disposables,
      elementDisposables
    };
  }
  renderElement(entry, index, templateData) {
    DOM.clearNode(templateData.metadataRow);
    super.renderElement(entry, index, templateData);
  }
  renderVendorElement(entry, index, templateData) {
  }
  renderGroupElement(entry, index, templateData) {
  }
  renderModelElement(entry, index, templateData) {
    const { model: modelEntry, capabilityMatches } = entry;
    if (modelEntry.metadata.capabilities?.toolCalling) {
      templateData.elementDisposables.add(this.createCapabilityButton(templateData.metadataRow, capabilityMatches?.includes("toolCalling") || false, localize("models.tools", "Tools"), "tools"));
    }
    if (modelEntry.metadata.capabilities?.vision) {
      templateData.elementDisposables.add(this.createCapabilityButton(templateData.metadataRow, capabilityMatches?.includes("vision") || false, localize("models.vision", "Vision"), "vision"));
    }
  }
  createCapabilityButton(container, isActive, label, capability) {
    const disposables = new DisposableStore();
    const buttonContainer = DOM.append(container, $(".model-badge-container"));
    const button = disposables.add(new Button(buttonContainer, { secondary: true }));
    button.element.classList.add("model-capability");
    button.element.classList.toggle("active", isActive);
    button.label = label;
    disposables.add(button.onDidClick(() => this._onDidClickCapability.fire(capability)));
    return disposables;
  }
}
let ActionsColumnRenderer = class ActionsColumnRenderer2 extends ModelsTableColumnRenderer {
  static {
    __name(this, "ActionsColumnRenderer");
  }
  static {
    ActionsColumnRenderer_1 = this;
  }
  static {
    this.TEMPLATE_ID = "actions";
  }
  constructor(viewModel, instantiationService, languageModelsService, dialogService, commandService, contextMenuService) {
    super();
    this.viewModel = viewModel;
    this.instantiationService = instantiationService;
    this.languageModelsService = languageModelsService;
    this.dialogService = dialogService;
    this.commandService = commandService;
    this.contextMenuService = contextMenuService;
    this.templateId = ActionsColumnRenderer_1.TEMPLATE_ID;
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    container.classList.add("models-actions-column");
    const parent = DOM.append(container, $(".actions-container"));
    const actionBar = disposables.add(this.instantiationService.createInstance(ToolBar, parent, this.contextMenuService, {
      icon: true,
      label: false,
      moreIcon: Codicon.gear,
      anchorAlignmentProvider: /* @__PURE__ */ __name(() => 1, "anchorAlignmentProvider")
      /* AnchorAlignment.RIGHT */
    }));
    return {
      container,
      actionBar,
      disposables,
      elementDisposables
    };
  }
  renderElement(entry, index, templateData) {
    templateData.actionBar.setActions([]);
    super.renderElement(entry, index, templateData);
  }
  renderVendorElement(entry, index, templateData) {
    const { vendorEntry } = entry;
    const primaryActions = [];
    const secondaryActions = [];
    if (vendorEntry.vendor.configuration) {
      secondaryActions.push(toAction({
        id: "configureAction",
        label: localize("models.configure", "Configure..."),
        run: /* @__PURE__ */ __name(() => this.languageModelsService.configureLanguageModelsProviderGroup(vendorEntry.vendor.vendor, vendorEntry.group.name), "run")
      }));
      secondaryActions.push(toAction({
        id: "deleteAction",
        label: localize("models.deleteAction", "Delete"),
        class: ThemeIcon.asClassName(Codicon.trash),
        run: /* @__PURE__ */ __name(async () => {
          const result = await this.dialogService.confirm({
            type: "info",
            message: localize("models.deleteConfirmation", "Would you like to delete {0}?", vendorEntry.group.name)
          });
          if (!result.confirmed) {
            return;
          }
          await this.languageModelsService.removeLanguageModelsProviderGroup(vendorEntry.vendor.vendor, vendorEntry.group.name);
        }, "run")
      }));
    } else if (vendorEntry.vendor.managementCommand) {
      primaryActions.push(toAction({
        id: "manageVendor",
        label: localize("models.manageProvider", "Manage {0}...", vendorEntry.group.name),
        class: ThemeIcon.asClassName(Codicon.gear),
        run: /* @__PURE__ */ __name(async () => {
          await this.commandService.executeCommand(vendorEntry.vendor.managementCommand, vendorEntry.vendor.vendor);
          this.viewModel.refresh();
        }, "run")
      }));
    }
    templateData.actionBar.setActions(primaryActions, secondaryActions);
  }
  renderGroupElement(entry, index, templateData) {
  }
  renderModelElement(entry, index, templateData) {
  }
};
ActionsColumnRenderer = ActionsColumnRenderer_1 = __decorate([
  __param(1, IInstantiationService),
  __param(2, ILanguageModelsService),
  __param(3, IDialogService),
  __param(4, ICommandService),
  __param(5, IContextMenuService)
], ActionsColumnRenderer);
class ProviderColumnRenderer extends ModelsTableColumnRenderer {
  static {
    __name(this, "ProviderColumnRenderer");
  }
  constructor() {
    super(...arguments);
    this.templateId = ProviderColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "provider";
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    const providerElement = DOM.append(container, $(".model-provider"));
    return {
      container,
      providerElement,
      disposables,
      elementDisposables
    };
  }
  renderVendorElement(entry, index, templateData) {
    templateData.providerElement.textContent = "";
  }
  renderGroupElement(entry, index, templateData) {
    templateData.providerElement.textContent = "";
  }
  renderModelElement(entry, index, templateData) {
    templateData.providerElement.textContent = entry.model.provider.vendor.displayName;
  }
}
function formatTokenCount(count) {
  if (count >= 1e6) {
    return `${(count / 1e6).toFixed(1)}M`;
  } else if (count >= 1e3) {
    return `${(count / 1e3).toFixed(0)}K`;
  }
  return count.toString();
}
__name(formatTokenCount, "formatTokenCount");
let ChatModelsWidget = class ChatModelsWidget2 extends Disposable {
  static {
    __name(this, "ChatModelsWidget");
  }
  static {
    ChatModelsWidget_1 = this;
  }
  static {
    this.NUM_INSTANCES = 0;
  }
  constructor(languageModelsService, instantiationService, extensionService, contextMenuService, chatEntitlementService, editorProgressService, commandService, contextKeyService) {
    super();
    this.languageModelsService = languageModelsService;
    this.instantiationService = instantiationService;
    this.extensionService = extensionService;
    this.contextMenuService = contextMenuService;
    this.chatEntitlementService = chatEntitlementService;
    this.editorProgressService = editorProgressService;
    this.commandService = commandService;
    this.dropdownActions = [];
    this.tableDisposables = this._register(new DisposableStore());
    this.searchFocusContextKey = CONTEXT_MODELS_SEARCH_FOCUS.bindTo(contextKeyService);
    this.delayedFiltering = new Delayer(200);
    this.viewModel = this._register(this.instantiationService.createInstance(ChatModelsViewModel));
    this.element = DOM.$(".models-widget");
    this.create(this.element);
    const loadingPromise = this.extensionService.whenInstalledExtensionsRegistered().then(() => this.viewModel.refresh());
    this.editorProgressService.showWhile(loadingPromise, 300);
  }
  create(container) {
    const searchAndButtonContainer = DOM.append(container, $(".models-search-and-button-container"));
    const placeholder = localize("Search.FullTextSearchPlaceholder", "Type to search...");
    const searchContainer = DOM.append(searchAndButtonContainer, $(".models-search-container"));
    this.searchWidget = this._register(this.instantiationService.createInstance(SuggestEnabledInput, "chatModelsWidget.searchbox", searchContainer, {
      triggerCharacters: ["@", ":"],
      provideResults: /* @__PURE__ */ __name((query) => {
        const providerSuggestions = this.viewModel.getVendors().map((v) => `@provider:"${v.displayName}"`);
        const allSuggestions = [
          ...providerSuggestions,
          ...SEARCH_SUGGESTIONS.CAPABILITIES,
          ...SEARCH_SUGGESTIONS.VISIBILITY
        ];
        if (!query.trim()) {
          return allSuggestions;
        }
        const queryParts = query.split(/\s/g);
        const lastPart = queryParts[queryParts.length - 1];
        if (lastPart.startsWith("@provider:")) {
          return providerSuggestions;
        } else if (lastPart.startsWith("@capability:")) {
          return SEARCH_SUGGESTIONS.CAPABILITIES;
        } else if (lastPart.startsWith("@visible:")) {
          return SEARCH_SUGGESTIONS.VISIBILITY;
        } else if (lastPart.startsWith("@")) {
          return allSuggestions;
        }
        return [];
      }, "provideResults")
    }, placeholder, `chatModelsWidget:searchinput:${ChatModelsWidget_1.NUM_INSTANCES++}`, {
      placeholderText: placeholder,
      styleOverrides: {
        inputBorder: settingsTextInputBorder
      },
      focusContextKey: this.searchFocusContextKey
    }));
    const filterAction = this._register(new ModelsFilterAction());
    const clearSearchAction = this._register(new Action("workbench.models.clearSearch", localize("clearSearch", "Clear Search"), ThemeIcon.asClassName(preferencesClearInputIcon), false, () => {
      this.searchWidget.setValue("");
      this.searchWidget.focus();
    }));
    const collapseAllAction = this._register(new Action("workbench.models.collapseAll", localize("collapseAll", "Collapse All"), ThemeIcon.asClassName(Codicon.collapseAll), false, () => {
      this.viewModel.collapseAll();
    }));
    collapseAllAction.enabled = this.viewModel.viewModelEntries.some((e) => isLanguageModelGroupEntry(e) || isLanguageModelProviderEntry(e));
    this._register(this.viewModel.onDidChange(() => collapseAllAction.enabled = this.viewModel.viewModelEntries.some((e) => isLanguageModelProviderEntry(e) || isLanguageModelGroupEntry(e))));
    this._register(this.searchWidget.onInputDidChange(() => {
      clearSearchAction.enabled = !!this.searchWidget.getValue();
      this.filterModels();
    }));
    this.searchActionsContainer = DOM.append(searchContainer, $(".models-search-actions"));
    const actions = [clearSearchAction, collapseAllAction, filterAction];
    const toolBar = this._register(new ToolBar(this.searchActionsContainer, this.contextMenuService, {
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        if (action.id === filterAction.id) {
          return this.instantiationService.createInstance(ModelsSearchFilterDropdownMenuActionViewItem, action, options, this.searchWidget, this.viewModel);
        }
        return void 0;
      }, "actionViewItemProvider"),
      getKeyBinding: /* @__PURE__ */ __name(() => void 0, "getKeyBinding")
    }));
    toolBar.setActions(actions);
    this.searchWidget.inputWidget.getContainerDomNode().style.paddingRight = `${DOM.getTotalWidth(this.searchActionsContainer) + 12}px`;
    this.addButtonContainer = DOM.append(searchAndButtonContainer, $(".section-title-actions"));
    const buttonOptions = {
      ...defaultButtonStyles,
      supportIcons: true
    };
    this.addButton = this._register(new Button(this.addButtonContainer, buttonOptions));
    this.addButton.label = `$(${Codicon.add.id}) ${localize("models.enableModelProvider", "Add Models...")}`;
    this.addButton.element.classList.add("models-add-model-button");
    this.addButton.enabled = false;
    this._register(this.addButton.onDidClick((e) => {
      if (this.dropdownActions.length > 0) {
        this.contextMenuService.showContextMenu({
          getAnchor: /* @__PURE__ */ __name(() => this.addButton.element, "getAnchor"),
          getActions: /* @__PURE__ */ __name(() => this.dropdownActions, "getActions")
        });
      }
    }));
    this.tableContainer = DOM.append(container, $(".models-table-container"));
    this.createTable();
    this._register(this.viewModel.onDidChangeGrouping(() => this.createTable()));
  }
  createTable() {
    this.tableDisposables.clear();
    DOM.clearNode(this.tableContainer);
    const gutterColumnRenderer = this.instantiationService.createInstance(GutterColumnRenderer, this.viewModel);
    const modelNameColumnRenderer = this.instantiationService.createInstance(ModelNameColumnRenderer);
    const costColumnRenderer = this.instantiationService.createInstance(MultiplierColumnRenderer);
    const tokenLimitsColumnRenderer = this.instantiationService.createInstance(TokenLimitsColumnRenderer);
    const capabilitiesColumnRenderer = this.instantiationService.createInstance(CapabilitiesColumnRenderer);
    const actionsColumnRenderer = this.instantiationService.createInstance(ActionsColumnRenderer, this.viewModel);
    const providerColumnRenderer = this.instantiationService.createInstance(ProviderColumnRenderer);
    this.tableDisposables.add(capabilitiesColumnRenderer.onDidClickCapability((capability) => {
      const currentQuery = this.searchWidget.getValue();
      const query = `@capability:${capability}`;
      const newQuery = toggleFilter(currentQuery, query);
      this.searchWidget.setValue(newQuery);
      this.searchWidget.focus();
    }));
    const columns = [
      {
        label: "",
        tooltip: "",
        weight: 0.05,
        minimumWidth: 40,
        maximumWidth: 40,
        templateId: GutterColumnRenderer.TEMPLATE_ID,
        project(row) {
          return row;
        }
      },
      {
        label: localize("modelName", "Name"),
        tooltip: "",
        weight: 0.35,
        minimumWidth: 200,
        templateId: ModelNameColumnRenderer.TEMPLATE_ID,
        project(row) {
          return row;
        }
      }
    ];
    if (this.viewModel.groupBy === "visibility") {
      columns.push({
        label: localize("provider", "Provider"),
        tooltip: "",
        weight: 0.15,
        minimumWidth: 100,
        templateId: ProviderColumnRenderer.TEMPLATE_ID,
        project(row) {
          return row;
        }
      });
    }
    columns.push({
      label: localize("tokenLimits", "Context Size"),
      tooltip: "",
      weight: 0.1,
      minimumWidth: 140,
      templateId: TokenLimitsColumnRenderer.TEMPLATE_ID,
      project(row) {
        return row;
      }
    }, {
      label: localize("capabilities", "Capabilities"),
      tooltip: "",
      weight: 0.25,
      minimumWidth: 180,
      templateId: CapabilitiesColumnRenderer.TEMPLATE_ID,
      project(row) {
        return row;
      }
    }, {
      label: localize("cost", "Multiplier"),
      tooltip: "",
      weight: 0.05,
      minimumWidth: 60,
      templateId: MultiplierColumnRenderer.TEMPLATE_ID,
      project(row) {
        return row;
      }
    }, {
      label: "",
      tooltip: "",
      weight: 0.05,
      minimumWidth: 64,
      maximumWidth: 64,
      templateId: ActionsColumnRenderer.TEMPLATE_ID,
      project(row) {
        return row;
      }
    });
    this.table = this.tableDisposables.add(this.instantiationService.createInstance(WorkbenchTable, "ModelsWidget", this.tableContainer, new Delegate(), columns, [
      gutterColumnRenderer,
      modelNameColumnRenderer,
      costColumnRenderer,
      tokenLimitsColumnRenderer,
      capabilitiesColumnRenderer,
      actionsColumnRenderer,
      providerColumnRenderer
    ], {
      identityProvider: { getId: /* @__PURE__ */ __name((e) => e.id, "getId") },
      horizontalScrolling: false,
      accessibilityProvider: {
        getAriaLabel: /* @__PURE__ */ __name((e) => {
          if (isLanguageModelProviderEntry(e)) {
            return localize("vendor.ariaLabel", "{0} Models", e.vendorEntry.group.name);
          } else if (isLanguageModelGroupEntry(e)) {
            return e.id === "visible" ? localize("visible.ariaLabel", "Visible Models") : localize("hidden.ariaLabel", "Hidden Models");
          } else if (isStatusEntry(e)) {
            return localize("status.ariaLabel", "Status: {0}", e.message);
          }
          const ariaLabels = [];
          ariaLabels.push(localize("model.name", "{0} from {1}", e.model.metadata.name, e.model.provider.vendor.displayName));
          if (e.model.metadata.maxInputTokens && e.model.metadata.maxOutputTokens) {
            ariaLabels.push(localize("model.contextSize", "Context size: {0} input tokens and {1} output tokens", formatTokenCount(e.model.metadata.maxInputTokens), formatTokenCount(e.model.metadata.maxOutputTokens)));
          }
          if (e.model.metadata.capabilities) {
            ariaLabels.push(localize("model.capabilities", "Capabilities: {0}", Object.keys(e.model.metadata.capabilities).join(", ")));
          }
          const multiplierText = e.model.metadata.detail && e.model.metadata.detail.trim().toLowerCase() !== e.model.provider.vendor.vendor.trim().toLowerCase() ? e.model.metadata.detail : "-";
          if (multiplierText !== "-") {
            ariaLabels.push(localize("multiplier.tooltip", "Every chat message counts {0} towards your premium model request quota", multiplierText));
          }
          if (e.model.metadata.isUserSelectable) {
            ariaLabels.push(localize("model.visible", "This model is visible in the chat model picker"));
          } else {
            ariaLabels.push(localize("model.hidden", "This model is hidden in the chat model picker"));
          }
          return ariaLabels.join(". ");
        }, "getAriaLabel"),
        getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize("modelsTable.ariaLabel", "Language Models"), "getWidgetAriaLabel")
      },
      multipleSelectionSupport: false,
      setRowLineHeight: false,
      openOnSingleClick: true,
      alwaysConsumeMouseWheel: false
    }));
    this.tableDisposables.add(this.table.onContextMenu((e) => {
      if (!e.element) {
        return;
      }
      const entry = e.element;
      if (isLanguageModelProviderEntry(entry) && entry.vendorEntry.vendor.managementCommand) {
        const actions = [
          toAction({
            id: "manageVendor",
            label: localize("models.manageProvider", "Manage {0}...", entry.vendorEntry.group.name),
            run: /* @__PURE__ */ __name(async () => {
              await this.commandService.executeCommand(entry.vendorEntry.vendor.managementCommand, entry.vendorEntry.vendor);
              await this.viewModel.refresh();
            }, "run")
          })
        ];
        this.contextMenuService.showContextMenu({
          getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
          getActions: /* @__PURE__ */ __name(() => actions, "getActions")
        });
      }
    }));
    this.table.splice(0, this.table.length, this.viewModel.viewModelEntries);
    this.tableDisposables.add(this.viewModel.onDidChange(({ at, removed, added }) => {
      this.table.splice(at, removed, added);
      if (this.viewModel.selectedEntry) {
        const selectedEntryIndex = this.viewModel.viewModelEntries.indexOf(this.viewModel.selectedEntry);
        this.table.setFocus([selectedEntryIndex]);
        this.table.setSelection([selectedEntryIndex]);
      }
      const configurableVendors = this.languageModelsService.getVendors().filter((vendor) => vendor.managementCommand || vendor.configuration);
      const hasPlan = this.chatEntitlementService.entitlement !== ChatEntitlement.Unknown && this.chatEntitlementService.entitlement !== ChatEntitlement.Available;
      this.addButton.enabled = hasPlan && configurableVendors.length > 0;
      this.dropdownActions = configurableVendors.map((vendor) => toAction({
        id: `enable-${vendor.vendor}`,
        label: vendor.displayName,
        run: /* @__PURE__ */ __name(async () => {
          await this.addModelsForVendor(vendor);
        }, "run")
      }));
    }));
    this.tableDisposables.add(this.table.onDidOpen(async ({ element, browserEvent }) => {
      if (!element) {
        return;
      }
      if (isStatusEntry(element)) {
        return;
      }
      if (isLanguageModelProviderEntry(element) || isLanguageModelGroupEntry(element)) {
        this.viewModel.toggleCollapsed(element);
      } else if (!DOM.isMouseEvent(browserEvent) || browserEvent.detail === 2) {
        this.viewModel.toggleVisibility(element);
      }
    }));
    this.tableDisposables.add(this.table.onDidChangeSelection((e) => this.viewModel.selectedEntry = e.elements[0]));
    this.tableDisposables.add(this.table.onDidBlur(() => {
      if (this.viewModel.shouldRefilter()) {
        this.viewModel.filter(this.searchWidget.getValue());
      }
    }));
    this.layout(this.element.clientHeight, this.element.clientWidth);
  }
  filterModels() {
    this.delayedFiltering.trigger(() => {
      this.viewModel.filter(this.searchWidget.getValue());
    });
  }
  async addModelsForVendor(vendor) {
    this.languageModelsService.configureLanguageModelsProviderGroup(vendor.vendor);
  }
  layout(height, width) {
    width = width - 24;
    this.searchWidget.layout(new DOM.Dimension(width - this.searchActionsContainer.clientWidth - this.addButtonContainer.clientWidth - 8, 22));
    const tableHeight = height - 40;
    this.tableContainer.style.height = `${tableHeight}px`;
    this.table.layout(tableHeight, width);
  }
  focusSearch() {
    this.searchWidget.focus();
  }
  search(filter) {
    this.focusSearch();
    this.searchWidget.setValue(filter);
  }
  clearSearch() {
    this.searchWidget.setValue("");
  }
  render() {
    if (this.viewModel.shouldRefilter()) {
      this.viewModel.filter(this.searchWidget.getValue());
    }
  }
};
ChatModelsWidget = ChatModelsWidget_1 = __decorate([
  __param(0, ILanguageModelsService),
  __param(1, IInstantiationService),
  __param(2, IExtensionService),
  __param(3, IContextMenuService),
  __param(4, IChatEntitlementService),
  __param(5, IEditorProgressService),
  __param(6, ICommandService),
  __param(7, IContextKeyService)
], ChatModelsWidget);
export {
  ChatModelsWidget,
  getModelHoverContent
};
//# sourceMappingURL=chatModelsWidget.js.map
