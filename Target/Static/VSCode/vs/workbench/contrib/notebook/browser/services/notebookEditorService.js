import { CodeWindow } from "../../../../../base/browser/window.js";
import { createDecorator, ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
import { INotebookEditor, INotebookEditorCreationOptions } from "../notebookBrowser.js";
import { Event } from "../../../../../base/common/event.js";
import { Dimension } from "../../../../../base/browser/dom.js";
import { NotebookEditorWidget } from "../notebookEditorWidget.js";
import { URI } from "../../../../../base/common/uri.js";
const INotebookEditorService = createDecorator("INotebookEditorWidgetService");
export {
  INotebookEditorService
};
//# sourceMappingURL=notebookEditorService.js.map
