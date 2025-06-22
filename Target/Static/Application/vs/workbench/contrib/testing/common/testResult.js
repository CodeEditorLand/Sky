var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DeferredPromise } from "../../../../base/common/async.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { observableValue } from "../../../../base/common/observable.js";
import { language } from "../../../../base/common/platform.js";
import { localize } from "../../../../nls.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { refreshComputedState } from "./getComputedState.js";
import { TestId } from "./testId.js";
import { makeEmptyCounts, maxPriority, statesInOrder, terminalStatePriorities } from "./testingStates.js";
import { getMarkId, TestResultItem } from "./testTypes.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
const emptyRawOutput = {
  buffers: [],
  length: 0,
  onDidWriteData: Event.None,
  endPromise: Promise.resolve(),
  getRange: /* @__PURE__ */ __name(() => VSBuffer.alloc(0), "getRange"),
  getRangeIter: /* @__PURE__ */ __name(() => [], "getRangeIter")
};
class TaskRawOutput {
  static {
    __name(this, "TaskRawOutput");
  }
  constructor() {
    this.writeDataEmitter = new Emitter();
    this.endDeferred = new DeferredPromise();
    this.offset = 0;
    this.onDidWriteData = this.writeDataEmitter.event;
    this.endPromise = this.endDeferred.p;
    this.buffers = [];
  }
  /** @inheritdoc */
  get length() {
    return this.offset;
  }
  /** @inheritdoc */
  getRange(start, length) {
    const buf = VSBuffer.alloc(length);
    let bufLastWrite = 0;
    for (const chunk of this.getRangeIter(start, length)) {
      buf.buffer.set(chunk.buffer, bufLastWrite);
      bufLastWrite += chunk.byteLength;
    }
    return bufLastWrite < length ? buf.slice(0, bufLastWrite) : buf;
  }
  /** @inheritdoc */
  *getRangeIter(start, length) {
    let soFar = 0;
    let internalLastRead = 0;
    for (const b of this.buffers) {
      if (internalLastRead + b.byteLength <= start) {
        internalLastRead += b.byteLength;
        continue;
      }
      const bstart = Math.max(0, start - internalLastRead);
      const bend = Math.min(b.byteLength, bstart + length - soFar);
      yield b.slice(bstart, bend);
      soFar += bend - bstart;
      internalLastRead += b.byteLength;
      if (soFar === length) {
        break;
      }
    }
  }
  /**
   * Appends data to the output, returning the byte range where the data can be found.
   */
  append(data, marker) {
    const offset = this.offset;
    let length = data.byteLength;
    if (marker === void 0) {
      this.push(data);
      return { offset, length };
    }
    let TrimBytes;
    (function(TrimBytes2) {
      TrimBytes2[TrimBytes2["CR"] = 13] = "CR";
      TrimBytes2[TrimBytes2["LF"] = 10] = "LF";
    })(TrimBytes || (TrimBytes = {}));
    const start = VSBuffer.fromString(getMarkCode(marker, true));
    const end = VSBuffer.fromString(getMarkCode(marker, false));
    length += start.byteLength + end.byteLength;
    this.push(start);
    let trimLen = data.byteLength;
    for (; trimLen > 0; trimLen--) {
      const last = data.buffer[trimLen - 1];
      if (last !== 13 && last !== 10) {
        break;
      }
    }
    this.push(data.slice(0, trimLen));
    this.push(end);
    this.push(data.slice(trimLen));
    return { offset, length };
  }
  push(data) {
    if (data.byteLength === 0) {
      return;
    }
    this.buffers.push(data);
    this.writeDataEmitter.fire(data);
    this.offset += data.byteLength;
  }
  /** Signals the output has ended. */
  end() {
    this.endDeferred.complete();
  }
}
const resultItemParents = /* @__PURE__ */ __name(function* (results, item) {
  for (const id of TestId.fromString(item.item.extId).idsToRoot()) {
    yield results.getStateById(id.toString());
  }
}, "resultItemParents");
const maxCountPriority = /* @__PURE__ */ __name((counts) => {
  for (const state of statesInOrder) {
    if (counts[state] > 0) {
      return state;
    }
  }
  return 0;
}, "maxCountPriority");
const getMarkCode = /* @__PURE__ */ __name((marker, start) => `\x1B]633;SetMark;Id=${getMarkId(marker, start)};Hidden\x07`, "getMarkCode");
const itemToNode = /* @__PURE__ */ __name((controllerId, item, parent) => ({
  controllerId,
  expand: 0,
  item: { ...item },
  children: [],
  tasks: [],
  ownComputedState: 0,
  computedState: 0
}), "itemToNode");
var TestResultItemChangeReason;
(function(TestResultItemChangeReason2) {
  TestResultItemChangeReason2[TestResultItemChangeReason2["ComputedStateChange"] = 0] = "ComputedStateChange";
  TestResultItemChangeReason2[TestResultItemChangeReason2["OwnStateChange"] = 1] = "OwnStateChange";
  TestResultItemChangeReason2[TestResultItemChangeReason2["NewMessage"] = 2] = "NewMessage";
})(TestResultItemChangeReason || (TestResultItemChangeReason = {}));
let LiveTestResult = class LiveTestResult2 extends Disposable {
  static {
    __name(this, "LiveTestResult");
  }
  /**
   * @inheritdoc
   */
  get completedAt() {
    return this._completedAt;
  }
  /**
   * @inheritdoc
   */
  get tests() {
    return this.testById.values();
  }
  /** Gets an included test item by ID. */
  getTestById(id) {
    return this.testById.get(id)?.item;
  }
  constructor(id, persist, request, insertOrder, telemetry) {
    super();
    this.id = id;
    this.persist = persist;
    this.request = request;
    this.insertOrder = insertOrder;
    this.telemetry = telemetry;
    this.completeEmitter = this._register(new Emitter());
    this.newTaskEmitter = this._register(new Emitter());
    this.endTaskEmitter = this._register(new Emitter());
    this.changeEmitter = this._register(new Emitter());
    this.testById = /* @__PURE__ */ new Map();
    this.testMarkerCounter = 0;
    this.startedAt = Date.now();
    this.onChange = this.changeEmitter.event;
    this.onComplete = this.completeEmitter.event;
    this.onNewTask = this.newTaskEmitter.event;
    this.onEndTask = this.endTaskEmitter.event;
    this.tasks = [];
    this.name = localize("runFinished", "Test run at {0}", (/* @__PURE__ */ new Date()).toLocaleString(language));
    this.counts = makeEmptyCounts();
    this.computedStateAccessor = {
      getOwnState: /* @__PURE__ */ __name((i) => i.ownComputedState, "getOwnState"),
      getCurrentComputedState: /* @__PURE__ */ __name((i) => i.computedState, "getCurrentComputedState"),
      setComputedState: /* @__PURE__ */ __name((i, s) => i.computedState = s, "setComputedState"),
      getChildren: /* @__PURE__ */ __name((i) => i.children, "getChildren"),
      getParents: /* @__PURE__ */ __name((i) => {
        const { testById: testByExtId } = this;
        return function* () {
          const parentId = TestId.fromString(i.item.extId).parentId;
          if (parentId) {
            for (const id2 of parentId.idsToRoot()) {
              yield testByExtId.get(id2.toString());
            }
          }
        }();
      }, "getParents")
    };
    this.doSerialize = new Lazy(() => ({
      id: this.id,
      completedAt: this.completedAt,
      tasks: this.tasks.map((t) => ({ id: t.id, name: t.name, ctrlId: t.ctrlId, hasCoverage: !!t.coverage.get() })),
      name: this.name,
      request: this.request,
      items: [...this.testById.values()].map(TestResultItem.serializeWithoutMessages)
    }));
    this.doSerializeWithMessages = new Lazy(() => ({
      id: this.id,
      completedAt: this.completedAt,
      tasks: this.tasks.map((t) => ({ id: t.id, name: t.name, ctrlId: t.ctrlId, hasCoverage: !!t.coverage.get() })),
      name: this.name,
      request: this.request,
      items: [...this.testById.values()].map(TestResultItem.serialize)
    }));
  }
  /**
   * @inheritdoc
   */
  getStateById(extTestId) {
    return this.testById.get(extTestId);
  }
  /**
   * Appends output that occurred during the test run.
   */
  appendOutput(output, taskId, location, testId) {
    const preview = output.byteLength > 100 ? output.slice(0, 100).toString() + "\u2026" : output.toString();
    let marker;
    if (testId || location) {
      marker = this.testMarkerCounter++;
    }
    const index = this.mustGetTaskIndex(taskId);
    const task = this.tasks[index];
    const { offset, length } = task.output.append(output, marker);
    const message = {
      location,
      message: preview,
      offset,
      length,
      marker,
      type: 1
    };
    const test = testId && this.testById.get(testId);
    if (test) {
      test.tasks[index].messages.push(message);
      this.changeEmitter.fire({ item: test, result: this, reason: 2, message });
    } else {
      task.otherMessages.push(message);
    }
  }
  /**
   * Adds a new run task to the results.
   */
  addTask(task) {
    this.tasks.push({ ...task, coverage: observableValue(this, void 0), otherMessages: [], output: new TaskRawOutput() });
    for (const test of this.tests) {
      test.tasks.push({
        duration: void 0,
        messages: [],
        state: 0
        /* TestResultState.Unset */
      });
    }
    this.newTaskEmitter.fire(this.tasks.length - 1);
  }
  /**
   * Add the chain of tests to the run. The first test in the chain should
   * be either a test root, or a previously-known test.
   */
  addTestChainToRun(controllerId, chain) {
    let parent = this.testById.get(chain[0].extId);
    if (!parent) {
      parent = this.addTestToRun(controllerId, chain[0], null);
    }
    for (let i = 1; i < chain.length; i++) {
      parent = this.addTestToRun(controllerId, chain[i], parent.item.extId);
    }
    return void 0;
  }
  /**
   * Updates the state of the test by its internal ID.
   */
  updateState(testId, taskId, state, duration) {
    const entry = this.testById.get(testId);
    if (!entry) {
      return;
    }
    const index = this.mustGetTaskIndex(taskId);
    const oldTerminalStatePrio = terminalStatePriorities[entry.tasks[index].state];
    const newTerminalStatePrio = terminalStatePriorities[state];
    if (oldTerminalStatePrio !== void 0 && (newTerminalStatePrio === void 0 || newTerminalStatePrio < oldTerminalStatePrio)) {
      return;
    }
    this.fireUpdateAndRefresh(entry, index, state, duration);
  }
  /**
   * Appends a message for the test in the run.
   */
  appendMessage(testId, taskId, message) {
    const entry = this.testById.get(testId);
    if (!entry) {
      return;
    }
    entry.tasks[this.mustGetTaskIndex(taskId)].messages.push(message);
    this.changeEmitter.fire({ item: entry, result: this, reason: 2, message });
  }
  /**
   * Marks the task in the test run complete.
   */
  markTaskComplete(taskId) {
    const index = this.mustGetTaskIndex(taskId);
    const task = this.tasks[index];
    task.running = false;
    task.output.end();
    this.setAllToState(
      0,
      taskId,
      (t) => t.state === 1 || t.state === 2
      /* TestResultState.Running */
    );
    this.endTaskEmitter.fire(index);
  }
  /**
   * Notifies the service that all tests are complete.
   */
  markComplete() {
    if (this._completedAt !== void 0) {
      throw new Error("cannot complete a test result multiple times");
    }
    for (const task of this.tasks) {
      if (task.running) {
        this.markTaskComplete(task.id);
      }
    }
    this._completedAt = Date.now();
    this.completeEmitter.fire();
    this.telemetry.publicLog2("test.outcomes", {
      failures: this.counts[
        6
        /* TestResultState.Errored */
      ] + this.counts[
        4
        /* TestResultState.Failed */
      ],
      passes: this.counts[
        3
        /* TestResultState.Passed */
      ],
      controller: this.request.targets.map((t) => t.controllerId).join(",")
    });
  }
  /**
   * Marks the test and all of its children in the run as retired.
   */
  markRetired(testIds) {
    for (const [id, test] of this.testById) {
      if (!test.retired && (!testIds || testIds.hasKeyOrParent(TestId.fromString(id).path))) {
        test.retired = true;
        this.changeEmitter.fire({ reason: 0, item: test, result: this });
      }
    }
  }
  /**
   * @inheritdoc
   */
  toJSON() {
    return this.completedAt && this.persist ? this.doSerialize.value : void 0;
  }
  toJSONWithMessages() {
    return this.completedAt && this.persist ? this.doSerializeWithMessages.value : void 0;
  }
  /**
   * Updates all tests in the collection to the given state.
   */
  setAllToState(state, taskId, when) {
    const index = this.mustGetTaskIndex(taskId);
    for (const test of this.testById.values()) {
      if (when(test.tasks[index], test)) {
        this.fireUpdateAndRefresh(test, index, state);
      }
    }
  }
  fireUpdateAndRefresh(entry, taskIndex, newState, newOwnDuration) {
    const previousOwnComputed = entry.ownComputedState;
    const previousOwnDuration = entry.ownDuration;
    const changeEvent = {
      item: entry,
      result: this,
      reason: 1,
      previousState: previousOwnComputed,
      previousOwnDuration
    };
    entry.tasks[taskIndex].state = newState;
    if (newOwnDuration !== void 0) {
      entry.tasks[taskIndex].duration = newOwnDuration;
      entry.ownDuration = Math.max(entry.ownDuration || 0, newOwnDuration);
    }
    const newOwnComputed = maxPriority(...entry.tasks.map((t) => t.state));
    if (newOwnComputed === previousOwnComputed) {
      if (newOwnDuration !== previousOwnDuration) {
        this.changeEmitter.fire(changeEvent);
      }
      return;
    }
    entry.ownComputedState = newOwnComputed;
    this.counts[previousOwnComputed]--;
    this.counts[newOwnComputed]++;
    refreshComputedState(this.computedStateAccessor, entry).forEach((t) => this.changeEmitter.fire(t === entry ? changeEvent : {
      item: t,
      result: this,
      reason: 0
    }));
  }
  addTestToRun(controllerId, item, parent) {
    const node = itemToNode(controllerId, item, parent);
    this.testById.set(item.extId, node);
    this.counts[
      0
      /* TestResultState.Unset */
    ]++;
    if (parent) {
      this.testById.get(parent)?.children.push(node);
    }
    if (this.tasks.length) {
      for (let i = 0; i < this.tasks.length; i++) {
        node.tasks.push({
          duration: void 0,
          messages: [],
          state: 0
          /* TestResultState.Unset */
        });
      }
    }
    return node;
  }
  mustGetTaskIndex(taskId) {
    const index = this.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) {
      throw new Error(`Unknown task ${taskId} in updateState`);
    }
    return index;
  }
};
LiveTestResult = __decorate([
  __param(4, ITelemetryService)
], LiveTestResult);
class HydratedTestResult {
  static {
    __name(this, "HydratedTestResult");
  }
  /**
   * @inheritdoc
   */
  get tests() {
    return this.testById.values();
  }
  constructor(identity, serialized, persist = true) {
    this.serialized = serialized;
    this.persist = persist;
    this.counts = makeEmptyCounts();
    this.testById = /* @__PURE__ */ new Map();
    this.id = serialized.id;
    this.completedAt = serialized.completedAt;
    this.tasks = serialized.tasks.map((task, i) => ({
      id: task.id,
      name: task.name || localize("testUnnamedTask", "Unnamed Task"),
      ctrlId: task.ctrlId,
      running: false,
      coverage: observableValue(this, void 0),
      output: emptyRawOutput,
      otherMessages: []
    }));
    this.name = serialized.name;
    this.request = serialized.request;
    for (const item of serialized.items) {
      const de = TestResultItem.deserialize(identity, item);
      this.counts[de.ownComputedState]++;
      this.testById.set(item.item.extId, de);
    }
  }
  /**
   * @inheritdoc
   */
  getStateById(extTestId) {
    return this.testById.get(extTestId);
  }
  /**
   * @inheritdoc
   */
  toJSON() {
    return this.persist ? this.serialized : void 0;
  }
  /**
   * @inheritdoc
   */
  toJSONWithMessages() {
    return this.toJSON();
  }
}
export {
  HydratedTestResult,
  LiveTestResult,
  TaskRawOutput,
  TestResultItemChangeReason,
  maxCountPriority,
  resultItemParents
};
//# sourceMappingURL=testResult.js.map
