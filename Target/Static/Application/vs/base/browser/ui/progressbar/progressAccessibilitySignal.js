var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const nullScopedAccessibilityProgressSignalFactory = /* @__PURE__ */ __name(() => ({
  msLoopTime: -1,
  msDelayTime: -1,
  dispose: /* @__PURE__ */ __name(() => {
  }, "dispose")
}), "nullScopedAccessibilityProgressSignalFactory");
let progressAccessibilitySignalSchedulerFactory = nullScopedAccessibilityProgressSignalFactory;
function setProgressAccessibilitySignalScheduler(progressAccessibilitySignalScheduler) {
  progressAccessibilitySignalSchedulerFactory = progressAccessibilitySignalScheduler;
}
__name(setProgressAccessibilitySignalScheduler, "setProgressAccessibilitySignalScheduler");
function getProgressAccessibilitySignalScheduler(msDelayTime, msLoopTime) {
  return progressAccessibilitySignalSchedulerFactory(msDelayTime, msLoopTime);
}
__name(getProgressAccessibilitySignalScheduler, "getProgressAccessibilitySignalScheduler");
export {
  getProgressAccessibilitySignalScheduler,
  setProgressAccessibilitySignalScheduler
};
//# sourceMappingURL=progressAccessibilitySignal.js.map
