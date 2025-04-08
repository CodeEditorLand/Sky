var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { LinkedList } from "../../../../base/common/linkedList.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { URI } from "../../../../base/common/uri.js";
import { IMainThreadTestCollection } from "./testService.js";
import { AbstractIncrementalTestCollection, ITestUriCanonicalizer, IncrementalChangeCollector, IncrementalTestCollectionItem, InternalTestItem, TestDiffOpType, TestsDiff } from "./testTypes.js";
class MainThreadTestCollection extends AbstractIncrementalTestCollection {
  constructor(uriIdentityService, expandActual) {
    super(uriIdentityService);
    this.expandActual = expandActual;
  }
  static {
    __name(this, "MainThreadTestCollection");
  }
  testsByUrl = new ResourceMap();
  busyProvidersChangeEmitter = new Emitter();
  expandPromises = /* @__PURE__ */ new WeakMap();
  /**
   * @inheritdoc
   */
  get busyProviders() {
    return this.busyControllerCount;
  }
  /**
   * @inheritdoc
   */
  get rootItems() {
    return this.roots;
  }
  /**
   * @inheritdoc
   */
  get all() {
    return this.getIterator();
  }
  get rootIds() {
    return Iterable.map(this.roots.values(), (r) => r.item.extId);
  }
  onBusyProvidersChange = this.busyProvidersChangeEmitter.event;
  /**
   * @inheritdoc
   */
  expand(testId, levels) {
    const test = this.items.get(testId);
    if (!test) {
      return Promise.resolve();
    }
    const existing = this.expandPromises.get(test);
    if (existing && existing.pendingLvl >= levels) {
      return existing.prom;
    }
    const prom = this.expandActual(test.item.extId, levels);
    const record = { doneLvl: existing ? existing.doneLvl : -1, pendingLvl: levels, prom };
    this.expandPromises.set(test, record);
    return prom.then(() => {
      record.doneLvl = levels;
    });
  }
  /**
   * @inheritdoc
   */
  getNodeById(id) {
    return this.items.get(id);
  }
  /**
   * @inheritdoc
   */
  getNodeByUrl(uri) {
    return this.testsByUrl.get(uri) || Iterable.empty();
  }
  /**
   * @inheritdoc
   */
  getReviverDiff() {
    const ops = [{ op: TestDiffOpType.IncrementPendingExtHosts, amount: this.pendingRootCount }];
    const queue = [this.rootIds];
    while (queue.length) {
      for (const child of queue.pop()) {
        const item = this.items.get(child);
        ops.push({
          op: TestDiffOpType.Add,
          item: {
            controllerId: item.controllerId,
            expand: item.expand,
            item: item.item
          }
        });
        queue.push(item.children);
      }
    }
    return ops;
  }
  /**
   * Applies the diff to the collection.
   */
  apply(diff) {
    const prevBusy = this.busyControllerCount;
    super.apply(diff);
    if (prevBusy !== this.busyControllerCount) {
      this.busyProvidersChangeEmitter.fire(this.busyControllerCount);
    }
  }
  /**
   * Clears everything from the collection, and returns a diff that applies
   * that action.
   */
  clear() {
    const ops = [];
    for (const root of this.roots) {
      ops.push({ op: TestDiffOpType.Remove, itemId: root.item.extId });
    }
    this.roots.clear();
    this.items.clear();
    return ops;
  }
  /**
   * @override
   */
  createItem(internal) {
    return { ...internal, children: /* @__PURE__ */ new Set() };
  }
  changeCollector = {
    add: /* @__PURE__ */ __name((node) => {
      if (!node.item.uri) {
        return;
      }
      const s = this.testsByUrl.get(node.item.uri);
      if (!s) {
        this.testsByUrl.set(node.item.uri, /* @__PURE__ */ new Set([node]));
      } else {
        s.add(node);
      }
    }, "add"),
    remove: /* @__PURE__ */ __name((node) => {
      if (!node.item.uri) {
        return;
      }
      const s = this.testsByUrl.get(node.item.uri);
      if (!s) {
        return;
      }
      s.delete(node);
      if (s.size === 0) {
        this.testsByUrl.delete(node.item.uri);
      }
    }, "remove")
  };
  createChangeCollector() {
    return this.changeCollector;
  }
  *getIterator() {
    const queue = new LinkedList();
    queue.push(this.rootIds);
    while (queue.size > 0) {
      for (const id of queue.pop()) {
        const node = this.getNodeById(id);
        yield node;
        queue.push(node.children);
      }
    }
  }
}
export {
  MainThreadTestCollection
};
//# sourceMappingURL=mainThreadTestCollection.js.map
