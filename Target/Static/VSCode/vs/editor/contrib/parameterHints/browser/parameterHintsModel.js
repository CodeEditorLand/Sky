var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancelablePromise, createCancelablePromise, Delayer } from "../../../../base/common/async.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { CharacterSet } from "../../../common/core/characterClassifier.js";
import { ICursorSelectionChangedEvent } from "../../../common/cursorEvents.js";
import { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import * as languages from "../../../common/languages.js";
import { provideSignatureHelp } from "./provideSignatureHelp.js";
var ParameterHintState;
((ParameterHintState2) => {
  let Type;
  ((Type2) => {
    Type2[Type2["Default"] = 0] = "Default";
    Type2[Type2["Active"] = 1] = "Active";
    Type2[Type2["Pending"] = 2] = "Pending";
  })(Type = ParameterHintState2.Type || (ParameterHintState2.Type = {}));
  ParameterHintState2.Default = { type: 0 /* Default */ };
  class Pending {
    constructor(request, previouslyActiveHints) {
      this.request = request;
      this.previouslyActiveHints = previouslyActiveHints;
    }
    static {
      __name(this, "Pending");
    }
    type = 2 /* Pending */;
  }
  ParameterHintState2.Pending = Pending;
  class Active {
    constructor(hints) {
      this.hints = hints;
    }
    static {
      __name(this, "Active");
    }
    type = 1 /* Active */;
  }
  ParameterHintState2.Active = Active;
})(ParameterHintState || (ParameterHintState = {}));
class ParameterHintsModel extends Disposable {
  static {
    __name(this, "ParameterHintsModel");
  }
  static DEFAULT_DELAY = 120;
  // ms
  _onChangedHints = this._register(new Emitter());
  onChangedHints = this._onChangedHints.event;
  editor;
  providers;
  triggerOnType = false;
  _state = ParameterHintState.Default;
  _pendingTriggers = [];
  _lastSignatureHelpResult = this._register(new MutableDisposable());
  triggerChars = new CharacterSet();
  retriggerChars = new CharacterSet();
  throttledDelayer;
  triggerId = 0;
  constructor(editor, providers, delay = ParameterHintsModel.DEFAULT_DELAY) {
    super();
    this.editor = editor;
    this.providers = providers;
    this.throttledDelayer = new Delayer(delay);
    this._register(this.editor.onDidBlurEditorWidget(() => this.cancel()));
    this._register(this.editor.onDidChangeConfiguration(() => this.onEditorConfigurationChange()));
    this._register(this.editor.onDidChangeModel((e) => this.onModelChanged()));
    this._register(this.editor.onDidChangeModelLanguage((_) => this.onModelChanged()));
    this._register(this.editor.onDidChangeCursorSelection((e) => this.onCursorChange(e)));
    this._register(this.editor.onDidChangeModelContent((e) => this.onModelContentChange()));
    this._register(this.providers.onDidChange(this.onModelChanged, this));
    this._register(this.editor.onDidType((text) => this.onDidType(text)));
    this.onEditorConfigurationChange();
    this.onModelChanged();
  }
  get state() {
    return this._state;
  }
  set state(value) {
    if (this._state.type === 2 /* Pending */) {
      this._state.request.cancel();
    }
    this._state = value;
  }
  cancel(silent = false) {
    this.state = ParameterHintState.Default;
    this.throttledDelayer.cancel();
    if (!silent) {
      this._onChangedHints.fire(void 0);
    }
  }
  trigger(context, delay) {
    const model = this.editor.getModel();
    if (!model || !this.providers.has(model)) {
      return;
    }
    const triggerId = ++this.triggerId;
    this._pendingTriggers.push(context);
    this.throttledDelayer.trigger(() => {
      return this.doTrigger(triggerId);
    }, delay).catch(onUnexpectedError);
  }
  next() {
    if (this.state.type !== 1 /* Active */) {
      return;
    }
    const length = this.state.hints.signatures.length;
    const activeSignature = this.state.hints.activeSignature;
    const last = activeSignature % length === length - 1;
    const cycle = this.editor.getOption(EditorOption.parameterHints).cycle;
    if ((length < 2 || last) && !cycle) {
      this.cancel();
      return;
    }
    this.updateActiveSignature(last && cycle ? 0 : activeSignature + 1);
  }
  previous() {
    if (this.state.type !== 1 /* Active */) {
      return;
    }
    const length = this.state.hints.signatures.length;
    const activeSignature = this.state.hints.activeSignature;
    const first = activeSignature === 0;
    const cycle = this.editor.getOption(EditorOption.parameterHints).cycle;
    if ((length < 2 || first) && !cycle) {
      this.cancel();
      return;
    }
    this.updateActiveSignature(first && cycle ? length - 1 : activeSignature - 1);
  }
  updateActiveSignature(activeSignature) {
    if (this.state.type !== 1 /* Active */) {
      return;
    }
    this.state = new ParameterHintState.Active({ ...this.state.hints, activeSignature });
    this._onChangedHints.fire(this.state.hints);
  }
  async doTrigger(triggerId) {
    const isRetrigger = this.state.type === 1 /* Active */ || this.state.type === 2 /* Pending */;
    const activeSignatureHelp = this.getLastActiveHints();
    this.cancel(true);
    if (this._pendingTriggers.length === 0) {
      return false;
    }
    const context = this._pendingTriggers.reduce(mergeTriggerContexts);
    this._pendingTriggers = [];
    const triggerContext = {
      triggerKind: context.triggerKind,
      triggerCharacter: context.triggerCharacter,
      isRetrigger,
      activeSignatureHelp
    };
    if (!this.editor.hasModel()) {
      return false;
    }
    const model = this.editor.getModel();
    const position = this.editor.getPosition();
    this.state = new ParameterHintState.Pending(
      createCancelablePromise((token) => provideSignatureHelp(this.providers, model, position, triggerContext, token)),
      activeSignatureHelp
    );
    try {
      const result = await this.state.request;
      if (triggerId !== this.triggerId) {
        result?.dispose();
        return false;
      }
      if (!result || !result.value.signatures || result.value.signatures.length === 0) {
        result?.dispose();
        this._lastSignatureHelpResult.clear();
        this.cancel();
        return false;
      } else {
        this.state = new ParameterHintState.Active(result.value);
        this._lastSignatureHelpResult.value = result;
        this._onChangedHints.fire(this.state.hints);
        return true;
      }
    } catch (error) {
      if (triggerId === this.triggerId) {
        this.state = ParameterHintState.Default;
      }
      onUnexpectedError(error);
      return false;
    }
  }
  getLastActiveHints() {
    switch (this.state.type) {
      case 1 /* Active */:
        return this.state.hints;
      case 2 /* Pending */:
        return this.state.previouslyActiveHints;
      default:
        return void 0;
    }
  }
  get isTriggered() {
    return this.state.type === 1 /* Active */ || this.state.type === 2 /* Pending */ || this.throttledDelayer.isTriggered();
  }
  onModelChanged() {
    this.cancel();
    this.triggerChars.clear();
    this.retriggerChars.clear();
    const model = this.editor.getModel();
    if (!model) {
      return;
    }
    for (const support of this.providers.ordered(model)) {
      for (const ch of support.signatureHelpTriggerCharacters || []) {
        if (ch.length) {
          const charCode = ch.charCodeAt(0);
          this.triggerChars.add(charCode);
          this.retriggerChars.add(charCode);
        }
      }
      for (const ch of support.signatureHelpRetriggerCharacters || []) {
        if (ch.length) {
          this.retriggerChars.add(ch.charCodeAt(0));
        }
      }
    }
  }
  onDidType(text) {
    if (!this.triggerOnType) {
      return;
    }
    const lastCharIndex = text.length - 1;
    const triggerCharCode = text.charCodeAt(lastCharIndex);
    if (this.triggerChars.has(triggerCharCode) || this.isTriggered && this.retriggerChars.has(triggerCharCode)) {
      this.trigger({
        triggerKind: languages.SignatureHelpTriggerKind.TriggerCharacter,
        triggerCharacter: text.charAt(lastCharIndex)
      });
    }
  }
  onCursorChange(e) {
    if (e.source === "mouse") {
      this.cancel();
    } else if (this.isTriggered) {
      this.trigger({ triggerKind: languages.SignatureHelpTriggerKind.ContentChange });
    }
  }
  onModelContentChange() {
    if (this.isTriggered) {
      this.trigger({ triggerKind: languages.SignatureHelpTriggerKind.ContentChange });
    }
  }
  onEditorConfigurationChange() {
    this.triggerOnType = this.editor.getOption(EditorOption.parameterHints).enabled;
    if (!this.triggerOnType) {
      this.cancel();
    }
  }
  dispose() {
    this.cancel(true);
    super.dispose();
  }
}
function mergeTriggerContexts(previous, current) {
  switch (current.triggerKind) {
    case languages.SignatureHelpTriggerKind.Invoke:
      return current;
    case languages.SignatureHelpTriggerKind.ContentChange:
      return previous;
    case languages.SignatureHelpTriggerKind.TriggerCharacter:
    default:
      return current;
  }
}
__name(mergeTriggerContexts, "mergeTriggerContexts");
export {
  ParameterHintsModel
};
//# sourceMappingURL=parameterHintsModel.js.map
