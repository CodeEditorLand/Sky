var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { InlineChatController } from "../browser/inlineChatController.js";
import { AbstractInlineChatAction, setHoldForSpeech } from "../browser/inlineChatActions.js";
import { disposableTimeout } from "../../../../base/common/async.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { StartVoiceChatAction, StopListeningAction, VOICE_KEY_HOLD_THRESHOLD } from "../../chat/electron-browser/actions/voiceChatActions.js";
import { CTX_INLINE_CHAT_VISIBLE } from "../common/inlineChat.js";
import { HasSpeechProvider, ISpeechService } from "../../speech/common/speechService.js";
import { localize2 } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { EditorAction2 } from "../../../../editor/browser/editorExtensions.js";
class HoldToSpeak extends EditorAction2 {
  static {
    __name(this, "HoldToSpeak");
  }
  constructor() {
    super({
      id: "inlineChat.holdForSpeech",
      category: AbstractInlineChatAction.category,
      precondition: ContextKeyExpr.and(HasSpeechProvider, CTX_INLINE_CHAT_VISIBLE),
      title: localize2("holdForSpeech", "Hold for Speech"),
      keybinding: {
        when: EditorContextKeys.textInputFocus,
        weight: 200,
        primary: 2048 | 39
      }
    });
  }
  runEditorCommand(accessor, editor, ..._args) {
    const ctrl = InlineChatController.get(editor);
    if (ctrl) {
      holdForSpeech(accessor, ctrl, this);
    }
  }
}
function holdForSpeech(accessor, ctrl, action) {
  const configService = accessor.get(IConfigurationService);
  const speechService = accessor.get(ISpeechService);
  const keybindingService = accessor.get(IKeybindingService);
  const commandService = accessor.get(ICommandService);
  if (!configService.getValue("inlineChat.holdToSpeech")) {
    return;
  }
  const holdMode = keybindingService.enableKeybindingHoldMode(action.desc.id);
  if (!holdMode) {
    return;
  }
  let listening = false;
  const handle = disposableTimeout(() => {
    commandService.executeCommand(StartVoiceChatAction.ID, { voice: { disableTimeout: true } });
    listening = true;
  }, VOICE_KEY_HOLD_THRESHOLD);
  holdMode.finally(() => {
    if (listening) {
      commandService.executeCommand(StopListeningAction.ID).finally(() => {
        ctrl.widget.chatWidget.acceptInput();
      });
    }
    handle.dispose();
  });
}
__name(holdForSpeech, "holdForSpeech");
setHoldForSpeech(holdForSpeech);
export {
  HoldToSpeak
};
//# sourceMappingURL=inlineChatActions.js.map
