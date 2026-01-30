var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../nls.js";
const collectTestStateCounts = /* @__PURE__ */ __name((isRunning, results) => {
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let running = 0;
  let queued = 0;
  for (const result of results) {
    const count = result.counts;
    failed += count[
      6
      /* TestResultState.Errored */
    ] + count[
      4
      /* TestResultState.Failed */
    ];
    passed += count[
      3
      /* TestResultState.Passed */
    ];
    skipped += count[
      5
      /* TestResultState.Skipped */
    ];
    running += count[
      2
      /* TestResultState.Running */
    ];
    queued += count[
      1
      /* TestResultState.Queued */
    ];
  }
  return {
    isRunning,
    passed,
    failed,
    runSoFar: passed + failed,
    totalWillBeRun: passed + failed + queued + running,
    skipped
  };
}, "collectTestStateCounts");
const getTestProgressText = /* @__PURE__ */ __name(({ isRunning, passed, runSoFar, totalWillBeRun, skipped, failed }) => {
  let percent = passed / runSoFar * 100;
  if (failed > 0) {
    percent = Math.min(percent, 99.9);
  } else if (runSoFar === 0) {
    percent = 0;
  }
  if (isRunning) {
    if (runSoFar === 0) {
      return localize("testProgress.runningInitial", "Running tests...");
    } else if (skipped === 0) {
      return localize("testProgress.running", "Running tests, {0}/{1} passed ({2}%)", passed, totalWillBeRun, percent.toPrecision(3));
    } else {
      return localize("testProgressWithSkip.running", "Running tests, {0}/{1} tests passed ({2}%, {3} skipped)", passed, totalWillBeRun, percent.toPrecision(3), skipped);
    }
  } else {
    if (skipped === 0) {
      return localize("testProgress.completed", "{0}/{1} tests passed ({2}%)", passed, runSoFar, percent.toPrecision(3));
    } else {
      return localize("testProgressWithSkip.completed", "{0}/{1} tests passed ({2}%, {3} skipped)", passed, runSoFar, percent.toPrecision(3), skipped);
    }
  }
}, "getTestProgressText");
export {
  collectTestStateCounts,
  getTestProgressText
};
//# sourceMappingURL=testingProgressMessages.js.map
