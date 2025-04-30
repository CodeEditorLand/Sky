var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DisposableStore } from "../../common/lifecycle.js";
import { autorun } from "../../common/observable.js";
import { createStyleSheet2 } from "../domStylesheets.js";
function createStyleSheetFromObservable(css) {
  const store = new DisposableStore();
  const w = store.add(createStyleSheet2());
  store.add(autorun((reader) => {
    w.setStyle(css.read(reader));
  }));
  return store;
}
__name(createStyleSheetFromObservable, "createStyleSheetFromObservable");
export {
  createStyleSheetFromObservable
};
//# sourceMappingURL=domObservable.js.map
