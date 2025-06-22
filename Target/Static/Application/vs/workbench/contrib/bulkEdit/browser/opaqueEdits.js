var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isObject } from "../../../../base/common/types.js";
import { ResourceEdit } from "../../../../editor/browser/services/bulkEditService.js";
import { IUndoRedoService } from "../../../../platform/undoRedo/common/undoRedo.js";
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
class ResourceAttachmentEdit extends ResourceEdit {
  static {
    __name(this, "ResourceAttachmentEdit");
  }
  static is(candidate) {
    if (candidate instanceof ResourceAttachmentEdit) {
      return true;
    } else {
      return isObject(candidate) && Boolean(candidate.undo && candidate.redo);
    }
  }
  static lift(edit) {
    if (edit instanceof ResourceAttachmentEdit) {
      return edit;
    } else {
      return new ResourceAttachmentEdit(edit.resource, edit.undo, edit.redo, edit.metadata);
    }
  }
  constructor(resource, undo, redo, metadata) {
    super(metadata);
    this.resource = resource;
    this.undo = undo;
    this.redo = redo;
  }
}
let OpaqueEdits = class OpaqueEdits2 {
  static {
    __name(this, "OpaqueEdits");
  }
  constructor(_undoRedoGroup, _undoRedoSource, _progress, _token, _edits, _undoRedoService) {
    this._undoRedoGroup = _undoRedoGroup;
    this._undoRedoSource = _undoRedoSource;
    this._progress = _progress;
    this._token = _token;
    this._edits = _edits;
    this._undoRedoService = _undoRedoService;
  }
  async apply() {
    const resources = [];
    for (const edit of this._edits) {
      if (this._token.isCancellationRequested) {
        break;
      }
      await edit.redo();
      this._undoRedoService.pushElement({
        type: 0,
        resource: edit.resource,
        label: edit.metadata?.label || "Custom Edit",
        code: "paste",
        undo: edit.undo,
        redo: edit.redo
      }, this._undoRedoGroup, this._undoRedoSource);
      this._progress.report(void 0);
      resources.push(edit.resource);
    }
    return resources;
  }
};
OpaqueEdits = __decorate([
  __param(5, IUndoRedoService)
], OpaqueEdits);
export {
  OpaqueEdits,
  ResourceAttachmentEdit
};
//# sourceMappingURL=opaqueEdits.js.map
