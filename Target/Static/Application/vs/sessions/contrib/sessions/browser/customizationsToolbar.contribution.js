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
import "../../../browser/media/sidebarActionButton.css";
import "./media/customizationsToolbar.css";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { localize, localize2 } from "../../../../nls.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IActionViewItemService } from "../../../../platform/actions/browser/actionViewItemService.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { registerWorkbenchContribution2 } from "../../../../workbench/common/contributions.js";
import { AICustomizationManagementEditor } from "../../../../workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagementEditor.js";
import { AICustomizationManagementSection } from "../../../../workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagement.js";
import { AICustomizationManagementEditorInput } from "../../../../workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagementEditorInput.js";
import { IPromptsService, PromptsStorage } from "../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js";
import { PromptsType } from "../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js";
import { ILanguageModelsService } from "../../../../workbench/contrib/chat/common/languageModels.js";
import { IMcpService } from "../../../../workbench/contrib/mcp/common/mcpTypes.js";
import { Menus } from "../../../browser/menus.js";
import { agentIcon, instructionsIcon, promptIcon, skillIcon, hookIcon, workspaceIcon, userIcon } from "../../../../workbench/contrib/chat/browser/aiCustomization/aiCustomizationIcons.js";
import { ActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { $, append } from "../../../../base/browser/dom.js";
import { autorun } from "../../../../base/common/observable.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ISessionsManagementService } from "./sessionsManagementService.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { defaultButtonStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { getSourceCounts, getSourceCountsTotal } from "./customizationCounts.js";
import { IEditorService, MODAL_GROUP } from "../../../../workbench/services/editor/common/editorService.js";
import { IAICustomizationWorkspaceService } from "../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js";
const CUSTOMIZATION_ITEMS = [
  {
    id: "sessions.customization.agents",
    label: localize("agents", "Agents"),
    icon: agentIcon,
    section: AICustomizationManagementSection.Agents,
    promptType: PromptsType.agent
  },
  {
    id: "sessions.customization.skills",
    label: localize("skills", "Skills"),
    icon: skillIcon,
    section: AICustomizationManagementSection.Skills,
    promptType: PromptsType.skill
  },
  {
    id: "sessions.customization.instructions",
    label: localize("instructions", "Instructions"),
    icon: instructionsIcon,
    section: AICustomizationManagementSection.Instructions,
    promptType: PromptsType.instructions
  },
  {
    id: "sessions.customization.prompts",
    label: localize("prompts", "Prompts"),
    icon: promptIcon,
    section: AICustomizationManagementSection.Prompts,
    promptType: PromptsType.prompt
  },
  {
    id: "sessions.customization.hooks",
    label: localize("hooks", "Hooks"),
    icon: hookIcon,
    section: AICustomizationManagementSection.Hooks,
    promptType: PromptsType.hook
  }
  // TODO: Re-enable MCP Servers once CLI MCP configuration is unified with VS Code
];
let CustomizationLinkViewItem = class CustomizationLinkViewItem2 extends ActionViewItem {
  static {
    __name(this, "CustomizationLinkViewItem");
  }
  constructor(action, options, _config, _promptsService, _languageModelsService, _mcpService, _workspaceContextService, _activeSessionService, _workspaceService) {
    super(void 0, action, { ...options, icon: false, label: false });
    this._config = _config;
    this._promptsService = _promptsService;
    this._languageModelsService = _languageModelsService;
    this._mcpService = _mcpService;
    this._workspaceContextService = _workspaceContextService;
    this._activeSessionService = _activeSessionService;
    this._workspaceService = _workspaceService;
    this._updateCountsRequestId = 0;
    this._viewItemDisposables = this._register(new DisposableStore());
  }
  getTooltip() {
    return void 0;
  }
  render(container) {
    super.render(container);
    container.classList.add("customization-link-widget", "sidebar-action");
    const buttonContainer = append(container, $(".customization-link-button-container"));
    this._button = this._viewItemDisposables.add(new Button(buttonContainer, {
      ...defaultButtonStyles,
      secondary: true,
      title: false,
      supportIcons: true,
      buttonSecondaryBackground: "transparent",
      buttonSecondaryHoverBackground: void 0,
      buttonSecondaryForeground: void 0,
      buttonSecondaryBorder: void 0
    }));
    this._button.element.classList.add("customization-link-button", "sidebar-action-button");
    this._button.label = `$(${this._config.icon.id}) ${this._config.label}`;
    this._viewItemDisposables.add(this._button.onDidClick(() => {
      this._action.run();
    }));
    this._countContainer = append(this._button.element, $("span.customization-link-counts"));
    this._viewItemDisposables.add(this._promptsService.onDidChangeCustomAgents(() => this._updateCounts()));
    this._viewItemDisposables.add(this._promptsService.onDidChangeSlashCommands(() => this._updateCounts()));
    this._viewItemDisposables.add(this._languageModelsService.onDidChangeLanguageModels(() => this._updateCounts()));
    this._viewItemDisposables.add(autorun((reader) => {
      this._mcpService.servers.read(reader);
      this._updateCounts();
    }));
    this._viewItemDisposables.add(this._workspaceContextService.onDidChangeWorkspaceFolders(() => this._updateCounts()));
    this._viewItemDisposables.add(autorun((reader) => {
      this._activeSessionService.activeSession.read(reader);
      this._updateCounts();
    }));
    this._updateCounts();
  }
  async _updateCounts() {
    if (!this._countContainer) {
      return;
    }
    const requestId = ++this._updateCountsRequestId;
    if (this._config.promptType) {
      const type = this._config.promptType;
      const filter = this._workspaceService.getStorageSourceFilter(type);
      const counts = await getSourceCounts(this._promptsService, type, filter, this._workspaceContextService, this._workspaceService);
      if (requestId !== this._updateCountsRequestId) {
        return;
      }
      this._renderSourceCounts(this._countContainer, counts);
    } else if (this._config.getCount) {
      const count = await this._config.getCount(this._languageModelsService, this._mcpService);
      if (requestId !== this._updateCountsRequestId) {
        return;
      }
      this._renderSimpleCount(this._countContainer, count);
    }
  }
  _renderSourceCounts(container, counts) {
    container.textContent = "";
    const type = this._config.promptType;
    const filter = type ? this._workspaceService.getStorageSourceFilter(type) : this._workspaceService.getStorageSourceFilter(PromptsType.prompt);
    const total = getSourceCountsTotal(counts, filter);
    container.classList.toggle("hidden", total === 0);
    if (total === 0) {
      return;
    }
    const visibleSourcesSet = new Set(filter.sources);
    const sources = [
      { storage: PromptsStorage.local, count: counts.workspace, icon: workspaceIcon, title: localize("workspaceCount", "{0} from workspace", counts.workspace) },
      { storage: PromptsStorage.user, count: counts.user, icon: userIcon, title: localize("userCount", "{0} from user", counts.user) }
    ];
    for (const source of sources) {
      if (source.count === 0 || !visibleSourcesSet.has(source.storage)) {
        continue;
      }
      const badge = append(container, $("span.source-count-badge"));
      badge.title = source.title;
      const icon = append(badge, $("span.source-count-icon"));
      icon.classList.add(...ThemeIcon.asClassNameArray(source.icon));
      const num = append(badge, $("span.source-count-num"));
      num.textContent = `${source.count}`;
    }
  }
  _renderSimpleCount(container, count) {
    container.textContent = "";
    container.classList.toggle("hidden", count === 0);
    if (count > 0) {
      const badge = append(container, $("span.source-count-badge"));
      const num = append(badge, $("span.source-count-num"));
      num.textContent = `${count}`;
    }
  }
};
CustomizationLinkViewItem = __decorate([
  __param(3, IPromptsService),
  __param(4, ILanguageModelsService),
  __param(5, IMcpService),
  __param(6, IWorkspaceContextService),
  __param(7, ISessionsManagementService),
  __param(8, IAICustomizationWorkspaceService)
], CustomizationLinkViewItem);
let CustomizationsToolbarContribution = class CustomizationsToolbarContribution2 extends Disposable {
  static {
    __name(this, "CustomizationsToolbarContribution");
  }
  static {
    this.ID = "workbench.contrib.sessionsCustomizationsToolbar";
  }
  constructor(actionViewItemService, instantiationService) {
    super();
    for (const [index, config] of CUSTOMIZATION_ITEMS.entries()) {
      this._register(actionViewItemService.register(Menus.SidebarCustomizations, config.id, (action, options) => {
        return instantiationService.createInstance(CustomizationLinkViewItem, action, options, config);
      }, void 0));
      this._register(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: config.id,
            title: localize2("customizationAction", "{0}", config.label),
            menu: {
              id: Menus.SidebarCustomizations,
              group: "navigation",
              order: index + 1
            }
          });
        }
        async run(accessor) {
          const editorService = accessor.get(IEditorService);
          const input = AICustomizationManagementEditorInput.getOrCreate();
          const editor = await editorService.openEditor(input, { pinned: true }, MODAL_GROUP);
          if (editor instanceof AICustomizationManagementEditor) {
            editor.selectSectionById(config.section);
          }
        }
      }));
    }
  }
};
CustomizationsToolbarContribution = __decorate([
  __param(0, IActionViewItemService),
  __param(1, IInstantiationService)
], CustomizationsToolbarContribution);
registerWorkbenchContribution2(
  CustomizationsToolbarContribution.ID,
  CustomizationsToolbarContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
//# sourceMappingURL=customizationsToolbar.contribution.js.map
