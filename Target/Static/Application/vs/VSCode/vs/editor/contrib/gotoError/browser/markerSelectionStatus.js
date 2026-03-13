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
import { isEqual } from "../../../../base/common/resources.js";
import { registerEditorContribution } from "../../../browser/editorExtensions.js";
import { Range } from "../../../common/core/range.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IMarkerService, MarkerSeverity } from "../../../../platform/markers/common/markers.js";
let MarkerSelectionStatus = class MarkerSelectionStatus2 extends Disposable {
  static {
    __name(this, "MarkerSelectionStatus");
  }
  static {
    this.ID = "editor.contrib.markerSelectionStatus";
  }
  constructor(_editor, contextKeyService, _markerService) {
    super();
    this._editor = _editor;
    this._markerService = _markerService;
    this._ctxHasDiagnostics = EditorContextKeys.selectionHasDiagnostics.bindTo(contextKeyService);
    this._store.add(this._editor.onDidChangeCursorSelection(() => this._update()));
    this._store.add(this._editor.onDidChangeModel(() => this._update()));
    this._store.add(this._markerService.onMarkerChanged((e) => {
      const model = this._editor.getModel();
      if (model && e.some((uri) => isEqual(uri, model.uri))) {
        this._update();
      }
    }));
    this._update();
  }
  dispose() {
    this._ctxHasDiagnostics.reset();
    super.dispose();
  }
  _update() {
    const model = this._editor.getModel();
    const selection = this._editor.getSelection();
    if (!model || !selection) {
      this._ctxHasDiagnostics.reset();
      return;
    }
    const markers = this._markerService.read({
      resource: model.uri,
      severities: MarkerSeverity.Error | MarkerSeverity.Warning | MarkerSeverity.Info
    });
    const hasIntersecting = markers.some((marker) => Range.areIntersecting({ startLineNumber: marker.startLineNumber, startColumn: marker.startColumn, endLineNumber: marker.endLineNumber, endColumn: marker.endColumn }, selection));
    this._ctxHasDiagnostics.set(hasIntersecting);
  }
};
MarkerSelectionStatus = __decorate([
  __param(1, IContextKeyService),
  __param(2, IMarkerService)
], MarkerSelectionStatus);
registerEditorContribution(
  MarkerSelectionStatus.ID,
  MarkerSelectionStatus,
  1
  /* EditorContributionInstantiation.AfterFirstRender */
);
//# sourceMappingURL=markerSelectionStatus.js.map
