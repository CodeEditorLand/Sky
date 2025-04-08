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
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, DisposableMap, DisposableStore } from "../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { Range } from "../../../../editor/common/core/range.js";
import { ITreeSitterParserService } from "../../../../editor/common/services/treeSitterParserService.js";
let TreeSitterCodeEditors = class extends Disposable {
  constructor(_languageId, _codeEditorService, _treeSitterParserService) {
    super();
    this._languageId = _languageId;
    this._codeEditorService = _codeEditorService;
    this._treeSitterParserService = _treeSitterParserService;
    this._register(this._codeEditorService.onCodeEditorAdd(this._onCodeEditorAdd, this));
    this._register(this._codeEditorService.onCodeEditorRemove(this._onCodeEditorRemove, this));
    this._codeEditorService.listCodeEditors().forEach(this._onCodeEditorAdd, this);
  }
  static {
    __name(this, "TreeSitterCodeEditors");
  }
  _textModels = /* @__PURE__ */ new Set();
  _languageEditors = this._register(new DisposableMap());
  _allEditors = this._register(new DisposableMap());
  _onDidChangeViewport = this._register(new Emitter());
  onDidChangeViewport = this._onDidChangeViewport.event;
  get textModels() {
    return Array.from(this._textModels.keys());
  }
  getEditorForModel(model) {
    return this._codeEditorService.listCodeEditors().find((editor) => editor.getModel() === model);
  }
  async getInitialViewPorts() {
    await this._treeSitterParserService.getLanguage(this._languageId);
    const editors = this._codeEditorService.listCodeEditors();
    const viewports = [];
    for (const editor of editors) {
      const model = await this.getEditorModel(editor);
      if (model && model.getLanguageId() === this._languageId) {
        viewports.push({
          model,
          ranges: this._nonIntersectingViewPortRanges(editor)
        });
      }
    }
    return viewports;
  }
  _onCodeEditorRemove(editor) {
    this._allEditors.deleteAndDispose(editor);
  }
  async getEditorModel(editor) {
    let model = editor.getModel() ?? void 0;
    if (!model) {
      const disposableStore = this._register(new DisposableStore());
      await Event.toPromise(Event.once(editor.onDidChangeModel), disposableStore);
      model = editor.getModel() ?? void 0;
    }
    return model;
  }
  async _onCodeEditorAdd(editor) {
    const otherEditorDisposables = new DisposableStore();
    otherEditorDisposables.add(editor.onDidChangeModel(() => this._onDidChangeModel(editor, editor.getModel()), this));
    this._allEditors.set(editor, otherEditorDisposables);
    const model = editor.getModel();
    if (model) {
      this._tryAddEditor(editor, model);
    }
  }
  _tryAddEditor(editor, model) {
    const language = model.getLanguageId();
    if (language === this._languageId) {
      if (!this._textModels.has(model)) {
        this._textModels.add(model);
      }
      if (!this._languageEditors.has(editor)) {
        const langaugeEditorDisposables = new DisposableStore();
        langaugeEditorDisposables.add(editor.onDidScrollChange(() => this._onViewportChange(editor), this));
        this._languageEditors.set(editor, langaugeEditorDisposables);
        this._onViewportChange(editor);
      }
    }
  }
  async _onDidChangeModel(editor, model) {
    if (model) {
      this._tryAddEditor(editor, model);
    } else {
      this._languageEditors.deleteAndDispose(editor);
    }
  }
  async _onViewportChange(editor) {
    const ranges = this._nonIntersectingViewPortRanges(editor);
    const model = editor.getModel();
    if (!model) {
      this._languageEditors.deleteAndDispose(editor);
      return;
    }
    this._onDidChangeViewport.fire({ model, ranges });
  }
  _nonIntersectingViewPortRanges(editor) {
    const viewportRanges = editor.getVisibleRangesPlusViewportAboveBelow();
    const nonIntersectingRanges = [];
    for (const range of viewportRanges) {
      if (nonIntersectingRanges.length !== 0) {
        const prev = nonIntersectingRanges[nonIntersectingRanges.length - 1];
        if (Range.areOnlyIntersecting(prev, range)) {
          const newRange = prev.plusRange(range);
          nonIntersectingRanges[nonIntersectingRanges.length - 1] = newRange;
          continue;
        }
      }
      nonIntersectingRanges.push(range);
    }
    return nonIntersectingRanges;
  }
};
TreeSitterCodeEditors = __decorateClass([
  __decorateParam(1, ICodeEditorService),
  __decorateParam(2, ITreeSitterParserService)
], TreeSitterCodeEditors);
export {
  TreeSitterCodeEditors
};
//# sourceMappingURL=treeSitterCodeEditors.js.map
