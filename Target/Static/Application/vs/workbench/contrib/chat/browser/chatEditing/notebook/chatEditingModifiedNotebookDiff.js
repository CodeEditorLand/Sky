var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { computeDiff } from "../../../../notebook/common/notebookDiff.js";
import { INotebookEditorModelResolverService } from "../../../../notebook/common/notebookEditorModelResolverService.js";
import { INotebookLoggingService } from "../../../../notebook/common/notebookLoggingService.js";
import { INotebookEditorWorkerService } from "../../../../notebook/common/services/notebookWorkerService.js";
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
let ChatEditingModifiedNotebookDiff = class ChatEditingModifiedNotebookDiff2 {
  static {
    __name(this, "ChatEditingModifiedNotebookDiff");
  }
  static {
    this.NewModelCounter = 0;
  }
  constructor(original, modified, notebookEditorWorkerService, notebookLoggingService, notebookEditorModelService) {
    this.original = original;
    this.modified = modified;
    this.notebookEditorWorkerService = notebookEditorWorkerService;
    this.notebookLoggingService = notebookLoggingService;
    this.notebookEditorModelService = notebookEditorModelService;
  }
  async computeDiff() {
    let added = 0;
    let removed = 0;
    const disposables = new DisposableStore();
    try {
      const [modifiedRef, originalRef] = await Promise.all([
        this.notebookEditorModelService.resolve(this.modified.snapshotUri),
        this.notebookEditorModelService.resolve(this.original.snapshotUri)
      ]);
      disposables.add(modifiedRef);
      disposables.add(originalRef);
      const notebookDiff = await this.notebookEditorWorkerService.computeDiff(this.original.snapshotUri, this.modified.snapshotUri);
      const result = computeDiff(originalRef.object.notebook, modifiedRef.object.notebook, notebookDiff);
      result.cellDiffInfo.forEach((diff) => {
        switch (diff.type) {
          case "modified":
          case "insert":
            added++;
            break;
          case "delete":
            removed++;
            break;
          default:
            break;
        }
      });
    } catch (e) {
      this.notebookLoggingService.error("Notebook Chat", "Error computing diff:\n" + e);
    } finally {
      disposables.dispose();
    }
    return {
      added,
      removed,
      identical: added === 0 && removed === 0,
      quitEarly: false,
      modifiedURI: this.modified.snapshotUri,
      originalURI: this.original.snapshotUri
    };
  }
};
ChatEditingModifiedNotebookDiff = __decorate([
  __param(2, INotebookEditorWorkerService),
  __param(3, INotebookLoggingService),
  __param(4, INotebookEditorModelResolverService)
], ChatEditingModifiedNotebookDiff);
export {
  ChatEditingModifiedNotebookDiff
};
//# sourceMappingURL=chatEditingModifiedNotebookDiff.js.map
