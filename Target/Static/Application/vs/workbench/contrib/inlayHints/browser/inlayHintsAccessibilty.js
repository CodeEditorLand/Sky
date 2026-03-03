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
var InlayHintsAccessibility_1;
import * as dom from "../../../../base/browser/dom.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { EditorAction2, registerEditorContribution } from "../../../../editor/browser/editorExtensions.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { asCommandLink } from "../../../../editor/contrib/inlayHints/browser/inlayHints.js";
import { InlayHintsController } from "../../../../editor/contrib/inlayHints/browser/inlayHintsController.js";
import { localize, localize2 } from "../../../../nls.js";
import { registerAction2 } from "../../../../platform/actions/common/actions.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Link } from "../../../../platform/opener/browser/link.js";
let InlayHintsAccessibility = class InlayHintsAccessibility2 {
  static {
    __name(this, "InlayHintsAccessibility");
  }
  static {
    InlayHintsAccessibility_1 = this;
  }
  static {
    this.IsReading = new RawContextKey("isReadingLineWithInlayHints", false, { type: "boolean", description: localize("isReadingLineWithInlayHints", "Whether the current line and its inlay hints are currently focused") });
  }
  static {
    this.ID = "editor.contrib.InlayHintsAccessibility";
  }
  static get(editor) {
    return editor.getContribution(InlayHintsAccessibility_1.ID) ?? void 0;
  }
  constructor(_editor, contextKeyService, _accessibilitySignalService, _instaService) {
    this._editor = _editor;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._instaService = _instaService;
    this._sessionDispoosables = new DisposableStore();
    this._ariaElement = document.createElement("span");
    this._ariaElement.style.position = "fixed";
    this._ariaElement.className = "inlayhint-accessibility-element";
    this._ariaElement.tabIndex = 0;
    this._ariaElement.setAttribute("aria-description", localize("description", "Code with Inlay Hint Information"));
    this._ctxIsReading = InlayHintsAccessibility_1.IsReading.bindTo(contextKeyService);
  }
  dispose() {
    this._sessionDispoosables.dispose();
    this._ctxIsReading.reset();
    this._ariaElement.remove();
  }
  _reset() {
    dom.clearNode(this._ariaElement);
    this._sessionDispoosables.clear();
    this._ctxIsReading.reset();
  }
  async _read(line, hints) {
    this._sessionDispoosables.clear();
    if (!this._ariaElement.isConnected) {
      this._editor.getDomNode()?.appendChild(this._ariaElement);
    }
    if (!this._editor.hasModel() || !this._ariaElement.isConnected) {
      this._ctxIsReading.set(false);
      return;
    }
    const cts = new CancellationTokenSource();
    this._sessionDispoosables.add(cts);
    for (const hint of hints) {
      await hint.resolve(cts.token);
    }
    if (cts.token.isCancellationRequested) {
      return;
    }
    const model = this._editor.getModel();
    const newChildren = [];
    let start = 0;
    let tooLongToRead = false;
    for (const item of hints) {
      const part = model.getValueInRange({ startLineNumber: line, startColumn: start + 1, endLineNumber: line, endColumn: item.hint.position.column });
      if (part.length > 0) {
        newChildren.push(part);
        start = item.hint.position.column - 1;
      }
      if (start > 750) {
        newChildren.push("\u2026");
        tooLongToRead = true;
        break;
      }
      const em = document.createElement("em");
      const { label } = item.hint;
      if (typeof label === "string") {
        em.innerText = label;
      } else {
        for (const part2 of label) {
          if (part2.command) {
            const link = this._instaService.createInstance(Link, em, { href: asCommandLink(part2.command), label: part2.label, title: part2.command.title }, void 0);
            this._sessionDispoosables.add(link);
          } else {
            em.innerText += part2.label;
          }
        }
      }
      newChildren.push(em);
    }
    if (!tooLongToRead) {
      newChildren.push(model.getValueInRange({ startLineNumber: line, startColumn: start + 1, endLineNumber: line, endColumn: Number.MAX_SAFE_INTEGER }));
    }
    dom.reset(this._ariaElement, ...newChildren);
    this._ariaElement.focus();
    this._ctxIsReading.set(true);
    this._sessionDispoosables.add(dom.addDisposableListener(this._ariaElement, "focusout", () => {
      this._reset();
    }));
  }
  startInlayHintsReading() {
    if (!this._editor.hasModel()) {
      return;
    }
    const line = this._editor.getPosition().lineNumber;
    const hints = InlayHintsController.get(this._editor)?.getInlayHintsForLine(line);
    if (!hints || hints.length === 0) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.noInlayHints);
    } else {
      this._read(line, hints);
    }
  }
  stopInlayHintsReading() {
    this._reset();
    this._editor.focus();
  }
};
InlayHintsAccessibility = InlayHintsAccessibility_1 = __decorate([
  __param(1, IContextKeyService),
  __param(2, IAccessibilitySignalService),
  __param(3, IInstantiationService)
], InlayHintsAccessibility);
registerAction2(class StartReadHints extends EditorAction2 {
  static {
    __name(this, "StartReadHints");
  }
  constructor() {
    super({
      id: "inlayHints.startReadingLineWithHint",
      title: localize2("read.title", "Read Line with Inlay Hints"),
      precondition: EditorContextKeys.hasInlayHintsProvider,
      f1: true
    });
  }
  runEditorCommand(_accessor, editor) {
    const ctrl = InlayHintsAccessibility.get(editor);
    ctrl?.startInlayHintsReading();
  }
});
registerAction2(class StopReadHints extends EditorAction2 {
  static {
    __name(this, "StopReadHints");
  }
  constructor() {
    super({
      id: "inlayHints.stopReadingLineWithHint",
      title: localize2("stop.title", "Stop Inlay Hints Reading"),
      precondition: InlayHintsAccessibility.IsReading,
      f1: true,
      keybinding: {
        weight: 100,
        primary: 9
        /* KeyCode.Escape */
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    const ctrl = InlayHintsAccessibility.get(editor);
    ctrl?.stopInlayHintsReading();
  }
});
registerEditorContribution(
  InlayHintsAccessibility.ID,
  InlayHintsAccessibility,
  4
  /* EditorContributionInstantiation.Lazy */
);
export {
  InlayHintsAccessibility
};
//# sourceMappingURL=inlayHintsAccessibilty.js.map
