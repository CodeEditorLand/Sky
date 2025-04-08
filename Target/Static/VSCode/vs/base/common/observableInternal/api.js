var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ISettableObservable, ObservableValue } from "./base.js";
import { DebugNameData, IDebugNameData } from "./debugName.js";
import { EqualityComparer, strictEquals } from "./commonFacade/deps.js";
import { LazyObservableValue } from "./lazyObservableValue.js";
function observableValueOpts(options, initialValue) {
  if (options.lazy) {
    return new LazyObservableValue(
      new DebugNameData(options.owner, options.debugName, void 0),
      initialValue,
      options.equalsFn ?? strictEquals
    );
  }
  return new ObservableValue(
    new DebugNameData(options.owner, options.debugName, void 0),
    initialValue,
    options.equalsFn ?? strictEquals
  );
}
__name(observableValueOpts, "observableValueOpts");
export {
  observableValueOpts
};
//# sourceMappingURL=api.js.map
