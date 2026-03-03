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
import "./media/aiCustomizationTreeView.css";
import * as dom from "../../../../base/browser/dom.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { basename, dirname } from "../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { localize } from "../../../../nls.js";
import { getContextMenuActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IMenuService } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { WorkbenchAsyncDataTree } from "../../../../platform/list/browser/listService.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ViewPane } from "../../../../workbench/browser/parts/views/viewPane.js";
import { IViewDescriptorService } from "../../../../workbench/common/views.js";
import { IPromptsService, PromptsStorage } from "../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js";
import { PromptsType } from "../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js";
import { agentIcon, extensionIcon, instructionsIcon, pluginIcon, promptIcon, skillIcon, userIcon, workspaceIcon } from "../../../../workbench/contrib/chat/browser/aiCustomization/aiCustomizationIcons.js";
import { AICustomizationItemMenuId } from "./aiCustomizationTreeView.js";
import { IEditorService } from "../../../../workbench/services/editor/common/editorService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IAICustomizationWorkspaceService } from "../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js";
const AICustomizationIsEmptyContextKey = new RawContextKey("aiCustomization.isEmpty", true);
const AICustomizationItemTypeContextKey = new RawContextKey("aiCustomizationItemType", "");
const ROOT_ELEMENT = /* @__PURE__ */ Symbol("root");
class AICustomizationTreeDelegate {
  static {
    __name(this, "AICustomizationTreeDelegate");
  }
  getHeight(_element) {
    return 22;
  }
  getTemplateId(element) {
    switch (element.type) {
      case "category":
        return "category";
      case "group":
        return "group";
      case "file":
        return "file";
    }
  }
}
class AICustomizationCategoryRenderer {
  static {
    __name(this, "AICustomizationCategoryRenderer");
  }
  constructor() {
    this.templateId = "category";
  }
  renderTemplate(container) {
    const element = dom.append(container, dom.$(".ai-customization-category"));
    const icon = dom.append(element, dom.$(".icon"));
    const label = dom.append(element, dom.$(".label"));
    return { container: element, icon, label };
  }
  renderElement(node, _index, templateData) {
    templateData.icon.className = "icon";
    templateData.icon.classList.add(...ThemeIcon.asClassNameArray(node.element.icon));
    templateData.label.textContent = node.element.label;
  }
  disposeTemplate(_templateData) {
  }
}
class AICustomizationGroupRenderer {
  static {
    __name(this, "AICustomizationGroupRenderer");
  }
  constructor() {
    this.templateId = "group";
  }
  renderTemplate(container) {
    const element = dom.append(container, dom.$(".ai-customization-group-header"));
    const label = dom.append(element, dom.$(".label"));
    return { container: element, label };
  }
  renderElement(node, _index, templateData) {
    templateData.label.textContent = node.element.label;
  }
  disposeTemplate(_templateData) {
  }
}
class AICustomizationFileRenderer {
  static {
    __name(this, "AICustomizationFileRenderer");
  }
  constructor() {
    this.templateId = "file";
  }
  renderTemplate(container) {
    const element = dom.append(container, dom.$(".ai-customization-tree-item"));
    const icon = dom.append(element, dom.$(".icon"));
    const name = dom.append(element, dom.$(".name"));
    return { container: element, icon, name };
  }
  renderElement(node, _index, templateData) {
    const item = node.element;
    let icon;
    switch (item.promptType) {
      case PromptsType.agent:
        icon = agentIcon;
        break;
      case PromptsType.skill:
        icon = skillIcon;
        break;
      case PromptsType.instructions:
        icon = instructionsIcon;
        break;
      case PromptsType.prompt:
      default:
        icon = promptIcon;
        break;
    }
    templateData.icon.className = "icon";
    templateData.icon.classList.add(...ThemeIcon.asClassNameArray(icon));
    templateData.name.textContent = item.name;
    const tooltip = item.description ? `${item.name} - ${item.description}` : item.name;
    templateData.container.title = tooltip;
  }
  disposeTemplate(_templateData) {
  }
}
class UnifiedAICustomizationDataSource {
  static {
    __name(this, "UnifiedAICustomizationDataSource");
  }
  constructor(promptsService, logService, onItemCountChanged) {
    this.promptsService = promptsService;
    this.logService = logService;
    this.onItemCountChanged = onItemCountChanged;
    this.cache = /* @__PURE__ */ new Map();
    this.totalItemCount = 0;
  }
  /**
   * Clears the cache. Should be called when the view refreshes.
   */
  clearCache() {
    this.cache.clear();
    this.totalItemCount = 0;
  }
  hasChildren(element) {
    if (element === ROOT_ELEMENT) {
      return true;
    }
    return element.type === "category" || element.type === "group";
  }
  async getChildren(element) {
    try {
      if (element === ROOT_ELEMENT) {
        return this.getTypeCategories();
      }
      if (element.type === "category") {
        return this.getStorageGroups(element.promptType);
      }
      if (element.type === "group") {
        return this.getFilesForStorageAndType(element.storage, element.promptType);
      }
      return [];
    } catch (error) {
      this.logService.error("[AICustomization] Error fetching tree children:", error);
      return [];
    }
  }
  getTypeCategories() {
    return [
      {
        type: "category",
        id: "category-agents",
        label: localize("customAgents", "Custom Agents"),
        promptType: PromptsType.agent,
        icon: agentIcon
      },
      {
        type: "category",
        id: "category-skills",
        label: localize("skills", "Skills"),
        promptType: PromptsType.skill,
        icon: skillIcon
      },
      {
        type: "category",
        id: "category-instructions",
        label: localize("instructions", "Instructions"),
        promptType: PromptsType.instructions,
        icon: instructionsIcon
      },
      {
        type: "category",
        id: "category-prompts",
        label: localize("prompts", "Prompts"),
        promptType: PromptsType.prompt,
        icon: promptIcon
      }
    ];
  }
  /**
   * Fetches and caches data for a prompt type, returning storage groups with items.
   */
  async getStorageGroups(promptType) {
    const groups = [];
    let cached = this.cache.get(promptType);
    if (!cached) {
      cached = {};
      this.cache.set(promptType, cached);
    }
    if (promptType === PromptsType.skill) {
      if (!cached.skills) {
        const skills = await this.promptsService.findAgentSkills(CancellationToken.None);
        cached.skills = skills || [];
        this.totalItemCount += cached.skills.length;
        this.onItemCountChanged(this.totalItemCount);
      }
      const workspaceSkills = cached.skills.filter((s) => s.storage === PromptsStorage.local);
      const userSkills = cached.skills.filter((s) => s.storage === PromptsStorage.user);
      const extensionSkills = cached.skills.filter((s) => s.storage === PromptsStorage.extension);
      if (workspaceSkills.length > 0) {
        groups.push(this.createGroupItem(promptType, PromptsStorage.local, workspaceSkills.length));
      }
      if (userSkills.length > 0) {
        groups.push(this.createGroupItem(promptType, PromptsStorage.user, userSkills.length));
      }
      if (extensionSkills.length > 0) {
        groups.push(this.createGroupItem(promptType, PromptsStorage.extension, extensionSkills.length));
      }
      return groups;
    }
    if (!cached.files) {
      const allItems = await this.promptsService.listPromptFiles(promptType, CancellationToken.None);
      const workspaceItems2 = allItems.filter((item) => item.storage === PromptsStorage.local);
      const userItems2 = allItems.filter((item) => item.storage === PromptsStorage.user);
      const extensionItems2 = allItems.filter((item) => item.storage === PromptsStorage.extension);
      cached.files = /* @__PURE__ */ new Map([
        [PromptsStorage.local, workspaceItems2],
        [PromptsStorage.user, userItems2],
        [PromptsStorage.extension, extensionItems2]
      ]);
      const itemCount = allItems.length;
      this.totalItemCount += itemCount;
      this.onItemCountChanged(this.totalItemCount);
    }
    const workspaceItems = cached.files.get(PromptsStorage.local) || [];
    const userItems = cached.files.get(PromptsStorage.user) || [];
    const extensionItems = cached.files.get(PromptsStorage.extension) || [];
    if (workspaceItems.length > 0) {
      groups.push(this.createGroupItem(promptType, PromptsStorage.local, workspaceItems.length));
    }
    if (userItems.length > 0) {
      groups.push(this.createGroupItem(promptType, PromptsStorage.user, userItems.length));
    }
    if (extensionItems.length > 0) {
      groups.push(this.createGroupItem(promptType, PromptsStorage.extension, extensionItems.length));
    }
    return groups;
  }
  /**
   * Creates a group item with consistent structure.
   */
  createGroupItem(promptType, storage, count) {
    const storageLabels = {
      [PromptsStorage.local]: localize("workspaceWithCount", "Workspace ({0})", count),
      [PromptsStorage.user]: localize("userWithCount", "User ({0})", count),
      [PromptsStorage.extension]: localize("extensionsWithCount", "Extensions ({0})", count),
      [PromptsStorage.plugin]: localize("pluginsWithCount", "Plugins ({0})", count)
    };
    const storageIcons = {
      [PromptsStorage.local]: workspaceIcon,
      [PromptsStorage.user]: userIcon,
      [PromptsStorage.extension]: extensionIcon,
      [PromptsStorage.plugin]: pluginIcon
    };
    const storageSuffixes = {
      [PromptsStorage.local]: "workspace",
      [PromptsStorage.user]: "user",
      [PromptsStorage.extension]: "extensions",
      [PromptsStorage.plugin]: "plugins"
    };
    return {
      type: "group",
      id: `group-${promptType}-${storageSuffixes[storage]}`,
      label: storageLabels[storage],
      storage,
      promptType,
      icon: storageIcons[storage]
    };
  }
  /**
   * Returns files for a specific storage/type combination from cache.
   * getStorageGroups must be called first to populate the cache.
   */
  async getFilesForStorageAndType(storage, promptType) {
    const cached = this.cache.get(promptType);
    if (promptType === PromptsType.skill) {
      const skills = cached?.skills || [];
      const filtered = skills.filter((skill) => skill.storage === storage);
      return filtered.map((skill) => {
        const skillName = skill.name || basename(dirname(skill.uri)) || basename(skill.uri);
        return {
          type: "file",
          id: skill.uri.toString(),
          uri: skill.uri,
          name: skillName,
          description: skill.description,
          storage: skill.storage,
          promptType
        };
      });
    }
    const items = [...cached?.files?.get(storage) || []];
    return items.map((item) => ({
      type: "file",
      id: item.uri.toString(),
      uri: item.uri,
      name: item.name || basename(item.uri),
      description: item.description,
      storage: item.storage,
      promptType
    }));
  }
}
let AICustomizationViewPane = class AICustomizationViewPane2 extends ViewPane {
  static {
    __name(this, "AICustomizationViewPane");
  }
  static {
    this.ID = "aiCustomization.view";
  }
  constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, promptsService, editorService, menuService, logService, workspaceContextService, workspaceService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.promptsService = promptsService;
    this.editorService = editorService;
    this.menuService = menuService;
    this.logService = logService;
    this.workspaceContextService = workspaceContextService;
    this.workspaceService = workspaceService;
    this.treeDisposables = this._register(new DisposableStore());
    this.isEmptyContextKey = AICustomizationIsEmptyContextKey.bindTo(contextKeyService);
    this.itemTypeContextKey = AICustomizationItemTypeContextKey.bindTo(contextKeyService);
    this._register(this.promptsService.onDidChangeCustomAgents(() => this.refresh()));
    this._register(this.promptsService.onDidChangeSlashCommands(() => this.refresh()));
    this._register(this.workspaceContextService.onDidChangeWorkspaceFolders(() => this.refresh()));
    this._register(autorun((reader) => {
      this.workspaceService.activeProjectRoot.read(reader);
      this.refresh();
    }));
  }
  renderBody(container) {
    super.renderBody(container);
    container.classList.add("ai-customization-view");
    this.treeContainer = dom.append(container, dom.$(".tree-container"));
    this.createTree();
  }
  createTree() {
    if (!this.treeContainer) {
      return;
    }
    this.dataSource = new UnifiedAICustomizationDataSource(this.promptsService, this.logService, (count) => this.isEmptyContextKey.set(count === 0));
    this.tree = this.treeDisposables.add(this.instantiationService.createInstance(WorkbenchAsyncDataTree, "AICustomization", this.treeContainer, new AICustomizationTreeDelegate(), [
      new AICustomizationCategoryRenderer(),
      new AICustomizationGroupRenderer(),
      new AICustomizationFileRenderer()
    ], this.dataSource, {
      identityProvider: {
        getId: /* @__PURE__ */ __name((element) => element.id, "getId")
      },
      accessibilityProvider: {
        getAriaLabel: /* @__PURE__ */ __name((element) => {
          if (element.type === "category") {
            return element.label;
          }
          if (element.type === "group") {
            return element.label;
          }
          return element.description ? localize("fileAriaLabel", "{0}, {1}", element.name, element.description) : element.name;
        }, "getAriaLabel"),
        getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize("aiCustomizationTree", "Chat Customization Items"), "getWidgetAriaLabel")
      },
      keyboardNavigationLabelProvider: {
        getKeyboardNavigationLabel: /* @__PURE__ */ __name((element) => {
          if (element.type === "file") {
            return element.name;
          }
          return element.label;
        }, "getKeyboardNavigationLabel")
      }
    }));
    this.treeDisposables.add(this.tree.onDidOpen((e) => {
      if (e.element && e.element.type === "file") {
        this.editorService.openEditor({
          resource: e.element.uri
        });
      }
    }));
    this.treeDisposables.add(this.tree.onContextMenu((e) => this.onContextMenu(e)));
    void this.tree.setInput(ROOT_ELEMENT).then(() => this.autoExpandCategories());
  }
  async autoExpandCategories() {
    if (!this.tree) {
      return;
    }
    const rootNode = this.tree.getNode(ROOT_ELEMENT);
    for (const child of rootNode.children) {
      if (child.element !== ROOT_ELEMENT) {
        await this.tree.expand(child.element);
      }
    }
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this.tree?.layout(height, width);
  }
  refresh() {
    this.dataSource?.clearCache();
    this.isEmptyContextKey.set(true);
    void this.tree?.setInput(ROOT_ELEMENT).then(() => this.autoExpandCategories());
  }
  collapseAll() {
    this.tree?.collapseAll();
  }
  expandAll() {
    this.tree?.expandAll();
  }
  onContextMenu(e) {
    if (!e.element || e.element.type !== "file") {
      return;
    }
    const element = e.element;
    this.itemTypeContextKey.set(element.promptType);
    const context = {
      uri: element.uri.toString(),
      name: element.name,
      promptType: element.promptType
    };
    const menu = this.menuService.getMenuActions(AICustomizationItemMenuId, this.contextKeyService, { arg: context, shouldForwardArgs: true });
    const { secondary } = getContextMenuActions(menu, "inline");
    if (secondary.length > 0) {
      this.contextMenuService.showContextMenu({
        getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
        getActions: /* @__PURE__ */ __name(() => secondary, "getActions"),
        getActionsContext: /* @__PURE__ */ __name(() => context, "getActionsContext"),
        onHide: /* @__PURE__ */ __name(() => {
          this.itemTypeContextKey.reset();
        }, "onHide")
      });
    }
  }
};
AICustomizationViewPane = __decorate([
  __param(1, IKeybindingService),
  __param(2, IContextMenuService),
  __param(3, IConfigurationService),
  __param(4, IContextKeyService),
  __param(5, IViewDescriptorService),
  __param(6, IInstantiationService),
  __param(7, IOpenerService),
  __param(8, IThemeService),
  __param(9, IHoverService),
  __param(10, IPromptsService),
  __param(11, IEditorService),
  __param(12, IMenuService),
  __param(13, ILogService),
  __param(14, IWorkspaceContextService),
  __param(15, IAICustomizationWorkspaceService)
], AICustomizationViewPane);
export {
  AICustomizationIsEmptyContextKey,
  AICustomizationItemTypeContextKey,
  AICustomizationViewPane
};
//# sourceMappingURL=aiCustomizationTreeViewViews.js.map
