var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
import { Position } from "../../../../editor/common/core/position.js";
import { Range } from "../../../../editor/common/core/range.js";
import { localize } from "../../../../nls.js";
import { TestId } from "./testId.js";
var TestResultState;
(function(TestResultState2) {
  TestResultState2[TestResultState2["Unset"] = 0] = "Unset";
  TestResultState2[TestResultState2["Queued"] = 1] = "Queued";
  TestResultState2[TestResultState2["Running"] = 2] = "Running";
  TestResultState2[TestResultState2["Passed"] = 3] = "Passed";
  TestResultState2[TestResultState2["Failed"] = 4] = "Failed";
  TestResultState2[TestResultState2["Skipped"] = 5] = "Skipped";
  TestResultState2[TestResultState2["Errored"] = 6] = "Errored";
})(TestResultState || (TestResultState = {}));
const testResultStateToContextValues = {
  [
    0
    /* TestResultState.Unset */
  ]: "unset",
  [
    1
    /* TestResultState.Queued */
  ]: "queued",
  [
    2
    /* TestResultState.Running */
  ]: "running",
  [
    3
    /* TestResultState.Passed */
  ]: "passed",
  [
    4
    /* TestResultState.Failed */
  ]: "failed",
  [
    5
    /* TestResultState.Skipped */
  ]: "skipped",
  [
    6
    /* TestResultState.Errored */
  ]: "errored"
};
var ExtTestRunProfileKind;
(function(ExtTestRunProfileKind2) {
  ExtTestRunProfileKind2[ExtTestRunProfileKind2["Run"] = 1] = "Run";
  ExtTestRunProfileKind2[ExtTestRunProfileKind2["Debug"] = 2] = "Debug";
  ExtTestRunProfileKind2[ExtTestRunProfileKind2["Coverage"] = 3] = "Coverage";
})(ExtTestRunProfileKind || (ExtTestRunProfileKind = {}));
var TestControllerCapability;
(function(TestControllerCapability2) {
  TestControllerCapability2[TestControllerCapability2["Refresh"] = 2] = "Refresh";
  TestControllerCapability2[TestControllerCapability2["CodeRelatedToTest"] = 4] = "CodeRelatedToTest";
  TestControllerCapability2[TestControllerCapability2["TestRelatedToCode"] = 8] = "TestRelatedToCode";
})(TestControllerCapability || (TestControllerCapability = {}));
var TestRunProfileBitset;
(function(TestRunProfileBitset2) {
  TestRunProfileBitset2[TestRunProfileBitset2["Run"] = 2] = "Run";
  TestRunProfileBitset2[TestRunProfileBitset2["Debug"] = 4] = "Debug";
  TestRunProfileBitset2[TestRunProfileBitset2["Coverage"] = 8] = "Coverage";
  TestRunProfileBitset2[TestRunProfileBitset2["HasNonDefaultProfile"] = 16] = "HasNonDefaultProfile";
  TestRunProfileBitset2[TestRunProfileBitset2["HasConfigurable"] = 32] = "HasConfigurable";
  TestRunProfileBitset2[TestRunProfileBitset2["SupportsContinuousRun"] = 64] = "SupportsContinuousRun";
})(TestRunProfileBitset || (TestRunProfileBitset = {}));
const testProfileBitset = {
  [
    2
    /* TestRunProfileBitset.Run */
  ]: localize("testing.runProfileBitset.run", "Run"),
  [
    4
    /* TestRunProfileBitset.Debug */
  ]: localize("testing.runProfileBitset.debug", "Debug"),
  [
    8
    /* TestRunProfileBitset.Coverage */
  ]: localize("testing.runProfileBitset.coverage", "Coverage")
};
const testRunProfileBitsetList = [
  2,
  4,
  8,
  16,
  32,
  64
];
const isStartControllerTests = /* @__PURE__ */ __name((t) => "runId" in t, "isStartControllerTests");
var IRichLocation;
(function(IRichLocation2) {
  IRichLocation2.serialize = (location) => ({
    range: location.range.toJSON(),
    uri: location.uri.toJSON()
  });
  IRichLocation2.deserialize = (uriIdentity, location) => ({
    range: Range.lift(location.range),
    uri: uriIdentity.asCanonicalUri(URI.revive(location.uri))
  });
})(IRichLocation || (IRichLocation = {}));
var TestMessageType;
(function(TestMessageType2) {
  TestMessageType2[TestMessageType2["Error"] = 0] = "Error";
  TestMessageType2[TestMessageType2["Output"] = 1] = "Output";
})(TestMessageType || (TestMessageType = {}));
var ITestMessageStackFrame;
(function(ITestMessageStackFrame2) {
  ITestMessageStackFrame2.serialize = (stack) => ({
    label: stack.label,
    uri: stack.uri?.toJSON(),
    position: stack.position?.toJSON()
  });
  ITestMessageStackFrame2.deserialize = (uriIdentity, stack) => ({
    label: stack.label,
    uri: stack.uri ? uriIdentity.asCanonicalUri(URI.revive(stack.uri)) : void 0,
    position: stack.position ? Position.lift(stack.position) : void 0
  });
})(ITestMessageStackFrame || (ITestMessageStackFrame = {}));
var ITestErrorMessage;
(function(ITestErrorMessage2) {
  ITestErrorMessage2.serialize = (message) => ({
    message: message.message,
    type: 0,
    expected: message.expected,
    actual: message.actual,
    contextValue: message.contextValue,
    location: message.location && IRichLocation.serialize(message.location),
    stackTrace: message.stackTrace?.map(ITestMessageStackFrame.serialize)
  });
  ITestErrorMessage2.deserialize = (uriIdentity, message) => ({
    message: message.message,
    type: 0,
    expected: message.expected,
    actual: message.actual,
    contextValue: message.contextValue,
    location: message.location && IRichLocation.deserialize(uriIdentity, message.location),
    stackTrace: message.stackTrace && message.stackTrace.map((s) => ITestMessageStackFrame.deserialize(uriIdentity, s))
  });
})(ITestErrorMessage || (ITestErrorMessage = {}));
const getMarkId = /* @__PURE__ */ __name((marker, start) => `${start ? "s" : "e"}${marker}`, "getMarkId");
var ITestOutputMessage;
(function(ITestOutputMessage2) {
  ITestOutputMessage2.serialize = (message) => ({
    message: message.message,
    type: 1,
    offset: message.offset,
    length: message.length,
    location: message.location && IRichLocation.serialize(message.location)
  });
  ITestOutputMessage2.deserialize = (uriIdentity, message) => ({
    message: message.message,
    type: 1,
    offset: message.offset,
    length: message.length,
    location: message.location && IRichLocation.deserialize(uriIdentity, message.location)
  });
})(ITestOutputMessage || (ITestOutputMessage = {}));
var ITestMessage;
(function(ITestMessage2) {
  ITestMessage2.serialize = (message) => message.type === 0 ? ITestErrorMessage.serialize(message) : ITestOutputMessage.serialize(message);
  ITestMessage2.deserialize = (uriIdentity, message) => message.type === 0 ? ITestErrorMessage.deserialize(uriIdentity, message) : ITestOutputMessage.deserialize(uriIdentity, message);
  ITestMessage2.isDiffable = (message) => message.type === 0 && message.actual !== void 0 && message.expected !== void 0;
})(ITestMessage || (ITestMessage = {}));
var ITestTaskState;
(function(ITestTaskState2) {
  ITestTaskState2.serializeWithoutMessages = (state) => ({
    state: state.state,
    duration: state.duration,
    messages: []
  });
  ITestTaskState2.serialize = (state) => ({
    state: state.state,
    duration: state.duration,
    messages: state.messages.map(ITestMessage.serialize)
  });
  ITestTaskState2.deserialize = (uriIdentity, state) => ({
    state: state.state,
    duration: state.duration,
    messages: state.messages.map((m) => ITestMessage.deserialize(uriIdentity, m))
  });
})(ITestTaskState || (ITestTaskState = {}));
const testTagDelimiter = "\0";
const namespaceTestTag = /* @__PURE__ */ __name((ctrlId, tagId) => ctrlId + testTagDelimiter + tagId, "namespaceTestTag");
const denamespaceTestTag = /* @__PURE__ */ __name((namespaced) => {
  const index = namespaced.indexOf(testTagDelimiter);
  return { ctrlId: namespaced.slice(0, index), tagId: namespaced.slice(index + 1) };
}, "denamespaceTestTag");
var ITestItem;
(function(ITestItem2) {
  ITestItem2.serialize = (item) => ({
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
  });
  ITestItem2.deserialize = (uriIdentity, serialized) => ({
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
  });
})(ITestItem || (ITestItem = {}));
var TestItemExpandState;
(function(TestItemExpandState2) {
  TestItemExpandState2[TestItemExpandState2["NotExpandable"] = 0] = "NotExpandable";
  TestItemExpandState2[TestItemExpandState2["Expandable"] = 1] = "Expandable";
  TestItemExpandState2[TestItemExpandState2["BusyExpanding"] = 2] = "BusyExpanding";
  TestItemExpandState2[TestItemExpandState2["Expanded"] = 3] = "Expanded";
})(TestItemExpandState || (TestItemExpandState = {}));
var InternalTestItem;
(function(InternalTestItem2) {
  InternalTestItem2.serialize = (item) => ({
    expand: item.expand,
    item: ITestItem.serialize(item.item)
  });
  InternalTestItem2.deserialize = (uriIdentity, serialized) => ({
    // the `controllerId` is derived from the test.item.extId. It's redundant
    // in the non-serialized InternalTestItem too, but there just because it's
    // checked against in many hot paths.
    controllerId: TestId.root(serialized.item.extId),
    expand: serialized.expand,
    item: ITestItem.deserialize(uriIdentity, serialized.item)
  });
})(InternalTestItem || (InternalTestItem = {}));
var ITestItemUpdate;
(function(ITestItemUpdate2) {
  ITestItemUpdate2.serialize = (u) => {
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
  };
  ITestItemUpdate2.deserialize = (u) => {
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
  };
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
(function(TestResultItem2) {
  TestResultItem2.serializeWithoutMessages = (original) => ({
    ...InternalTestItem.serialize(original),
    ownComputedState: original.ownComputedState,
    computedState: original.computedState,
    tasks: original.tasks.map(ITestTaskState.serializeWithoutMessages)
  });
  TestResultItem2.serialize = (original) => ({
    ...InternalTestItem.serialize(original),
    ownComputedState: original.ownComputedState,
    computedState: original.computedState,
    tasks: original.tasks.map(ITestTaskState.serialize)
  });
  TestResultItem2.deserialize = (uriIdentity, serialized) => ({
    ...InternalTestItem.deserialize(uriIdentity, serialized),
    ownComputedState: serialized.ownComputedState,
    computedState: serialized.computedState,
    tasks: serialized.tasks.map((m) => ITestTaskState.deserialize(uriIdentity, m)),
    retired: true
  });
})(TestResultItem || (TestResultItem = {}));
var ICoverageCount;
(function(ICoverageCount2) {
  ICoverageCount2.empty = () => ({ covered: 0, total: 0 });
  ICoverageCount2.sum = (target, src) => {
    target.covered += src.covered;
    target.total += src.total;
  };
})(ICoverageCount || (ICoverageCount = {}));
var IFileCoverage;
(function(IFileCoverage2) {
  IFileCoverage2.serialize = (original) => ({
    id: original.id,
    statement: original.statement,
    branch: original.branch,
    declaration: original.declaration,
    testIds: original.testIds,
    uri: original.uri.toJSON()
  });
  IFileCoverage2.deserialize = (uriIdentity, serialized) => ({
    id: serialized.id,
    statement: serialized.statement,
    branch: serialized.branch,
    declaration: serialized.declaration,
    testIds: serialized.testIds,
    uri: uriIdentity.asCanonicalUri(URI.revive(serialized.uri))
  });
  IFileCoverage2.empty = (id, uri) => ({
    id,
    uri,
    statement: ICoverageCount.empty()
  });
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
var DetailType;
(function(DetailType2) {
  DetailType2[DetailType2["Declaration"] = 0] = "Declaration";
  DetailType2[DetailType2["Statement"] = 1] = "Statement";
  DetailType2[DetailType2["Branch"] = 2] = "Branch";
})(DetailType || (DetailType = {}));
var CoverageDetails;
(function(CoverageDetails2) {
  CoverageDetails2.serialize = (original) => original.type === 0 ? IDeclarationCoverage.serialize(original) : IStatementCoverage.serialize(original);
  CoverageDetails2.deserialize = (serialized) => serialized.type === 0 ? IDeclarationCoverage.deserialize(serialized) : IStatementCoverage.deserialize(serialized);
})(CoverageDetails || (CoverageDetails = {}));
var IBranchCoverage;
(function(IBranchCoverage2) {
  IBranchCoverage2.serialize = serializeThingWithLocation;
  IBranchCoverage2.deserialize = deserializeThingWithLocation;
})(IBranchCoverage || (IBranchCoverage = {}));
var IDeclarationCoverage;
(function(IDeclarationCoverage2) {
  IDeclarationCoverage2.serialize = serializeThingWithLocation;
  IDeclarationCoverage2.deserialize = deserializeThingWithLocation;
})(IDeclarationCoverage || (IDeclarationCoverage = {}));
var IStatementCoverage;
(function(IStatementCoverage2) {
  IStatementCoverage2.serialize = (original) => ({
    ...serializeThingWithLocation(original),
    branches: original.branches?.map(IBranchCoverage.serialize)
  });
  IStatementCoverage2.deserialize = (serialized) => ({
    ...deserializeThingWithLocation(serialized),
    branches: serialized.branches?.map(IBranchCoverage.deserialize)
  });
})(IStatementCoverage || (IStatementCoverage = {}));
var TestDiffOpType;
(function(TestDiffOpType2) {
  TestDiffOpType2[TestDiffOpType2["Add"] = 0] = "Add";
  TestDiffOpType2[TestDiffOpType2["Update"] = 1] = "Update";
  TestDiffOpType2[TestDiffOpType2["DocumentSynced"] = 2] = "DocumentSynced";
  TestDiffOpType2[TestDiffOpType2["Remove"] = 3] = "Remove";
  TestDiffOpType2[TestDiffOpType2["IncrementPendingExtHosts"] = 4] = "IncrementPendingExtHosts";
  TestDiffOpType2[TestDiffOpType2["Retire"] = 5] = "Retire";
  TestDiffOpType2[TestDiffOpType2["AddTag"] = 6] = "AddTag";
  TestDiffOpType2[TestDiffOpType2["RemoveTag"] = 7] = "RemoveTag";
})(TestDiffOpType || (TestDiffOpType = {}));
var TestsDiffOp;
(function(TestsDiffOp2) {
  TestsDiffOp2.deserialize = (uriIdentity, u) => {
    if (u.op === 0) {
      return { op: u.op, item: InternalTestItem.deserialize(uriIdentity, u.item) };
    } else if (u.op === 1) {
      return { op: u.op, item: ITestItemUpdate.deserialize(u.item) };
    } else if (u.op === 2) {
      return { op: u.op, uri: uriIdentity.asCanonicalUri(URI.revive(u.uri)), docv: u.docv };
    } else {
      return u;
    }
  };
  TestsDiffOp2.serialize = (u) => {
    if (u.op === 0) {
      return { op: u.op, item: InternalTestItem.serialize(u.item) };
    } else if (u.op === 1) {
      return { op: u.op, item: ITestItemUpdate.serialize(u.item) };
    } else {
      return u;
    }
  };
})(TestsDiffOp || (TestsDiffOp = {}));
class AbstractIncrementalTestCollection {
  static {
    __name(this, "AbstractIncrementalTestCollection");
  }
  constructor(uriIdentity) {
    this.uriIdentity = uriIdentity;
    this._tags = /* @__PURE__ */ new Map();
    this.items = /* @__PURE__ */ new Map();
    this.roots = /* @__PURE__ */ new Set();
    this.busyControllerCount = 0;
    this.pendingRootCount = 0;
    this.tags = this._tags;
  }
  /**
   * Applies the diff to the collection.
   */
  apply(diff) {
    const changes = this.createChangeCollector();
    for (const op of diff) {
      switch (op.op) {
        case 0:
          this.add(InternalTestItem.deserialize(this.uriIdentity, op.item), changes);
          break;
        case 1:
          this.update(ITestItemUpdate.deserialize(op.item), changes);
          break;
        case 3:
          this.remove(op.itemId, changes);
          break;
        case 5:
          this.retireTest(op.itemId);
          break;
        case 4:
          this.updatePendingRoots(op.amount);
          break;
        case 6:
          this._tags.set(op.tag.id, op.tag);
          break;
        case 7:
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
    if (item.expand === 2) {
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
      if (existing.expand === 2) {
        this.busyControllerCount--;
      }
      if (patch.expand === 2) {
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
          if (existing.expand === 2) {
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
