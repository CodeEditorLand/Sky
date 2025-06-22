var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { ISpeechService } from "../common/speechService.js";
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
let SpeechAccessibilitySignalContribution = class SpeechAccessibilitySignalContribution2 extends Disposable {
  static {
    __name(this, "SpeechAccessibilitySignalContribution");
  }
  static {
    this.ID = "workbench.contrib.speechAccessibilitySignal";
  }
  constructor(_accessibilitySignalService, _speechService) {
    super();
    this._accessibilitySignalService = _accessibilitySignalService;
    this._speechService = _speechService;
    this._register(this._speechService.onDidStartSpeechToTextSession(() => this._accessibilitySignalService.playSignal(AccessibilitySignal.voiceRecordingStarted)));
    this._register(this._speechService.onDidEndSpeechToTextSession(() => this._accessibilitySignalService.playSignal(AccessibilitySignal.voiceRecordingStopped)));
  }
};
SpeechAccessibilitySignalContribution = __decorate([
  __param(0, IAccessibilitySignalService),
  __param(1, ISpeechService)
], SpeechAccessibilitySignalContribution);
export {
  SpeechAccessibilitySignalContribution
};
//# sourceMappingURL=speechAccessibilitySignal.js.map
