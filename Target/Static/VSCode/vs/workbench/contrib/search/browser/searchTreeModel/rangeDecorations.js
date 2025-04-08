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
import { IDisposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { ITextModel, TrackedRangeStickiness } from "../../../../../editor/common/model.js";
import { ModelDecorationOptions } from "../../../../../editor/common/model/textModel.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { Range } from "../../../../../editor/common/core/range.js";
let RangeHighlightDecorations = class {
  constructor(_modelService) {
    this._modelService = _modelService;
  }
  static {
    __name(this, "RangeHighlightDecorations");
  }
  _decorationId = null;
  _model = null;
  _modelDisposables = new DisposableStore();
  removeHighlightRange() {
    if (this._model && this._decorationId) {
      const decorationId = this._decorationId;
      this._model.changeDecorations((accessor) => {
        accessor.removeDecoration(decorationId);
      });
    }
    this._decorationId = null;
  }
  highlightRange(resource, range, ownerId = 0) {
    let model;
    if (URI.isUri(resource)) {
      model = this._modelService.getModel(resource);
    } else {
      model = resource;
    }
    if (model) {
      this.doHighlightRange(model, range);
    }
  }
  doHighlightRange(model, range) {
    this.removeHighlightRange();
    model.changeDecorations((accessor) => {
      this._decorationId = accessor.addDecoration(range, RangeHighlightDecorations._RANGE_HIGHLIGHT_DECORATION);
    });
    this.setModel(model);
  }
  setModel(model) {
    if (this._model !== model) {
      this.clearModelListeners();
      this._model = model;
      this._modelDisposables.add(this._model.onDidChangeDecorations((e) => {
        this.clearModelListeners();
        this.removeHighlightRange();
        this._model = null;
      }));
      this._modelDisposables.add(this._model.onWillDispose(() => {
        this.clearModelListeners();
        this.removeHighlightRange();
        this._model = null;
      }));
    }
  }
  clearModelListeners() {
    this._modelDisposables.clear();
  }
  dispose() {
    if (this._model) {
      this.removeHighlightRange();
      this._model = null;
    }
    this._modelDisposables.dispose();
  }
  static _RANGE_HIGHLIGHT_DECORATION = ModelDecorationOptions.register({
    description: "search-range-highlight",
    stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
    className: "rangeHighlight",
    isWholeLine: true
  });
};
RangeHighlightDecorations = __decorateClass([
  __decorateParam(0, IModelService)
], RangeHighlightDecorations);
export {
  RangeHighlightDecorations
};
//# sourceMappingURL=rangeDecorations.js.map
