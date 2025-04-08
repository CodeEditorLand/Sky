import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { URI } from "../../../../base/common/uri.js";
import { IResolvedNotebookEditorModel, NotebookEditorModelCreationOptions } from "./notebookCommon.js";
import { IReference } from "../../../../base/common/lifecycle.js";
import { Event, IWaitUntil } from "../../../../base/common/event.js";
import { NotebookTextModel } from "./model/notebookTextModel.js";
const INotebookEditorModelResolverService = createDecorator("INotebookModelResolverService");
export {
  INotebookEditorModelResolverService
};
//# sourceMappingURL=notebookEditorModelResolverService.js.map
