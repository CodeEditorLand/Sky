var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../../base/common/event.js";
import { EditorResourceAccessor, SideBySideEditor } from "../../../common/editor.js";
import { EditorPane } from "./editorPane.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { MutableDisposable } from "../../../../base/common/lifecycle.js";
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
let AbstractEditorWithViewState = class AbstractEditorWithViewState2 extends EditorPane {
  static {
    __name(this, "AbstractEditorWithViewState");
  }
  constructor(id, group, viewStateStorageKey, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService) {
    super(id, group, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.textResourceConfigurationService = textResourceConfigurationService;
    this.editorService = editorService;
    this.editorGroupService = editorGroupService;
    this.groupListener = this._register(new MutableDisposable());
    this.viewState = this.getEditorMemento(editorGroupService, textResourceConfigurationService, viewStateStorageKey, 100);
  }
  setEditorVisible(visible) {
    this.groupListener.value = this.group.onWillCloseEditor((e) => this.onWillCloseEditor(e));
    super.setEditorVisible(visible);
  }
  onWillCloseEditor(e) {
    const editor = e.editor;
    if (editor === this.input) {
      this.updateEditorViewState(editor);
    }
  }
  clearInput() {
    this.updateEditorViewState(this.input);
    super.clearInput();
  }
  saveState() {
    this.updateEditorViewState(this.input);
    super.saveState();
  }
  updateEditorViewState(input) {
    if (!input || !this.tracksEditorViewState(input)) {
      return;
    }
    const resource = this.toEditorViewStateResource(input);
    if (!resource) {
      return;
    }
    if (!this.tracksDisposedEditorViewState()) {
      if (!this.editorViewStateDisposables) {
        this.editorViewStateDisposables = /* @__PURE__ */ new Map();
      }
      if (!this.editorViewStateDisposables.has(input)) {
        this.editorViewStateDisposables.set(input, Event.once(input.onWillDispose)(() => {
          this.clearEditorViewState(resource, this.group);
          this.editorViewStateDisposables?.delete(input);
        }));
      }
    }
    if (input.isDisposed() && !this.tracksDisposedEditorViewState() || !this.shouldRestoreEditorViewState(input) && !this.group.contains(input)) {
      this.clearEditorViewState(resource, this.group);
    } else if (!input.isDisposed()) {
      this.saveEditorViewState(resource);
    }
  }
  shouldRestoreEditorViewState(input, context) {
    if (context?.newInGroup) {
      return this.textResourceConfigurationService.getValue(EditorResourceAccessor.getOriginalUri(input, { supportSideBySide: SideBySideEditor.PRIMARY }), "workbench.editor.restoreViewState") === false ? false : true;
    }
    return true;
  }
  getViewState() {
    const input = this.input;
    if (!input || !this.tracksEditorViewState(input)) {
      return;
    }
    const resource = this.toEditorViewStateResource(input);
    if (!resource) {
      return;
    }
    return this.computeEditorViewState(resource);
  }
  saveEditorViewState(resource) {
    const editorViewState = this.computeEditorViewState(resource);
    if (!editorViewState) {
      return;
    }
    this.viewState.saveEditorState(this.group, resource, editorViewState);
  }
  loadEditorViewState(input, context) {
    if (!input) {
      return void 0;
    }
    if (!this.tracksEditorViewState(input)) {
      return void 0;
    }
    if (!this.shouldRestoreEditorViewState(input, context)) {
      return void 0;
    }
    const resource = this.toEditorViewStateResource(input);
    if (!resource) {
      return;
    }
    return this.viewState.loadEditorState(this.group, resource);
  }
  moveEditorViewState(source, target, comparer) {
    return this.viewState.moveEditorState(source, target, comparer);
  }
  clearEditorViewState(resource, group) {
    this.viewState.clearEditorState(resource, group);
  }
  dispose() {
    super.dispose();
    if (this.editorViewStateDisposables) {
      for (const [, disposables] of this.editorViewStateDisposables) {
        disposables.dispose();
      }
      this.editorViewStateDisposables = void 0;
    }
  }
  /**
   * Whether view state should be tracked even when the editor is
   * disposed.
   *
   * Subclasses should override this if the input can be restored
   * from the resource at a later point, e.g. if backed by files.
   */
  tracksDisposedEditorViewState() {
    return false;
  }
};
AbstractEditorWithViewState = __decorate([
  __param(3, ITelemetryService),
  __param(4, IInstantiationService),
  __param(5, IStorageService),
  __param(6, ITextResourceConfigurationService),
  __param(7, IThemeService),
  __param(8, IEditorService),
  __param(9, IEditorGroupsService)
], AbstractEditorWithViewState);
export {
  AbstractEditorWithViewState
};
//# sourceMappingURL=editorWithViewState.js.map
