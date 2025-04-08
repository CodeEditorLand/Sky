var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assert } from "../../../../base/common/assert.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { LinkedList } from "../../../../base/common/linkedList.js";
import { MarshalledId } from "../../../../base/common/marshallingIds.js";
import { IObservable } from "../../../../base/common/observable.js";
import { IPrefixTreeNode, WellDefinedPrefixTree } from "../../../../base/common/prefixTree.js";
import { URI } from "../../../../base/common/uri.js";
import { Position } from "../../../../editor/common/core/position.js";
import { Location } from "../../../../editor/common/languages.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { MutableObservableValue } from "./observableValue.js";
import { TestExclusions } from "./testExclusions.js";
import { TestId } from "./testId.js";
import { ITestResult } from "./testResult.js";
import { AbstractIncrementalTestCollection, ICallProfileRunHandler, IncrementalTestCollectionItem, InternalTestItem, IStartControllerTests, IStartControllerTestsResult, ITestItemContext, ResolvedTestRunRequest, TestControllerCapability, TestItemExpandState, TestMessageFollowupRequest, TestMessageFollowupResponse, TestRunProfileBitset, TestsDiff } from "./testTypes.js";
const ITestService = createDecorator("testService");
const testCollectionIsEmpty = /* @__PURE__ */ __name((collection) => !Iterable.some(collection.rootItems, (r) => r.children.size > 0), "testCollectionIsEmpty");
const getContextForTestItem = /* @__PURE__ */ __name((collection, id) => {
  if (typeof id === "string") {
    id = TestId.fromString(id);
  }
  if (id.isRoot) {
    return { controller: id.toString() };
  }
  const context = { $mid: MarshalledId.TestItemContext, tests: [] };
  for (const i of id.idsFromRoot()) {
    if (!i.isRoot) {
      const test = collection.getNodeById(i.toString());
      if (test) {
        context.tests.push(test);
      }
    }
  }
  return context;
}, "getContextForTestItem");
const expandAndGetTestById = /* @__PURE__ */ __name(async (collection, id, ct = CancellationToken.None) => {
  const idPath = [...TestId.fromString(id).idsFromRoot()];
  let expandToLevel = 0;
  for (let i = idPath.length - 1; !ct.isCancellationRequested && i >= expandToLevel; ) {
    const id2 = idPath[i].toString();
    const existing = collection.getNodeById(id2);
    if (!existing) {
      i--;
      continue;
    }
    if (i === idPath.length - 1) {
      return existing;
    }
    if (!existing.children.has(idPath[i + 1].toString())) {
      await collection.expand(id2, 0);
    }
    expandToLevel = i + 1;
    i = idPath.length - 1;
  }
  return void 0;
}, "expandAndGetTestById");
const waitForTestToBeIdle = /* @__PURE__ */ __name((testService, test) => {
  if (!test.item.busy) {
    return;
  }
  return new Promise((resolve) => {
    const l = testService.onDidProcessDiff(() => {
      if (testService.collection.getNodeById(test.item.extId)?.item.busy !== true) {
        resolve();
        l.dispose();
      }
    });
  });
}, "waitForTestToBeIdle");
const testsInFile = /* @__PURE__ */ __name(async function* (testService, ident, uri, waitForIdle = true) {
  const queue = new LinkedList();
  const existing = [...testService.collection.getNodeByUrl(uri)];
  queue.push(existing.length ? existing.map((e) => e.item.extId) : testService.collection.rootIds);
  let n = 0;
  while (queue.size > 0) {
    for (const id of queue.pop()) {
      n++;
      const test = testService.collection.getNodeById(id);
      if (!test) {
        continue;
      }
      if (!test.item.uri) {
        queue.push(test.children);
        continue;
      }
      if (ident.extUri.isEqual(uri, test.item.uri)) {
        yield test;
      }
      if (ident.extUri.isEqualOrParent(uri, test.item.uri)) {
        if (test.expand === TestItemExpandState.Expandable) {
          await testService.collection.expand(test.item.extId, 1);
        }
        if (waitForIdle) {
          await waitForTestToBeIdle(testService, test);
        }
        if (test.children.size) {
          queue.push(test.children);
        }
      }
    }
  }
}, "testsInFile");
const testsUnderUri = /* @__PURE__ */ __name(async function* (testService, ident, uri, waitForIdle = true) {
  const queue = [testService.collection.rootIds];
  while (queue.length) {
    for (const testId of queue.pop()) {
      const test = testService.collection.getNodeById(testId);
      if (!test) {
      } else if (test.item.uri && ident.extUri.isEqualOrParent(test.item.uri, uri)) {
        yield test;
      } else if (!test.item.uri || ident.extUri.isEqualOrParent(uri, test.item.uri)) {
        if (test.expand === TestItemExpandState.Expandable) {
          await testService.collection.expand(test.item.extId, 1);
        }
        if (waitForIdle) {
          await waitForTestToBeIdle(testService, test);
        }
        queue.push(test.children.values());
      }
    }
  }
}, "testsUnderUri");
const simplifyTestsToExecute = /* @__PURE__ */ __name((collection, tests) => {
  if (tests.length < 2) {
    return tests;
  }
  const tree = new WellDefinedPrefixTree();
  for (const test of tests) {
    tree.insert(TestId.fromString(test.item.extId).path, test);
  }
  const out = [];
  const process = /* @__PURE__ */ __name((currentId, node) => {
    if (node.value) {
      return node.value;
    }
    assert(!!node.children, "expect to have children");
    const thisChildren = [];
    for (const [part, child] of node.children) {
      currentId.push(part);
      const c = process(currentId, child);
      if (c) {
        thisChildren.push(c);
      }
      currentId.pop();
    }
    if (!thisChildren.length) {
      return;
    }
    const id = new TestId(currentId);
    const test = collection.getNodeById(id.toString());
    if (test?.children.size === thisChildren.length) {
      return test;
    }
    out.push(...thisChildren);
    return;
  }, "process");
  for (const [id, node] of tree.entries) {
    const n = process([id], node);
    if (n) {
      out.push(n);
    }
  }
  return out;
}, "simplifyTestsToExecute");
export {
  ITestService,
  expandAndGetTestById,
  getContextForTestItem,
  simplifyTestsToExecute,
  testCollectionIsEmpty,
  testsInFile,
  testsUnderUri
};
//# sourceMappingURL=testService.js.map
