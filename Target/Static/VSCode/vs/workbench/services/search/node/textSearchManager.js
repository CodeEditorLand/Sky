var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { toCanonicalName } from "../../textfile/common/encoding.js";
import * as pfs from "../../../../base/node/pfs.js";
import { ITextQuery, ITextSearchStats } from "../common/search.js";
import { TextSearchProvider2 } from "../common/searchExtTypes.js";
import { TextSearchManager } from "../common/textSearchManager.js";
class NativeTextSearchManager extends TextSearchManager {
  static {
    __name(this, "NativeTextSearchManager");
  }
  constructor(query, provider, _pfs = pfs, processType = "searchProcess") {
    super({ query, provider }, {
      readdir: /* @__PURE__ */ __name((resource) => _pfs.Promises.readdir(resource.fsPath), "readdir"),
      toCanonicalName: /* @__PURE__ */ __name((name) => toCanonicalName(name), "toCanonicalName")
    }, processType);
  }
}
export {
  NativeTextSearchManager
};
//# sourceMappingURL=textSearchManager.js.map
