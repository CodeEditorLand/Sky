var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var inputLatency;
((inputLatency2) => {
  const totalKeydownTime = { total: 0, min: Number.MAX_VALUE, max: 0 };
  const totalInputTime = { ...totalKeydownTime };
  const totalRenderTime = { ...totalKeydownTime };
  const totalInputLatencyTime = { ...totalKeydownTime };
  let measurementsCount = 0;
  let EventPhase;
  ((EventPhase2) => {
    EventPhase2[EventPhase2["Before"] = 0] = "Before";
    EventPhase2[EventPhase2["InProgress"] = 1] = "InProgress";
    EventPhase2[EventPhase2["Finished"] = 2] = "Finished";
  })(EventPhase || (EventPhase = {}));
  const state = {
    keydown: 0 /* Before */,
    input: 0 /* Before */,
    render: 0 /* Before */
  };
  function onKeyDown() {
    recordIfFinished();
    performance.mark("inputlatency/start");
    performance.mark("keydown/start");
    state.keydown = 1 /* InProgress */;
    queueMicrotask(markKeyDownEnd);
  }
  inputLatency2.onKeyDown = onKeyDown;
  __name(onKeyDown, "onKeyDown");
  function markKeyDownEnd() {
    if (state.keydown === 1 /* InProgress */) {
      performance.mark("keydown/end");
      state.keydown = 2 /* Finished */;
    }
  }
  __name(markKeyDownEnd, "markKeyDownEnd");
  function onBeforeInput() {
    performance.mark("input/start");
    state.input = 1 /* InProgress */;
    scheduleRecordIfFinishedTask();
  }
  inputLatency2.onBeforeInput = onBeforeInput;
  __name(onBeforeInput, "onBeforeInput");
  function onInput() {
    if (state.input === 0 /* Before */) {
      onBeforeInput();
    }
    queueMicrotask(markInputEnd);
  }
  inputLatency2.onInput = onInput;
  __name(onInput, "onInput");
  function markInputEnd() {
    if (state.input === 1 /* InProgress */) {
      performance.mark("input/end");
      state.input = 2 /* Finished */;
    }
  }
  __name(markInputEnd, "markInputEnd");
  function onKeyUp() {
    recordIfFinished();
  }
  inputLatency2.onKeyUp = onKeyUp;
  __name(onKeyUp, "onKeyUp");
  function onSelectionChange() {
    recordIfFinished();
  }
  inputLatency2.onSelectionChange = onSelectionChange;
  __name(onSelectionChange, "onSelectionChange");
  function onRenderStart() {
    if (state.keydown === 2 /* Finished */ && state.input === 2 /* Finished */ && state.render === 0 /* Before */) {
      performance.mark("render/start");
      state.render = 1 /* InProgress */;
      queueMicrotask(markRenderEnd);
      scheduleRecordIfFinishedTask();
    }
  }
  inputLatency2.onRenderStart = onRenderStart;
  __name(onRenderStart, "onRenderStart");
  function markRenderEnd() {
    if (state.render === 1 /* InProgress */) {
      performance.mark("render/end");
      state.render = 2 /* Finished */;
    }
  }
  __name(markRenderEnd, "markRenderEnd");
  function scheduleRecordIfFinishedTask() {
    setTimeout(recordIfFinished);
  }
  __name(scheduleRecordIfFinishedTask, "scheduleRecordIfFinishedTask");
  function recordIfFinished() {
    if (state.keydown === 2 /* Finished */ && state.input === 2 /* Finished */ && state.render === 2 /* Finished */) {
      performance.mark("inputlatency/end");
      performance.measure("keydown", "keydown/start", "keydown/end");
      performance.measure("input", "input/start", "input/end");
      performance.measure("render", "render/start", "render/end");
      performance.measure("inputlatency", "inputlatency/start", "inputlatency/end");
      addMeasure("keydown", totalKeydownTime);
      addMeasure("input", totalInputTime);
      addMeasure("render", totalRenderTime);
      addMeasure("inputlatency", totalInputLatencyTime);
      measurementsCount++;
      reset();
    }
  }
  __name(recordIfFinished, "recordIfFinished");
  function addMeasure(entryName, cumulativeMeasurement) {
    const duration = performance.getEntriesByName(entryName)[0].duration;
    cumulativeMeasurement.total += duration;
    cumulativeMeasurement.min = Math.min(cumulativeMeasurement.min, duration);
    cumulativeMeasurement.max = Math.max(cumulativeMeasurement.max, duration);
  }
  __name(addMeasure, "addMeasure");
  function reset() {
    performance.clearMarks("keydown/start");
    performance.clearMarks("keydown/end");
    performance.clearMarks("input/start");
    performance.clearMarks("input/end");
    performance.clearMarks("render/start");
    performance.clearMarks("render/end");
    performance.clearMarks("inputlatency/start");
    performance.clearMarks("inputlatency/end");
    performance.clearMeasures("keydown");
    performance.clearMeasures("input");
    performance.clearMeasures("render");
    performance.clearMeasures("inputlatency");
    state.keydown = 0 /* Before */;
    state.input = 0 /* Before */;
    state.render = 0 /* Before */;
  }
  __name(reset, "reset");
  function getAndClearMeasurements() {
    if (measurementsCount === 0) {
      return void 0;
    }
    const result = {
      keydown: cumulativeToFinalMeasurement(totalKeydownTime),
      input: cumulativeToFinalMeasurement(totalInputTime),
      render: cumulativeToFinalMeasurement(totalRenderTime),
      total: cumulativeToFinalMeasurement(totalInputLatencyTime),
      sampleCount: measurementsCount
    };
    clearCumulativeMeasurement(totalKeydownTime);
    clearCumulativeMeasurement(totalInputTime);
    clearCumulativeMeasurement(totalRenderTime);
    clearCumulativeMeasurement(totalInputLatencyTime);
    measurementsCount = 0;
    return result;
  }
  inputLatency2.getAndClearMeasurements = getAndClearMeasurements;
  __name(getAndClearMeasurements, "getAndClearMeasurements");
  function cumulativeToFinalMeasurement(cumulative) {
    return {
      average: cumulative.total / measurementsCount,
      max: cumulative.max,
      min: cumulative.min
    };
  }
  __name(cumulativeToFinalMeasurement, "cumulativeToFinalMeasurement");
  function clearCumulativeMeasurement(cumulative) {
    cumulative.total = 0;
    cumulative.min = Number.MAX_VALUE;
    cumulative.max = 0;
  }
  __name(clearCumulativeMeasurement, "clearCumulativeMeasurement");
})(inputLatency || (inputLatency = {}));
export {
  inputLatency
};
//# sourceMappingURL=performance.js.map
