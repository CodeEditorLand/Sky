var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { InlineVoiceChatAction, QuickVoiceChatAction, StartVoiceChatAction, VoiceChatInChatViewAction, StopListeningAction, StopListeningAndSubmitAction, KeywordActivationContribution, InstallSpeechProviderForVoiceChatAction, HoldToVoiceChatInChatViewAction, ReadChatResponseAloud, StopReadAloud, StopReadChatItemAloud } from "./actions/voiceChatActions.js";
import { registerAction2 } from "../../../../platform/actions/common/actions.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILanguageModelToolsService } from "../common/languageModelToolsService.js";
import { FetchWebPageTool, FetchWebPageToolData } from "./tools/fetchPageTool.js";
import { registerChatDeveloperActions } from "./actions/chatDeveloperActions.js";
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
let NativeBuiltinToolsContribution = class NativeBuiltinToolsContribution2 extends Disposable {
  static {
    __name(this, "NativeBuiltinToolsContribution");
  }
  static {
    this.ID = "chat.nativeBuiltinTools";
  }
  constructor(toolsService, instantiationService) {
    super();
    const editTool = instantiationService.createInstance(FetchWebPageTool);
    this._register(toolsService.registerToolData(FetchWebPageToolData));
    this._register(toolsService.registerToolImplementation(FetchWebPageToolData.id, editTool));
  }
};
NativeBuiltinToolsContribution = __decorate([
  __param(0, ILanguageModelToolsService),
  __param(1, IInstantiationService)
], NativeBuiltinToolsContribution);
registerAction2(StartVoiceChatAction);
registerAction2(InstallSpeechProviderForVoiceChatAction);
registerAction2(VoiceChatInChatViewAction);
registerAction2(HoldToVoiceChatInChatViewAction);
registerAction2(QuickVoiceChatAction);
registerAction2(InlineVoiceChatAction);
registerAction2(StopListeningAction);
registerAction2(StopListeningAndSubmitAction);
registerAction2(ReadChatResponseAloud);
registerAction2(StopReadChatItemAloud);
registerAction2(StopReadAloud);
registerChatDeveloperActions();
registerWorkbenchContribution2(
  KeywordActivationContribution.ID,
  KeywordActivationContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
registerWorkbenchContribution2(
  NativeBuiltinToolsContribution.ID,
  NativeBuiltinToolsContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
//# sourceMappingURL=chat.contribution.js.map
