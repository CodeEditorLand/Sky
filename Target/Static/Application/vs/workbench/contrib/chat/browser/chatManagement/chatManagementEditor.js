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
var ModelsManagementEditor_1, ChatManagementEditor_1;
import "./media/chatManagementEditor.css";
import * as DOM from "../../../../../base/browser/dom.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { EditorPane } from "../../../../browser/parts/editor/editorPane.js";
import { CHAT_MANAGEMENT_SECTION_USAGE, CHAT_MANAGEMENT_SECTION_MODELS } from "./chatManagementEditorInput.js";
import { ChatModelsWidget } from "./chatModelsWidget.js";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { localize } from "../../../../../nls.js";
import { defaultButtonStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
import { IChatEntitlementService, ChatEntitlement, getChatPlanName } from "../../../../services/chat/common/chatEntitlementService.js";
import { ChatUsageWidget } from "./chatUsageWidget.js";
import { Sizing, SplitView } from "../../../../../base/browser/ui/splitview/splitview.js";
import { WorkbenchList } from "../../../../../platform/list/browser/listService.js";
import { Event } from "../../../../../base/common/event.js";
import { registerColor } from "../../../../../platform/theme/common/colorRegistry.js";
import { PANEL_BORDER } from "../../../../common/theme.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { CONTEXT_MODELS_EDITOR } from "../../common/constants.js";
const $ = DOM.$;
let ModelsManagementEditor = class ModelsManagementEditor2 extends EditorPane {
  static {
    __name(this, "ModelsManagementEditor");
  }
  static {
    ModelsManagementEditor_1 = this;
  }
  static {
    this.ID = "workbench.editor.modelsManagement";
  }
  constructor(group, telemetryService, themeService, storageService, instantiationService, contextKeyService) {
    super(ModelsManagementEditor_1.ID, group, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.editorDisposables = this._register(new DisposableStore());
    this.inModelsEditorContextKey = CONTEXT_MODELS_EDITOR.bindTo(contextKeyService);
  }
  createEditor(parent) {
    this.editorDisposables.clear();
    this.bodyContainer = DOM.append(parent, $(".ai-models-management-editor"));
    this.modelsWidget = this.editorDisposables.add(this.instantiationService.createInstance(ChatModelsWidget));
    this.bodyContainer.appendChild(this.modelsWidget.element);
  }
  async setInput(input, options, context, token) {
    this.inModelsEditorContextKey.set(true);
    await super.setInput(input, options, context, token);
    if (this.dimension) {
      this.layout(this.dimension);
    }
    this.modelsWidget?.render();
  }
  layout(dimension) {
    this.dimension = dimension;
    if (this.bodyContainer) {
      this.modelsWidget?.layout(dimension.height - 15, this.bodyContainer.clientWidth - 24);
    }
  }
  focus() {
    super.focus();
    this.modelsWidget?.focusSearch();
  }
  clearInput() {
    this.inModelsEditorContextKey.set(false);
    super.clearInput();
  }
  clearSearch() {
    this.modelsWidget?.clearSearch();
  }
  search(query) {
    this.modelsWidget?.search(query);
  }
};
ModelsManagementEditor = ModelsManagementEditor_1 = __decorate([
  __param(1, ITelemetryService),
  __param(2, IThemeService),
  __param(3, IStorageService),
  __param(4, IInstantiationService),
  __param(5, IContextKeyService)
], ModelsManagementEditor);
const chatManagementSashBorder = registerColor("chatManagement.sashBorder", PANEL_BORDER, localize("chatManagementSashBorder", "The color of the Chat Management editor splitview sash border."));
function isNewUser(chatEntitlementService) {
  return !chatEntitlementService.sentiment.installed || chatEntitlementService.entitlement === ChatEntitlement.Available;
}
__name(isNewUser, "isNewUser");
let ChatManagementEditor = class ChatManagementEditor2 extends EditorPane {
  static {
    __name(this, "ChatManagementEditor");
  }
  static {
    ChatManagementEditor_1 = this;
  }
  static {
    this.ID = "workbench.editor.chatManagement";
  }
  constructor(group, telemetryService, themeService, storageService, instantiationService, commandService, chatEntitlementService) {
    super(ChatManagementEditor_1.ID, group, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.selectedSection = CHAT_MANAGEMENT_SECTION_USAGE;
    this.sections = [];
    this.commandService = commandService;
    this.chatEntitlementService = chatEntitlementService;
  }
  createEditor(parent) {
    this.container = DOM.append(parent, $(".ai-management-editor"));
    this.renderHeader(this.container);
    const splitViewContainer = DOM.append(this.container, $(".split-view-container"));
    const sidebarView = DOM.append(splitViewContainer, $(".sidebar-view"));
    const sidebarContainer = DOM.append(sidebarView, $(".sidebar-container"));
    const contentsView = DOM.append(splitViewContainer, $(".contents-view"));
    this.contentsContainer = DOM.append(contentsView, $(".contents-container"));
    this.splitView = new SplitView(splitViewContainer, {
      orientation: 1,
      proportionalLayout: true
    });
    this.renderSidebar(sidebarContainer);
    this.renderContents(this.contentsContainer);
    this.splitView.addView({
      onDidChange: Event.None,
      element: sidebarView,
      minimumSize: 150,
      maximumSize: 350,
      layout: /* @__PURE__ */ __name((width, _, height) => {
        sidebarContainer.style.width = `${width}px`;
        if (this.sectionsList && height !== void 0) {
          this.sectionsList.layout(height, width);
        }
      }, "layout")
    }, 200, void 0, true);
    this.splitView.addView({
      onDidChange: Event.None,
      element: contentsView,
      minimumSize: 550,
      maximumSize: Number.POSITIVE_INFINITY,
      layout: /* @__PURE__ */ __name((width, _, height) => {
        contentsView.style.width = `${width}px`;
        if (height !== void 0) {
          this.layoutContents(width, height);
        }
      }, "layout")
    }, Sizing.Distribute, void 0, true);
    this.updateStyles();
    this.updateHeaderData();
    this._register(this.chatEntitlementService.onDidChangeQuotaRemaining(() => this.updateHeaderData()));
    this._register(this.chatEntitlementService.onDidChangeEntitlement(() => this.updateHeaderData()));
  }
  updateStyles() {
    const borderColor = this.theme.getColor(chatManagementSashBorder);
    this.splitView?.style({ separatorBorder: borderColor });
  }
  renderSidebar(parent) {
    this.sections = [
      { id: CHAT_MANAGEMENT_SECTION_USAGE, label: localize("plan.usage", "Usage") },
      { id: CHAT_MANAGEMENT_SECTION_MODELS, label: localize("plan.models", "Models") }
    ];
    const delegate = new SectionItemDelegate();
    const renderer = new SectionItemRenderer();
    this.sectionsList = this._register(this.instantiationService.createInstance(WorkbenchList, "ChatManagementSections", parent, delegate, [renderer], {
      multipleSelectionSupport: false,
      setRowLineHeight: false,
      horizontalScrolling: false,
      accessibilityProvider: {
        getAriaLabel(element) {
          return element.label;
        },
        getWidgetAriaLabel() {
          return localize("sectionsListAriaLabel", "Sections");
        }
      },
      openOnSingleClick: true,
      identityProvider: {
        getId(element) {
          return element.id;
        }
      }
    }));
    this.sectionsList.splice(0, this.sectionsList.length, this.sections);
    this.sectionsList.setSelection([0]);
    this._register(this.sectionsList.onDidChangeSelection((e) => {
      if (e.elements.length > 0) {
        this.selectedSection = e.elements[0].id;
        this.renderSelectedSection();
      }
    }));
  }
  renderHeader(parent) {
    this.headerContainer = DOM.append(parent, $(".ai-management-header"));
    const headerTitleContainer = DOM.append(this.headerContainer, $(".header-title-container"));
    const headerTitleWrapper = DOM.append(headerTitleContainer, $(".header-title-wrapper"));
    const tile = DOM.append(headerTitleWrapper, $(".ai-management-editor-title"));
    tile.textContent = localize("plan.copilot", "Copilot");
    this.planBadge = DOM.append(headerTitleWrapper, $(".plan-badge"));
    const titleButtonContainer = DOM.append(headerTitleContainer, $(".header-upgrade-button-container"));
    this.actionButton = this._register(new Button(titleButtonContainer, { ...defaultButtonStyles }));
    this.actionButton.element.classList.add("header-upgrade-button");
    this.actionButton.element.style.display = "none";
  }
  renderContents(parent) {
    const bodyContainer = DOM.append(parent, $(".ai-management-body"));
    this.chatUsageWidget = this._register(this.instantiationService.createInstance(ChatUsageWidget));
    this.modelsWidget = this._register(this.instantiationService.createInstance(ChatModelsWidget));
    bodyContainer.appendChild(this.chatUsageWidget.element);
    bodyContainer.appendChild(this.modelsWidget.element);
    this.renderSelectedSection();
  }
  renderSelectedSection() {
    this.chatUsageWidget.element.style.display = "none";
    this.modelsWidget.element.style.display = "none";
    if (this.selectedSection === CHAT_MANAGEMENT_SECTION_USAGE) {
      this.chatUsageWidget.element.style.display = "";
    } else if (this.selectedSection === CHAT_MANAGEMENT_SECTION_MODELS) {
      this.modelsWidget.element.style.display = "";
    }
    if (this.dimension) {
      this.layout(this.dimension);
    }
  }
  layoutContents(width, height) {
    if (!this.contentsContainer) {
      return;
    }
    if (this.selectedSection === CHAT_MANAGEMENT_SECTION_MODELS) {
      this.modelsWidget.layout(height - 30, width - 30);
    }
  }
  selectSection(sectionId) {
    const index = this.sections.findIndex((s) => s.id === sectionId);
    if (index >= 0) {
      this.sectionsList?.setFocus([index]);
      this.sectionsList?.setSelection([index]);
    }
  }
  updateHeaderData() {
    const newUser = isNewUser(this.chatEntitlementService);
    const anonymousUser = this.chatEntitlementService.anonymous;
    const disabled = this.chatEntitlementService.sentiment.disabled || this.chatEntitlementService.sentiment.untrusted;
    const signedOut = this.chatEntitlementService.entitlement === ChatEntitlement.Unknown;
    const isFreePlan = this.chatEntitlementService.entitlement === ChatEntitlement.Free;
    if (anonymousUser || isFreePlan) {
      if (anonymousUser) {
        this.planBadge.style.display = "none";
      } else {
        this.planBadge.style.display = "";
        this.planBadge.textContent = localize("plan.free", "Free");
      }
    } else {
      this.planBadge.style.display = "";
      const planName = this.getCurrentPlanName();
      this.planBadge.textContent = planName.replace("Copilot ", "");
    }
    const shouldUpgrade = this.shouldShowUpgradeButton();
    if (newUser || signedOut || disabled || shouldUpgrade) {
      this.actionButton.element.style.display = "";
      let buttonLabel;
      let commandId;
      if (shouldUpgrade && !isFreePlan && !anonymousUser) {
        if (this.chatEntitlementService.entitlement === ChatEntitlement.Pro) {
          buttonLabel = localize("plan.upgradeToProPlus", "Upgrade to Copilot Pro+");
        } else {
          buttonLabel = localize("plan.upgradeToPro", "Upgrade to Copilot Pro");
        }
        commandId = "workbench.action.chat.upgradePlan";
      } else if (shouldUpgrade && (isFreePlan || anonymousUser)) {
        buttonLabel = localize("upgradeToCopilotPro", "Upgrade to Copilot Pro");
        commandId = "workbench.action.chat.upgradePlan";
      } else if (newUser) {
        buttonLabel = localize("enableAIFeatures", "Use AI Features");
        commandId = newUser && anonymousUser ? "workbench.action.chat.triggerSetupAnonymousWithoutDialog" : "workbench.action.chat.triggerSetup";
      } else if (anonymousUser) {
        buttonLabel = localize("enableMoreAIFeatures", "Enable more AI Features");
        commandId = "workbench.action.chat.triggerSetup";
      } else if (disabled) {
        buttonLabel = localize("enableCopilotButton", "Enable AI Features");
        commandId = "workbench.action.chat.triggerSetup";
      } else {
        buttonLabel = localize("signInToUseAIFeatures", "Sign in to use AI Features");
        commandId = "workbench.action.chat.triggerSetup";
      }
      this.actionButton.label = buttonLabel;
      this.actionButton.onDidClick(() => {
        this.commandService.executeCommand(commandId);
      });
    } else {
      this.actionButton.element.style.display = "none";
    }
  }
  getCurrentPlanName() {
    return getChatPlanName(this.chatEntitlementService.entitlement);
  }
  shouldShowUpgradeButton() {
    const entitlement = this.chatEntitlementService.entitlement;
    return entitlement === ChatEntitlement.Available || entitlement === ChatEntitlement.Free || entitlement === ChatEntitlement.Pro;
  }
  async setInput(input, options, context, token) {
    await super.setInput(input, options, context, token);
    if (this.dimension) {
      this.layout(this.dimension);
    }
  }
  layout(dimension) {
    this.dimension = dimension;
    if (this.container && this.splitView) {
      const headerHeight = this.headerContainer?.offsetHeight || 0;
      const splitViewHeight = dimension.height - headerHeight;
      this.splitView.layout(this.container.clientWidth, splitViewHeight);
      this.splitView.el.style.height = `${splitViewHeight}px`;
    }
  }
  focus() {
    super.focus();
    this.sectionsList?.domFocus();
  }
};
ChatManagementEditor = ChatManagementEditor_1 = __decorate([
  __param(1, ITelemetryService),
  __param(2, IThemeService),
  __param(3, IStorageService),
  __param(4, IInstantiationService),
  __param(5, ICommandService),
  __param(6, IChatEntitlementService)
], ChatManagementEditor);
class SectionItemDelegate {
  static {
    __name(this, "SectionItemDelegate");
  }
  getHeight(element) {
    return 22;
  }
  getTemplateId() {
    return "sectionItem";
  }
}
class SectionItemRenderer {
  static {
    __name(this, "SectionItemRenderer");
  }
  constructor() {
    this.templateId = "sectionItem";
  }
  renderTemplate(container) {
    container.classList.add("section-list-item");
    const label = DOM.append(container, $(".section-list-item-label"));
    return { label };
  }
  renderElement(element, index, templateData) {
    templateData.label.textContent = element.label;
  }
  disposeTemplate(templateData) {
  }
}
export {
  ChatManagementEditor,
  ModelsManagementEditor,
  chatManagementSashBorder
};
//# sourceMappingURL=chatManagementEditor.js.map
