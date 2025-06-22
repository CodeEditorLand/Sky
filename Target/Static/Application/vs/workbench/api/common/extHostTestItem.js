var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../base/common/uri.js";
import * as editorRange from "../../../editor/common/core/range.js";
import { TestId } from "../../contrib/testing/common/testId.js";
import { createTestItemChildren, TestItemCollection } from "../../contrib/testing/common/testItemCollection.js";
import { denamespaceTestTag } from "../../contrib/testing/common/testTypes.js";
import { createPrivateApiFor, getPrivateApiFor } from "./extHostTestingPrivateApi.js";
import * as Convert from "./extHostTypeConverters.js";
const testItemPropAccessor = /* @__PURE__ */ __name((api, defaultValue, equals, toUpdate) => {
  let value = defaultValue;
  return {
    enumerable: true,
    configurable: false,
    get() {
      return value;
    },
    set(newValue) {
      if (!equals(value, newValue)) {
        const oldValue = value;
        value = newValue;
        api.listener?.(toUpdate(newValue, oldValue));
      }
    }
  };
}, "testItemPropAccessor");
const strictEqualComparator = /* @__PURE__ */ __name((a, b) => a === b, "strictEqualComparator");
const propComparators = {
  range: /* @__PURE__ */ __name((a, b) => {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.isEqual(b);
  }, "range"),
  label: strictEqualComparator,
  description: strictEqualComparator,
  sortText: strictEqualComparator,
  busy: strictEqualComparator,
  error: strictEqualComparator,
  canResolveChildren: strictEqualComparator,
  tags: /* @__PURE__ */ __name((a, b) => {
    if (a.length !== b.length) {
      return false;
    }
    if (a.some((t1) => !b.find((t2) => t1.id === t2.id))) {
      return false;
    }
    return true;
  }, "tags")
};
const evSetProps = /* @__PURE__ */ __name((fn) => (v) => ({ op: 4, update: fn(v) }), "evSetProps");
const makePropDescriptors = /* @__PURE__ */ __name((api, label) => ({
  range: (() => {
    let value;
    const updateProps = evSetProps((r) => ({ range: editorRange.Range.lift(Convert.Range.from(r)) }));
    return {
      enumerable: true,
      configurable: false,
      get() {
        return value;
      },
      set(newValue) {
        api.listener?.({
          op: 6
          /* TestItemEventOp.DocumentSynced */
        });
        if (!propComparators.range(value, newValue)) {
          value = newValue;
          api.listener?.(updateProps(newValue));
        }
      }
    };
  })(),
  label: testItemPropAccessor(api, label, propComparators.label, evSetProps((label2) => ({ label: label2 }))),
  description: testItemPropAccessor(api, void 0, propComparators.description, evSetProps((description) => ({ description }))),
  sortText: testItemPropAccessor(api, void 0, propComparators.sortText, evSetProps((sortText) => ({ sortText }))),
  canResolveChildren: testItemPropAccessor(api, false, propComparators.canResolveChildren, (state) => ({
    op: 2,
    state
  })),
  busy: testItemPropAccessor(api, false, propComparators.busy, evSetProps((busy) => ({ busy }))),
  error: testItemPropAccessor(api, void 0, propComparators.error, evSetProps((error) => ({ error: Convert.MarkdownString.fromStrict(error) || null }))),
  tags: testItemPropAccessor(api, [], propComparators.tags, (current, previous) => ({
    op: 1,
    new: current.map(Convert.TestTag.from),
    old: previous.map(Convert.TestTag.from)
  }))
}), "makePropDescriptors");
const toItemFromPlain = /* @__PURE__ */ __name((item) => {
  const testId = TestId.fromString(item.extId);
  const testItem = new TestItemImpl(testId.controllerId, testId.localId, item.label, URI.revive(item.uri) || void 0);
  testItem.range = Convert.Range.to(item.range || void 0);
  testItem.description = item.description || void 0;
  testItem.sortText = item.sortText || void 0;
  testItem.tags = item.tags.map((t) => Convert.TestTag.to({ id: denamespaceTestTag(t).tagId }));
  return testItem;
}, "toItemFromPlain");
const toItemFromContext = /* @__PURE__ */ __name((context) => {
  let node;
  for (const test of context.tests) {
    const next = toItemFromPlain(test.item);
    getPrivateApiFor(next).parent = node;
    node = next;
  }
  return node;
}, "toItemFromContext");
class TestItemImpl {
  static {
    __name(this, "TestItemImpl");
  }
  /**
   * Note that data is deprecated and here for back-compat only
   */
  constructor(controllerId, id, label, uri) {
    if (id.includes(
      "\0"
      /* TestIdPathParts.Delimiter */
    )) {
      throw new Error(`Test IDs may not include the ${JSON.stringify(id)} symbol`);
    }
    const api = createPrivateApiFor(this, controllerId);
    Object.defineProperties(this, {
      id: {
        value: id,
        enumerable: true,
        writable: false
      },
      uri: {
        value: uri,
        enumerable: true,
        writable: false
      },
      parent: {
        enumerable: false,
        get() {
          return api.parent instanceof TestItemRootImpl ? void 0 : api.parent;
        }
      },
      children: {
        value: createTestItemChildren(api, getPrivateApiFor, TestItemImpl),
        enumerable: true,
        writable: false
      },
      ...makePropDescriptors(api, label)
    });
  }
}
class TestItemRootImpl extends TestItemImpl {
  static {
    __name(this, "TestItemRootImpl");
  }
  constructor(controllerId, label) {
    super(controllerId, controllerId, label, void 0);
    this._isRoot = true;
  }
}
class ExtHostTestItemCollection extends TestItemCollection {
  static {
    __name(this, "ExtHostTestItemCollection");
  }
  constructor(controllerId, controllerLabel, editors) {
    super({
      controllerId,
      getDocumentVersion: /* @__PURE__ */ __name((uri) => uri && editors.getDocument(uri)?.version, "getDocumentVersion"),
      getApiFor: getPrivateApiFor,
      getChildren: /* @__PURE__ */ __name((item) => item.children, "getChildren"),
      root: new TestItemRootImpl(controllerId, controllerLabel),
      toITestItem: Convert.TestItem.from
    });
  }
}
export {
  ExtHostTestItemCollection,
  TestItemImpl,
  TestItemRootImpl,
  toItemFromContext
};
//# sourceMappingURL=extHostTestItem.js.map
