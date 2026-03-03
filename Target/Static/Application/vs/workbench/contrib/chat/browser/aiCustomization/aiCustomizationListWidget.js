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
import "./media/aiCustomizationManagement.css";
import * as DOM from "../../../../../base/browser/dom.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { Emitter } from "../../../../../base/common/event.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { autorun } from "../../../../../base/common/observable.js";
import { basename, dirname, isEqualOrParent } from "../../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { localize } from "../../../../../nls.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { WorkbenchList } from "../../../../../platform/list/browser/listService.js";
import { IPromptsService, PromptsStorage } from "../../common/promptSyntax/service/promptsService.js";
import { PromptsType } from "../../common/promptSyntax/promptTypes.js";
import { agentIcon, instructionsIcon, promptIcon, skillIcon, hookIcon, userIcon, workspaceIcon, extensionIcon, pluginIcon } from "./aiCustomizationIcons.js";
import { AICustomizationManagementItemMenuId, AICustomizationManagementSection } from "./aiCustomizationManagement.js";
import { InputBox } from "../../../../../base/browser/ui/inputbox/inputBox.js";
import { defaultButtonStyles, defaultInputBoxStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
import { Delayer } from "../../../../../base/common/async.js";
import { IContextMenuService, IContextViewService } from "../../../../../platform/contextview/browser/contextView.js";
import { HighlightedLabel } from "../../../../../base/browser/ui/highlightedlabel/highlightedLabel.js";
import { matchesContiguousSubString } from "../../../../../base/common/filters.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { Button, ButtonWithDropdown } from "../../../../../base/browser/ui/button/button.js";
import { IMenuService } from "../../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { getFlatContextMenuActions } from "../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { IAICustomizationWorkspaceService, applyStorageSourceFilter } from "../../common/aiCustomizationWorkspaceService.js";
import { Action, Separator } from "../../../../../base/common/actions.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { ISCMService } from "../../../scm/common/scm.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IPathService } from "../../../../services/path/common/pathService.js";
import { generateCustomizationDebugReport } from "./aiCustomizationDebugPanel.js";
import { parseHooksFromFile } from "../../common/promptSyntax/hookCompatibility.js";
import { HOOK_TYPES, formatHookCommandLabel } from "../../common/promptSyntax/hookSchema.js";
import { parse as parseJSONC } from "../../../../../base/common/json.js";
import { Schemas } from "../../../../../base/common/network.js";
import { OS } from "../../../../../base/common/platform.js";
const $ = DOM.$;
const ITEM_HEIGHT = 44;
const GROUP_HEADER_HEIGHT = 32;
const GROUP_HEADER_HEIGHT_WITH_SEPARATOR = 40;
class AICustomizationListDelegate {
  static {
    __name(this, "AICustomizationListDelegate");
  }
  getHeight(element) {
    if (element.type === "group-header") {
      return element.isFirst ? GROUP_HEADER_HEIGHT : GROUP_HEADER_HEIGHT_WITH_SEPARATOR;
    }
    return ITEM_HEIGHT;
  }
  getTemplateId(element) {
    return element.type === "group-header" ? "groupHeader" : "aiCustomizationItem";
  }
}
class GroupHeaderRenderer {
  static {
    __name(this, "GroupHeaderRenderer");
  }
  constructor(hoverService) {
    this.hoverService = hoverService;
    this.templateId = "groupHeader";
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    container.classList.add("ai-customization-group-header");
    const chevron = DOM.append(container, $(".group-chevron"));
    const icon = DOM.append(container, $(".group-icon"));
    const labelGroup = DOM.append(container, $(".group-label-group"));
    const label = DOM.append(labelGroup, $(".group-label"));
    const infoIcon = DOM.append(labelGroup, $(".group-info"));
    infoIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.info));
    const count = DOM.append(container, $(".group-count"));
    return { container, chevron, icon, label, count, infoIcon, disposables, elementDisposables };
  }
  renderElement(element, _index, templateData) {
    templateData.elementDisposables.clear();
    templateData.chevron.className = "group-chevron";
    templateData.chevron.classList.add(...ThemeIcon.asClassNameArray(element.collapsed ? Codicon.chevronRight : Codicon.chevronDown));
    templateData.icon.className = "group-icon";
    templateData.icon.classList.add(...ThemeIcon.asClassNameArray(element.icon));
    templateData.label.textContent = element.label;
    templateData.count.textContent = `${element.count}`;
    templateData.elementDisposables.add(this.hoverService.setupDelayedHover(templateData.infoIcon, () => ({
      content: element.description,
      appearance: {
        compact: true,
        skipFadeInAnimation: true
      }
    })));
    templateData.container.classList.toggle("collapsed", element.collapsed);
    templateData.container.classList.toggle("has-previous-group", !element.isFirst);
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.disposables.dispose();
  }
}
class AICustomizationItemRenderer {
  static {
    __name(this, "AICustomizationItemRenderer");
  }
  constructor() {
    this.templateId = "aiCustomizationItem";
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    container.classList.add("ai-customization-list-item");
    const leftSection = DOM.append(container, $(".item-left"));
    const storageBadge = DOM.append(leftSection, $(".storage-badge"));
    const textContainer = DOM.append(leftSection, $(".item-text"));
    const nameLabel = disposables.add(new HighlightedLabel(DOM.append(textContainer, $(".item-name"))));
    const description = disposables.add(new HighlightedLabel(DOM.append(textContainer, $(".item-description"))));
    const gitStatusBadge = DOM.append(container, $(".git-status-badge"));
    const actionsContainer = DOM.append(container, $(".item-right"));
    return {
      container,
      actionsContainer,
      nameLabel,
      description,
      storageBadge,
      gitStatusBadge,
      disposables,
      elementDisposables
    };
  }
  renderElement(entry, index, templateData) {
    templateData.elementDisposables.clear();
    const element = entry.item;
    templateData.nameLabel.set(element.name, element.nameMatches);
    const secondaryText = element.description || element.filename;
    if (secondaryText) {
      templateData.description.set(secondaryText, element.description ? element.descriptionMatches : void 0);
      templateData.description.element.style.display = "";
      templateData.description.element.classList.toggle("is-filename", !element.description);
    } else {
      templateData.description.set("", void 0);
      templateData.description.element.style.display = "none";
    }
    let storageBadgeIcon;
    let storageBadgeLabel;
    switch (element.storage) {
      case PromptsStorage.local:
        storageBadgeIcon = workspaceIcon;
        storageBadgeLabel = localize("workspace", "Workspace");
        break;
      case PromptsStorage.user:
        storageBadgeIcon = userIcon;
        storageBadgeLabel = localize("user", "User");
        break;
      case PromptsStorage.extension:
        storageBadgeIcon = extensionIcon;
        storageBadgeLabel = localize("extension", "Extension");
        break;
      case PromptsStorage.plugin:
        storageBadgeIcon = pluginIcon;
        storageBadgeLabel = localize("plugin", "Plugin");
        break;
    }
    templateData.storageBadge.className = "storage-badge";
    templateData.storageBadge.classList.add(...ThemeIcon.asClassNameArray(storageBadgeIcon));
    templateData.storageBadge.title = storageBadgeLabel;
    const gitBadge = templateData.gitStatusBadge;
    gitBadge.className = "git-status-badge";
    if (element.gitStatus === "committed") {
      gitBadge.classList.add(...ThemeIcon.asClassNameArray(Codicon.check));
      gitBadge.classList.add("committed");
      gitBadge.textContent = "";
      gitBadge.title = localize("committedStatus", "Committed");
      gitBadge.style.display = "";
    } else {
      gitBadge.style.display = "none";
    }
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.disposables.dispose();
  }
}
function sectionToPromptType(section) {
  switch (section) {
    case AICustomizationManagementSection.Agents:
      return PromptsType.agent;
    case AICustomizationManagementSection.Skills:
      return PromptsType.skill;
    case AICustomizationManagementSection.Instructions:
      return PromptsType.instructions;
    case AICustomizationManagementSection.Hooks:
      return PromptsType.hook;
    case AICustomizationManagementSection.Prompts:
    default:
      return PromptsType.prompt;
  }
}
__name(sectionToPromptType, "sectionToPromptType");
let AICustomizationListWidget = class AICustomizationListWidget2 extends Disposable {
  static {
    __name(this, "AICustomizationListWidget");
  }
  constructor(instantiationService, promptsService, contextViewService, openerService, contextMenuService, menuService, contextKeyService, workspaceContextService, labelService, workspaceService, clipboardService, scmService, hoverService, fileService, pathService) {
    super();
    this.instantiationService = instantiationService;
    this.promptsService = promptsService;
    this.contextViewService = contextViewService;
    this.openerService = openerService;
    this.contextMenuService = contextMenuService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.workspaceContextService = workspaceContextService;
    this.labelService = labelService;
    this.workspaceService = workspaceService;
    this.clipboardService = clipboardService;
    this.scmService = scmService;
    this.hoverService = hoverService;
    this.fileService = fileService;
    this.pathService = pathService;
    this.currentSection = AICustomizationManagementSection.Agents;
    this.allItems = [];
    this.displayEntries = [];
    this.searchQuery = "";
    this.collapsedGroups = /* @__PURE__ */ new Set();
    this.dropdownActionDisposables = this._register(new DisposableStore());
    this.delayedFilter = new Delayer(200);
    this._onDidSelectItem = this._register(new Emitter());
    this.onDidSelectItem = this._onDidSelectItem.event;
    this._onDidChangeItemCount = this._register(new Emitter());
    this.onDidChangeItemCount = this._onDidChangeItemCount.event;
    this._onDidRequestCreate = this._register(new Emitter());
    this.onDidRequestCreate = this._onDidRequestCreate.event;
    this._onDidRequestCreateManual = this._register(new Emitter());
    this.onDidRequestCreateManual = this._onDidRequestCreateManual.event;
    this.element = $(".ai-customization-list-widget");
    this.create();
    this._register(this.workspaceContextService.onDidChangeWorkspaceFolders(() => this.refresh()));
    this._register(autorun((reader) => {
      this.workspaceService.activeProjectRoot.read(reader);
      this.updateAddButton();
      this.refresh();
    }));
    const trackRepoChanges = /* @__PURE__ */ __name((repo) => {
      this._register(repo.provider.onDidChangeResources(() => {
        this.updateGitStatus(this.allItems);
        this.filterItems();
      }));
    }, "trackRepoChanges");
    for (const repo of [...this.scmService.repositories]) {
      trackRepoChanges(repo);
    }
    this._register(this.scmService.onDidAddRepository((repo) => trackRepoChanges(repo)));
  }
  create() {
    this.searchAndButtonContainer = DOM.append(this.element, $(".list-search-and-button-container"));
    this.searchContainer = DOM.append(this.searchAndButtonContainer, $(".list-search-container"));
    this.searchInput = this._register(new InputBox(this.searchContainer, this.contextViewService, {
      placeholder: localize("searchPlaceholder", "Type to search..."),
      inputBoxStyles: defaultInputBoxStyles
    }));
    this._register(this.searchInput.onDidChange(() => {
      this.searchQuery = this.searchInput.value;
      this.delayedFilter.trigger(() => this.filterItems());
    }));
    this.addButtonContainer = DOM.append(this.searchAndButtonContainer, $(".list-add-button-container"));
    this.addButtonSimple = this._register(new Button(this.addButtonContainer, {
      ...defaultButtonStyles,
      supportIcons: true
    }));
    this.addButtonSimple.element.classList.add("list-add-button");
    this._register(this.addButtonSimple.onDidClick(() => this.executePrimaryCreateAction()));
    this.addButton = this._register(new ButtonWithDropdown(this.addButtonContainer, {
      ...defaultButtonStyles,
      supportIcons: true,
      contextMenuProvider: this.contextMenuService,
      addPrimaryActionToDropdown: false,
      actions: { getActions: /* @__PURE__ */ __name(() => this.getDropdownActions(), "getActions") }
    }));
    this.addButton.element.classList.add("list-add-button");
    this._register(this.addButton.onDidClick(() => this.executePrimaryCreateAction()));
    this.updateAddButton();
    this.listContainer = DOM.append(this.element, $(".list-container"));
    this.emptyStateContainer = DOM.append(this.element, $(".list-empty-state"));
    this.emptyStateIcon = DOM.append(this.emptyStateContainer, $(".empty-state-icon"));
    this.emptyStateText = DOM.append(this.emptyStateContainer, $(".empty-state-text"));
    this.emptyStateSubtext = DOM.append(this.emptyStateContainer, $(".empty-state-subtext"));
    this.emptyStateContainer.style.display = "none";
    this.list = this._register(this.instantiationService.createInstance(WorkbenchList, "AICustomizationManagementList", this.listContainer, new AICustomizationListDelegate(), [
      new GroupHeaderRenderer(this.hoverService),
      this.instantiationService.createInstance(AICustomizationItemRenderer)
    ], {
      identityProvider: {
        getId: /* @__PURE__ */ __name((entry) => entry.type === "group-header" ? entry.id : entry.item.id, "getId")
      },
      accessibilityProvider: {
        getAriaLabel: /* @__PURE__ */ __name((entry) => {
          if (entry.type === "group-header") {
            return localize("groupAriaLabel", "{0}, {1} items, {2}", entry.label, entry.count, entry.collapsed ? localize("collapsed", "collapsed") : localize("expanded", "expanded"));
          }
          return entry.item.description ? localize("itemAriaLabel", "{0}, {1}", entry.item.name, entry.item.description) : entry.item.name;
        }, "getAriaLabel"),
        getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize("listAriaLabel", "Chat Customizations"), "getWidgetAriaLabel")
      },
      keyboardNavigationLabelProvider: {
        getKeyboardNavigationLabel: /* @__PURE__ */ __name((entry) => entry.type === "group-header" ? entry.label : entry.item.name, "getKeyboardNavigationLabel")
      },
      multipleSelectionSupport: false,
      openOnSingleClick: true
    }));
    this._register(this.list.onDidOpen((e) => {
      if (e.element) {
        if (e.element.type === "group-header") {
          this.toggleGroup(e.element);
        } else {
          this._onDidSelectItem.fire(e.element.item);
        }
      }
    }));
    this._register(this.list.onContextMenu((e) => this.onContextMenu(e)));
    this._register(this.promptsService.onDidChangeCustomAgents(() => this.refresh()));
    this._register(this.promptsService.onDidChangeSlashCommands(() => this.refresh()));
    this.sectionHeader = DOM.append(this.element, $(".section-footer"));
    this.sectionDescription = DOM.append(this.sectionHeader, $("p.section-footer-description"));
    this.sectionLink = DOM.append(this.sectionHeader, $("a.section-footer-link"));
    this._register(DOM.addDisposableListener(this.sectionLink, "click", (e) => {
      e.preventDefault();
      const href = this.sectionLink.href;
      if (href) {
        this.openerService.open(URI.parse(href));
      }
    }));
    this.updateSectionHeader();
  }
  /**
   * Handles context menu for list items.
   */
  onContextMenu(e) {
    if (!e.element || e.element.type !== "file-item") {
      return;
    }
    const item = e.element.item;
    const context = {
      uri: item.uri.toString(),
      name: item.name,
      promptType: item.promptType,
      storage: item.storage
    };
    const actions = this.menuService.getMenuActions(AICustomizationManagementItemMenuId, this.contextKeyService, {
      arg: context,
      shouldForwardArgs: true
    });
    const flatActions = getFlatContextMenuActions(actions);
    const copyActions = [
      new Separator(),
      new Action("copyFullPath", localize("copyFullPath", "Copy Full Path"), void 0, true, async () => {
        await this.clipboardService.writeText(item.uri.fsPath);
      }),
      new Action("copyRelativePath", localize("copyRelativePath", "Copy Relative Path"), void 0, true, async () => {
        const basePath = this.workspaceService.getActiveProjectRoot();
        if (basePath && item.uri.fsPath.startsWith(basePath.fsPath)) {
          const relative = item.uri.fsPath.substring(basePath.fsPath.length + 1);
          await this.clipboardService.writeText(relative);
        } else {
          const relativePath = this.labelService.getUriLabel(item.uri, { relative: true });
          await this.clipboardService.writeText(relativePath);
        }
      })
    ];
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => [...flatActions, ...copyActions], "getActions")
    });
  }
  /**
   * Sets the current section and loads items for that section.
   */
  async setSection(section) {
    this.currentSection = section;
    this.updateSectionHeader();
    this.updateAddButton();
    await this.loadItems();
  }
  /**
   * Updates the section header based on the current section.
   */
  updateSectionHeader() {
    let description;
    let docsUrl;
    let learnMoreLabel;
    switch (this.currentSection) {
      case AICustomizationManagementSection.Agents:
        description = localize("agentsDescription", "Configure the AI to adopt different personas tailored to specific development tasks. Each agent has its own instructions, tools, and behavior.");
        docsUrl = "https://code.visualstudio.com/docs/copilot/customization/custom-agents";
        learnMoreLabel = localize("learnMoreAgents", "Learn more about custom agents");
        break;
      case AICustomizationManagementSection.Skills:
        description = localize("skillsDescription", "Folders of instructions, scripts, and resources that Copilot loads when relevant to perform specialized tasks.");
        docsUrl = "https://code.visualstudio.com/docs/copilot/customization/agent-skills";
        learnMoreLabel = localize("learnMoreSkills", "Learn more about agent skills");
        break;
      case AICustomizationManagementSection.Instructions:
        description = localize("instructionsDescription", "Define common guidelines and rules that automatically influence how AI generates code and handles development tasks.");
        docsUrl = "https://code.visualstudio.com/docs/copilot/customization/custom-instructions";
        learnMoreLabel = localize("learnMoreInstructions", "Learn more about custom instructions");
        break;
      case AICustomizationManagementSection.Hooks:
        description = localize("hooksDescription", "Prompts executed at specific points during an agentic lifecycle.");
        docsUrl = "https://code.visualstudio.com/docs/copilot/customization/hooks";
        learnMoreLabel = localize("learnMoreHooks", "Learn more about hooks");
        break;
      case AICustomizationManagementSection.Prompts:
      default:
        description = localize("promptsDescription", "Reusable prompts for common development tasks like generating code, performing reviews, or scaffolding components.");
        docsUrl = "https://code.visualstudio.com/docs/copilot/customization/prompt-files";
        learnMoreLabel = localize("learnMorePrompts", "Learn more about prompt files");
        break;
    }
    this.sectionDescription.textContent = description;
    this.sectionLink.textContent = learnMoreLabel;
    this.sectionLink.href = docsUrl;
  }
  /**
   * Updates the add button label based on the current section.
   */
  updateAddButton() {
    const typeLabel = this.getTypeLabel();
    const dropdownActions = this.getDropdownActions();
    const hasDropdown = dropdownActions.length > 0;
    this.addButton.element.style.display = hasDropdown ? "" : "none";
    this.addButtonSimple.element.style.display = hasDropdown ? "none" : "";
    if (this.workspaceService.isSessionsWindow) {
      const hasWorkspace = this.hasActiveWorkspace();
      const label = `$(${Codicon.add.id}) New ${typeLabel} (Workspace)`;
      if (hasDropdown) {
        this.addButton.label = label;
        this.addButton.enabled = hasWorkspace;
        this.addButton.primaryButton.setTitle("");
        this.addButton.dropdownButton.setTitle("");
        if (!hasWorkspace) {
          const disabledTitle = localize("createDisabled", "Open a workspace folder to create customizations.");
          this.addButton.primaryButton.setTitle(disabledTitle);
          this.addButton.dropdownButton.setTitle(disabledTitle);
        }
      } else {
        this.addButtonSimple.label = label;
        this.addButtonSimple.enabled = hasWorkspace;
        if (!hasWorkspace) {
          this.addButtonSimple.setTitle(localize("createDisabled", "Open a workspace folder to create customizations."));
        } else {
          this.addButtonSimple.setTitle("");
        }
      }
    } else {
      const label = `$(${Codicon.sparkle.id}) Generate ${typeLabel}`;
      if (hasDropdown) {
        this.addButton.label = label;
        this.addButton.enabled = true;
        this.addButton.primaryButton.setTitle("");
        this.addButton.dropdownButton.setTitle("");
      } else {
        this.addButtonSimple.label = label;
        this.addButtonSimple.enabled = true;
        this.addButtonSimple.setTitle("");
      }
    }
  }
  /**
   * Gets the dropdown actions for the add button.
   */
  getDropdownActions() {
    this.dropdownActionDisposables.clear();
    const typeLabel = this.getTypeLabel();
    const actions = [];
    const promptType = sectionToPromptType(this.currentSection);
    if (promptType === PromptsType.hook) {
      if (this.workspaceService.isSessionsWindow) {
      } else {
        if (this.hasActiveWorkspace()) {
          actions.push(this.dropdownActionDisposables.add(new Action("configureHooks", `$(${Codicon.add.id}) Configure Hooks`, void 0, true, () => {
            this._onDidRequestCreateManual.fire({ type: promptType, target: "workspace" });
          })));
        }
      }
      return actions;
    }
    if (this.workspaceService.isSessionsWindow) {
      actions.push(this.dropdownActionDisposables.add(new Action("createUser", `$(${Codicon.account.id}) New ${typeLabel} (User)`, void 0, true, () => {
        this._onDidRequestCreateManual.fire({ type: promptType, target: "user" });
      })));
    } else {
      if (this.hasActiveWorkspace()) {
        actions.push(this.dropdownActionDisposables.add(new Action("createWorkspace", `$(${Codicon.folder.id}) New ${typeLabel} (Workspace)`, void 0, true, () => {
          this._onDidRequestCreateManual.fire({ type: promptType, target: "workspace" });
        })));
      }
      actions.push(this.dropdownActionDisposables.add(new Action("createUser", `$(${Codicon.account.id}) New ${typeLabel} (User)`, void 0, true, () => {
        this._onDidRequestCreateManual.fire({ type: promptType, target: "user" });
      })));
    }
    return actions;
  }
  /**
   * Checks if there's an active project root (workspace folder or session repository).
   */
  hasActiveWorkspace() {
    return !!this.workspaceService.getActiveProjectRoot();
  }
  /**
   * Executes the primary create action based on context.
   */
  executePrimaryCreateAction() {
    const promptType = sectionToPromptType(this.currentSection);
    if (this.workspaceService.isSessionsWindow) {
      if (!this.hasActiveWorkspace()) {
        return;
      }
      this._onDidRequestCreateManual.fire({ type: promptType, target: "workspace" });
    } else {
      this._onDidRequestCreate.fire(promptType);
    }
  }
  /**
   * Gets the type label for the current section.
   */
  getTypeLabel() {
    switch (this.currentSection) {
      case AICustomizationManagementSection.Agents:
        return localize("agent", "Agent");
      case AICustomizationManagementSection.Skills:
        return localize("skill", "Skill");
      case AICustomizationManagementSection.Instructions:
        return localize("instructions", "Instructions");
      case AICustomizationManagementSection.Hooks:
        return localize("hook", "Hook");
      case AICustomizationManagementSection.Prompts:
      default:
        return localize("prompt", "Prompt");
    }
  }
  /**
   * Refreshes the current section's items.
   */
  async refresh() {
    this.updateAddButton();
    await this.loadItems();
  }
  /**
   * Loads items for the current section.
   */
  async loadItems() {
    const promptType = sectionToPromptType(this.currentSection);
    const items = [];
    if (promptType === PromptsType.agent) {
      const agents = await this.promptsService.getCustomAgents(CancellationToken.None);
      for (const agent of agents) {
        const filename = basename(agent.uri);
        items.push({
          id: agent.uri.toString(),
          uri: agent.uri,
          name: agent.name,
          filename,
          description: agent.description,
          storage: agent.source.storage,
          promptType
        });
      }
    } else if (promptType === PromptsType.skill) {
      const skills = await this.promptsService.findAgentSkills(CancellationToken.None);
      for (const skill of skills || []) {
        const filename = basename(skill.uri);
        const skillName = skill.name || basename(dirname(skill.uri)) || filename;
        items.push({
          id: skill.uri.toString(),
          uri: skill.uri,
          name: skillName,
          filename,
          description: skill.description,
          storage: skill.storage,
          promptType
        });
      }
    } else if (promptType === PromptsType.prompt) {
      const commands = await this.promptsService.getPromptSlashCommands(CancellationToken.None);
      for (const command of commands) {
        if (command.promptPath.type === PromptsType.skill) {
          continue;
        }
        const filename = basename(command.promptPath.uri);
        items.push({
          id: command.promptPath.uri.toString(),
          uri: command.promptPath.uri,
          name: command.name,
          filename,
          description: command.description,
          storage: command.promptPath.storage,
          promptType
        });
      }
    } else if (promptType === PromptsType.hook) {
      const hookFiles = await this.promptsService.listPromptFiles(PromptsType.hook, CancellationToken.None);
      const activeRoot = this.workspaceService.getActiveProjectRoot();
      const userHomeUri = await this.pathService.userHome();
      const userHome = userHomeUri.scheme === Schemas.file ? userHomeUri.fsPath : userHomeUri.path;
      for (const hookFile of hookFiles) {
        let parsedHooks = false;
        try {
          const content = await this.fileService.readFile(hookFile.uri);
          const json = parseJSONC(content.value.toString());
          const { hooks } = parseHooksFromFile(hookFile.uri, json, activeRoot, userHome);
          if (hooks.size > 0) {
            parsedHooks = true;
            for (const [hookType, entry] of hooks) {
              const hookMeta = HOOK_TYPES.find((h) => h.id === hookType);
              for (let i = 0; i < entry.hooks.length; i++) {
                const hook = entry.hooks[i];
                const cmdLabel = formatHookCommandLabel(hook, OS);
                const truncatedCmd = cmdLabel.length > 60 ? cmdLabel.substring(0, 57) + "..." : cmdLabel;
                items.push({
                  id: `${hookFile.uri.toString()}#${entry.originalId}[${i}]`,
                  uri: hookFile.uri,
                  name: hookMeta?.label ?? entry.originalId,
                  filename: basename(hookFile.uri),
                  description: truncatedCmd || localize("hookUnset", "(unset)"),
                  storage: hookFile.storage,
                  promptType
                });
              }
            }
          }
        } catch {
        }
        if (!parsedHooks) {
          const filename = basename(hookFile.uri);
          items.push({
            id: hookFile.uri.toString(),
            uri: hookFile.uri,
            name: this.getFriendlyName(filename),
            filename,
            storage: hookFile.storage,
            promptType
          });
        }
      }
    } else {
      const promptFiles = await this.promptsService.listPromptFiles(promptType, CancellationToken.None);
      const allItems = [...promptFiles];
      if (promptType === PromptsType.instructions) {
        const agentInstructions = await this.promptsService.listAgentInstructions(CancellationToken.None, void 0);
        const workspaceFolderUris = this.workspaceContextService.getWorkspace().folders.map((f) => f.uri);
        const activeRoot = this.workspaceService.getActiveProjectRoot();
        if (activeRoot) {
          workspaceFolderUris.push(activeRoot);
        }
        for (const file of agentInstructions) {
          const isWorkspaceFile = workspaceFolderUris.some((root) => isEqualOrParent(file.uri, root));
          allItems.push({
            uri: file.uri,
            storage: isWorkspaceFile ? PromptsStorage.local : PromptsStorage.user,
            type: PromptsType.instructions,
            name: basename(file.uri)
          });
        }
      }
      const workspaceItems = allItems.filter((item) => item.storage === PromptsStorage.local);
      const userItems = allItems.filter((item) => item.storage === PromptsStorage.user);
      const extensionItems = allItems.filter((item) => item.storage === PromptsStorage.extension);
      const pluginItems = allItems.filter((item) => item.storage === PromptsStorage.plugin);
      const mapToListItem = /* @__PURE__ */ __name((item) => {
        const filename = basename(item.uri);
        const friendlyName = item.name || this.getFriendlyName(filename);
        return {
          id: item.uri.toString(),
          uri: item.uri,
          name: friendlyName,
          filename,
          description: item.description,
          storage: item.storage,
          promptType
        };
      }, "mapToListItem");
      items.push(...workspaceItems.map(mapToListItem));
      items.push(...userItems.map(mapToListItem));
      items.push(...extensionItems.map(mapToListItem));
      items.push(...pluginItems.map(mapToListItem));
    }
    const filter = this.workspaceService.getStorageSourceFilter(promptType);
    const filteredItems = applyStorageSourceFilter(items, filter);
    items.length = 0;
    items.push(...filteredItems);
    items.sort((a, b) => a.name.localeCompare(b.name));
    this.updateGitStatus(items);
    this.allItems = items;
    this.filterItems();
    this._onDidChangeItemCount.fire(items.length);
  }
  /**
   * Updates git status on local workspace items by checking SCM resource groups.
   * Files found in resource groups have uncommitted changes; others are committed.
   */
  updateGitStatus(items) {
    const uncommittedUris = /* @__PURE__ */ new Set();
    for (const repo of [...this.scmService.repositories]) {
      for (const group of repo.provider.groups) {
        for (const resource of group.resources) {
          uncommittedUris.add(resource.sourceUri.toString());
        }
      }
    }
    for (const item of items) {
      if (item.storage === PromptsStorage.local) {
        item.gitStatus = uncommittedUris.has(item.uri.toString()) ? "uncommitted" : "committed";
      }
    }
  }
  /**
   * Derives a friendly name from a filename by removing extension suffixes.
   */
  getFriendlyName(filename) {
    let name = filename.replace(/\.instructions\.md$/i, "").replace(/\.prompt\.md$/i, "").replace(/\.agent\.md$/i, "").replace(/\.md$/i, "");
    name = name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return name || filename;
  }
  /**
   * Filters items based on the current search query and builds grouped display entries.
   */
  filterItems() {
    let matchedItems;
    if (!this.searchQuery.trim()) {
      matchedItems = this.allItems.map((item) => ({ ...item, nameMatches: void 0, descriptionMatches: void 0 }));
    } else {
      const query = this.searchQuery.toLowerCase();
      matchedItems = [];
      for (const item of this.allItems) {
        const nameMatches = matchesContiguousSubString(query, item.name);
        const descriptionMatches = item.description ? matchesContiguousSubString(query, item.description) : null;
        const filenameMatches = matchesContiguousSubString(query, item.filename);
        if (nameMatches || descriptionMatches || filenameMatches) {
          matchedItems.push({
            ...item,
            nameMatches: nameMatches || void 0,
            descriptionMatches: descriptionMatches || void 0
          });
        }
      }
    }
    const promptType = sectionToPromptType(this.currentSection);
    const visibleSources = new Set(this.workspaceService.getStorageSourceFilter(promptType).sources);
    const groups = [
      { storage: PromptsStorage.local, label: localize("workspaceGroup", "Workspace"), icon: workspaceIcon, description: localize("workspaceGroupDescription", "Customizations stored as files in your project folder and shared with your team via version control."), items: [] },
      { storage: PromptsStorage.user, label: localize("userGroup", "User"), icon: userIcon, description: localize("userGroupDescription", "Customizations stored locally on your machine in a central location. Private to you and available across all projects."), items: [] },
      { storage: PromptsStorage.extension, label: localize("extensionGroup", "Extensions"), icon: extensionIcon, description: localize("extensionGroupDescription", "Read-only customizations provided by installed extensions."), items: [] },
      { storage: PromptsStorage.plugin, label: localize("pluginGroup", "Plugins"), icon: pluginIcon, description: localize("pluginGroupDescription", "Read-only customizations provided by installed plugins."), items: [] }
    ].filter((g) => visibleSources.has(g.storage));
    for (const item of matchedItems) {
      const group = groups.find((g) => g.storage === item.storage);
      if (group) {
        group.items.push(item);
      }
    }
    for (const group of groups) {
      group.items.sort((a, b) => a.name.localeCompare(b.name));
    }
    this.displayEntries = [];
    let isFirstGroup = true;
    for (const group of groups) {
      if (group.items.length === 0) {
        continue;
      }
      const collapsed = this.collapsedGroups.has(group.storage);
      this.displayEntries.push({
        type: "group-header",
        id: `group-${group.storage}`,
        storage: group.storage,
        label: group.label,
        icon: group.icon,
        count: group.items.length,
        isFirst: isFirstGroup,
        description: group.description,
        collapsed
      });
      isFirstGroup = false;
      if (!collapsed) {
        for (const item of group.items) {
          this.displayEntries.push({ type: "file-item", item });
        }
      }
    }
    this.list.splice(0, this.list.length, this.displayEntries);
    this.updateEmptyState();
  }
  /**
   * Toggles the collapsed state of a group.
   */
  toggleGroup(entry) {
    if (this.collapsedGroups.has(entry.storage)) {
      this.collapsedGroups.delete(entry.storage);
    } else {
      this.collapsedGroups.add(entry.storage);
    }
    this.filterItems();
  }
  updateEmptyState() {
    const hasItems = this.displayEntries.length > 0;
    if (!hasItems) {
      this.emptyStateContainer.style.display = "flex";
      this.listContainer.style.display = "none";
      this.emptyStateIcon.className = "empty-state-icon";
      const sectionIcon = this.getSectionIcon();
      this.emptyStateIcon.classList.add(...ThemeIcon.asClassNameArray(sectionIcon));
      if (this.searchQuery.trim()) {
        this.emptyStateText.textContent = localize("noMatchingItems", "No items match '{0}'", this.searchQuery);
        this.emptyStateSubtext.textContent = localize("tryDifferentSearch", "Try a different search term");
      } else {
        const emptyInfo = this.getEmptyStateInfo();
        this.emptyStateText.textContent = emptyInfo.title;
        this.emptyStateSubtext.textContent = emptyInfo.description;
      }
    } else {
      this.emptyStateContainer.style.display = "none";
      this.listContainer.style.display = "";
    }
  }
  getSectionIcon() {
    switch (this.currentSection) {
      case AICustomizationManagementSection.Agents:
        return agentIcon;
      case AICustomizationManagementSection.Skills:
        return skillIcon;
      case AICustomizationManagementSection.Instructions:
        return instructionsIcon;
      case AICustomizationManagementSection.Hooks:
        return hookIcon;
      case AICustomizationManagementSection.Prompts:
      default:
        return promptIcon;
    }
  }
  getEmptyStateInfo() {
    switch (this.currentSection) {
      case AICustomizationManagementSection.Agents:
        return {
          title: localize("noAgents", "No agents yet"),
          description: localize("createFirstAgent", "Create your first custom agent to get started")
        };
      case AICustomizationManagementSection.Skills:
        return {
          title: localize("noSkills", "No skills yet"),
          description: localize("createFirstSkill", "Create your first skill to extend agent capabilities")
        };
      case AICustomizationManagementSection.Instructions:
        return {
          title: localize("noInstructions", "No instructions yet"),
          description: localize("createFirstInstructions", "Add instructions to teach Copilot about your codebase")
        };
      case AICustomizationManagementSection.Hooks:
        return {
          title: localize("noHooks", "No hooks yet"),
          description: localize("createFirstHook", "Create hooks to execute commands at agent lifecycle events")
        };
      case AICustomizationManagementSection.Prompts:
      default:
        return {
          title: localize("noPrompts", "No prompts yet"),
          description: localize("createFirstPrompt", "Create reusable prompts for common tasks")
        };
    }
  }
  /**
   * Sets the search query programmatically.
   */
  setSearchQuery(query) {
    this.searchInput.value = query;
  }
  /**
   * Clears the search query.
   */
  clearSearch() {
    this.searchInput.value = "";
  }
  /**
   * Focuses the search input.
   */
  focusSearch() {
    this.searchInput.focus();
  }
  /**
   * Focuses the list.
   */
  focusList() {
    this.list.domFocus();
    if (this.displayEntries.length > 0) {
      this.list.setFocus([0]);
    }
  }
  /**
   * Layouts the widget.
   */
  layout(height, width) {
    const sectionFooterHeight = this.sectionHeader.offsetHeight || 100;
    const searchBarHeight = this.searchAndButtonContainer.offsetHeight || 40;
    const margins = 12;
    const listHeight = height - sectionFooterHeight - searchBarHeight - margins;
    this.searchInput.layout();
    this.listContainer.style.height = `${Math.max(0, listHeight)}px`;
    this.list.layout(Math.max(0, listHeight), width);
  }
  /**
   * Gets the total item count (before filtering).
   */
  get itemCount() {
    return this.allItems.length;
  }
  /**
   * Generates a debug report for the current section.
   */
  async generateDebugReport() {
    return generateCustomizationDebugReport(this.currentSection, this.promptsService, this.workspaceService, { allItems: this.allItems, displayEntries: this.displayEntries });
  }
};
AICustomizationListWidget = __decorate([
  __param(0, IInstantiationService),
  __param(1, IPromptsService),
  __param(2, IContextViewService),
  __param(3, IOpenerService),
  __param(4, IContextMenuService),
  __param(5, IMenuService),
  __param(6, IContextKeyService),
  __param(7, IWorkspaceContextService),
  __param(8, ILabelService),
  __param(9, IAICustomizationWorkspaceService),
  __param(10, IClipboardService),
  __param(11, ISCMService),
  __param(12, IHoverService),
  __param(13, IFileService),
  __param(14, IPathService)
], AICustomizationListWidget);
export {
  AICustomizationListWidget,
  sectionToPromptType
};
//# sourceMappingURL=aiCustomizationListWidget.js.map
