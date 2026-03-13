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
var AICustomizationManagementEditor_1;
import "./media/aiCustomizationManagement.css";
import * as DOM from "../../../../../base/browser/dom.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { DisposableStore, toDisposable } from "../../../../../base/common/lifecycle.js";
import { Event } from "../../../../../base/common/event.js";
import { autorun } from "../../../../../base/common/observable.js";
import { Sizing, SplitView } from "../../../../../base/browser/ui/splitview/splitview.js";
import { localize } from "../../../../../nls.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { EditorPane } from "../../../../browser/parts/editor/editorPane.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { WorkbenchList } from "../../../../../platform/list/browser/listService.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { basename, isEqual } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { registerColor } from "../../../../../platform/theme/common/colorRegistry.js";
import { PANEL_BORDER } from "../../../../common/theme.js";
import { AICustomizationListWidget } from "./aiCustomizationListWidget.js";
import { McpListWidget } from "./mcpListWidget.js";
import { PluginListWidget } from "./pluginListWidget.js";
import { AI_CUSTOMIZATION_MANAGEMENT_EDITOR_ID, AI_CUSTOMIZATION_MANAGEMENT_SIDEBAR_WIDTH_KEY, AI_CUSTOMIZATION_MANAGEMENT_SELECTED_SECTION_KEY, AICustomizationManagementSection, BUILTIN_STORAGE, CONTEXT_AI_CUSTOMIZATION_MANAGEMENT_EDITOR, CONTEXT_AI_CUSTOMIZATION_MANAGEMENT_SECTION, SIDEBAR_DEFAULT_WIDTH, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH, CONTENT_MIN_WIDTH } from "./aiCustomizationManagement.js";
import { agentIcon, instructionsIcon, promptIcon, skillIcon, hookIcon, pluginIcon } from "./aiCustomizationIcons.js";
import { ChatModelsWidget } from "../chatManagement/chatModelsWidget.js";
import { PromptsType, Target } from "../../common/promptSyntax/promptTypes.js";
import { IPromptsService, PromptsStorage } from "../../common/promptSyntax/service/promptsService.js";
import { NEW_PROMPT_COMMAND_ID, NEW_INSTRUCTIONS_COMMAND_ID, NEW_AGENT_COMMAND_ID, NEW_SKILL_COMMAND_ID } from "../promptSyntax/newPromptFileActions.js";
import { showConfigureHooksQuickPick } from "../promptSyntax/hookActions.js";
import { resolveWorkspaceTargetDirectory, resolveUserTargetDirectory } from "./customizationCreatorService.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IAICustomizationWorkspaceService } from "../../common/aiCustomizationWorkspaceService.js";
import { CodeEditorWidget } from "../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { createTextBufferFactoryFromSnapshot } from "../../../../../editor/common/model/textModel.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { getSimpleEditorOptions } from "../../../codeEditor/browser/simpleEditorOptions.js";
import { IWorkingCopyService } from "../../../../services/workingCopy/common/workingCopyService.js";
import { IFileDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { McpServerEditorInput } from "../../../mcp/browser/mcpServerEditorInput.js";
import { McpServerEditor } from "../../../mcp/browser/mcpServerEditor.js";
import { getDefaultHoverDelegate } from "../../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { AgentPluginEditor } from "../agentPluginEditor/agentPluginEditor.js";
import { AgentPluginEditorInput } from "../agentPluginEditor/agentPluginEditorInput.js";
const $ = DOM.$;
const aiCustomizationManagementSashBorder = registerColor("aiCustomizationManagement.sashBorder", PANEL_BORDER, localize("aiCustomizationManagementSashBorder", "The color of the Chat Customization Management editor splitview sash border."));
class SectionItemDelegate {
  static {
    __name(this, "SectionItemDelegate");
  }
  getHeight() {
    return 26;
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
    const icon = DOM.append(container, $(".section-icon"));
    const label = DOM.append(container, $(".section-label"));
    return { container, icon, label };
  }
  renderElement(element, index, templateData) {
    templateData.icon.className = "section-icon";
    templateData.icon.classList.add(...ThemeIcon.asClassNameArray(element.icon));
    templateData.label.textContent = element.label;
  }
  disposeTemplate() {
  }
}
let AICustomizationManagementEditor = class AICustomizationManagementEditor2 extends EditorPane {
  static {
    __name(this, "AICustomizationManagementEditor");
  }
  static {
    AICustomizationManagementEditor_1 = this;
  }
  static {
    this.ID = AI_CUSTOMIZATION_MANAGEMENT_EDITOR_ID;
  }
  constructor(group, telemetryService, themeService, storageService, instantiationService, contextKeyService, openerService, commandService, workspaceService, promptsService, textModelService, configurationService, workingCopyService, fileDialogService, hoverService, modelService, quickInputService, fileService, notificationService) {
    super(AICustomizationManagementEditor_1.ID, group, telemetryService, themeService, storageService);
    this.storageService = storageService;
    this.instantiationService = instantiationService;
    this.openerService = openerService;
    this.commandService = commandService;
    this.workspaceService = workspaceService;
    this.promptsService = promptsService;
    this.textModelService = textModelService;
    this.configurationService = configurationService;
    this.workingCopyService = workingCopyService;
    this.fileDialogService = fileDialogService;
    this.hoverService = hoverService;
    this.modelService = modelService;
    this.quickInputService = quickInputService;
    this.fileService = fileService;
    this.notificationService = notificationService;
    this.editorActionButtonInProgress = false;
    this.editorModelChangeDisposables = this._register(new DisposableStore());
    this.builtinEditingSessions = /* @__PURE__ */ new Map();
    this.viewMode = "list";
    this.mcpDetailDisposables = this._register(new DisposableStore());
    this.pluginDetailDisposables = this._register(new DisposableStore());
    this.sections = [];
    this.selectedSection = AICustomizationManagementSection.Agents;
    this.editorDisposables = this._register(new DisposableStore());
    this._editorContentChanged = false;
    this.inEditorContextKey = CONTEXT_AI_CUSTOMIZATION_MANAGEMENT_EDITOR.bindTo(contextKeyService);
    this.sectionContextKey = CONTEXT_AI_CUSTOMIZATION_MANAGEMENT_SECTION.bindTo(contextKeyService);
    this._register(autorun((reader) => {
      this.workspaceService.activeProjectRoot.read(reader);
      if (this.viewMode === "editor") {
        this.currentEditingProjectRoot = this.workspaceService.getActiveProjectRoot();
      }
    }));
    this._register(toDisposable(() => {
      this.currentModelRef?.dispose();
      this.currentModelRef = void 0;
    }));
    this._register(toDisposable(() => this.disposeBuiltinEditingSessions()));
    const sectionInfo = {
      [AICustomizationManagementSection.Agents]: { label: localize("agents", "Agents"), icon: agentIcon },
      [AICustomizationManagementSection.Skills]: { label: localize("skills", "Skills"), icon: skillIcon },
      [AICustomizationManagementSection.Instructions]: { label: localize("instructions", "Instructions"), icon: instructionsIcon },
      [AICustomizationManagementSection.Prompts]: { label: localize("prompts", "Prompts"), icon: promptIcon },
      [AICustomizationManagementSection.Hooks]: { label: localize("hooks", "Hooks"), icon: hookIcon },
      [AICustomizationManagementSection.McpServers]: { label: localize("mcpServers", "MCP Servers"), icon: Codicon.server },
      [AICustomizationManagementSection.Plugins]: { label: localize("plugins", "Plugins"), icon: pluginIcon },
      [AICustomizationManagementSection.Models]: { label: localize("models", "Models"), icon: Codicon.vm }
    };
    for (const id of this.workspaceService.managementSections) {
      const info = sectionInfo[id];
      if (info) {
        this.sections.push({ id, ...info });
      }
    }
    const savedSection = this.storageService.get(
      AI_CUSTOMIZATION_MANAGEMENT_SELECTED_SECTION_KEY,
      0
      /* StorageScope.PROFILE */
    );
    if (savedSection && this.sections.some((s) => s.id === savedSection)) {
      this.selectedSection = savedSection;
    } else if (this.sections.length > 0) {
      this.selectedSection = this.sections[0].id;
    }
  }
  createEditor(parent) {
    this.editorDisposables.clear();
    this.container = DOM.append(parent, $(".ai-customization-management-editor"));
    this.createSplitView();
    this.updateStyles();
  }
  createSplitView() {
    this.splitViewContainer = DOM.append(this.container, $(".management-split-view"));
    this.sidebarContainer = $(".management-sidebar");
    this.contentContainer = $(".management-content");
    this.createSidebar();
    this.createContent();
    this.splitView = this.editorDisposables.add(new SplitView(this.splitViewContainer, {
      orientation: 1,
      proportionalLayout: true
    }));
    const savedWidth = this.storageService.getNumber(AI_CUSTOMIZATION_MANAGEMENT_SIDEBAR_WIDTH_KEY, 0, SIDEBAR_DEFAULT_WIDTH);
    this.splitView.addView({
      onDidChange: Event.None,
      element: this.sidebarContainer,
      minimumSize: SIDEBAR_MIN_WIDTH,
      maximumSize: SIDEBAR_MAX_WIDTH,
      layout: /* @__PURE__ */ __name((width, _, height) => {
        this.sidebarContainer.style.width = `${width}px`;
        if (height !== void 0) {
          const footerHeight = this.folderPickerContainer?.offsetHeight ?? 0;
          const listHeight = height - 8 - footerHeight;
          this.sectionsList.layout(listHeight, width);
        }
      }, "layout")
    }, savedWidth, void 0, true);
    this.splitView.addView({
      onDidChange: Event.None,
      element: this.contentContainer,
      minimumSize: CONTENT_MIN_WIDTH,
      maximumSize: Number.POSITIVE_INFINITY,
      layout: /* @__PURE__ */ __name((width, _, height) => {
        this.contentContainer.style.width = `${width}px`;
        if (height !== void 0) {
          this.listWidget.layout(height - 16, width - 24);
          this.mcpListWidget?.layout(height - 16, width - 24);
          this.pluginListWidget?.layout(height - 16, width - 24);
          const modelsFooterHeight = this.modelsFooterElement?.offsetHeight || 80;
          this.modelsWidget?.layout(height - 16 - modelsFooterHeight, width);
          if (this.viewMode === "editor" && this.embeddedEditor) {
            const editorHeaderHeight = 50;
            const padding = 24;
            this.embeddedEditor.layout({ width: Math.max(0, width - padding), height: Math.max(0, height - editorHeaderHeight - padding) });
          }
          if (this.viewMode === "mcpDetail" && this.embeddedMcpEditor) {
            const backHeaderHeight = 40;
            this.embeddedMcpEditor.layout(new DOM.Dimension(width, Math.max(0, height - backHeaderHeight)));
          }
          if (this.viewMode === "pluginDetail" && this.embeddedPluginEditor) {
            const backHeaderHeight = 40;
            this.embeddedPluginEditor.layout(new DOM.Dimension(width, Math.max(0, height - backHeaderHeight)));
          }
        }
      }, "layout")
    }, Sizing.Distribute, void 0, true);
    this.editorDisposables.add(this.splitView.onDidSashChange(() => {
      const width = this.splitView.getViewSize(0);
      this.storageService.store(
        AI_CUSTOMIZATION_MANAGEMENT_SIDEBAR_WIDTH_KEY,
        width,
        0,
        0
        /* StorageTarget.USER */
      );
    }));
    this.editorDisposables.add(this.splitView.onDidSashReset(() => {
      const totalWidth = this.splitView.getViewSize(0) + this.splitView.getViewSize(1);
      this.splitView.resizeView(0, SIDEBAR_DEFAULT_WIDTH);
      this.splitView.resizeView(1, totalWidth - SIDEBAR_DEFAULT_WIDTH);
    }));
  }
  createSidebar() {
    const sidebarContent = DOM.append(this.sidebarContainer, $(".sidebar-content"));
    const sectionsListContainer = DOM.append(sidebarContent, $(".sidebar-sections-list"));
    this.sectionsList = this.editorDisposables.add(this.instantiationService.createInstance(WorkbenchList, "AICustomizationManagementSections", sectionsListContainer, new SectionItemDelegate(), [new SectionItemRenderer()], {
      multipleSelectionSupport: false,
      setRowLineHeight: false,
      horizontalScrolling: false,
      accessibilityProvider: {
        getAriaLabel: /* @__PURE__ */ __name((item) => item.label, "getAriaLabel"),
        getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize("sectionsAriaLabel", "Chat Customization Sections"), "getWidgetAriaLabel")
      },
      openOnSingleClick: true,
      identityProvider: {
        getId: /* @__PURE__ */ __name((item) => item.id, "getId")
      }
    }));
    this.sectionsList.splice(0, this.sectionsList.length, this.sections);
    this.ensureSectionsListReflectsActiveSection();
    this.editorDisposables.add(this.sectionsList.onDidChangeSelection((e) => {
      if (e.elements.length === 0) {
        this.ensureSectionsListReflectsActiveSection();
        return;
      }
      this.selectSection(e.elements[0].id);
    }));
    if (this.workspaceService.isSessionsWindow) {
      this.createFolderPicker(sidebarContent);
    }
  }
  createFolderPicker(sidebarContent) {
    const footer = this.folderPickerContainer = DOM.append(sidebarContent, $(".sidebar-folder-picker"));
    const button = DOM.append(footer, $("button.folder-picker-button"));
    button.setAttribute("aria-label", localize("browseFolder", "Browse folder"));
    const folderIcon = DOM.append(button, $(`.codicon.codicon-${Codicon.folder.id}`));
    folderIcon.classList.add("folder-picker-icon");
    this.folderPickerLabel = DOM.append(button, $("span.folder-picker-label"));
    this.folderPickerClearButton = DOM.append(footer, $("button.folder-picker-clear"));
    this.folderPickerClearButton.setAttribute("aria-label", localize("clearFolderOverride", "Reset to session folder"));
    DOM.append(this.folderPickerClearButton, $(`.codicon.codicon-${Codicon.close.id}`));
    this.editorDisposables.add(DOM.addDisposableListener(button, "click", () => {
      this.browseForFolder();
    }));
    this.editorDisposables.add(DOM.addDisposableListener(this.folderPickerClearButton, "click", () => {
      this.workspaceService.clearOverrideProjectRoot();
    }));
    this.editorDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), button, () => {
      const root = this.workspaceService.getActiveProjectRoot();
      return root?.fsPath ?? "";
    }));
    this.editorDisposables.add(autorun((reader) => {
      const root = this.workspaceService.activeProjectRoot.read(reader);
      const hasOverride = this.workspaceService.hasOverrideProjectRoot.read(reader);
      this.updateFolderPickerLabel(root, hasOverride);
    }));
  }
  updateFolderPickerLabel(root, hasOverride) {
    if (this.folderPickerLabel) {
      this.folderPickerLabel.textContent = root ? basename(root) : localize("noFolder", "No folder");
    }
    if (this.folderPickerClearButton) {
      this.folderPickerClearButton.style.display = hasOverride ? "" : "none";
    }
  }
  async browseForFolder() {
    const result = await this.fileDialogService.showOpenDialog({
      canSelectFolders: true,
      canSelectFiles: false,
      canSelectMany: false,
      title: localize("selectFolder", "Select Folder to Explore"),
      defaultUri: this.workspaceService.getActiveProjectRoot()
    });
    if (result?.[0]) {
      this.workspaceService.setOverrideProjectRoot(result[0]);
    }
  }
  createContent() {
    const contentInner = DOM.append(this.contentContainer, $(".content-inner"));
    this.promptsContentContainer = DOM.append(contentInner, $(".prompts-content-container"));
    this.listWidget = this.editorDisposables.add(this.instantiationService.createInstance(AICustomizationListWidget));
    this.promptsContentContainer.appendChild(this.listWidget.element);
    this.editorDisposables.add(this.listWidget.onDidSelectItem((item) => {
      this.telemetryService.publicLog2("chatCustomizationEditor.itemSelected", {
        section: this.selectedSection,
        promptType: item.promptType,
        storage: item.storage
      });
      const isWorkspaceFile = item.storage === PromptsStorage.local;
      const isReadOnly = item.storage === PromptsStorage.extension || item.storage === PromptsStorage.plugin || item.storage === BUILTIN_STORAGE;
      this.showEmbeddedEditor(item.uri, item.name, item.promptType, item.storage, isWorkspaceFile, isReadOnly);
    }));
    this.editorDisposables.add(this.listWidget.onDidRequestCreate((promptType) => {
      this.createNewItemWithAI(promptType);
    }));
    this.editorDisposables.add(this.listWidget.onDidRequestCreateManual(({ type, target }) => {
      this.createNewItemManual(type, target);
    }));
    const hasSections = new Set(this.workspaceService.managementSections);
    if (hasSections.has(AICustomizationManagementSection.Models)) {
      this.modelsContentContainer = DOM.append(contentInner, $(".models-content-container"));
      this.modelsWidget = this.editorDisposables.add(this.instantiationService.createInstance(ChatModelsWidget));
      this.modelsContentContainer.appendChild(this.modelsWidget.element);
      this.modelsFooterElement = DOM.append(this.modelsContentContainer, $(".section-footer"));
      const modelsDescription = DOM.append(this.modelsFooterElement, $("p.section-footer-description"));
      modelsDescription.textContent = localize("modelsDescription", "Browse and manage language models from different providers. Select models for use in chat, code completion, and other AI features.");
      const modelsLink = DOM.append(this.modelsFooterElement, $("a.section-footer-link"));
      modelsLink.textContent = localize("learnMoreModels", "Learn more about language models");
      modelsLink.href = "https://code.visualstudio.com/docs/copilot/customization/language-models";
      this.editorDisposables.add(DOM.addDisposableListener(modelsLink, "click", (e) => {
        e.preventDefault();
        this.openerService.open(URI.parse(modelsLink.href));
      }));
    }
    if (hasSections.has(AICustomizationManagementSection.McpServers)) {
      this.mcpContentContainer = DOM.append(contentInner, $(".mcp-content-container"));
      this.mcpListWidget = this.editorDisposables.add(this.instantiationService.createInstance(McpListWidget));
      this.mcpContentContainer.appendChild(this.mcpListWidget.element);
      this.mcpDetailContainer = DOM.append(contentInner, $(".mcp-detail-container"));
      this.createEmbeddedMcpDetail();
      this.editorDisposables.add(this.mcpListWidget.onDidSelectServer((server) => {
        this.showEmbeddedMcpDetail(server);
      }));
    }
    if (hasSections.has(AICustomizationManagementSection.Plugins)) {
      this.pluginContentContainer = DOM.append(contentInner, $(".plugin-content-container"));
      this.pluginListWidget = this.editorDisposables.add(this.instantiationService.createInstance(PluginListWidget));
      this.pluginContentContainer.appendChild(this.pluginListWidget.element);
      this.pluginDetailContainer = DOM.append(contentInner, $(".plugin-detail-container"));
      this.createEmbeddedPluginDetail();
      this.editorDisposables.add(this.pluginListWidget.onDidSelectPlugin((item) => {
        this.showEmbeddedPluginDetail(item);
      }));
    }
    this.editorContentContainer = DOM.append(contentInner, $(".editor-content-container"));
    this.createEmbeddedEditor();
    this.updateContentVisibility();
    if (this.isPromptsSection(this.selectedSection)) {
      void this.listWidget.setSection(this.selectedSection);
    }
  }
  isPromptsSection(section) {
    return section === AICustomizationManagementSection.Agents || section === AICustomizationManagementSection.Skills || section === AICustomizationManagementSection.Instructions || section === AICustomizationManagementSection.Prompts || section === AICustomizationManagementSection.Hooks;
  }
  selectSection(section) {
    if (this.selectedSection === section) {
      this.ensureSectionsListReflectsActiveSection(section);
      return;
    }
    this.telemetryService.publicLog2("chatCustomizationEditor.sectionChanged", {
      section
    });
    if (this.viewMode === "editor") {
      this.goBackToList();
    }
    if (this.viewMode === "mcpDetail") {
      this.goBackFromMcpDetail();
    }
    if (this.viewMode === "pluginDetail") {
      this.goBackFromPluginDetail();
    }
    this.selectedSection = section;
    this.sectionContextKey.set(section);
    this.storageService.store(
      AI_CUSTOMIZATION_MANAGEMENT_SELECTED_SECTION_KEY,
      section,
      0,
      0
      /* StorageTarget.USER */
    );
    this.updateContentVisibility();
    if (this.isPromptsSection(section)) {
      void this.listWidget.setSection(section);
    }
    this.ensureSectionsListReflectsActiveSection(section);
  }
  ensureSectionsListReflectsActiveSection(section = this.selectedSection) {
    if (!this.sectionsList) {
      return;
    }
    const index = this.sections.findIndex((s) => s.id === section);
    if (index < 0) {
      return;
    }
    const selection = this.sectionsList.getSelection();
    if (selection.length !== 1 || selection[0] !== index) {
      this.sectionsList.setSelection([index]);
    }
    const focus = this.sectionsList.getFocus();
    if (focus.length !== 1 || focus[0] !== index) {
      this.sectionsList.setFocus([index]);
    }
  }
  updateContentVisibility() {
    const isEditorMode = this.viewMode === "editor";
    const isMcpDetailMode = this.viewMode === "mcpDetail";
    const isPluginDetailMode = this.viewMode === "pluginDetail";
    const isDetailMode = isMcpDetailMode || isPluginDetailMode;
    const isPromptsSection = this.isPromptsSection(this.selectedSection);
    const isModelsSection = this.selectedSection === AICustomizationManagementSection.Models;
    const isMcpSection = this.selectedSection === AICustomizationManagementSection.McpServers;
    const isPluginsSection = this.selectedSection === AICustomizationManagementSection.Plugins;
    this.promptsContentContainer.style.display = !isEditorMode && !isDetailMode && isPromptsSection ? "" : "none";
    if (this.modelsContentContainer) {
      this.modelsContentContainer.style.display = !isEditorMode && !isDetailMode && isModelsSection ? "" : "none";
    }
    if (this.mcpContentContainer) {
      this.mcpContentContainer.style.display = !isEditorMode && !isDetailMode && isMcpSection ? "" : "none";
    }
    if (this.mcpDetailContainer) {
      this.mcpDetailContainer.style.display = isMcpDetailMode ? "" : "none";
    }
    if (this.pluginContentContainer) {
      this.pluginContentContainer.style.display = !isEditorMode && !isDetailMode && isPluginsSection ? "" : "none";
    }
    if (this.pluginDetailContainer) {
      this.pluginDetailContainer.style.display = isPluginDetailMode ? "" : "none";
    }
    if (this.editorContentContainer) {
      this.editorContentContainer.style.display = isEditorMode ? "" : "none";
    }
    if (isModelsSection && this.modelsWidget) {
      this.modelsWidget.render();
      if (this.dimension) {
        this.layout(this.dimension);
      }
    }
  }
  /**
   * Creates a new customization using the AI-guided flow.
   */
  async createNewItemWithAI(type) {
    this.telemetryService.publicLog2("chatCustomizationEditor.createItem", {
      section: this.selectedSection,
      promptType: type,
      creationMode: "ai",
      target: "workspace"
    });
    if (this.input) {
      this.group.closeEditor(this.input);
    }
    await this.workspaceService.generateCustomization(type);
  }
  /**
   * Creates a new prompt file and opens it in the embedded editor.
   */
  async createNewItemManual(type, target) {
    this.telemetryService.publicLog2("chatCustomizationEditor.createItem", {
      section: this.selectedSection,
      promptType: type,
      creationMode: "manual",
      target
    });
    if (type === PromptsType.hook) {
      if (this.workspaceService.isSessionsWindow) {
        await this.instantiationService.invokeFunction(showConfigureHooksQuickPick, {
          openEditor: /* @__PURE__ */ __name(async (resource) => {
            await this.showEmbeddedEditor(resource, basename(resource), PromptsType.hook, PromptsStorage.local, true);
            return;
          }, "openEditor"),
          target: Target.GitHubCopilot
        });
      } else {
        await this.instantiationService.invokeFunction(showConfigureHooksQuickPick, {
          openEditor: /* @__PURE__ */ __name(async (resource) => {
            await this.showEmbeddedEditor(resource, basename(resource), PromptsType.hook, PromptsStorage.local, true);
            return;
          }, "openEditor")
        });
      }
      return;
    }
    const targetDir = target === "workspace" ? resolveWorkspaceTargetDirectory(this.workspaceService, type) : await resolveUserTargetDirectory(this.promptsService, type);
    const options = {
      targetFolder: targetDir,
      targetStorage: target === "user" ? PromptsStorage.user : PromptsStorage.local,
      openFile: /* @__PURE__ */ __name(async (uri) => {
        const isWorkspace = target === "workspace";
        await this.showEmbeddedEditor(uri, basename(uri), type, target === "user" ? PromptsStorage.user : PromptsStorage.local, isWorkspace);
        return this.embeddedEditor;
      }, "openFile")
    };
    let commandId;
    switch (type) {
      case PromptsType.prompt:
        commandId = NEW_PROMPT_COMMAND_ID;
        break;
      case PromptsType.instructions:
        commandId = NEW_INSTRUCTIONS_COMMAND_ID;
        break;
      case PromptsType.agent:
        commandId = NEW_AGENT_COMMAND_ID;
        break;
      case PromptsType.skill:
        commandId = NEW_SKILL_COMMAND_ID;
        break;
      default:
        return;
    }
    await this.commandService.executeCommand(commandId, options);
    void this.listWidget.refresh();
  }
  updateStyles() {
    const borderColor = this.theme.getColor(aiCustomizationManagementSashBorder);
    if (borderColor) {
      this.splitView?.style({ separatorBorder: borderColor });
    }
  }
  async setInput(input, options, context, token) {
    this.workspaceService.clearOverrideProjectRoot();
    this.inEditorContextKey.set(true);
    this.sectionContextKey.set(this.selectedSection);
    this.telemetryService.publicLog2("chatCustomizationEditor.opened", {
      section: this.selectedSection
    });
    await super.setInput(input, options, context, token);
    if (this.dimension) {
      this.layout(this.dimension);
    }
  }
  clearInput() {
    this.inEditorContextKey.set(false);
    if (this.viewMode === "editor") {
      this.goBackToList();
    }
    if (this.viewMode === "mcpDetail") {
      this.goBackFromMcpDetail();
    }
    if (this.viewMode === "pluginDetail") {
      this.goBackFromPluginDetail();
    }
    this.workspaceService.clearOverrideProjectRoot();
    this.disposeBuiltinEditingSessions();
    super.clearInput();
  }
  layout(dimension) {
    this.dimension = dimension;
    if (this.container && this.splitView) {
      this.splitViewContainer.style.height = `${dimension.height}px`;
      this.splitView.layout(dimension.width, dimension.height);
    }
  }
  focus() {
    super.focus();
    if (this.viewMode === "editor") {
      this.embeddedEditor?.focus();
      return;
    }
    if (this.selectedSection === AICustomizationManagementSection.McpServers) {
      this.mcpListWidget?.focusSearch();
    } else if (this.selectedSection === AICustomizationManagementSection.Plugins) {
      this.pluginListWidget?.focusSearch();
    } else if (this.selectedSection === AICustomizationManagementSection.Models) {
      this.modelsWidget?.focusSearch();
    } else {
      this.listWidget?.focusSearch();
    }
  }
  /**
   * Selects a specific section programmatically.
   */
  selectSectionById(sectionId) {
    const index = this.sections.findIndex((s) => s.id === sectionId);
    if (index >= 0) {
      if (this.viewMode === "editor") {
        this.goBackToList();
      }
      if (this.viewMode === "mcpDetail") {
        this.goBackFromMcpDetail();
      }
      if (this.viewMode === "pluginDetail") {
        this.goBackFromPluginDetail();
      }
      this.selectedSection = sectionId;
      this.sectionContextKey.set(sectionId);
      this.storageService.store(
        AI_CUSTOMIZATION_MANAGEMENT_SELECTED_SECTION_KEY,
        sectionId,
        0,
        0
        /* StorageTarget.USER */
      );
      this.updateContentVisibility();
      if (this.isPromptsSection(sectionId)) {
        void this.listWidget.setSection(sectionId);
      }
      this.ensureSectionsListReflectsActiveSection(sectionId);
    }
  }
  /**
   * Refreshes the list widget.
   */
  refreshList() {
    void this.listWidget.refresh();
  }
  /**
   * Generates a debug report for the current section.
   */
  async generateDebugReport() {
    return this.listWidget.generateDebugReport();
  }
  //#region Embedded Editor
  createEmbeddedEditor() {
    if (!this.editorContentContainer) {
      return;
    }
    const editorHeader = DOM.append(this.editorContentContainer, $(".editor-header"));
    this.editorActionButton = DOM.append(editorHeader, $("button.editor-back-button"));
    this.editorActionButton.setAttribute("aria-label", localize("backToList", "Back to list"));
    this.editorActionButtonIcon = DOM.append(this.editorActionButton, $(`.codicon.codicon-${Codicon.arrowLeft.id}.editor-action-button-icon`));
    this.editorActionButtonIcon.setAttribute("aria-hidden", "true");
    this.editorDisposables.add(DOM.addDisposableListener(this.editorActionButton, "click", () => {
      void this.handleEditorActionButton().catch((error) => {
        console.error("Failed to handle editor back action:", error);
        this.notificationService.error(localize("editorActionButtonFailed", "Failed to finish the prompt action."));
      });
    }));
    const itemInfo = DOM.append(editorHeader, $(".editor-item-info"));
    this.editorItemNameElement = DOM.append(itemInfo, $(".editor-item-name"));
    this.editorItemPathElement = DOM.append(itemInfo, $(".editor-item-path"));
    this.editorSaveIndicator = DOM.append(editorHeader, $(".editor-save-indicator"));
    const embeddedEditorContainer = DOM.append(this.editorContentContainer, $(".embedded-editor-container"));
    const overflowWidgetsDomNode = DOM.append(this.editorContentContainer, $(".embedded-editor-overflow-widgets.monaco-editor"));
    this.editorDisposables.add(toDisposable(() => overflowWidgetsDomNode.remove()));
    this.embeddedEditor = this.editorDisposables.add(this.instantiationService.createInstance(CodeEditorWidget, embeddedEditorContainer, {
      ...getSimpleEditorOptions(this.configurationService),
      readOnly: false,
      minimap: { enabled: false },
      lineNumbers: "on",
      wordWrap: "on",
      scrollBeyondLastLine: false,
      automaticLayout: false,
      folding: true,
      renderLineHighlight: "all",
      scrollbar: { vertical: "auto", horizontal: "auto" },
      overflowWidgetsDomNode
    }, { isSimpleWidget: false }));
  }
  async showEmbeddedEditor(uri, displayName, promptType, storage, isWorkspaceFile = false, isReadOnly = false) {
    this.currentModelRef?.dispose();
    this.currentModelRef = void 0;
    this.editorModelChangeDisposables.clear();
    this.currentEditingUri = uri;
    this.currentEditingProjectRoot = isWorkspaceFile ? this.workspaceService.getActiveProjectRoot() : void 0;
    this.currentEditingStorage = storage;
    this.currentEditingPromptType = promptType;
    this.viewMode = "editor";
    this.editorItemNameElement.textContent = displayName;
    this.editorItemPathElement.textContent = basename(uri);
    this._editorContentChanged = false;
    this.resetEditorSaveIndicator();
    this.updateEditorActionButton();
    this.updateContentVisibility();
    try {
      if (storage === BUILTIN_STORAGE && promptType === PromptsType.prompt) {
        const session = await this.getOrCreateBuiltinEditingSession(uri);
        if (!isEqual(this.currentEditingUri, uri)) {
          return;
        }
        this.embeddedEditor.setModel(session.model);
        this.embeddedEditor.updateOptions({ readOnly: false });
        this._editorContentChanged = session.model.getValue() !== session.originalContent;
        this.updateEditorActionButton();
        if (this.dimension) {
          this.layout(this.dimension);
        }
        this.embeddedEditor.focus();
        this.editorModelChangeDisposables.add(session.model.onDidChangeContent(() => {
          this._editorContentChanged = session.model.getValue() !== session.originalContent;
          this.updateEditorActionButton();
        }));
        return;
      }
      const ref = await this.textModelService.createModelReference(uri);
      if (!isEqual(this.currentEditingUri, uri)) {
        ref.dispose();
        return;
      }
      this.currentModelRef = ref;
      this.embeddedEditor.setModel(ref.object.textEditorModel);
      this.embeddedEditor.updateOptions({ readOnly: isReadOnly });
      if (this.dimension) {
        this.layout(this.dimension);
      }
      this.embeddedEditor.focus();
      this._editorContentChanged = this.workingCopyService.isDirty(uri);
      this.editorModelChangeDisposables.add(ref.object.textEditorModel.onDidChangeContent(() => {
        this._editorContentChanged = true;
        this.resetEditorSaveIndicator();
      }));
      this.editorModelChangeDisposables.add(this.workingCopyService.onDidSave((e) => {
        if (isEqual(e.workingCopy.resource, uri)) {
          this._editorContentChanged = this.workingCopyService.isDirty(uri);
          this.editorSaveIndicator.className = "editor-save-indicator visible saved";
          this.editorSaveIndicator.classList.add(...ThemeIcon.asClassNameArray(Codicon.check));
          this.editorSaveIndicator.title = localize("saved", "Saved");
        }
      }));
    } catch (error) {
      console.error("Failed to load model for embedded editor:", error);
      if (isEqual(this.currentEditingUri, uri)) {
        this.goBackToList();
      }
    }
  }
  goBackToList() {
    const fileUri = this.currentEditingUri;
    const backgroundSaveRequest = this.createExistingCustomizationSaveRequest();
    if (backgroundSaveRequest) {
      this.telemetryService.publicLog2("chatCustomizationEditor.saveItem", {
        promptType: this.currentEditingPromptType ?? "",
        storage: String(this.currentEditingStorage ?? ""),
        saveTarget: "existing"
      });
    }
    if (fileUri && this.currentEditingStorage === BUILTIN_STORAGE) {
      this.disposeBuiltinEditingSession(fileUri);
    }
    this.currentModelRef?.dispose();
    this.currentModelRef = void 0;
    this.currentEditingUri = void 0;
    this.currentEditingProjectRoot = void 0;
    this.currentEditingStorage = void 0;
    this.currentEditingPromptType = void 0;
    this._editorContentChanged = false;
    this.editorModelChangeDisposables.clear();
    this.resetEditorSaveIndicator();
    this.updateEditorActionButton();
    this.embeddedEditor?.setModel(null);
    this.viewMode = "list";
    this.updateContentVisibility();
    void this.listWidget?.refresh();
    if (this.dimension) {
      this.layout(this.dimension);
    }
    this.listWidget?.focusSearch();
    if (backgroundSaveRequest) {
      const saveRequest = backgroundSaveRequest;
      void this.saveExistingCustomization(saveRequest).catch((error) => {
        console.error("Failed to save customization changes on exit:", error);
        this.notificationService.warn(localize("saveCustomizationOnExitFailed", "Could not save changes to {0}.", basename(saveRequest.fileUri)));
      });
    }
  }
  //#endregion
  async getOrCreateBuiltinEditingSession(uri) {
    const key = uri.toString();
    const existing = this.builtinEditingSessions.get(key);
    if (existing && !existing.model.isDisposed()) {
      return existing;
    }
    const ref = await this.textModelService.createModelReference(uri);
    try {
      const session = {
        model: this.modelService.createModel(createTextBufferFactoryFromSnapshot(ref.object.textEditorModel.createSnapshot()), { languageId: ref.object.textEditorModel.getLanguageId(), onDidChange: Event.None }, URI.from({ scheme: "ai-customization-builtin", path: uri.path, query: generateUuid() }), false),
        originalContent: ref.object.textEditorModel.getValue()
      };
      this.builtinEditingSessions.set(key, session);
      return session;
    } finally {
      ref.dispose();
    }
  }
  createBuiltinPromptSaveRequest(target) {
    const sourceUri = this.currentEditingUri;
    const promptType = this.currentEditingPromptType;
    if (!sourceUri || this.currentEditingStorage !== BUILTIN_STORAGE || promptType !== PromptsType.prompt || !target.folder || target.target === "cancel") {
      return;
    }
    const session = this.builtinEditingSessions.get(sourceUri.toString());
    if (!session || !this._editorContentChanged) {
      return;
    }
    return {
      target: target.target,
      folder: target.folder,
      sourceUri,
      content: session.model.getValue(),
      projectRoot: target.target === "workspace" ? this.workspaceService.getActiveProjectRoot() : void 0
    };
  }
  createExistingCustomizationSaveRequest() {
    if (!this._editorContentChanged || this.currentEditingStorage === BUILTIN_STORAGE || !this.currentEditingUri) {
      return void 0;
    }
    const model = this.currentModelRef?.object.textEditorModel;
    if (!model) {
      return void 0;
    }
    return {
      fileUri: this.currentEditingUri,
      content: model.getValue(),
      projectRoot: this.currentEditingProjectRoot
    };
  }
  async saveBuiltinPromptCopy(request) {
    const targetUri = URI.joinPath(request.folder, basename(request.sourceUri));
    await this.fileService.createFolder(request.folder);
    await this.fileService.writeFile(targetUri, VSBuffer.fromString(request.content));
    if (request.target === "workspace" && request.projectRoot) {
      await this.workspaceService.commitFiles(request.projectRoot, [targetUri]);
    }
  }
  async saveExistingCustomization(request) {
    await this.fileService.writeFile(request.fileUri, VSBuffer.fromString(request.content));
    if (request.projectRoot) {
      await this.workspaceService.commitFiles(request.projectRoot, [request.fileUri]);
    }
  }
  async pickBuiltinPromptSaveTarget() {
    const items = [];
    const workspaceFolder = resolveWorkspaceTargetDirectory(this.workspaceService, PromptsType.prompt);
    if (workspaceFolder) {
      items.push({
        label: localize("workspaceSaveTarget", "Workspace"),
        description: workspaceFolder.fsPath,
        target: "workspace",
        folder: workspaceFolder
      });
    }
    const userFolder = await resolveUserTargetDirectory(this.promptsService, PromptsType.prompt);
    if (userFolder) {
      items.push({
        label: localize("userSaveTarget", "User"),
        description: userFolder.fsPath,
        target: "user",
        folder: userFolder
      });
    }
    items.push({
      label: localize("cancelSaveTarget", "Cancel"),
      target: "cancel"
    });
    return this.quickInputService.pick(items, {
      canPickMany: false,
      placeHolder: localize("saveBuiltinPromptCopyPlaceholder", "Select Workspace, User, or Cancel"),
      matchOnDescription: true
    });
  }
  async handleEditorActionButton() {
    if (this.editorActionButtonInProgress) {
      return;
    }
    this.editorActionButtonInProgress = true;
    this.updateEditorActionButton();
    let backgroundSaveRequest;
    try {
      if (this.shouldShowBuiltinSaveAction()) {
        const selection = await this.pickBuiltinPromptSaveTarget();
        if (!selection || selection.target === "cancel") {
          return;
        }
        backgroundSaveRequest = this.createBuiltinPromptSaveRequest(selection);
        if (backgroundSaveRequest) {
          this.telemetryService.publicLog2("chatCustomizationEditor.saveItem", {
            promptType: this.currentEditingPromptType ?? "",
            storage: String(this.currentEditingStorage ?? ""),
            saveTarget: selection.target
          });
        }
      }
      this.goBackToList();
      if (backgroundSaveRequest) {
        const saveRequest = backgroundSaveRequest;
        void this.saveBuiltinPromptCopy(saveRequest).then(() => {
          void this.listWidget?.refresh();
        }, (error) => {
          console.error("Failed to save built-in prompt override:", error);
          this.notificationService.warn(saveRequest.target === "workspace" ? localize("saveBuiltinPromptCopyFailedWorkspace", "Could not save the prompt override to the workspace prompts.") : localize("saveBuiltinPromptCopyFailedUser", "Could not save the prompt override to your user prompts."));
        });
      }
    } finally {
      this.editorActionButtonInProgress = false;
      this.updateEditorActionButton();
    }
  }
  updateEditorActionButton() {
    if (!this.editorActionButton || !this.editorActionButtonIcon) {
      return;
    }
    const shouldShowBuiltinSaveAction = this.shouldShowBuiltinSaveAction();
    this.editorActionButtonIcon.className = `codicon codicon-${shouldShowBuiltinSaveAction ? Codicon.save.id : Codicon.arrowLeft.id} editor-action-button-icon`;
    this.editorActionButton.disabled = this.editorActionButtonInProgress;
    this.editorActionButton.setAttribute("aria-label", shouldShowBuiltinSaveAction ? localize("savePromptCopyAndChooseLocation", "Save prompt override") : localize("backToList", "Back to list"));
    this.editorActionButton.title = shouldShowBuiltinSaveAction ? localize("savePromptCopyAndChooseLocationTooltip", "Save prompt override (choose Workspace, User, or Cancel)") : localize("backToList", "Back to list");
  }
  shouldShowBuiltinSaveAction() {
    return this._editorContentChanged && this.currentEditingStorage === BUILTIN_STORAGE && this.currentEditingPromptType === PromptsType.prompt;
  }
  resetEditorSaveIndicator() {
    this.editorSaveIndicator.className = "editor-save-indicator";
    this.editorSaveIndicator.title = "";
  }
  disposeBuiltinEditingSessions() {
    for (const session of this.builtinEditingSessions.values()) {
      session.model.dispose();
    }
    this.builtinEditingSessions.clear();
  }
  disposeBuiltinEditingSession(uri) {
    const key = uri.toString();
    const session = this.builtinEditingSessions.get(key);
    if (!session) {
      return;
    }
    session.model.dispose();
    this.builtinEditingSessions.delete(key);
  }
  //#region Embedded MCP Server Detail
  createEmbeddedMcpDetail() {
    if (!this.mcpDetailContainer) {
      return;
    }
    const detailHeader = DOM.append(this.mcpDetailContainer, $(".editor-header"));
    const backButton = DOM.append(detailHeader, $("button.editor-back-button"));
    backButton.setAttribute("aria-label", localize("backToMcpList", "Back to MCP servers"));
    const backIconEl = DOM.append(backButton, $(`.codicon.codicon-${Codicon.arrowLeft.id}`));
    backIconEl.setAttribute("aria-hidden", "true");
    this.editorDisposables.add(DOM.addDisposableListener(backButton, "click", () => {
      this.goBackFromMcpDetail();
    }));
    const editorContainer = DOM.append(this.mcpDetailContainer, $(".mcp-detail-editor-container"));
    this.embeddedMcpEditor = this.editorDisposables.add(this.instantiationService.createInstance(McpServerEditor, this.group));
    this.embeddedMcpEditor.create(editorContainer);
  }
  async showEmbeddedMcpDetail(server) {
    if (!this.embeddedMcpEditor) {
      return;
    }
    this.viewMode = "mcpDetail";
    this.updateContentVisibility();
    const input = this.instantiationService.createInstance(McpServerEditorInput, server);
    this.mcpDetailDisposables.clear();
    this.mcpDetailDisposables.add(input);
    try {
      await this.embeddedMcpEditor.setInput(input, void 0, {}, CancellationToken.None);
    } catch {
      this.goBackFromMcpDetail();
      return;
    }
    if (this.dimension) {
      this.layout(this.dimension);
    }
  }
  goBackFromMcpDetail() {
    this.mcpDetailDisposables.clear();
    this.embeddedMcpEditor?.clearInput();
    this.viewMode = "list";
    this.updateContentVisibility();
    if (this.dimension) {
      this.layout(this.dimension);
    }
    this.mcpListWidget?.focusSearch();
  }
  //#endregion
  //#region Embedded Plugin Detail
  createEmbeddedPluginDetail() {
    if (!this.pluginDetailContainer) {
      return;
    }
    const detailHeader = DOM.append(this.pluginDetailContainer, $(".editor-header"));
    const backButton = DOM.append(detailHeader, $("button.editor-back-button"));
    backButton.setAttribute("aria-label", localize("backToPluginList", "Back to plugins"));
    const backIconEl = DOM.append(backButton, $(`.codicon.codicon-${Codicon.arrowLeft.id}`));
    backIconEl.setAttribute("aria-hidden", "true");
    this.editorDisposables.add(DOM.addDisposableListener(backButton, "click", () => {
      this.goBackFromPluginDetail();
    }));
    const editorContainer = DOM.append(this.pluginDetailContainer, $(".plugin-detail-editor-container"));
    this.embeddedPluginEditor = this.editorDisposables.add(this.instantiationService.createInstance(AgentPluginEditor, this.group));
    this.embeddedPluginEditor.create(editorContainer);
  }
  async showEmbeddedPluginDetail(item) {
    if (!this.embeddedPluginEditor) {
      return;
    }
    this.viewMode = "pluginDetail";
    this.updateContentVisibility();
    const input = new AgentPluginEditorInput(item);
    this.pluginDetailDisposables.clear();
    this.pluginDetailDisposables.add(input);
    try {
      await this.embeddedPluginEditor.setInput(input, void 0, {}, CancellationToken.None);
    } catch {
      this.goBackFromPluginDetail();
      return;
    }
    if (this.dimension) {
      this.layout(this.dimension);
    }
  }
  goBackFromPluginDetail() {
    this.pluginDetailDisposables.clear();
    this.embeddedPluginEditor?.clearInput();
    this.viewMode = "list";
    this.updateContentVisibility();
    if (this.dimension) {
      this.layout(this.dimension);
    }
    this.pluginListWidget?.focusSearch();
  }
};
AICustomizationManagementEditor = AICustomizationManagementEditor_1 = __decorate([
  __param(1, ITelemetryService),
  __param(2, IThemeService),
  __param(3, IStorageService),
  __param(4, IInstantiationService),
  __param(5, IContextKeyService),
  __param(6, IOpenerService),
  __param(7, ICommandService),
  __param(8, IAICustomizationWorkspaceService),
  __param(9, IPromptsService),
  __param(10, ITextModelService),
  __param(11, IConfigurationService),
  __param(12, IWorkingCopyService),
  __param(13, IFileDialogService),
  __param(14, IHoverService),
  __param(15, IModelService),
  __param(16, IQuickInputService),
  __param(17, IFileService),
  __param(18, INotificationService)
], AICustomizationManagementEditor);
export {
  AICustomizationManagementEditor,
  aiCustomizationManagementSashBorder
};
//# sourceMappingURL=aiCustomizationManagementEditor.js.map
