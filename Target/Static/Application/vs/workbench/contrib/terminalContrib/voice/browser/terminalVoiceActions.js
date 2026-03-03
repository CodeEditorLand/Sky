var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize, localize2 } from "../../../../../nls.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { IExtensionManagementService } from "../../../../../platform/extensionManagement/common/extensionManagement.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IWorkbenchExtensionEnablementService } from "../../../../services/extensionManagement/common/extensionManagement.js";
import { HasSpeechProvider, SpeechToTextInProgress } from "../../../speech/common/speechService.js";
import { registerActiveInstanceAction, sharedWhenClause } from "../../../terminal/browser/terminalActions.js";
import { TerminalContextKeys } from "../../../terminal/common/terminalContextKey.js";
import { TerminalVoiceSession } from "./terminalVoice.js";
const VOICE_CATEGORY = localize2("voiceCategory", "Voice");
function registerTerminalVoiceActions() {
  registerActiveInstanceAction({
    id: "workbench.action.terminal.startVoice",
    title: localize2("workbench.action.terminal.startDictation", "Start Dictation in Terminal"),
    category: VOICE_CATEGORY,
    precondition: ContextKeyExpr.and(SpeechToTextInProgress.toNegated(), sharedWhenClause.terminalAvailable),
    f1: true,
    icon: Codicon.mic,
    run: /* @__PURE__ */ __name(async (activeInstance, c, accessor) => {
      const contextKeyService = accessor.get(IContextKeyService);
      const commandService = accessor.get(ICommandService);
      const dialogService = accessor.get(IDialogService);
      const workbenchExtensionEnablementService = accessor.get(IWorkbenchExtensionEnablementService);
      const extensionManagementService = accessor.get(IExtensionManagementService);
      if (HasSpeechProvider.getValue(contextKeyService)) {
        const instantiationService = accessor.get(IInstantiationService);
        TerminalVoiceSession.getInstance(instantiationService).start();
        return;
      }
      const extensions = await extensionManagementService.getInstalled();
      const extension = extensions.find((extension2) => extension2.identifier.id === "ms-vscode.vscode-speech");
      const extensionIsDisabled = extension && !workbenchExtensionEnablementService.isEnabled(extension);
      let run;
      let message;
      let primaryButton;
      if (extensionIsDisabled) {
        message = localize("terminal.voice.enableSpeechExtension", "Would you like to enable the speech extension?");
        primaryButton = localize("enableExtension", "Enable Extension");
        run = /* @__PURE__ */ __name(() => workbenchExtensionEnablementService.setEnablement(
          [extension],
          13
          /* EnablementState.EnabledWorkspace */
        ), "run");
      } else {
        message = localize("terminal.voice.installSpeechExtension", "Would you like to install 'VS Code Speech' extension from '../../../../../../../../Microsoft'?");
        run = /* @__PURE__ */ __name(() => commandService.executeCommand("workbench.extensions.installExtension", "ms-vscode.vscode-speech"), "run");
        primaryButton = localize("installExtension", "Install Extension");
      }
      const detail = localize("terminal.voice.detail", "Microphone support requires this extension.");
      const confirmed = await dialogService.confirm({ message, primaryButton, type: "info", detail });
      if (confirmed.confirmed) {
        await run();
      }
    }, "run")
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.stopVoice",
    title: localize2("workbench.action.terminal.stopDictation", "Stop Dictation in Terminal"),
    category: VOICE_CATEGORY,
    precondition: TerminalContextKeys.terminalDictationInProgress,
    f1: true,
    keybinding: {
      primary: 9,
      weight: 200 + 100
    },
    run: /* @__PURE__ */ __name((activeInstance, c, accessor) => {
      const instantiationService = accessor.get(IInstantiationService);
      TerminalVoiceSession.getInstance(instantiationService).stop(true);
    }, "run")
  });
}
__name(registerTerminalVoiceActions, "registerTerminalVoiceActions");
export {
  registerTerminalVoiceActions
};
//# sourceMappingURL=terminalVoiceActions.js.map
