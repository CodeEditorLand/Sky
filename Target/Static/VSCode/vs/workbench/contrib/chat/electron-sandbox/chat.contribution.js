var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { InlineVoiceChatAction, QuickVoiceChatAction, StartVoiceChatAction, VoiceChatInChatViewAction, StopListeningAction, StopListeningAndSubmitAction, KeywordActivationContribution, InstallSpeechProviderForVoiceChatAction, HoldToVoiceChatInChatViewAction, ReadChatResponseAloud, StopReadAloud, StopReadChatItemAloud } from "./actions/voiceChatActions.js";
import { registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IWorkbenchContribution, WorkbenchPhase, registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILanguageModelToolsService } from "../common/languageModelToolsService.js";
import { FetchWebPageTool, FetchWebPageToolData } from "./tools/fetchPageTool.js";
import { registerChatDeveloperActions } from "./actions/chatDeveloperActions.js";
let NativeBuiltinToolsContribution = class extends Disposable {
  static {
    __name(this, "NativeBuiltinToolsContribution");
  }
  static ID = "chat.nativeBuiltinTools";
  constructor(toolsService, instantiationService) {
    super();
    const editTool = instantiationService.createInstance(FetchWebPageTool);
    this._register(toolsService.registerToolData(FetchWebPageToolData));
    this._register(toolsService.registerToolImplementation(FetchWebPageToolData.id, editTool));
  }
};
NativeBuiltinToolsContribution = __decorateClass([
  __decorateParam(0, ILanguageModelToolsService),
  __decorateParam(1, IInstantiationService)
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
registerWorkbenchContribution2(KeywordActivationContribution.ID, KeywordActivationContribution, WorkbenchPhase.AfterRestored);
registerWorkbenchContribution2(NativeBuiltinToolsContribution.ID, NativeBuiltinToolsContribution, WorkbenchPhase.AfterRestored);
//# sourceMappingURL=chat.contribution.js.map
