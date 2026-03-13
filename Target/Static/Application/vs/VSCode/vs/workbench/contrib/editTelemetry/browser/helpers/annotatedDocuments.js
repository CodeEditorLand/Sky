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
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { mapObservableArrayCached, derived, derivedObservableWithCache, observableFromEvent, observableSignalFromEvent } from "../../../../../base/common/observable.js";
import { isDefined } from "../../../../../base/common/types.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { EditorResourceAccessor } from "../../../../common/editor.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { DocumentWithSourceAnnotatedEdits, CombineStreamedChanges, MinimizeEditsProcessor } from "./documentWithAnnotatedEdits.js";
let AnnotatedDocuments = class AnnotatedDocuments2 extends Disposable {
  static {
    __name(this, "AnnotatedDocuments");
  }
  constructor(_workspace, _instantiationService) {
    super();
    this._workspace = _workspace;
    this._instantiationService = _instantiationService;
    const uriVisibilityProvider = this._instantiationService.createInstance(UriVisibilityProvider);
    this._states = mapObservableArrayCached(this, this._workspace.documents, (doc, store) => {
      const docIsVisible = derived((reader) => uriVisibilityProvider.isVisible(doc.uri, reader));
      const wasEverVisible = derivedObservableWithCache(this, (reader, lastVal) => lastVal || docIsVisible.read(reader));
      return wasEverVisible.map((v) => v ? store.add(this._instantiationService.createInstance(AnnotatedDocument, doc, docIsVisible)) : void 0);
    });
    this.documents = this._states.map((vals, reader) => vals.map((v) => v.read(reader)).filter(isDefined));
    this.documents.recomputeInitiallyAndOnChange(this._store);
  }
};
AnnotatedDocuments = __decorate([
  __param(1, IInstantiationService)
], AnnotatedDocuments);
let UriVisibilityProvider = class UriVisibilityProvider2 {
  static {
    __name(this, "UriVisibilityProvider");
  }
  constructor(_editorGroupsService) {
    this._editorGroupsService = _editorGroupsService;
    const onDidAddGroupSignal = observableSignalFromEvent(this, this._editorGroupsService.onDidAddGroup);
    const onDidRemoveGroupSignal = observableSignalFromEvent(this, this._editorGroupsService.onDidRemoveGroup);
    const groups = derived(this, (reader) => {
      onDidAddGroupSignal.read(reader);
      onDidRemoveGroupSignal.read(reader);
      return this._editorGroupsService.groups;
    });
    this.visibleUris = mapObservableArrayCached(this, groups, (g) => {
      const editors = observableFromEvent(this, g.onDidModelChange, () => g.editors);
      return editors.map((e) => e.map((editor) => EditorResourceAccessor.getCanonicalUri(editor)));
    }).map((editors, reader) => {
      const map = /* @__PURE__ */ new Map();
      for (const urisObs of editors) {
        for (const uri of urisObs.read(reader)) {
          if (isDefined(uri)) {
            map.set(uri.toString(), uri);
          }
        }
      }
      return map;
    });
  }
  isVisible(uri, reader) {
    return this.visibleUris.read(reader).has(uri.toString());
  }
};
UriVisibilityProvider = __decorate([
  __param(0, IEditorGroupsService)
], UriVisibilityProvider);
let AnnotatedDocument = class AnnotatedDocument2 extends Disposable {
  static {
    __name(this, "AnnotatedDocument");
  }
  constructor(document, isVisible, _instantiationService) {
    super();
    this.document = document;
    this.isVisible = isVisible;
    this._instantiationService = _instantiationService;
    let processedDoc = this._store.add(new DocumentWithSourceAnnotatedEdits(document));
    processedDoc = this._store.add(this._instantiationService.createInstance(CombineStreamedChanges, processedDoc));
    processedDoc = this._store.add(new MinimizeEditsProcessor(processedDoc));
    this.documentWithAnnotations = processedDoc;
  }
};
AnnotatedDocument = __decorate([
  __param(2, IInstantiationService)
], AnnotatedDocument);
export {
  AnnotatedDocument,
  AnnotatedDocuments,
  UriVisibilityProvider
};
//# sourceMappingURL=annotatedDocuments.js.map
