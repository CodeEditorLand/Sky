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
import { CTX_INLINE_CHAT_AFFORDANCE_VISIBLE } from "../common/inlineChat.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { IChatEntitlementService } from "../../../services/chat/common/chatEntitlementService.js";
import { InlineChatEditorAffordance } from "./inlineChatEditorAffordance.js";
import { InlineChatGutterAffordance } from "./inlineChatGutterAffordance.js";
import { assertType } from "../../../../base/common/types.js";
import { IInlineChatSessionService } from "./inlineChatSessionService.js";
import { CodeActionController } from "../../../../editor/contrib/codeAction/browser/codeActionController.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { Event } from "../../../../base/common/event.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
let InlineChatAffordance = class InlineChatAffordance2 extends Disposable {
  static {
    __name(this, "InlineChatAffordance");
  }
  #editor;
  #inputWidget;
  #instantiationService;
  #menuData = observableValue(this, void 0);
  #selectionData = observableValue(this, void 0);
  constructor(editor, inputWidget, instantiationService, configurationService, chatEntiteldService, inlineChatSessionService, telemetryService, contextKeyService) {
    super();
    this.#editor = editor;
    this.#inputWidget = inputWidget;
    this.#instantiationService = instantiationService;
    const editorObs = observableCodeEditor(this.#editor);
    const affordance = observableConfigValue("inlineChat.affordance", "off", configurationService);
    const debouncedSelection = debouncedObservable(editorObs.cursorSelection, 500);
    const selectionData = this.#selectionData;
    const ctxAffordanceVisible = CTX_INLINE_CHAT_AFFORDANCE_VISIBLE.bindTo(contextKeyService);
    this._store.add({ dispose: /* @__PURE__ */ __name(() => ctxAffordanceVisible.reset(), "dispose") });
    let explicitSelection = false;
    let affordanceId;
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
      if (!value || value.isEmpty() || !explicitSelection || this.#editor.getModel()?.getValueInRange(value).match(/^\s+$/)) {
        selectionData.set(void 0, void 0);
        affordanceId = void 0;
        return;
      }
      affordanceId = generateUuid();
      const mode = affordance.read(void 0);
      if (mode === "gutter" || mode === "editor") {
        telemetryService.publicLog2("inlineChatAffordance/shown", { mode, id: affordanceId, commandId: "" });
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
    this._store.add(this.#editor.onContextMenu(() => {
      selectionData.set(void 0, void 0);
    }));
    this._store.add(autorun((r) => {
      if (!editorObs.isFocused.read(r)) {
        selectionData.set(void 0, void 0);
      }
    }));
    this._store.add(autorun((r) => {
      const sel = selectionData.read(r);
      const mode = affordance.read(r);
      ctxAffordanceVisible.set(sel !== void 0 && (mode === "editor" || mode === "gutter"));
    }));
    const gutterAffordance = this._store.add(this.#instantiationService.createInstance(InlineChatGutterAffordance, editorObs, derived((r) => affordance.read(r) === "gutter" ? selectionData.read(r) : void 0)));
    const editorAffordance = this.#instantiationService.createInstance(InlineChatEditorAffordance, this.#editor, derived((r) => affordance.read(r) === "editor" ? selectionData.read(r) : void 0));
    this._store.add(editorAffordance);
    this._store.add(Event.any(editorAffordance.onDidRunAction, gutterAffordance.onDidRunAction)((commandId) => {
      if (affordanceId) {
        telemetryService.publicLog2("inlineChatAffordance/selected", { mode: affordance.get(), id: affordanceId, commandId });
      }
    }));
    this._store.add(autorun((r) => {
      const mode = affordance.read(r);
      const hideWithSelection = mode === "editor" || mode === "gutter";
      const controller = CodeActionController.get(this.#editor);
      if (controller) {
        controller.onlyLightBulbWithEmptySelection = hideWithSelection;
      }
    }));
    this._store.add(autorun((r) => {
      const data = this.#menuData.read(r);
      if (!data) {
        return;
      }
      this.#editor.revealLineInCenterIfOutsideViewport(
        data.lineNumber,
        1
        /* ScrollType.Immediate */
      );
      const editorDomNode = this.#editor.getDomNode();
      const editorRect = editorDomNode.getBoundingClientRect();
      const left = data.rect.left - editorRect.left;
      this.#inputWidget.show(data.lineNumber, left, data.above, data.placeholder, data.value);
    }));
    this._store.add(autorun((r) => {
      const pos = this.#inputWidget.position.read(r);
      if (pos === null) {
        this.#menuData.set(void 0, void 0);
      }
    }));
  }
  dismiss() {
    this.#selectionData.set(void 0, void 0);
  }
  async showMenuAtSelection(placeholder, value) {
    assertType(this.#editor.hasModel());
    const direction = this.#editor.getSelection().getDirection();
    const position = this.#editor.getPosition();
    const editorDomNode = this.#editor.getDomNode();
    const scrolledPosition = this.#editor.getScrolledVisiblePosition(position);
    const editorRect = editorDomNode.getBoundingClientRect();
    const x = editorRect.left + scrolledPosition.left;
    const y = editorRect.top + scrolledPosition.top;
    this.#menuData.set({
      rect: new DOMRect(x, y, 0, scrolledPosition.height),
      above: direction === 1,
      lineNumber: position.lineNumber,
      placeholder,
      value
    }, void 0);
    await waitForState(this.#inputWidget.position, (pos) => pos === null);
  }
};
InlineChatAffordance = __decorate([
  __param(2, IInstantiationService),
  __param(3, IConfigurationService),
  __param(4, IChatEntitlementService),
  __param(5, IInlineChatSessionService),
  __param(6, ITelemetryService),
  __param(7, IContextKeyService)
], InlineChatAffordance);
export {
  InlineChatAffordance
};
//# sourceMappingURL=inlineChatAffordance.js.map
