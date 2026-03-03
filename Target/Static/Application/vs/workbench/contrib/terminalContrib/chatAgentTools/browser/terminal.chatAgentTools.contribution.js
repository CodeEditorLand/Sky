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
import { Codicon } from "../../../../../base/common/codicons.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { isNumber } from "../../../../../base/common/types.js";
import { localize } from "../../../../../nls.js";
import { MenuId } from "../../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { registerWorkbenchContribution2 } from "../../../../common/contributions.js";
import { IChatWidgetService } from "../../../chat/browser/chat.js";
import { ChatContextKeys } from "../../../chat/common/actions/chatContextKeys.js";
import { ILanguageModelToolsService } from "../../../chat/common/tools/languageModelToolsService.js";
import { registerActiveInstanceAction, sharedWhenClause } from "../../../terminal/browser/terminalActions.js";
import { TerminalContextKeys } from "../../../terminal/common/terminalContextKey.js";
import { AwaitTerminalTool, AwaitTerminalToolData } from "./tools/awaitTerminalTool.js";
import { GetTerminalLastCommandTool, GetTerminalLastCommandToolData } from "./tools/getTerminalLastCommandTool.js";
import { KillTerminalTool, KillTerminalToolData } from "./tools/killTerminalTool.js";
import { GetTerminalOutputTool, GetTerminalOutputToolData } from "./tools/getTerminalOutputTool.js";
import { GetTerminalSelectionTool, GetTerminalSelectionToolData } from "./tools/getTerminalSelectionTool.js";
import { ConfirmTerminalCommandTool, ConfirmTerminalCommandToolData } from "./tools/runInTerminalConfirmationTool.js";
import { RunInTerminalTool, createRunInTerminalToolData } from "./tools/runInTerminalTool.js";
import { CreateAndRunTaskTool, CreateAndRunTaskToolData } from "./tools/task/createAndRunTaskTool.js";
import { GetTaskOutputTool, GetTaskOutputToolData } from "./tools/task/getTaskOutputTool.js";
import { RunTaskTool, RunTaskToolData } from "./tools/task/runTaskTool.js";
import { registerSingleton } from "../../../../../platform/instantiation/common/extensions.js";
import { ITerminalSandboxService, TerminalSandboxService } from "../common/terminalSandboxService.js";
registerSingleton(
  ITerminalSandboxService,
  TerminalSandboxService,
  1
  /* InstantiationType.Delayed */
);
let ShellIntegrationTimeoutMigrationContribution = class ShellIntegrationTimeoutMigrationContribution2 extends Disposable {
  static {
    __name(this, "ShellIntegrationTimeoutMigrationContribution");
  }
  static {
    this.ID = "terminal.shellIntegrationTimeoutMigration";
  }
  constructor(configurationService) {
    super();
    const deprecatedSettingValue = configurationService.getValue(
      "chat.tools.terminal.shellIntegrationTimeout"
      /* TerminalChatAgentToolsSettingId.ShellIntegrationTimeout */
    );
    if (!isNumber(deprecatedSettingValue)) {
      return;
    }
    const newSettingValue = configurationService.getValue(
      "terminal.integrated.shellIntegration.timeout"
      /* TerminalSettingId.ShellIntegrationTimeout */
    );
    if (!isNumber(newSettingValue)) {
      configurationService.updateValue("terminal.integrated.shellIntegration.timeout", deprecatedSettingValue);
    }
  }
};
ShellIntegrationTimeoutMigrationContribution = __decorate([
  __param(0, IConfigurationService)
], ShellIntegrationTimeoutMigrationContribution);
registerWorkbenchContribution2(
  ShellIntegrationTimeoutMigrationContribution.ID,
  ShellIntegrationTimeoutMigrationContribution,
  4
  /* WorkbenchPhase.Eventually */
);
let OutputLocationMigrationContribution = class OutputLocationMigrationContribution2 extends Disposable {
  static {
    __name(this, "OutputLocationMigrationContribution");
  }
  static {
    this.ID = "terminal.outputLocationMigration";
  }
  constructor(configurationService) {
    super();
    const currentValue = configurationService.getValue(
      "chat.tools.terminal.outputLocation"
      /* TerminalChatAgentToolsSettingId.OutputLocation */
    );
    if (currentValue === "none") {
      configurationService.updateValue("chat.tools.terminal.outputLocation", "chat");
    }
  }
};
OutputLocationMigrationContribution = __decorate([
  __param(0, IConfigurationService)
], OutputLocationMigrationContribution);
registerWorkbenchContribution2(
  OutputLocationMigrationContribution.ID,
  OutputLocationMigrationContribution,
  4
  /* WorkbenchPhase.Eventually */
);
let ChatAgentToolsContribution = class ChatAgentToolsContribution2 extends Disposable {
  static {
    __name(this, "ChatAgentToolsContribution");
  }
  static {
    this.ID = "terminal.chatAgentTools";
  }
  constructor(instantiationService, toolsService) {
    super();
    const confirmTerminalCommandTool = instantiationService.createInstance(ConfirmTerminalCommandTool);
    this._register(toolsService.registerTool(ConfirmTerminalCommandToolData, confirmTerminalCommandTool));
    const getTerminalOutputTool = instantiationService.createInstance(GetTerminalOutputTool);
    this._register(toolsService.registerTool(GetTerminalOutputToolData, getTerminalOutputTool));
    this._register(toolsService.executeToolSet.addTool(GetTerminalOutputToolData));
    const awaitTerminalTool = instantiationService.createInstance(AwaitTerminalTool);
    this._register(toolsService.registerTool(AwaitTerminalToolData, awaitTerminalTool));
    this._register(toolsService.executeToolSet.addTool(AwaitTerminalToolData));
    const killTerminalTool = instantiationService.createInstance(KillTerminalTool);
    this._register(toolsService.registerTool(KillTerminalToolData, killTerminalTool));
    this._register(toolsService.executeToolSet.addTool(KillTerminalToolData));
    instantiationService.invokeFunction(createRunInTerminalToolData).then((runInTerminalToolData) => {
      const runInTerminalTool = instantiationService.createInstance(RunInTerminalTool);
      this._register(toolsService.registerTool(runInTerminalToolData, runInTerminalTool));
      this._register(toolsService.executeToolSet.addTool(runInTerminalToolData));
    });
    const getTerminalSelectionTool = instantiationService.createInstance(GetTerminalSelectionTool);
    this._register(toolsService.registerTool(GetTerminalSelectionToolData, getTerminalSelectionTool));
    const getTerminalLastCommandTool = instantiationService.createInstance(GetTerminalLastCommandTool);
    this._register(toolsService.registerTool(GetTerminalLastCommandToolData, getTerminalLastCommandTool));
    this._register(toolsService.readToolSet.addTool(GetTerminalSelectionToolData));
    this._register(toolsService.readToolSet.addTool(GetTerminalLastCommandToolData));
    const runTaskTool = instantiationService.createInstance(RunTaskTool);
    this._register(toolsService.registerTool(RunTaskToolData, runTaskTool));
    const getTaskOutputTool = instantiationService.createInstance(GetTaskOutputTool);
    this._register(toolsService.registerTool(GetTaskOutputToolData, getTaskOutputTool));
    const createAndRunTaskTool = instantiationService.createInstance(CreateAndRunTaskTool);
    this._register(toolsService.registerTool(CreateAndRunTaskToolData, createAndRunTaskTool));
    this._register(toolsService.executeToolSet.addTool(RunTaskToolData));
    this._register(toolsService.executeToolSet.addTool(CreateAndRunTaskToolData));
    this._register(toolsService.readToolSet.addTool(GetTaskOutputToolData));
  }
};
ChatAgentToolsContribution = __decorate([
  __param(0, IInstantiationService),
  __param(1, ILanguageModelToolsService)
], ChatAgentToolsContribution);
registerWorkbenchContribution2(
  ChatAgentToolsContribution.ID,
  ChatAgentToolsContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
registerActiveInstanceAction({
  id: "workbench.action.terminal.chat.addTerminalSelection",
  title: localize("addTerminalSelection", "Add Terminal Selection to Chat"),
  precondition: ContextKeyExpr.and(ChatContextKeys.enabled, sharedWhenClause.terminalAvailable),
  menu: [
    {
      id: MenuId.TerminalInstanceContext,
      group: "0_chat",
      order: 1,
      when: ContextKeyExpr.and(ChatContextKeys.enabled, TerminalContextKeys.textSelected)
    }
  ],
  run: /* @__PURE__ */ __name(async (activeInstance, _c, accessor) => {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const selection = activeInstance.selection;
    if (!selection) {
      return;
    }
    const chatView = chatWidgetService.lastFocusedWidget ?? await chatWidgetService.revealWidget();
    if (!chatView) {
      return;
    }
    chatView.attachmentModel.addContext({
      id: `terminal-selection-${Date.now()}`,
      kind: "generic",
      name: localize("terminalSelection", "Terminal Selection"),
      fullName: localize("terminalSelection", "Terminal Selection"),
      value: selection,
      icon: Codicon.terminal
    });
    chatView.focusInput();
  }, "run")
});
//# sourceMappingURL=terminal.chatAgentTools.contribution.js.map
