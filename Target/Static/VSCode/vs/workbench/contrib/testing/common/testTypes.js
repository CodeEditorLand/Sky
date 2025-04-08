var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { MarshalledId } from "../../../../base/common/marshallingIds.js";
import { URI, UriComponents } from "../../../../base/common/uri.js";
import { IPosition, Position } from "../../../../editor/common/core/position.js";
import { IRange, Range } from "../../../../editor/common/core/range.js";
import { localize } from "../../../../nls.js";
import { TestId } from "./testId.js";
var TestResultState = /* @__PURE__ */ ((TestResultState2) => {
  TestResultState2[TestResultState2["Unset"] = 0] = "Unset";
  TestResultState2[TestResultState2["Queued"] = 1] = "Queued";
  TestResultState2[TestResultState2["Running"] = 2] = "Running";
  TestResultState2[TestResultState2["Passed"] = 3] = "Passed";
  TestResultState2[TestResultState2["Failed"] = 4] = "Failed";
  TestResultState2[TestResultState2["Skipped"] = 5] = "Skipped";
  TestResultState2[TestResultState2["Errored"] = 6] = "Errored";
  return TestResultState2;
})(TestResultState || {});
const testResultStateToContextValues = {
  [0 /* Unset */]: "unset",
  [1 /* Queued */]: "queued",
  [2 /* Running */]: "running",
  [3 /* Passed */]: "passed",
  [4 /* Failed */]: "failed",
  [5 /* Skipped */]: "skipped",
  [6 /* Errored */]: "errored"
};
var ExtTestRunProfileKind = /* @__PURE__ */ ((ExtTestRunProfileKind2) => {
  ExtTestRunProfileKind2[ExtTestRunProfileKind2["Run"] = 1] = "Run";
  ExtTestRunProfileKind2[ExtTestRunProfileKind2["Debug"] = 2] = "Debug";
  ExtTestRunProfileKind2[ExtTestRunProfileKind2["Coverage"] = 3] = "Coverage";
  return ExtTestRunProfileKind2;
})(ExtTestRunProfileKind || {});
var TestControllerCapability = /* @__PURE__ */ ((TestControllerCapability2) => {
  TestControllerCapability2[TestControllerCapability2["Refresh"] = 2] = "Refresh";
  TestControllerCapability2[TestControllerCapability2["CodeRelatedToTest"] = 4] = "CodeRelatedToTest";
  TestControllerCapability2[TestControllerCapability2["TestRelatedToCode"] = 8] = "TestRelatedToCode";
  return TestControllerCapability2;
})(TestControllerCapability || {});
var TestRunProfileBitset = /* @__PURE__ */ ((TestRunProfileBitset2) => {
  TestRunProfileBitset2[TestRunProfileBitset2["Run"] = 2] = "Run";
  TestRunProfileBitset2[TestRunProfileBitset2["Debug"] = 4] = "Debug";
  TestRunProfileBitset2[TestRunProfileBitset2["Coverage"] = 8] = "Coverage";
  TestRunProfileBitset2[TestRunProfileBitset2["HasNonDefaultProfile"] = 16] = "HasNonDefaultProfile";
  TestRunProfileBitset2[TestRunProfileBitset2["HasConfigurable"] = 32] = "HasConfigurable";
  TestRunProfileBitset2[TestRunProfileBitset2["SupportsContinuousRun"] = 64] = "SupportsContinuousRun";
  return TestRunProfileBitset2;
})(TestRunProfileBitset || {});
const testProfileBitset = {
  [2 /* Run */]: localize("testing.runProfileBitset.run", "Run"),
  [4 /* Debug */]: localize("testing.runProfileBitset.debug", "Debug"),
  [8 /* Coverage */]: localize("testing.runProfileBitset.coverage", "Coverage")
};
const testRunProfileBitsetList = [
  2 /* Run */,
  4 /* Debug */,
  8 /* Coverage */,
  16 /* HasNonDefaultProfile */,
  32 /* HasConfigurable */,
  64 /* SupportsContinuousRun */
];
const isStartControllerTests = /* @__PURE__ */ __name((t) => "runId" in t, "isStartControllerTests");
var IRichLocation;
((IRichLocation2) => {
  IRichLocation2.serialize = /* @__PURE__ */ __name((location) => ({
    range: location.range.toJSON(),
    uri: location.uri.toJSON()
  }), "serialize");
  IRichLocation2.deserialize = /* @__PURE__ */ __name((uriIdentity, location) => ({
    range: Range.lift(location.range),
    uri: uriIdentity.asCanonicalUri(URI.revive(location.uri))
  }), "deserialize");
})(IRichLocation || (IRichLocation = {}));
var TestMessageType = /* @__PURE__ */ ((TestMessageType2) => {
  TestMessageType2[TestMessageType2["Error"] = 0] = "Error";
  TestMessageType2[TestMessageType2["Output"] = 1] = "Output";
  return TestMessageType2;
})(TestMessageType || {});
var ITestMessageStackFrame;
((ITestMessageStackFrame2) => {
  ITestMessageStackFrame2.serialize = /* @__PURE__ */ __name((stack) => ({
    label: stack.label,
    uri: stack.uri?.toJSON(),
    position: stack.position?.toJSON()
  }), "serialize");
  ITestMessageStackFrame2.deserialize = /* @__PURE__ */ __name((uriIdentity, stack) => ({
    label: stack.label,
    uri: stack.uri ? uriIdentity.asCanonicalUri(URI.revive(stack.uri)) : void 0,
    position: stack.position ? Position.lift(stack.position) : void 0
  }), "deserialize");
})(ITestMessageStackFrame || (ITestMessageStackFrame = {}));
var ITestErrorMessage;
((ITestErrorMessage2) => {
  ITestErrorMessage2.serialize = /* @__PURE__ */ __name((message) => ({
    message: message.message,
    type: 0 /* Error */,
    expected: message.expected,
    actual: message.actual,
    contextValue: message.contextValue,
    location: message.location && IRichLocation.serialize(message.location),
    stackTrace: message.stackTrace?.map(ITestMessageStackFrame.serialize)
  }), "serialize");
  ITestErrorMessage2.deserialize = /* @__PURE__ */ __name((uriIdentity, message) => ({
    message: message.message,
    type: 0 /* Error */,
    expected: message.expected,
    actual: message.actual,
    contextValue: message.contextValue,
    location: message.location && IRichLocation.deserialize(uriIdentity, message.location),
    stackTrace: message.stackTrace && message.stackTrace.map((s) => ITestMessageStackFrame.deserialize(uriIdentity, s))
  }), "deserialize");
})(ITestErrorMessage || (ITestErrorMessage = {}));
const getMarkId = /* @__PURE__ */ __name((marker, start) => `${start ? "s" : "e"}${marker}`, "getMarkId");
var ITestOutputMessage;
((ITestOutputMessage2) => {
  ITestOutputMessage2.serialize = /* @__PURE__ */ __name((message) => ({
    message: message.message,
    type: 1 /* Output */,
    offset: message.offset,
    length: message.length,
    location: message.location && IRichLocation.serialize(message.location)
  }), "serialize");
  ITestOutputMessage2.deserialize = /* @__PURE__ */ __name((uriIdentity, message) => ({
    message: message.message,
    type: 1 /* Output */,
    offset: message.offset,
    length: message.length,
    location: message.location && IRichLocation.deserialize(uriIdentity, message.location)
  }), "deserialize");
})(ITestOutputMessage || (ITestOutputMessage = {}));
var ITestMessage;
((ITestMessage2) => {
  ITestMessage2.serialize = /* @__PURE__ */ __name((message) => message.type === 0 /* Error */ ? ITestErrorMessage.serialize(message) : ITestOutputMessage.serialize(message), "serialize");
  ITestMessage2.deserialize = /* @__PURE__ */ __name((uriIdentity, message) => message.type === 0 /* Error */ ? ITestErrorMessage.deserialize(uriIdentity, message) : ITestOutputMessage.deserialize(uriIdentity, message), "deserialize");
  ITestMessage2.isDiffable = /* @__PURE__ */ __name((message) => message.type === 0 /* Error */ && message.actual !== void 0 && message.expected !== void 0, "isDiffable");
})(ITestMessage || (ITestMessage = {}));
var ITestTaskState;
((ITestTaskState2) => {
  ITestTaskState2.serializeWithoutMessages = /* @__PURE__ */ __name((state) => ({
    state: state.state,
    duration: state.duration,
    messages: []
  }), "serializeWithoutMessages");
  ITestTaskState2.serialize = /* @__PURE__ */ __name((state) => ({
    state: state.state,
    duration: state.duration,
    messages: state.messages.map(ITestMessage.serialize)
  }), "serialize");
  ITestTaskState2.deserialize = /* @__PURE__ */ __name((uriIdentity, state) => ({
    state: state.state,
    duration: state.duration,
    messages: state.messages.map((m) => ITestMessage.deserialize(uriIdentity, m))
  }), "deserialize");
})(ITestTaskState || (ITestTaskState = {}));
const testTagDelimiter = "\0";
const namespaceTestTag = /* @__PURE__ */ __name((ctrlId, tagId) => ctrlId + testTagDelimiter + tagId, "namespaceTestTag");
const denamespaceTestTag = /* @__PURE__ */ __name((namespaced) => {
  const index = namespaced.indexOf(testTagDelimiter);
  return { ctrlId: namespaced.slice(0, index), tagId: namespaced.slice(index + 1) };
}, "denamespaceTestTag");
var ITestItem;
((ITestItem2) => {
  ITestItem2.serialize = /* @__PURE__ */ __name((item) => ({
    extId: item.extId,
    label: item.label,
    tags: item.tags,
    busy: item.busy,
    children: void 0,
    uri: item.uri?.toJSON(),
    range: item.range?.toJSON() || null,
    description: item.description,
    error: item.error,
    sortText: item.sortText
  }), "serialize");
  ITestItem2.deserialize = /* @__PURE__ */ __name((uriIdentity, serialized) => ({
    extId: serialized.extId,
    label: serialized.label,
    tags: serialized.tags,
    busy: serialized.busy,
    children: void 0,
    uri: serialized.uri ? uriIdentity.asCanonicalUri(URI.revive(serialized.uri)) : void 0,
    range: serialized.range ? Range.lift(serialized.range) : null,
    description: serialized.description,
    error: serialized.error,
    sortText: serialized.sortText
  }), "deserialize");
})(ITestItem || (ITestItem = {}));
var TestItemExpandState = /* @__PURE__ */ ((TestItemExpandState2) => {
  TestItemExpandState2[TestItemExpandState2["NotExpandable"] = 0] = "NotExpandable";
  TestItemExpandState2[TestItemExpandState2["Expandable"] = 1] = "Expandable";
  TestItemExpandState2[TestItemExpandState2["BusyExpanding"] = 2] = "BusyExpanding";
  TestItemExpandState2[TestItemExpandState2["Expanded"] = 3] = "Expanded";
  return TestItemExpandState2;
})(TestItemExpandState || {});
var InternalTestItem;
((InternalTestItem2) => {
  InternalTestItem2.serialize = /* @__PURE__ */ __name((item) => ({
    expand: item.expand,
    item: ITestItem.serialize(item.item)
  }), "serialize");
  InternalTestItem2.deserialize = /* @__PURE__ */ __name((uriIdentity, serialized) => ({
    // the `controllerId` is derived from the test.item.extId. It's redundant
    // in the non-serialized InternalTestItem too, but there just because it's
    // checked against in many hot paths.
    controllerId: TestId.root(serialized.item.extId),
    expand: serialized.expand,
    item: ITestItem.deserialize(uriIdentity, serialized.item)
  }), "deserialize");
})(InternalTestItem || (InternalTestItem = {}));
var ITestItemUpdate;
((ITestItemUpdate2) => {
  ITestItemUpdate2.serialize = /* @__PURE__ */ __name((u) => {
    let item;
    if (u.item) {
      item = {};
      if (u.item.label !== void 0) {
        item.label = u.item.label;
      }
      if (u.item.tags !== void 0) {
        item.tags = u.item.tags;
      }
      if (u.item.busy !== void 0) {
        item.busy = u.item.busy;
      }
      if (u.item.uri !== void 0) {
        item.uri = u.item.uri?.toJSON();
      }
      if (u.item.range !== void 0) {
        item.range = u.item.range?.toJSON();
      }
      if (u.item.description !== void 0) {
        item.description = u.item.description;
      }
      if (u.item.error !== void 0) {
        item.error = u.item.error;
      }
      if (u.item.sortText !== void 0) {
        item.sortText = u.item.sortText;
      }
    }
    return { extId: u.extId, expand: u.expand, item };
  }, "serialize");
  ITestItemUpdate2.deserialize = /* @__PURE__ */ __name((u) => {
    let item;
    if (u.item) {
      item = {};
      if (u.item.label !== void 0) {
        item.label = u.item.label;
      }
      if (u.item.tags !== void 0) {
        item.tags = u.item.tags;
      }
      if (u.item.busy !== void 0) {
        item.busy = u.item.busy;
      }
      if (u.item.range !== void 0) {
        item.range = u.item.range ? Range.lift(u.item.range) : null;
      }
      if (u.item.description !== void 0) {
        item.description = u.item.description;
      }
      if (u.item.error !== void 0) {
        item.error = u.item.error;
      }
      if (u.item.sortText !== void 0) {
        item.sortText = u.item.sortText;
      }
    }
    return { extId: u.extId, expand: u.expand, item };
  }, "deserialize");
})(ITestItemUpdate || (ITestItemUpdate = {}));
const applyTestItemUpdate = /* @__PURE__ */ __name((internal, patch) => {
  if (patch.expand !== void 0) {
    internal.expand = patch.expand;
  }
  if (patch.item !== void 0) {
    internal.item = internal.item ? Object.assign(internal.item, patch.item) : patch.item;
  }
}, "applyTestItemUpdate");
var TestResultItem;
((TestResultItem2) => {
  TestResultItem2.serializeWithoutMessages = /* @__PURE__ */ __name((original) => ({
    ...InternalTestItem.serialize(original),
    ownComputedState: original.ownComputedState,
    computedState: original.computedState,
    tasks: original.tasks.map(ITestTaskState.serializeWithoutMessages)
  }), "serializeWithoutMessages");
  TestResultItem2.serialize = /* @__PURE__ */ __name((original) => ({
    ...InternalTestItem.serialize(original),
    ownComputedState: original.ownComputedState,
    computedState: original.computedState,
    tasks: original.tasks.map(ITestTaskState.serialize)
  }), "serialize");
  TestResultItem2.deserialize = /* @__PURE__ */ __name((uriIdentity, serialized) => ({
    ...InternalTestItem.deserialize(uriIdentity, serialized),
    ownComputedState: serialized.ownComputedState,
    computedState: serialized.computedState,
    tasks: serialized.tasks.map((m) => ITestTaskState.deserialize(uriIdentity, m)),
    retired: true
  }), "deserialize");
})(TestResultItem || (TestResultItem = {}));
var ICoverageCount;
((ICoverageCount2) => {
  ICoverageCount2.empty = /* @__PURE__ */ __name(() => ({ covered: 0, total: 0 }), "empty");
  ICoverageCount2.sum = /* @__PURE__ */ __name((target, src) => {
    target.covered += src.covered;
    target.total += src.total;
  }, "sum");
})(ICoverageCount || (ICoverageCount = {}));
var IFileCoverage;
((IFileCoverage2) => {
  IFileCoverage2.serialize = /* @__PURE__ */ __name((original) => ({
    id: original.id,
    statement: original.statement,
    branch: original.branch,
    declaration: original.declaration,
    testIds: original.testIds,
    uri: original.uri.toJSON()
  }), "serialize");
  IFileCoverage2.deserialize = /* @__PURE__ */ __name((uriIdentity, serialized) => ({
    id: serialized.id,
    statement: serialized.statement,
    branch: serialized.branch,
    declaration: serialized.declaration,
    testIds: serialized.testIds,
    uri: uriIdentity.asCanonicalUri(URI.revive(serialized.uri))
  }), "deserialize");
  IFileCoverage2.empty = /* @__PURE__ */ __name((id, uri) => ({
    id,
    uri,
    statement: ICoverageCount.empty()
  }), "empty");
})(IFileCoverage || (IFileCoverage = {}));
function serializeThingWithLocation(serialized) {
  return {
    ...serialized,
    location: serialized.location?.toJSON()
  };
}
__name(serializeThingWithLocation, "serializeThingWithLocation");
function deserializeThingWithLocation(serialized) {
  serialized.location = serialized.location ? Position.isIPosition(serialized.location) ? Position.lift(serialized.location) : Range.lift(serialized.location) : void 0;
  return serialized;
}
__name(deserializeThingWithLocation, "deserializeThingWithLocation");
const KEEP_N_LAST_COVERAGE_REPORTS = 3;
var DetailType = /* @__PURE__ */ ((DetailType2) => {
  DetailType2[DetailType2["Declaration"] = 0] = "Declaration";
  DetailType2[DetailType2["Statement"] = 1] = "Statement";
  DetailType2[DetailType2["Branch"] = 2] = "Branch";
  return DetailType2;
})(DetailType || {});
var CoverageDetails;
((CoverageDetails2) => {
  CoverageDetails2.serialize = /* @__PURE__ */ __name((original) => original.type === 0 /* Declaration */ ? IDeclarationCoverage.serialize(original) : IStatementCoverage.serialize(original), "serialize");
  CoverageDetails2.deserialize = /* @__PURE__ */ __name((serialized) => serialized.type === 0 /* Declaration */ ? IDeclarationCoverage.deserialize(serialized) : IStatementCoverage.deserialize(serialized), "deserialize");
})(CoverageDetails || (CoverageDetails = {}));
var IBranchCoverage;
((IBranchCoverage2) => {
  IBranchCoverage2.serialize = serializeThingWithLocation;
  IBranchCoverage2.deserialize = deserializeThingWithLocation;
})(IBranchCoverage || (IBranchCoverage = {}));
var IDeclarationCoverage;
((IDeclarationCoverage2) => {
  IDeclarationCoverage2.serialize = serializeThingWithLocation;
  IDeclarationCoverage2.deserialize = deserializeThingWithLocation;
})(IDeclarationCoverage || (IDeclarationCoverage = {}));
var IStatementCoverage;
((IStatementCoverage2) => {
  IStatementCoverage2.serialize = /* @__PURE__ */ __name((original) => ({
    ...serializeThingWithLocation(original),
    branches: original.branches?.map(IBranchCoverage.serialize)
  }), "serialize");
  IStatementCoverage2.deserialize = /* @__PURE__ */ __name((serialized) => ({
    ...deserializeThingWithLocation(serialized),
    branches: serialized.branches?.map(IBranchCoverage.deserialize)
  }), "deserialize");
})(IStatementCoverage || (IStatementCoverage = {}));
var TestDiffOpType = /* @__PURE__ */ ((TestDiffOpType2) => {
  TestDiffOpType2[TestDiffOpType2["Add"] = 0] = "Add";
  TestDiffOpType2[TestDiffOpType2["Update"] = 1] = "Update";
  TestDiffOpType2[TestDiffOpType2["DocumentSynced"] = 2] = "DocumentSynced";
  TestDiffOpType2[TestDiffOpType2["Remove"] = 3] = "Remove";
  TestDiffOpType2[TestDiffOpType2["IncrementPendingExtHosts"] = 4] = "IncrementPendingExtHosts";
  TestDiffOpType2[TestDiffOpType2["Retire"] = 5] = "Retire";
  TestDiffOpType2[TestDiffOpType2["AddTag"] = 6] = "AddTag";
  TestDiffOpType2[TestDiffOpType2["RemoveTag"] = 7] = "RemoveTag";
  return TestDiffOpType2;
})(TestDiffOpType || {});
var TestsDiffOp;
((TestsDiffOp2) => {
  TestsDiffOp2.deserialize = /* @__PURE__ */ __name((uriIdentity, u) => {
    if (u.op === 0 /* Add */) {
      return { op: u.op, item: InternalTestItem.deserialize(uriIdentity, u.item) };
    } else if (u.op === 1 /* Update */) {
      return { op: u.op, item: ITestItemUpdate.deserialize(u.item) };
    } else if (u.op === 2 /* DocumentSynced */) {
      return { op: u.op, uri: uriIdentity.asCanonicalUri(URI.revive(u.uri)), docv: u.docv };
    } else {
      return u;
    }
  }, "deserialize");
  TestsDiffOp2.serialize = /* @__PURE__ */ __name((u) => {
    if (u.op === 0 /* Add */) {
      return { op: u.op, item: InternalTestItem.serialize(u.item) };
    } else if (u.op === 1 /* Update */) {
      return { op: u.op, item: ITestItemUpdate.serialize(u.item) };
    } else {
      return u;
    }
  }, "serialize");
})(TestsDiffOp || (TestsDiffOp = {}));
class AbstractIncrementalTestCollection {
  constructor(uriIdentity) {
    this.uriIdentity = uriIdentity;
  }
  static {
    __name(this, "AbstractIncrementalTestCollection");
  }
  _tags = /* @__PURE__ */ new Map();
  /**
   * Map of item IDs to test item objects.
   */
  items = /* @__PURE__ */ new Map();
  /**
   * ID of test root items.
   */
  roots = /* @__PURE__ */ new Set();
  /**
   * Number of 'busy' controllers.
   */
  busyControllerCount = 0;
  /**
   * Number of pending roots.
   */
  pendingRootCount = 0;
  /**
   * Known test tags.
   */
  tags = this._tags;
  /**
   * Applies the diff to the collection.
   */
  apply(diff) {
    const changes = this.createChangeCollector();
    for (const op of diff) {
      switch (op.op) {
        case 0 /* Add */:
          this.add(InternalTestItem.deserialize(this.uriIdentity, op.item), changes);
          break;
        case 1 /* Update */:
          this.update(ITestItemUpdate.deserialize(op.item), changes);
          break;
        case 3 /* Remove */:
          this.remove(op.itemId, changes);
          break;
        case 5 /* Retire */:
          this.retireTest(op.itemId);
          break;
        case 4 /* IncrementPendingExtHosts */:
          this.updatePendingRoots(op.amount);
          break;
        case 6 /* AddTag */:
          this._tags.set(op.tag.id, op.tag);
          break;
        case 7 /* RemoveTag */:
          this._tags.delete(op.id);
          break;
      }
    }
    changes.complete?.();
  }
  add(item, changes) {
    const parentId = TestId.parentId(item.item.extId)?.toString();
    let created;
    if (!parentId) {
      created = this.createItem(item);
      this.roots.add(created);
      this.items.set(item.item.extId, created);
    } else if (this.items.has(parentId)) {
      const parent = this.items.get(parentId);
      parent.children.add(item.item.extId);
      created = this.createItem(item, parent);
      this.items.set(item.item.extId, created);
    } else {
      console.error(`Test with unknown parent ID: ${JSON.stringify(item)}`);
      return;
    }
    changes.add?.(created);
    if (item.expand === 2 /* BusyExpanding */) {
      this.busyControllerCount++;
    }
    return created;
  }
  update(patch, changes) {
    const existing = this.items.get(patch.extId);
    if (!existing) {
      return;
    }
    if (patch.expand !== void 0) {
      if (existing.expand === 2 /* BusyExpanding */) {
        this.busyControllerCount--;
      }
      if (patch.expand === 2 /* BusyExpanding */) {
        this.busyControllerCount++;
      }
    }
    applyTestItemUpdate(existing, patch);
    changes.update?.(existing);
    return existing;
  }
  remove(itemId, changes) {
    const toRemove = this.items.get(itemId);
    if (!toRemove) {
      return;
    }
    const parentId = TestId.parentId(toRemove.item.extId)?.toString();
    if (parentId) {
      const parent = this.items.get(parentId);
      parent.children.delete(toRemove.item.extId);
    } else {
      this.roots.delete(toRemove);
    }
    const queue = [[itemId]];
    while (queue.length) {
      for (const itemId2 of queue.pop()) {
        const existing = this.items.get(itemId2);
        if (existing) {
          queue.push(existing.children);
          this.items.delete(itemId2);
          changes.remove?.(existing, existing !== toRemove);
          if (existing.expand === 2 /* BusyExpanding */) {
            this.busyControllerCount--;
          }
        }
      }
    }
  }
  /**
   * Called when the extension signals a test result should be retired.
   */
  retireTest(testId) {
  }
  /**
   * Updates the number of test root sources who are yet to report. When
   * the total pending test roots reaches 0, the roots for all controllers
   * will exist in the collection.
   */
  updatePendingRoots(delta) {
    this.pendingRootCount += delta;
  }
  /**
   * Called before a diff is applied to create a new change collector.
   */
  createChangeCollector() {
    return {};
  }
}
export {
  AbstractIncrementalTestCollection,
  CoverageDetails,
  DetailType,
  ExtTestRunProfileKind,
  IBranchCoverage,
  ICoverageCount,
  IDeclarationCoverage,
  IFileCoverage,
  IRichLocation,
  IStatementCoverage,
  ITestErrorMessage,
  ITestItem,
  ITestItemUpdate,
  ITestMessage,
  ITestMessageStackFrame,
  ITestOutputMessage,
  ITestTaskState,
  InternalTestItem,
  KEEP_N_LAST_COVERAGE_REPORTS,
  TestControllerCapability,
  TestDiffOpType,
  TestItemExpandState,
  TestMessageType,
  TestResultItem,
  TestResultState,
  TestRunProfileBitset,
  TestsDiffOp,
  applyTestItemUpdate,
  denamespaceTestTag,
  getMarkId,
  isStartControllerTests,
  namespaceTestTag,
  testProfileBitset,
  testResultStateToContextValues,
  testRunProfileBitsetList
};
//# sourceMappingURL=testTypes.js.map
