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
import * as DOM from "../../../../base/browser/dom.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { autorun } from "../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { localize } from "../../../../nls.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ViewPane } from "../../../../workbench/browser/parts/views/viewPane.js";
import { IViewDescriptorService } from "../../../../workbench/common/views.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IPromptsService } from "../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js";
import { PromptsType } from "../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js";
import { AICustomizationManagementSection } from "../../../../workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagement.js";
import { AICustomizationManagementEditorInput } from "../../../../workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagementEditorInput.js";
import { AICustomizationManagementEditor } from "../../../../workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagementEditor.js";
import { agentIcon, instructionsIcon, mcpServerIcon, pluginIcon, promptIcon, skillIcon } from "../../../../workbench/contrib/chat/browser/aiCustomization/aiCustomizationIcons.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IAICustomizationWorkspaceService } from "../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js";
import { IEditorService, MODAL_GROUP } from "../../../../workbench/services/editor/common/editorService.js";
import { IMcpService } from "../../../../workbench/contrib/mcp/common/mcpTypes.js";
import { IAgentPluginService } from "../../../../workbench/contrib/chat/common/plugins/agentPluginService.js";
const $ = DOM.$;
const AI_CUSTOMIZATION_OVERVIEW_VIEW_ID = "workbench.view.aiCustomizationOverview";
let AICustomizationOverviewView = class AICustomizationOverviewView2 extends ViewPane {
  static {
    __name(this, "AICustomizationOverviewView");
  }
  constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, editorService, promptsService, workspaceContextService, workspaceService, mcpService, agentPluginService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.editorService = editorService;
    this.promptsService = promptsService;
    this.workspaceContextService = workspaceContextService;
    this.workspaceService = workspaceService;
    this.mcpService = mcpService;
    this.agentPluginService = agentPluginService;
    this.sections = [];
    this.countElements = /* @__PURE__ */ new Map();
    this.sections.push({ id: AICustomizationManagementSection.Agents, label: localize("agents", "Agents"), icon: agentIcon, count: 0 }, { id: AICustomizationManagementSection.Skills, label: localize("skills", "Skills"), icon: skillIcon, count: 0 }, { id: AICustomizationManagementSection.Instructions, label: localize("instructions", "Instructions"), icon: instructionsIcon, count: 0 }, { id: AICustomizationManagementSection.Prompts, label: localize("prompts", "Prompts"), icon: promptIcon, count: 0 }, { id: AICustomizationManagementSection.McpServers, label: localize("mcpServers", "MCP Servers"), icon: mcpServerIcon, count: 0 }, { id: AICustomizationManagementSection.Plugins, label: localize("plugins", "Plugins"), icon: pluginIcon, count: 0 });
    this._register(this.promptsService.onDidChangeCustomAgents(() => this.loadCounts()));
    this._register(this.promptsService.onDidChangeSlashCommands(() => this.loadCounts()));
    this._register(this.workspaceContextService.onDidChangeWorkspaceFolders(() => this.loadCounts()));
    this._register(autorun((reader) => {
      this.workspaceService.activeProjectRoot.read(reader);
      this.loadCounts();
    }));
  }
  renderBody(container) {
    super.renderBody(container);
    this.bodyElement = container;
    this.container = DOM.append(container, $(".ai-customization-overview"));
    this.sectionsContainer = DOM.append(this.container, $(".overview-sections"));
    this.renderSections();
    void this.loadCounts();
    this.layoutBody(this.bodyElement.offsetHeight, this.bodyElement.offsetWidth);
  }
  renderSections() {
    DOM.clearNode(this.sectionsContainer);
    this.countElements.clear();
    for (const section of this.sections) {
      const sectionElement = DOM.append(this.sectionsContainer, $(".overview-section"));
      sectionElement.tabIndex = 0;
      sectionElement.setAttribute("role", "button");
      sectionElement.setAttribute("aria-label", `${section.label}: ${section.count} items`);
      const iconElement = DOM.append(sectionElement, $(".section-icon"));
      iconElement.classList.add(...ThemeIcon.asClassNameArray(section.icon));
      const textContainer = DOM.append(sectionElement, $(".section-text"));
      const labelElement = DOM.append(textContainer, $(".section-label"));
      labelElement.textContent = section.label;
      const countElement = DOM.append(sectionElement, $(".section-count"));
      countElement.textContent = `${section.count}`;
      this.countElements.set(section.id, countElement);
      this._register(DOM.addDisposableListener(sectionElement, "click", () => {
        this.openSection(section.id);
      }));
      this._register(DOM.addDisposableListener(sectionElement, "keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.openSection(section.id);
        }
      }));
      this._register(this.hoverService.setupDelayedHoverAtMouse(sectionElement, () => ({
        content: localize("openSection", "Open {0} in Chat Customizations editor", section.label),
        appearance: { compact: true, skipFadeInAnimation: true }
      })));
    }
  }
  async loadCounts() {
    const sectionPromptTypes = [
      { section: AICustomizationManagementSection.Agents, type: PromptsType.agent },
      { section: AICustomizationManagementSection.Skills, type: PromptsType.skill },
      { section: AICustomizationManagementSection.Instructions, type: PromptsType.instructions },
      { section: AICustomizationManagementSection.Prompts, type: PromptsType.prompt }
    ];
    await Promise.all(sectionPromptTypes.map(async ({ section, type }) => {
      let count = 0;
      if (type === PromptsType.skill) {
        const skills = await this.promptsService.findAgentSkills(CancellationToken.None);
        if (skills) {
          count = skills.length;
        }
      } else {
        const allItems = await this.promptsService.listPromptFiles(type, CancellationToken.None);
        count = allItems.length;
      }
      const sectionData = this.sections.find((s) => s.id === section);
      if (sectionData) {
        sectionData.count = count;
      }
    }));
    const mcpSection = this.sections.find((s) => s.id === AICustomizationManagementSection.McpServers);
    if (mcpSection) {
      this._register(autorun((reader) => {
        const servers = this.mcpService.servers.read(reader);
        mcpSection.count = servers.length;
        this.updateCountElements();
      }));
    }
    const pluginSection = this.sections.find((s) => s.id === AICustomizationManagementSection.Plugins);
    if (pluginSection) {
      this._register(autorun((reader) => {
        const plugins = this.agentPluginService.plugins.read(reader);
        pluginSection.count = plugins.length;
        this.updateCountElements();
      }));
    }
    this.updateCountElements();
  }
  updateCountElements() {
    for (const section of this.sections) {
      const countElement = this.countElements.get(section.id);
      if (countElement) {
        countElement.textContent = `${section.count}`;
      }
    }
  }
  async openSection(sectionId) {
    const input = AICustomizationManagementEditorInput.getOrCreate();
    const editor = await this.editorService.openEditor(input, { pinned: true }, MODAL_GROUP);
    if (editor instanceof AICustomizationManagementEditor) {
      editor.selectSectionById(sectionId);
    }
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this.container.style.height = `${height}px`;
  }
};
AICustomizationOverviewView = __decorate([
  __param(1, IKeybindingService),
  __param(2, IContextMenuService),
  __param(3, IConfigurationService),
  __param(4, IContextKeyService),
  __param(5, IViewDescriptorService),
  __param(6, IInstantiationService),
  __param(7, IOpenerService),
  __param(8, IThemeService),
  __param(9, IHoverService),
  __param(10, IEditorService),
  __param(11, IPromptsService),
  __param(12, IWorkspaceContextService),
  __param(13, IAICustomizationWorkspaceService),
  __param(14, IMcpService),
  __param(15, IAgentPluginService)
], AICustomizationOverviewView);
export {
  AICustomizationOverviewView,
  AI_CUSTOMIZATION_OVERVIEW_VIEW_ID
};
//# sourceMappingURL=aiCustomizationOverviewView.js.map
