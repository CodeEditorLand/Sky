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
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { autorun, observableFromEvent } from "../../../../../base/common/observable.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IChatEditingService } from "../../common/editing/chatEditingService.js";
let ChatEditingEditorAccessibility = class ChatEditingEditorAccessibility2 {
  static {
    __name(this, "ChatEditingEditorAccessibility");
  }
  static {
    this.ID = "chat.edits.accessibilty";
  }
  constructor(chatEditingService, editorService, accessibilityService) {
    this._store = new DisposableStore();
    const activeUri = observableFromEvent(this, editorService.onDidActiveEditorChange, () => editorService.activeEditorPane?.input.resource);
    this._store.add(autorun((r) => {
      const editor = activeUri.read(r);
      if (!editor) {
        return;
      }
      const entry = chatEditingService.editingSessionsObs.read(r).find((session) => session.readEntry(editor, r));
      if (entry) {
        accessibilityService.playSignal(AccessibilitySignal.chatEditModifiedFile);
      }
    }));
  }
  dispose() {
    this._store.dispose();
  }
};
ChatEditingEditorAccessibility = __decorate([
  __param(0, IChatEditingService),
  __param(1, IEditorService),
  __param(2, IAccessibilitySignalService)
], ChatEditingEditorAccessibility);
export {
  ChatEditingEditorAccessibility
};
//# sourceMappingURL=chatEditingEditorAccessibility.js.map
