var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equals } from "../../../base/common/arrays.js";
import { RunOnceScheduler } from "../../../base/common/async.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { LineRange } from "../core/lineRange.js";
class AttachedViews {
  static {
    __name(this, "AttachedViews");
  }
  constructor() {
    this._onDidChangeVisibleRanges = new Emitter();
    this.onDidChangeVisibleRanges = this._onDidChangeVisibleRanges.event;
    this._views = /* @__PURE__ */ new Set();
  }
  attachView() {
    const view = new AttachedViewImpl((state) => {
      this._onDidChangeVisibleRanges.fire({ view, state });
    });
    this._views.add(view);
    return view;
  }
  detachView(view) {
    this._views.delete(view);
    this._onDidChangeVisibleRanges.fire({ view, state: void 0 });
  }
}
class AttachedViewImpl {
  static {
    __name(this, "AttachedViewImpl");
  }
  constructor(handleStateChange) {
    this.handleStateChange = handleStateChange;
  }
  setVisibleLines(visibleLines, stabilized) {
    const visibleLineRanges = visibleLines.map((line) => new LineRange(line.startLineNumber, line.endLineNumber + 1));
    this.handleStateChange({ visibleLineRanges, stabilized });
  }
}
class AttachedViewHandler extends Disposable {
  static {
    __name(this, "AttachedViewHandler");
  }
  get lineRanges() {
    return this._lineRanges;
  }
  constructor(_refreshTokens) {
    super();
    this._refreshTokens = _refreshTokens;
    this.runner = this._register(new RunOnceScheduler(() => this.update(), 50));
    this._computedLineRanges = [];
    this._lineRanges = [];
  }
  update() {
    if (equals(this._computedLineRanges, this._lineRanges, (a, b) => a.equals(b))) {
      return;
    }
    this._computedLineRanges = this._lineRanges;
    this._refreshTokens();
  }
  handleStateChange(state) {
    this._lineRanges = state.visibleLineRanges;
    if (state.stabilized) {
      this.runner.cancel();
      this.update();
    } else {
      this.runner.schedule();
    }
  }
}
class AbstractTokens extends Disposable {
  static {
    __name(this, "AbstractTokens");
  }
  get backgroundTokenizationState() {
    return this._backgroundTokenizationState;
  }
  constructor(_languageIdCodec, _textModel, getLanguageId) {
    super();
    this._languageIdCodec = _languageIdCodec;
    this._textModel = _textModel;
    this.getLanguageId = getLanguageId;
    this._onDidChangeTokens = this._register(new Emitter());
    this.onDidChangeTokens = this._onDidChangeTokens.event;
  }
  tokenizeIfCheap(lineNumber) {
    if (this.isCheapToTokenize(lineNumber)) {
      this.forceTokenization(lineNumber);
    }
  }
}
export {
  AbstractTokens,
  AttachedViewHandler,
  AttachedViews
};
//# sourceMappingURL=tokens.js.map
