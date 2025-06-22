var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../../../../base/common/buffer.js";
import { INotebookService } from "../../../../notebook/common/notebookService.js";
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
let ChatEditingNewNotebookContentEdits = class ChatEditingNewNotebookContentEdits2 {
  static {
    __name(this, "ChatEditingNewNotebookContentEdits");
  }
  constructor(notebook, _notebookService) {
    this.notebook = notebook;
    this._notebookService = _notebookService;
    this.textEdits = [];
  }
  acceptTextEdits(edits) {
    if (edits.length) {
      this.textEdits.push(...edits);
    }
  }
  async generateEdits() {
    if (this.notebook.cells.length) {
      console.error(`Notebook edits not generated as notebook already has cells`);
      return [];
    }
    const content = this.generateContent();
    if (!content) {
      return [];
    }
    const notebookEdits = [];
    try {
      const { serializer } = await this._notebookService.withNotebookDataProvider(this.notebook.viewType);
      const data = await serializer.dataToNotebook(VSBuffer.fromString(content));
      for (let i = 0; i < data.cells.length; i++) {
        notebookEdits.push({
          editType: 1,
          index: i,
          count: 0,
          cells: [data.cells[i]]
        });
      }
    } catch (ex) {
      console.error(`Failed to generate notebook edits from text edits ${content}`, ex);
      return [];
    }
    return notebookEdits;
  }
  generateContent() {
    try {
      return applyTextEdits(this.textEdits);
    } catch (ex) {
      console.error("Failed to generate content from text edits", ex);
      return "";
    }
  }
};
ChatEditingNewNotebookContentEdits = __decorate([
  __param(1, INotebookService)
], ChatEditingNewNotebookContentEdits);
function applyTextEdits(edits) {
  let output = "";
  for (const edit of edits) {
    output = output.slice(0, edit.range.startColumn) + edit.text + output.slice(edit.range.endColumn);
  }
  return output;
}
__name(applyTextEdits, "applyTextEdits");
export {
  ChatEditingNewNotebookContentEdits
};
//# sourceMappingURL=chatEditingNewNotebookContentEdits.js.map
