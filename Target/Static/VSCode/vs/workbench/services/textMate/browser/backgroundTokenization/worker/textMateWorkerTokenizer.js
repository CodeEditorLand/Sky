var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { importAMDNodeModule } from "../../../../../../amdX.js";
import { RunOnceScheduler } from "../../../../../../base/common/async.js";
import { observableValue } from "../../../../../../base/common/observable.js";
import { setTimeout0 } from "../../../../../../base/common/platform.js";
import { URI } from "../../../../../../base/common/uri.js";
import { LineRange } from "../../../../../../editor/common/core/lineRange.js";
import { LanguageId } from "../../../../../../editor/common/encodedTokenAttributes.js";
import { IModelChangedEvent, MirrorTextModel } from "../../../../../../editor/common/model/mirrorTextModel.js";
import { TokenizerWithStateStore } from "../../../../../../editor/common/model/textModelTokens.js";
import { ContiguousMultilineTokensBuilder } from "../../../../../../editor/common/tokens/contiguousMultilineTokensBuilder.js";
import { LineTokens } from "../../../../../../editor/common/tokens/lineTokens.js";
import { TextMateTokenizationSupport } from "../../tokenizationSupport/textMateTokenizationSupport.js";
import { TokenizationSupportWithLineLimit } from "../../tokenizationSupport/tokenizationSupportWithLineLimit.js";
import { ICreateGrammarResult } from "../../../common/TMGrammarFactory.js";
import { StateDeltas } from "./textMateTokenizationWorker.worker.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
class TextMateWorkerTokenizer extends MirrorTextModel {
  constructor(uri, lines, eol, versionId, _host, _languageId, _encodedLanguageId, maxTokenizationLineLength) {
    super(uri, lines, eol, versionId);
    this._host = _host;
    this._languageId = _languageId;
    this._encodedLanguageId = _encodedLanguageId;
    this._maxTokenizationLineLength.set(maxTokenizationLineLength, void 0);
    this._resetTokenization();
  }
  static {
    __name(this, "TextMateWorkerTokenizer");
  }
  _tokenizerWithStateStore = null;
  _isDisposed = false;
  _maxTokenizationLineLength = observableValue(this, -1);
  _diffStateStacksRefEqFn;
  _tokenizeDebouncer = new RunOnceScheduler(() => this._tokenize(), 10);
  dispose() {
    this._isDisposed = true;
    super.dispose();
  }
  onLanguageId(languageId, encodedLanguageId) {
    this._languageId = languageId;
    this._encodedLanguageId = encodedLanguageId;
    this._resetTokenization();
  }
  onEvents(e) {
    super.onEvents(e);
    this._tokenizerWithStateStore?.store.acceptChanges(e.changes);
    this._tokenizeDebouncer.schedule();
  }
  acceptMaxTokenizationLineLength(maxTokenizationLineLength) {
    this._maxTokenizationLineLength.set(maxTokenizationLineLength, void 0);
  }
  retokenize(startLineNumber, endLineNumberExclusive) {
    if (this._tokenizerWithStateStore) {
      this._tokenizerWithStateStore.store.invalidateEndStateRange(new LineRange(startLineNumber, endLineNumberExclusive));
      this._tokenizeDebouncer.schedule();
    }
  }
  async _resetTokenization() {
    this._tokenizerWithStateStore = null;
    const languageId = this._languageId;
    const encodedLanguageId = this._encodedLanguageId;
    const r = await this._host.getOrCreateGrammar(languageId, encodedLanguageId);
    if (this._isDisposed || languageId !== this._languageId || encodedLanguageId !== this._encodedLanguageId || !r) {
      return;
    }
    if (r.grammar) {
      const tokenizationSupport = new TokenizationSupportWithLineLimit(
        this._encodedLanguageId,
        new TextMateTokenizationSupport(
          r.grammar,
          r.initialState,
          false,
          void 0,
          () => false,
          (timeMs, lineLength, isRandomSample) => {
            this._host.reportTokenizationTime(timeMs, languageId, r.sourceExtensionId, lineLength, isRandomSample);
          },
          false
        ),
        Disposable.None,
        this._maxTokenizationLineLength
      );
      this._tokenizerWithStateStore = new TokenizerWithStateStore(this._lines.length, tokenizationSupport);
    } else {
      this._tokenizerWithStateStore = null;
    }
    this._tokenize();
  }
  async _tokenize() {
    if (this._isDisposed || !this._tokenizerWithStateStore) {
      return;
    }
    if (!this._diffStateStacksRefEqFn) {
      const { diffStateStacksRefEq } = await importAMDNodeModule("vscode-textmate", "release/main.js");
      this._diffStateStacksRefEqFn = diffStateStacksRefEq;
    }
    const startTime = (/* @__PURE__ */ new Date()).getTime();
    while (true) {
      let tokenizedLines = 0;
      const tokenBuilder = new ContiguousMultilineTokensBuilder();
      const stateDeltaBuilder = new StateDeltaBuilder();
      while (true) {
        const lineToTokenize = this._tokenizerWithStateStore.getFirstInvalidLine();
        if (lineToTokenize === null || tokenizedLines > 200) {
          break;
        }
        tokenizedLines++;
        const text = this._lines[lineToTokenize.lineNumber - 1];
        const r = this._tokenizerWithStateStore.tokenizationSupport.tokenizeEncoded(text, true, lineToTokenize.startState);
        if (this._tokenizerWithStateStore.store.setEndState(lineToTokenize.lineNumber, r.endState)) {
          const delta = this._diffStateStacksRefEqFn(lineToTokenize.startState, r.endState);
          stateDeltaBuilder.setState(lineToTokenize.lineNumber, delta);
        } else {
          stateDeltaBuilder.setState(lineToTokenize.lineNumber, null);
        }
        LineTokens.convertToEndOffset(r.tokens, text.length);
        tokenBuilder.add(lineToTokenize.lineNumber, r.tokens);
        const deltaMs2 = (/* @__PURE__ */ new Date()).getTime() - startTime;
        if (deltaMs2 > 20) {
          break;
        }
      }
      if (tokenizedLines === 0) {
        break;
      }
      const stateDeltas = stateDeltaBuilder.getStateDeltas();
      this._host.setTokensAndStates(
        this._versionId,
        tokenBuilder.serialize(),
        stateDeltas
      );
      const deltaMs = (/* @__PURE__ */ new Date()).getTime() - startTime;
      if (deltaMs > 20) {
        setTimeout0(() => this._tokenize());
        return;
      }
    }
  }
}
class StateDeltaBuilder {
  static {
    __name(this, "StateDeltaBuilder");
  }
  _lastStartLineNumber = -1;
  _stateDeltas = [];
  setState(lineNumber, stackDiff) {
    if (lineNumber === this._lastStartLineNumber + 1) {
      this._stateDeltas[this._stateDeltas.length - 1].stateDeltas.push(stackDiff);
    } else {
      this._stateDeltas.push({ startLineNumber: lineNumber, stateDeltas: [stackDiff] });
    }
    this._lastStartLineNumber = lineNumber;
  }
  getStateDeltas() {
    return this._stateDeltas;
  }
}
export {
  TextMateWorkerTokenizer
};
//# sourceMappingURL=textMateWorkerTokenizer.js.map
