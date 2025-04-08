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
import { status } from "../../../../base/browser/ui/aria/aria.js";
import { Disposable, DisposableMap } from "../../../../base/common/lifecycle.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { AccessibilityProgressSignalScheduler } from "../../../../platform/accessibilitySignal/browser/progressAccessibilitySignalScheduler.js";
import { IChatAccessibilityService } from "./chat.js";
import { IChatResponseViewModel } from "../common/chatViewModel.js";
import { renderStringAsPlaintext } from "../../../../base/browser/markdownRenderer.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { AccessibilityVoiceSettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
const CHAT_RESPONSE_PENDING_ALLOWANCE_MS = 4e3;
let ChatAccessibilityService = class extends Disposable {
  constructor(_accessibilitySignalService, _instantiationService, _configurationService) {
    super();
    this._accessibilitySignalService = _accessibilitySignalService;
    this._instantiationService = _instantiationService;
    this._configurationService = _configurationService;
  }
  static {
    __name(this, "ChatAccessibilityService");
  }
  _pendingSignalMap = this._register(new DisposableMap());
  _requestId = 0;
  acceptRequest() {
    this._requestId++;
    this._accessibilitySignalService.playSignal(AccessibilitySignal.chatRequestSent, { allowManyInParallel: true });
    this._pendingSignalMap.set(this._requestId, this._instantiationService.createInstance(AccessibilityProgressSignalScheduler, CHAT_RESPONSE_PENDING_ALLOWANCE_MS, void 0));
    return this._requestId;
  }
  acceptResponse(response, requestId, isVoiceInput) {
    this._pendingSignalMap.deleteAndDispose(requestId);
    const isPanelChat = typeof response !== "string";
    const responseContent = typeof response === "string" ? response : response?.response.toString();
    this._accessibilitySignalService.playSignal(AccessibilitySignal.chatResponseReceived, { allowManyInParallel: true });
    if (!response || !responseContent) {
      return;
    }
    const errorDetails = isPanelChat && response.errorDetails ? ` ${response.errorDetails.message}` : "";
    const plainTextResponse = renderStringAsPlaintext(new MarkdownString(responseContent));
    if (!isVoiceInput || this._configurationService.getValue(AccessibilityVoiceSettingId.AutoSynthesize) !== "on") {
      status(plainTextResponse + errorDetails);
    }
  }
};
ChatAccessibilityService = __decorateClass([
  __decorateParam(0, IAccessibilitySignalService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IConfigurationService)
], ChatAccessibilityService);
export {
  ChatAccessibilityService
};
//# sourceMappingURL=chatAccessibilityService.js.map
