import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { INotebookCellStatusBarItemList, INotebookCellStatusBarItemProvider } from "./notebookCommon.js";
const INotebookCellStatusBarService = createDecorator("notebookCellStatusBarService");
export {
  INotebookCellStatusBarService
};
//# sourceMappingURL=notebookCellStatusBarService.js.map
