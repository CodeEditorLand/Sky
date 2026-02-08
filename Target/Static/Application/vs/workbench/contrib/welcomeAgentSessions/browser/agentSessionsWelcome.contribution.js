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
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { AuxiliaryBarMaximizedContext } from "../../../common/contextkeys.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { AgentSessionsWelcomeInput } from "./agentSessionsWelcomeInput.js";
import { AgentSessionsWelcomePage, AgentSessionsWelcomeInputSerializer } from "./agentSessionsWelcome.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ChatContextKeys } from "../../chat/common/actions/chatContextKeys.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IChatEntitlementService } from "../../../services/chat/common/chatEntitlementService.js";
const agentSessionsWelcomeInputTypeId = "workbench.editors.agentSessionsWelcomeInput";
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(agentSessionsWelcomeInputTypeId, AgentSessionsWelcomeInputSerializer);
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(AgentSessionsWelcomePage, AgentSessionsWelcomePage.ID, localize("agentSessionsWelcome", "Agent Sessions Welcome")), [
  new SyncDescriptor(AgentSessionsWelcomeInput)
]);
const getWorkspaceKind = /* @__PURE__ */ __name((workspaceContextService) => {
  const state = workspaceContextService.getWorkbenchState();
  switch (state) {
    case 1:
      return "empty";
    case 2:
      return "folder";
    case 3:
      return "workspace";
    default:
      return "empty";
  }
}, "getWorkspaceKind");
let AgentSessionsWelcomeEditorResolverContribution = class AgentSessionsWelcomeEditorResolverContribution2 extends Disposable {
  static {
    __name(this, "AgentSessionsWelcomeEditorResolverContribution");
  }
  static {
    this.ID = "workbench.contrib.agentSessionsWelcomeEditorResolver";
  }
  constructor(editorResolverService, instantiationService, workspaceContextService) {
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
          editor: instantiationService.createInstance(AgentSessionsWelcomeInput, { workspaceKind: getWorkspaceKind(workspaceContextService) })
        };
      }, "createEditorInput")
    }));
  }
};
AgentSessionsWelcomeEditorResolverContribution = __decorate([
  __param(0, IEditorResolverService),
  __param(1, IInstantiationService),
  __param(2, IWorkspaceContextService)
], AgentSessionsWelcomeEditorResolverContribution);
registerAction2(class OpenAgentSessionsWelcomeAction extends Action2 {
  static {
    __name(this, "OpenAgentSessionsWelcomeAction");
  }
  constructor() {
    super({
      id: AgentSessionsWelcomePage.COMMAND_ID,
      title: localize("openAgentSessionsWelcome", "Open Agent Sessions Welcome"),
      precondition: ChatContextKeys.enabled
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const instantiationService = accessor.get(IInstantiationService);
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    const input = instantiationService.createInstance(AgentSessionsWelcomeInput, { initiator: "command", workspaceKind: getWorkspaceKind(workspaceContextService) });
    await editorService.openEditor(input, { pinned: true });
  }
});
let AgentSessionsWelcomeRunnerContribution = class AgentSessionsWelcomeRunnerContribution2 extends Disposable {
  static {
    __name(this, "AgentSessionsWelcomeRunnerContribution");
  }
  static {
    this.ID = "workbench.contrib.agentSessionsWelcomeRunner";
  }
  constructor(configurationService, editorService, editorGroupsService, instantiationService, contextKeyService, storageService, workspaceContextService, chatEntitlementService) {
    super();
    this.configurationService = configurationService;
    this.editorService = editorService;
    this.editorGroupsService = editorGroupsService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.storageService = storageService;
    this.workspaceContextService = workspaceContextService;
    this.chatEntitlementService = chatEntitlementService;
    this.run();
  }
  async run() {
    if (this.chatEntitlementService.sentiment.hidden) {
      return;
    }
    const startupEditor = this.configurationService.getValue("workbench.startupEditor");
    if (startupEditor !== "agentSessionsWelcomePage") {
      return;
    }
    await this.editorGroupsService.whenReady;
    if (AuxiliaryBarMaximizedContext.getValue(this.contextKeyService)) {
      return;
    }
    const hasPrefillData = !!this.storageService.get(
      "chat.welcomeViewPrefill",
      -1
      /* StorageScope.APPLICATION */
    );
    if (this.editorService.activeEditor && !hasPrefillData) {
      return;
    }
    const input = this.instantiationService.createInstance(AgentSessionsWelcomeInput, { initiator: "startup", workspaceKind: getWorkspaceKind(this.workspaceContextService) });
    await this.editorService.openEditor(input, { pinned: false });
  }
};
AgentSessionsWelcomeRunnerContribution = __decorate([
  __param(0, IConfigurationService),
  __param(1, IEditorService),
  __param(2, IEditorGroupsService),
  __param(3, IInstantiationService),
  __param(4, IContextKeyService),
  __param(5, IStorageService),
  __param(6, IWorkspaceContextService),
  __param(7, IChatEntitlementService)
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
