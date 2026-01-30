var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Range } from "../../../../../editor/common/core/range.js";
import { TestId } from "../../common/testId.js";
import { ITestMessage, InternalTestItem } from "../../common/testTypes.js";
import { buildTestUri } from "../../common/testingUri.js";
const getMessageArgs = /* @__PURE__ */ __name((test, message) => ({
  $mid: 18,
  test: InternalTestItem.serialize(test),
  message: ITestMessage.serialize(message)
}), "getMessageArgs");
const inspectSubjectHasStack = /* @__PURE__ */ __name((subject) => subject instanceof MessageSubject && !!subject.stack?.length, "inspectSubjectHasStack");
class MessageSubject {
  static {
    __name(this, "MessageSubject");
  }
  get controllerId() {
    return TestId.root(this.test.extId);
  }
  get isDiffable() {
    return this.message.type === 0 && ITestMessage.isDiffable(this.message);
  }
  get contextValue() {
    return this.message.type === 0 ? this.message.contextValue : void 0;
  }
  get stack() {
    return this.message.type === 0 && this.message.stackTrace?.length ? this.message.stackTrace : void 0;
  }
  constructor(result, test, taskIndex, messageIndex) {
    this.result = result;
    this.taskIndex = taskIndex;
    this.messageIndex = messageIndex;
    this.test = test.item;
    const messages = test.tasks[taskIndex].messages;
    this.messageIndex = messageIndex;
    const parts = { messageIndex, resultId: result.id, taskIndex, testExtId: test.item.extId };
    this.expectedUri = buildTestUri({
      ...parts,
      type: 4
      /* TestUriType.ResultExpectedOutput */
    });
    this.actualUri = buildTestUri({
      ...parts,
      type: 3
      /* TestUriType.ResultActualOutput */
    });
    this.messageUri = buildTestUri({
      ...parts,
      type: 2
      /* TestUriType.ResultMessage */
    });
    const message = this.message = messages[this.messageIndex];
    this.context = getMessageArgs(test, message);
    this.revealLocation = message.location ?? (test.item.uri && test.item.range ? { uri: test.item.uri, range: Range.lift(test.item.range) } : void 0);
  }
}
class TaskSubject {
  static {
    __name(this, "TaskSubject");
  }
  get controllerId() {
    return this.result.tasks[this.taskIndex].ctrlId;
  }
  constructor(result, taskIndex) {
    this.result = result;
    this.taskIndex = taskIndex;
    this.outputUri = buildTestUri({
      resultId: result.id,
      taskIndex,
      type: 0
      /* TestUriType.TaskOutput */
    });
  }
}
class TestOutputSubject {
  static {
    __name(this, "TestOutputSubject");
  }
  get controllerId() {
    return TestId.root(this.test.item.extId);
  }
  constructor(result, taskIndex, test) {
    this.result = result;
    this.taskIndex = taskIndex;
    this.test = test;
    this.outputUri = buildTestUri({
      resultId: this.result.id,
      taskIndex: this.taskIndex,
      testExtId: this.test.item.extId,
      type: 1
      /* TestUriType.TestOutput */
    });
    this.task = result.tasks[this.taskIndex];
  }
}
const equalsSubject = /* @__PURE__ */ __name((a, b) => a instanceof MessageSubject && b instanceof MessageSubject && a.message === b.message || a instanceof TaskSubject && b instanceof TaskSubject && a.result === b.result && a.taskIndex === b.taskIndex || a instanceof TestOutputSubject && b instanceof TestOutputSubject && a.test === b.test && a.taskIndex === b.taskIndex, "equalsSubject");
const mapFindTestMessage = /* @__PURE__ */ __name((test, fn) => {
  for (let taskIndex = 0; taskIndex < test.tasks.length; taskIndex++) {
    const task = test.tasks[taskIndex];
    for (let messageIndex = 0; messageIndex < task.messages.length; messageIndex++) {
      const r = fn(task, task.messages[messageIndex], messageIndex, taskIndex);
      if (r !== void 0) {
        return r;
      }
    }
  }
  return void 0;
}, "mapFindTestMessage");
const getSubjectTestItem = /* @__PURE__ */ __name((subject) => {
  if (subject instanceof MessageSubject) {
    return subject.test;
  }
  if (subject instanceof TaskSubject) {
    return void 0;
  }
  return subject.test.item;
}, "getSubjectTestItem");
export {
  MessageSubject,
  TaskSubject,
  TestOutputSubject,
  equalsSubject,
  getMessageArgs,
  getSubjectTestItem,
  inspectSubjectHasStack,
  mapFindTestMessage
};
//# sourceMappingURL=testResultsSubject.js.map
