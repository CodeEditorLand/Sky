var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { toAction } from "../../../../../base/common/actions.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { observableValue } from "../../../../../base/common/observable.js";
import { URI } from "../../../../../base/common/uri.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { IActionViewItemService } from "../../../../../platform/actions/browser/actionViewItemService.js";
import { IMenuService, isIMenuItem, MenuId, MenuRegistry } from "../../../../../platform/actions/common/actions.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { IPromptsService, PromptsStorage } from "../../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js";
import { PromptsType } from "../../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js";
import { ILanguageModelsService } from "../../../../../workbench/contrib/chat/common/languageModels.js";
import { IMcpService } from "../../../../../workbench/contrib/mcp/common/mcpTypes.js";
import { IAICustomizationWorkspaceService } from "../../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js";
import { IAgentPluginService } from "../../../../../workbench/contrib/chat/common/plugins/agentPluginService.js";
import { createEditorServices, defineComponentFixture, defineThemedFixtureGroup, registerWorkbenchServices } from "../../../../../workbench/test/browser/componentFixtures/fixtureUtils.js";
import { AICustomizationShortcutsWidget } from "../../browser/aiCustomizationShortcutsWidget.js";
import { CUSTOMIZATION_ITEMS, CustomizationLinkViewItem } from "../../browser/customizationsToolbar.contribution.js";
import { ISessionsManagementService } from "../../browser/sessionsManagementService.js";
import { Menus } from "../../../../browser/menus.js";
import "../../../../common/theme.js";
import "../../../../../platform/theme/common/colors/inputColors.js";
const menuRegistrations = new DisposableStore();
for (const [index, config] of CUSTOMIZATION_ITEMS.entries()) {
  menuRegistrations.add(MenuRegistry.appendMenuItem(Menus.SidebarCustomizations, {
    command: { id: config.id, title: config.label },
    group: "navigation",
    order: index + 1
  }));
}
class FixtureMenuService {
  static {
    __name(this, "FixtureMenuService");
  }
  createMenu(id) {
    return {
      onDidChange: Event.None,
      dispose: /* @__PURE__ */ __name(() => {
      }, "dispose"),
      getActions: /* @__PURE__ */ __name(() => {
        const items = MenuRegistry.getMenuItems(id).filter(isIMenuItem);
        items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const actions = items.map((item) => {
          const title = typeof item.command.title === "string" ? item.command.title : item.command.title.value;
          return toAction({ id: item.command.id, label: title, run: /* @__PURE__ */ __name(() => {
          }, "run") });
        });
        return actions.length ? [["navigation", actions]] : [];
      }, "getActions")
    };
  }
  getMenuActions(_id, _contextKeyService, _options) {
    return [];
  }
  getMenuContexts() {
    return /* @__PURE__ */ new Set();
  }
  resetHiddenStates() {
  }
}
class FixtureActionViewItemService {
  static {
    __name(this, "FixtureActionViewItemService");
  }
  constructor() {
    this._providers = /* @__PURE__ */ new Map();
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
  }
  register(menu, commandId, provider) {
    const key = `${menu.id}/${commandId instanceof MenuId ? commandId.id : commandId}`;
    this._providers.set(key, provider);
    return { dispose: /* @__PURE__ */ __name(() => {
      this._providers.delete(key);
    }, "dispose") };
  }
  lookUp(menu, commandId) {
    const key = `${menu.id}/${commandId instanceof MenuId ? commandId.id : commandId}`;
    return this._providers.get(key);
  }
}
const defaultFilter = {
  sources: [PromptsStorage.local, PromptsStorage.user, PromptsStorage.extension]
};
function createMockPromptsService() {
  return createMockPromptsServiceWithCounts();
}
__name(createMockPromptsService, "createMockPromptsService");
function createMockPromptsServiceWithCounts(counts) {
  const fakeUri = /* @__PURE__ */ __name((prefix, i) => URI.parse(`file:///mock/${prefix}-${i}.md`), "fakeUri");
  const fakeItem = /* @__PURE__ */ __name((prefix, i) => ({ uri: fakeUri(prefix, i), storage: PromptsStorage.local }), "fakeItem");
  const agents = Array.from({ length: counts?.agents ?? 0 }, (_, i) => ({
    uri: fakeUri("agent", i),
    source: { storage: PromptsStorage.local }
  }));
  const skills = Array.from({ length: counts?.skills ?? 0 }, (_, i) => fakeItem("skill", i));
  const prompts = Array.from({ length: counts?.prompts ?? 0 }, (_, i) => ({
    promptPath: { uri: fakeUri("prompt", i), storage: PromptsStorage.local, type: PromptsType.prompt }
  }));
  const instructions = Array.from({ length: counts?.instructions ?? 0 }, (_, i) => fakeItem("instructions", i));
  const hooks = Array.from({ length: counts?.hooks ?? 0 }, (_, i) => fakeItem("hook", i));
  return new class extends mock() {
    constructor() {
      super(...arguments);
      this.onDidChangeCustomAgents = Event.None;
      this.onDidChangeSlashCommands = Event.None;
    }
    async getCustomAgents() {
      return agents;
    }
    async findAgentSkills() {
      return skills;
    }
    async getPromptSlashCommands() {
      return prompts;
    }
    async listPromptFiles(type) {
      return type === PromptsType.hook ? hooks : instructions;
    }
    async listAgentInstructions() {
      return [];
    }
  }();
}
__name(createMockPromptsServiceWithCounts, "createMockPromptsServiceWithCounts");
function createMockMcpService(serverCount = 0) {
  const MockServer = mock();
  const servers = observableValue("mockMcpServers", Array.from({ length: serverCount }, () => new MockServer()));
  return new class extends mock() {
    constructor() {
      super(...arguments);
      this.servers = servers;
    }
  }();
}
__name(createMockMcpService, "createMockMcpService");
function createMockWorkspaceService() {
  const activeProjectRoot = observableValue("mockActiveProjectRoot", void 0);
  return new class extends mock() {
    constructor() {
      super(...arguments);
      this.activeProjectRoot = activeProjectRoot;
    }
    getActiveProjectRoot() {
      return void 0;
    }
    getStorageSourceFilter() {
      return defaultFilter;
    }
  }();
}
__name(createMockWorkspaceService, "createMockWorkspaceService");
function createMockWorkspaceContextService() {
  return new class extends mock() {
    constructor() {
      super(...arguments);
      this.onDidChangeWorkspaceFolders = Event.None;
    }
    getWorkspace() {
      return { id: "test", folders: [] };
    }
  }();
}
__name(createMockWorkspaceContextService, "createMockWorkspaceContextService");
function renderWidget(ctx, options) {
  ctx.container.style.width = "300px";
  ctx.container.style.backgroundColor = "var(--vscode-sideBar-background)";
  const actionViewItemService = new FixtureActionViewItemService();
  const instantiationService = createEditorServices(ctx.disposableStore, {
    colorTheme: ctx.theme,
    additionalServices: /* @__PURE__ */ __name((reg) => {
      reg.defineInstance(IMenuService, new FixtureMenuService());
      reg.defineInstance(IActionViewItemService, actionViewItemService);
      registerWorkbenchServices(reg);
      reg.defineInstance(IPromptsService, options?.counts ? createMockPromptsServiceWithCounts(options.counts) : createMockPromptsService());
      reg.defineInstance(IMcpService, createMockMcpService(options?.mcpServerCount ?? 0));
      reg.defineInstance(IAICustomizationWorkspaceService, createMockWorkspaceService());
      reg.defineInstance(IWorkspaceContextService, createMockWorkspaceContextService());
      reg.defineInstance(IAgentPluginService, new class extends mock() {
        constructor() {
          super(...arguments);
          this.plugins = observableValue("mockPlugins", []);
        }
      }());
      reg.defineInstance(ILanguageModelsService, new class extends mock() {
        constructor() {
          super(...arguments);
          this.onDidChangeLanguageModels = Event.None;
        }
      }());
      reg.defineInstance(ISessionsManagementService, new class extends mock() {
        constructor() {
          super(...arguments);
          this.activeSession = observableValue("activeSession", void 0);
        }
      }());
      reg.defineInstance(IFileService, new class extends mock() {
        constructor() {
          super(...arguments);
          this.onDidFilesChange = Event.None;
        }
      }());
    }, "additionalServices")
  });
  for (const config of CUSTOMIZATION_ITEMS) {
    ctx.disposableStore.add(actionViewItemService.register(Menus.SidebarCustomizations, config.id, (action, options2) => {
      return instantiationService.createInstance(CustomizationLinkViewItem, action, options2, config);
    }));
  }
  if (options?.collapsed) {
    const storageService = instantiationService.get(IStorageService);
    instantiationService.set(IStorageService, new class extends mock() {
      getBoolean(key, scope, fallbackValue) {
        if (key === "agentSessions.customizationsCollapsed") {
          return true;
        }
        return storageService.getBoolean(key, scope, fallbackValue);
      }
      store() {
      }
    }());
  }
  ctx.disposableStore.add(instantiationService.createInstance(AICustomizationShortcutsWidget, ctx.container, void 0));
}
__name(renderWidget, "renderWidget");
var aiCustomizationShortcutsWidget_fixture_default = defineThemedFixtureGroup({ path: "sessions/" }, {
  Expanded: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderWidget(ctx), "render")
  }),
  Collapsed: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderWidget(ctx, { collapsed: true }), "render")
  }),
  WithMcpServers: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderWidget(ctx, { mcpServerCount: 3 }), "render")
  }),
  CollapsedWithMcpServers: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderWidget(ctx, { mcpServerCount: 3, collapsed: true }), "render")
  }),
  WithCounts: defineComponentFixture({
    labels: { kind: "screenshot" },
    render: /* @__PURE__ */ __name((ctx) => renderWidget(ctx, {
      mcpServerCount: 2,
      counts: { agents: 2, skills: 30, instructions: 16, prompts: 17, hooks: 4 }
    }), "render")
  })
});
export {
  aiCustomizationShortcutsWidget_fixture_default as default
};
//# sourceMappingURL=aiCustomizationShortcutsWidget.fixture.js.map
