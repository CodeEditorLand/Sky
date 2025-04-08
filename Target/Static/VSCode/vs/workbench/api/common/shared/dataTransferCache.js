var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { coalesce } from "../../../../base/common/arrays.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { IDataTransferFile, IReadonlyVSDataTransfer } from "../../../../base/common/dataTransfer.js";
class DataTransferFileCache {
  static {
    __name(this, "DataTransferFileCache");
  }
  requestIdPool = 0;
  dataTransferFiles = /* @__PURE__ */ new Map();
  add(dataTransfer) {
    const requestId = this.requestIdPool++;
    this.dataTransferFiles.set(requestId, coalesce(Array.from(dataTransfer, ([, item]) => item.asFile())));
    return {
      id: requestId,
      dispose: /* @__PURE__ */ __name(() => {
        this.dataTransferFiles.delete(requestId);
      }, "dispose")
    };
  }
  async resolveFileData(requestId, dataItemId) {
    const files = this.dataTransferFiles.get(requestId);
    if (!files) {
      throw new Error("No data transfer found");
    }
    const file = files.find((file2) => file2.id === dataItemId);
    if (!file) {
      throw new Error("No matching file found in data transfer");
    }
    return VSBuffer.wrap(await file.data());
  }
  dispose() {
    this.dataTransferFiles.clear();
  }
}
export {
  DataTransferFileCache
};
//# sourceMappingURL=dataTransferCache.js.map
