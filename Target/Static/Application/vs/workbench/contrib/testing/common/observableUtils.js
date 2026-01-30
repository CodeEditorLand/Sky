var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function onObservableChange(observable, callback) {
  const o = {
    beginUpdate() {
    },
    endUpdate() {
    },
    handlePossibleChange(observable2) {
      observable2.reportChanges();
    },
    handleChange(_observable, change) {
      callback(change);
    }
  };
  observable.addObserver(o);
  return {
    dispose() {
      observable.removeObserver(o);
    }
  };
}
__name(onObservableChange, "onObservableChange");
export {
  onObservableChange
};
//# sourceMappingURL=observableUtils.js.map
