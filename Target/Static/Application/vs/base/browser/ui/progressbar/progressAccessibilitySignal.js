var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const nullScopedAccessibilityProgressSignalFactory = /* @__PURE__ */ __name(() => ({
  msLoopTime: -1,
  msDelayTime: -1,
  dispose: /* @__PURE__ */ __name(() => {
  }, "dispose")
}), "nullScopedAccessibilityProgressSignalFactory");
let progressAccessibilitySignalSchedulerFactory = nullScopedAccessibilityProgressSignalFactory;
function setProgressAcccessibilitySignalScheduler(progressAccessibilitySignalScheduler) {
  progressAccessibilitySignalSchedulerFactory = progressAccessibilitySignalScheduler;
}
__name(setProgressAcccessibilitySignalScheduler, "setProgressAcccessibilitySignalScheduler");
function getProgressAcccessibilitySignalScheduler(msDelayTime, msLoopTime) {
  return progressAccessibilitySignalSchedulerFactory(msDelayTime, msLoopTime);
}
__name(getProgressAcccessibilitySignalScheduler, "getProgressAcccessibilitySignalScheduler");
export {
  getProgressAcccessibilitySignalScheduler,
  setProgressAcccessibilitySignalScheduler
};
//# sourceMappingURL=progressAccessibilitySignal.js.map
