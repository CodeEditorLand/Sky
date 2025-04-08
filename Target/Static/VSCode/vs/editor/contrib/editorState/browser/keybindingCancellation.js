var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { EditorCommand, registerEditorCommand } from "../../../browser/editorExtensions.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { IContextKeyService, RawContextKey, IContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { CancellationTokenSource, CancellationToken } from "../../../../base/common/cancellation.js";
import { LinkedList } from "../../../../base/common/linkedList.js";
import { createDecorator, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { localize } from "../../../../nls.js";
const IEditorCancellationTokens = createDecorator("IEditorCancelService");
const ctxCancellableOperation = new RawContextKey("cancellableOperation", false, localize("cancellableOperation", "Whether the editor runs a cancellable operation, e.g. like 'Peek References'"));
registerSingleton(IEditorCancellationTokens, class {
  _tokens = /* @__PURE__ */ new WeakMap();
  add(editor, cts) {
    let data = this._tokens.get(editor);
    if (!data) {
      data = editor.invokeWithinContext((accessor) => {
        const key = ctxCancellableOperation.bindTo(accessor.get(IContextKeyService));
        const tokens = new LinkedList();
        return { key, tokens };
      });
      this._tokens.set(editor, data);
    }
    let removeFn;
    data.key.set(true);
    removeFn = data.tokens.push(cts);
    return () => {
      if (removeFn) {
        removeFn();
        data.key.set(!data.tokens.isEmpty());
        removeFn = void 0;
      }
    };
  }
  cancel(editor) {
    const data = this._tokens.get(editor);
    if (!data) {
      return;
    }
    const cts = data.tokens.pop();
    if (cts) {
      cts.cancel();
      data.key.set(!data.tokens.isEmpty());
    }
  }
}, InstantiationType.Delayed);
class EditorKeybindingCancellationTokenSource extends CancellationTokenSource {
  constructor(editor, parent) {
    super(parent);
    this.editor = editor;
    this._unregister = editor.invokeWithinContext((accessor) => accessor.get(IEditorCancellationTokens).add(editor, this));
  }
  static {
    __name(this, "EditorKeybindingCancellationTokenSource");
  }
  _unregister;
  dispose() {
    this._unregister();
    super.dispose();
  }
}
registerEditorCommand(new class extends EditorCommand {
  constructor() {
    super({
      id: "editor.cancelOperation",
      kbOpts: {
        weight: KeybindingWeight.EditorContrib,
        primary: KeyCode.Escape
      },
      precondition: ctxCancellableOperation
    });
  }
  runEditorCommand(accessor, editor) {
    accessor.get(IEditorCancellationTokens).cancel(editor);
  }
}());
export {
  EditorKeybindingCancellationTokenSource
};
//# sourceMappingURL=keybindingCancellation.js.map
