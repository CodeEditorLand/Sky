var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Disposable, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { Range } from "../../../common/core/range.js";
import { binarySearch } from "../../../../base/common/arrays.js";
import { Event, Emitter } from "../../../../base/common/event.js";
import { ILanguageConfigurationService } from "../../../common/languages/languageConfigurationRegistry.js";
import { StickyModelProvider, IStickyModelProvider } from "./stickyScrollModelProvider.js";
import { StickyElement, StickyModel, StickyRange } from "./stickyScrollElement.js";
class StickyLineCandidate {
  constructor(startLineNumber, endLineNumber, top, height) {
    this.startLineNumber = startLineNumber;
    this.endLineNumber = endLineNumber;
    this.top = top;
    this.height = height;
  }
  static {
    __name(this, "StickyLineCandidate");
  }
}
let StickyLineCandidateProvider = class extends Disposable {
  constructor(editor, _languageFeaturesService, _languageConfigurationService) {
    super();
    this._languageFeaturesService = _languageFeaturesService;
    this._languageConfigurationService = _languageConfigurationService;
    this._editor = editor;
    this._sessionStore = this._register(new DisposableStore());
    this._updateSoon = this._register(new RunOnceScheduler(() => this.update(), 50));
    this._register(this._editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(EditorOption.stickyScroll)) {
        this.readConfiguration();
      }
    }));
    this.readConfiguration();
  }
  static {
    __name(this, "StickyLineCandidateProvider");
  }
  static ID = "store.contrib.stickyScrollController";
  _onDidChangeStickyScroll = this._register(new Emitter());
  onDidChangeStickyScroll = this._onDidChangeStickyScroll.event;
  _editor;
  _updateSoon;
  _sessionStore;
  _model = null;
  _cts = null;
  _stickyModelProvider = null;
  readConfiguration() {
    this._sessionStore.clear();
    const options = this._editor.getOption(EditorOption.stickyScroll);
    if (!options.enabled) {
      return;
    }
    this._sessionStore.add(this._editor.onDidChangeModel(() => {
      this._model = null;
      this.updateStickyModelProvider();
      this._onDidChangeStickyScroll.fire();
      this.update();
    }));
    this._sessionStore.add(this._editor.onDidChangeHiddenAreas(() => this.update()));
    this._sessionStore.add(this._editor.onDidChangeModelContent(() => this._updateSoon.schedule()));
    this._sessionStore.add(this._languageFeaturesService.documentSymbolProvider.onDidChange(() => this.update()));
    this._sessionStore.add(toDisposable(() => {
      this._stickyModelProvider?.dispose();
      this._stickyModelProvider = null;
    }));
    this.updateStickyModelProvider();
    this.update();
  }
  getVersionId() {
    return this._model?.version;
  }
  updateStickyModelProvider() {
    this._stickyModelProvider?.dispose();
    this._stickyModelProvider = null;
    const editor = this._editor;
    if (editor.hasModel()) {
      this._stickyModelProvider = new StickyModelProvider(
        editor,
        () => this._updateSoon.schedule(),
        this._languageConfigurationService,
        this._languageFeaturesService
      );
    }
  }
  async update() {
    this._cts?.dispose(true);
    this._cts = new CancellationTokenSource();
    await this.updateStickyModel(this._cts.token);
    this._onDidChangeStickyScroll.fire();
  }
  async updateStickyModel(token) {
    if (!this._editor.hasModel() || !this._stickyModelProvider || this._editor.getModel().isTooLargeForTokenization()) {
      this._model = null;
      return;
    }
    const model = await this._stickyModelProvider.update(token);
    if (token.isCancellationRequested) {
      return;
    }
    this._model = model;
  }
  updateIndex(index) {
    if (index === -1) {
      index = 0;
    } else if (index < 0) {
      index = -index - 2;
    }
    return index;
  }
  getCandidateStickyLinesIntersectingFromStickyModel(range, outlineModel, result, depth, top, lastStartLineNumber) {
    if (outlineModel.children.length === 0) {
      return;
    }
    let lastLine = lastStartLineNumber;
    const childrenStartLines = [];
    for (let i = 0; i < outlineModel.children.length; i++) {
      const child = outlineModel.children[i];
      if (child.range) {
        childrenStartLines.push(child.range.startLineNumber);
      }
    }
    const lowerBound = this.updateIndex(binarySearch(childrenStartLines, range.startLineNumber, (a, b) => {
      return a - b;
    }));
    const upperBound = this.updateIndex(binarySearch(childrenStartLines, range.startLineNumber + depth, (a, b) => {
      return a - b;
    }));
    for (let i = lowerBound; i <= upperBound; i++) {
      const child = outlineModel.children[i];
      if (!child) {
        return;
      }
      const childRange = child.range;
      if (childRange) {
        const childStartLine = childRange.startLineNumber;
        const childEndLine = childRange.endLineNumber;
        if (range.startLineNumber <= childEndLine + 1 && childStartLine - 1 <= range.endLineNumber && childStartLine !== lastLine) {
          lastLine = childStartLine;
          const lineHeight = this._editor.getOption(EditorOption.lineHeight);
          result.push(new StickyLineCandidate(childStartLine, childEndLine - 1, top, lineHeight));
          this.getCandidateStickyLinesIntersectingFromStickyModel(range, child, result, depth + 1, top + lineHeight, childStartLine);
        }
      } else {
        this.getCandidateStickyLinesIntersectingFromStickyModel(range, child, result, depth, top, lastStartLineNumber);
      }
    }
  }
  getCandidateStickyLinesIntersecting(range) {
    if (!this._model?.element) {
      return [];
    }
    let stickyLineCandidates = [];
    this.getCandidateStickyLinesIntersectingFromStickyModel(range, this._model.element, stickyLineCandidates, 0, 0, -1);
    const hiddenRanges = this._editor._getViewModel()?.getHiddenAreas();
    if (hiddenRanges) {
      for (const hiddenRange of hiddenRanges) {
        stickyLineCandidates = stickyLineCandidates.filter((stickyLine) => !(stickyLine.startLineNumber >= hiddenRange.startLineNumber && stickyLine.endLineNumber <= hiddenRange.endLineNumber + 1));
      }
    }
    return stickyLineCandidates;
  }
};
StickyLineCandidateProvider = __decorateClass([
  __decorateParam(1, ILanguageFeaturesService),
  __decorateParam(2, ILanguageConfigurationService)
], StickyLineCandidateProvider);
export {
  StickyLineCandidate,
  StickyLineCandidateProvider
};
//# sourceMappingURL=stickyScrollProvider.js.map
