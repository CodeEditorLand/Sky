import { Event } from "../../../../base/common/event.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { URI } from "../../../../base/common/uri.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { SaveSource } from "../../../common/editor.js";
const IWorkingCopyHistoryService = createDecorator("workingCopyHistoryService");
const MAX_PARALLEL_HISTORY_IO_OPS = 20;
export {
  IWorkingCopyHistoryService,
  MAX_PARALLEL_HISTORY_IO_OPS
};
//# sourceMappingURL=workingCopyHistory.js.map
