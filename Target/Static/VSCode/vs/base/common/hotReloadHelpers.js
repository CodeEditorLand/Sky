var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isHotReloadEnabled, registerHotReloadHandler } from "./hotReload.js";
import { constObservable, IObservable, IReader, ISettableObservable, observableSignalFromEvent, observableValue } from "./observable.js";
function readHotReloadableExport(value, reader) {
  observeHotReloadableExports([value], reader);
  return value;
}
__name(readHotReloadableExport, "readHotReloadableExport");
function observeHotReloadableExports(values, reader) {
  if (isHotReloadEnabled()) {
    const o = observableSignalFromEvent(
      "reload",
      (event) => registerHotReloadHandler(({ oldExports }) => {
        if (![...Object.values(oldExports)].some((v) => values.includes(v))) {
          return void 0;
        }
        return (_newExports) => {
          event(void 0);
          return true;
        };
      })
    );
    o.read(reader);
  }
}
__name(observeHotReloadableExports, "observeHotReloadableExports");
const classes = /* @__PURE__ */ new Map();
function createHotClass(clazz) {
  if (!isHotReloadEnabled()) {
    return constObservable(clazz);
  }
  const id = clazz.name;
  let existing = classes.get(id);
  if (!existing) {
    existing = observableValue(id, clazz);
    classes.set(id, existing);
  } else {
    setTimeout(() => {
      existing.set(clazz, void 0);
    }, 0);
  }
  return existing;
}
__name(createHotClass, "createHotClass");
export {
  createHotClass,
  observeHotReloadableExports,
  readHotReloadableExport
};
//# sourceMappingURL=hotReloadHelpers.js.map
