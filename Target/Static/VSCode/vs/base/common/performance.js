var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function _definePolyfillMarks(timeOrigin) {
  const _data = [];
  if (typeof timeOrigin === "number") {
    _data.push("code/timeOrigin", timeOrigin);
  }
  function mark2(name, markOptions) {
    _data.push(name, markOptions?.startTime ?? Date.now());
  }
  __name(mark2, "mark");
  function getMarks2() {
    const result = [];
    for (let i = 0; i < _data.length; i += 2) {
      result.push({
        name: _data[i],
        startTime: _data[i + 1]
      });
    }
    return result;
  }
  __name(getMarks2, "getMarks");
  return { mark: mark2, getMarks: getMarks2 };
}
__name(_definePolyfillMarks, "_definePolyfillMarks");
function _define() {
  if (typeof performance === "object" && typeof performance.mark === "function" && !performance.nodeTiming) {
    if (typeof performance.timeOrigin !== "number" && !performance.timing) {
      return _definePolyfillMarks();
    } else {
      return {
        mark(name, markOptions) {
          performance.mark(name, markOptions);
        },
        getMarks() {
          let timeOrigin = performance.timeOrigin;
          if (typeof timeOrigin !== "number") {
            timeOrigin = performance.timing.navigationStart || performance.timing.redirectStart || performance.timing.fetchStart;
          }
          const result = [{ name: "code/timeOrigin", startTime: Math.round(timeOrigin) }];
          for (const entry of performance.getEntriesByType("mark")) {
            result.push({
              name: entry.name,
              startTime: Math.round(timeOrigin + entry.startTime)
            });
          }
          return result;
        }
      };
    }
  } else if (typeof process === "object") {
    const timeOrigin = performance?.timeOrigin;
    return _definePolyfillMarks(timeOrigin);
  } else {
    console.trace("perf-util loaded in UNKNOWN environment");
    return _definePolyfillMarks();
  }
}
__name(_define, "_define");
function _factory(sharedObj) {
  if (!sharedObj.MonacoPerformanceMarks) {
    sharedObj.MonacoPerformanceMarks = _define();
  }
  return sharedObj.MonacoPerformanceMarks;
}
__name(_factory, "_factory");
const perf = _factory(globalThis);
const mark = perf.mark;
const getMarks = perf.getMarks;
export {
  getMarks,
  mark
};
//# sourceMappingURL=performance.js.map
