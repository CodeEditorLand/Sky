var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
class QuickInputTreeSorter extends Disposable {
  static {
    __name(this, "QuickInputTreeSorter");
  }
  constructor() {
    super(...arguments);
    this._sortByLabel = true;
  }
  get sortByLabel() {
    return this._sortByLabel;
  }
  set sortByLabel(value) {
    this._sortByLabel = value;
  }
  compare(a, b) {
    if (!this._sortByLabel) {
      return 0;
    }
    if (a.label < b.label) {
      return -1;
    } else if (a.label > b.label) {
      return 1;
    }
    if (a.description && b.description) {
      if (a.description < b.description) {
        return -1;
      } else if (a.description > b.description) {
        return 1;
      }
    } else if (a.description) {
      return -1;
    } else if (b.description) {
      return 1;
    }
    return 0;
  }
}
export {
  QuickInputTreeSorter
};
//# sourceMappingURL=quickInputTreeSorter.js.map
