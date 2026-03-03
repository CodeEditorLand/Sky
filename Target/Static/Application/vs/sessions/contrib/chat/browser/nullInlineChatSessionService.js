var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../../base/common/event.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IInlineChatSessionService } from "../../../../workbench/contrib/inlineChat/browser/inlineChatSessionService.js";
class NullInlineChatSessionService {
  static {
    __name(this, "NullInlineChatSessionService");
  }
  constructor() {
    this.onWillStartSession = Event.None;
    this.onDidChangeSessions = Event.None;
  }
  dispose() {
  }
  createSession(_editor) {
    throw new Error("Inline chat sessions are not supported in the sessions window");
  }
  getSessionByTextModel(_uri) {
    return void 0;
  }
  getSessionBySessionUri(_uri) {
    return void 0;
  }
}
registerSingleton(
  IInlineChatSessionService,
  NullInlineChatSessionService,
  1
  /* InstantiationType.Delayed */
);
//# sourceMappingURL=nullInlineChatSessionService.js.map
