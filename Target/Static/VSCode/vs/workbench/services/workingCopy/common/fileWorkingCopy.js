import { IDisposable } from "../../../../base/common/lifecycle.js";
import { Event } from "../../../../base/common/event.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { VSBufferReadableStream } from "../../../../base/common/buffer.js";
import { URI } from "../../../../base/common/uri.js";
import { IWorkingCopy } from "./workingCopy.js";
var SnapshotContext = /* @__PURE__ */ ((SnapshotContext2) => {
  SnapshotContext2[SnapshotContext2["Save"] = 1] = "Save";
  SnapshotContext2[SnapshotContext2["Backup"] = 2] = "Backup";
  return SnapshotContext2;
})(SnapshotContext || {});
export {
  SnapshotContext
};
//# sourceMappingURL=fileWorkingCopy.js.map
