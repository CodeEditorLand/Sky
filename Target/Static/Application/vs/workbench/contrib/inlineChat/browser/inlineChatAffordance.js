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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { autorun, debouncedObservable, derived, observableSignalFromEvent, observableValue, runOnChange, waitForState } from "../../../../base/common/observable.js";
import { observableCodeEditor } from "../../../../editor/browser/observableCodeEditor.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { IChatEntitlementService } from "../../../services/chat/common/chatEntitlementService.js";
import { InlineChatEditorAffordance } from "./inlineChatEditorAffordance.js";
import { InlineChatGutterAffordance } from "./inlineChatGutterAffordance.js";
import { assertType } from "../../../../base/common/types.js";
import { IInlineChatSessionService } from "./inlineChatSessionService.js";
let InlineChatAffordance = class InlineChatAffordance2 extends Disposable {
  static {
    __name(this, "InlineChatAffordance");
  }
  constructor(_editor, _inputWidget, _instantiationService, configurationService, chatEntiteldService, inlineChatSessionService) {
    super();
    this._editor = _editor;
    this._inputWidget = _inputWidget;
    this._instantiationService = _instantiationService;
    this._menuData = observableValue(this, void 0);
    const editorObs = observableCodeEditor(this._editor);
    const affordance = observableConfigValue("inlineChat.affordance", "off", configurationService);
    const debouncedSelection = debouncedObservable(editorObs.cursorSelection, 500);
    const selectionData = observableValue(this, void 0);
    let explicitSelection = false;
    this._store.add(runOnChange(editorObs.selections, (value, _prev, events) => {
      explicitSelection = events.every(
        (e) => e.reason === 3
        /* CursorChangeReason.Explicit */
      );
      if (!value || value.length !== 1 || value[0].isEmpty() || !explicitSelection) {
        selectionData.set(void 0, void 0);
      }
    }));
    this._store.add(autorun((r) => {
      const value = debouncedSelection.read(r);
      if (!value || value.isEmpty() || !explicitSelection || _editor.getModel()?.getValueInRange(value).match(/^\s+$/)) {
        selectionData.set(void 0, void 0);
        return;
      }
      selectionData.set(value, void 0);
    }));
    this._store.add(autorun((r) => {
      if (chatEntiteldService.sentimentObs.read(r).hidden) {
        selectionData.set(void 0, void 0);
      }
    }));
    const hasSessionObs = derived((r) => {
      observableSignalFromEvent(this, inlineChatSessionService.onDidChangeSessions).read(r);
      const model = editorObs.model.read(r);
      return model ? inlineChatSessionService.getSessionByTextModel(model.uri) !== void 0 : false;
    });
    this._store.add(autorun((r) => {
      if (hasSessionObs.read(r)) {
        selectionData.set(void 0, void 0);
      }
    }));
    this._store.add(this._instantiationService.createInstance(InlineChatGutterAffordance, editorObs, derived((r) => affordance.read(r) === "gutter" ? selectionData.read(r) : void 0), this._menuData));
    this._store.add(this._instantiationService.createInstance(InlineChatEditorAffordance, this._editor, derived((r) => affordance.read(r) === "editor" ? selectionData.read(r) : void 0)));
    this._store.add(autorun((r) => {
      const data = this._menuData.read(r);
      if (!data) {
        return;
      }
      this._editor.revealLineInCenterIfOutsideViewport(
        data.lineNumber,
        1
        /* ScrollType.Immediate */
      );
      const editorDomNode = this._editor.getDomNode();
      const editorRect = editorDomNode.getBoundingClientRect();
      const left = data.rect.left - editorRect.left;
      this._inputWidget.show(data.lineNumber, left, data.above);
    }));
    this._store.add(autorun((r) => {
      const pos = this._inputWidget.position.read(r);
      if (pos === null) {
        this._menuData.set(void 0, void 0);
      }
    }));
  }
  async showMenuAtSelection() {
    assertType(this._editor.hasModel());
    const direction = this._editor.getSelection().getDirection();
    const position = this._editor.getPosition();
    const editorDomNode = this._editor.getDomNode();
    const scrolledPosition = this._editor.getScrolledVisiblePosition(position);
    const editorRect = editorDomNode.getBoundingClientRect();
    const x = editorRect.left + scrolledPosition.left;
    const y = editorRect.top + scrolledPosition.top;
    this._menuData.set({
      rect: new DOMRect(x, y, 0, scrolledPosition.height),
      above: direction === 1,
      lineNumber: position.lineNumber
    }, void 0);
    await waitForState(this._inputWidget.position, (pos) => pos === null);
  }
};
InlineChatAffordance = __decorate([
  __param(2, IInstantiationService),
  __param(3, IConfigurationService),
  __param(4, IChatEntitlementService),
  __param(5, IInlineChatSessionService)
], InlineChatAffordance);
export {
  InlineChatAffordance
};
//# sourceMappingURL=inlineChatAffordance.js.map
