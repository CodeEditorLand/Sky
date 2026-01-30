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
import { localize } from "../../../../nls.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { EditorPaneDescriptor } from "../../../browser/editor.js";
import { EditorExtensions } from "../../../common/editor.js";
import { IEditorResolverService, RegisteredEditorPriority } from "../../../services/editor/common/editorResolverService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { AgentSessionsWelcomeInput } from "./agentSessionsWelcomeInput.js";
import { AgentSessionsWelcomePage, AgentSessionsWelcomeInputSerializer } from "./agentSessionsWelcome.js";
const agentSessionsWelcomeInputTypeId = "workbench.editors.agentSessionsWelcomeInput";
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(agentSessionsWelcomeInputTypeId, AgentSessionsWelcomeInputSerializer);
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(AgentSessionsWelcomePage, AgentSessionsWelcomePage.ID, localize("agentSessionsWelcome", "Agent Sessions Welcome")), [
  new SyncDescriptor(AgentSessionsWelcomeInput)
]);
let AgentSessionsWelcomeEditorResolverContribution = class AgentSessionsWelcomeEditorResolverContribution2 extends Disposable {
  static {
    __name(this, "AgentSessionsWelcomeEditorResolverContribution");
  }
  static {
    this.ID = "workbench.contrib.agentSessionsWelcomeEditorResolver";
  }
  constructor(editorResolverService, instantiationService) {
    super();
    this._register(editorResolverService.registerEditor(`${AgentSessionsWelcomeInput.RESOURCE.scheme}:${AgentSessionsWelcomeInput.RESOURCE.authority}/**`, {
      id: AgentSessionsWelcomePage.ID,
      label: localize("agentSessionsWelcome.displayName", "Agent Sessions Welcome"),
      priority: RegisteredEditorPriority.builtin
    }, {
      singlePerResource: true,
      canSupportResource: /* @__PURE__ */ __name((resource) => resource.scheme === AgentSessionsWelcomeInput.RESOURCE.scheme && resource.authority === AgentSessionsWelcomeInput.RESOURCE.authority, "canSupportResource")
    }, {
      createEditorInput: /* @__PURE__ */ __name(() => {
        return {
          editor: instantiationService.createInstance(AgentSessionsWelcomeInput, {})
        };
      }, "createEditorInput")
    }));
  }
};
AgentSessionsWelcomeEditorResolverContribution = __decorate([
  __param(0, IEditorResolverService),
  __param(1, IInstantiationService)
], AgentSessionsWelcomeEditorResolverContribution);
CommandsRegistry.registerCommand("workbench.action.openAgentSessionsWelcome", (accessor) => {
  const editorService = accessor.get(IEditorService);
  const instantiationService = accessor.get(IInstantiationService);
  const input = instantiationService.createInstance(AgentSessionsWelcomeInput, {});
  return editorService.openEditor(input, { pinned: true });
});
let AgentSessionsWelcomeRunnerContribution = class AgentSessionsWelcomeRunnerContribution2 extends Disposable {
  static {
    __name(this, "AgentSessionsWelcomeRunnerContribution");
  }
  static {
    this.ID = "workbench.contrib.agentSessionsWelcomeRunner";
  }
  constructor(configurationService, editorService, editorGroupsService, instantiationService) {
    super();
    this.configurationService = configurationService;
    this.editorService = editorService;
    this.editorGroupsService = editorGroupsService;
    this.instantiationService = instantiationService;
    this.run();
  }
  async run() {
    const startupEditor = this.configurationService.getValue("workbench.startupEditor");
    if (startupEditor !== "agentSessionsWelcomePage") {
      return;
    }
    await this.editorGroupsService.whenReady;
    if (this.editorService.activeEditor) {
      return;
    }
    const input = this.instantiationService.createInstance(AgentSessionsWelcomeInput, {});
    await this.editorService.openEditor(input, { pinned: false });
  }
};
AgentSessionsWelcomeRunnerContribution = __decorate([
  __param(0, IConfigurationService),
  __param(1, IEditorService),
  __param(2, IEditorGroupsService),
  __param(3, IInstantiationService)
], AgentSessionsWelcomeRunnerContribution);
registerWorkbenchContribution2(
  AgentSessionsWelcomeEditorResolverContribution.ID,
  AgentSessionsWelcomeEditorResolverContribution,
  1
  /* WorkbenchPhase.BlockStartup */
);
registerWorkbenchContribution2(
  AgentSessionsWelcomeRunnerContribution.ID,
  AgentSessionsWelcomeRunnerContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
//# sourceMappingURL=agentSessionsWelcome.contribution.js.map
