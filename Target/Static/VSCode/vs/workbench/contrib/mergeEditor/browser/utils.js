var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { ArrayQueue, CompareResult } from "../../../../base/common/arrays.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { DisposableStore, IDisposable } from "../../../../base/common/lifecycle.js";
import { IObservable, autorunOpts } from "../../../../base/common/observable.js";
import { CodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { IModelDeltaDecoration } from "../../../../editor/common/model.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
function setStyle(element, style) {
  Object.entries(style).forEach(([key, value]) => {
    element.style.setProperty(key, toSize(value));
  });
}
__name(setStyle, "setStyle");
function toSize(value) {
  return typeof value === "number" ? `${value}px` : value;
}
__name(toSize, "toSize");
function applyObservableDecorations(editor, decorations) {
  const d = new DisposableStore();
  let decorationIds = [];
  d.add(autorunOpts({ debugName: /* @__PURE__ */ __name(() => `Apply decorations from ${decorations.debugName}`, "debugName") }, (reader) => {
    const d2 = decorations.read(reader);
    editor.changeDecorations((a) => {
      decorationIds = a.deltaDecorations(decorationIds, d2);
    });
  }));
  d.add({
    dispose: /* @__PURE__ */ __name(() => {
      editor.changeDecorations((a) => {
        decorationIds = a.deltaDecorations(decorationIds, []);
      });
    }, "dispose")
  });
  return d;
}
__name(applyObservableDecorations, "applyObservableDecorations");
function* leftJoin(left, right, compare) {
  const rightQueue = new ArrayQueue(right);
  for (const leftElement of left) {
    rightQueue.takeWhile((rightElement) => CompareResult.isGreaterThan(compare(leftElement, rightElement)));
    const equals = rightQueue.takeWhile((rightElement) => CompareResult.isNeitherLessOrGreaterThan(compare(leftElement, rightElement)));
    yield { left: leftElement, rights: equals || [] };
  }
}
__name(leftJoin, "leftJoin");
function* join(left, right, compare) {
  const rightQueue = new ArrayQueue(right);
  for (const leftElement of left) {
    const skipped = rightQueue.takeWhile((rightElement) => CompareResult.isGreaterThan(compare(leftElement, rightElement)));
    if (skipped) {
      yield { rights: skipped };
    }
    const equals = rightQueue.takeWhile((rightElement) => CompareResult.isNeitherLessOrGreaterThan(compare(leftElement, rightElement)));
    yield { left: leftElement, rights: equals || [] };
  }
}
__name(join, "join");
function concatArrays(...arrays) {
  return [].concat(...arrays);
}
__name(concatArrays, "concatArrays");
function elementAtOrUndefined(arr, index) {
  return arr[index];
}
__name(elementAtOrUndefined, "elementAtOrUndefined");
function setFields(obj, fields) {
  return Object.assign(obj, fields);
}
__name(setFields, "setFields");
function deepMerge(source1, source2) {
  const result = {};
  for (const key in source1) {
    result[key] = source1[key];
  }
  for (const key in source2) {
    const source2Value = source2[key];
    if (typeof result[key] === "object" && source2Value && typeof source2Value === "object") {
      result[key] = deepMerge(result[key], source2Value);
    } else {
      result[key] = source2Value;
    }
  }
  return result;
}
__name(deepMerge, "deepMerge");
let PersistentStore = class {
  constructor(key, storageService) {
    this.key = key;
    this.storageService = storageService;
  }
  static {
    __name(this, "PersistentStore");
  }
  hasValue = false;
  value = void 0;
  get() {
    if (!this.hasValue) {
      const value = this.storageService.get(this.key, StorageScope.PROFILE);
      if (value !== void 0) {
        try {
          this.value = JSON.parse(value);
        } catch (e) {
          onUnexpectedError(e);
        }
      }
      this.hasValue = true;
    }
    return this.value;
  }
  set(newValue) {
    this.value = newValue;
    this.storageService.store(
      this.key,
      JSON.stringify(this.value),
      StorageScope.PROFILE,
      StorageTarget.USER
    );
  }
};
PersistentStore = __decorateClass([
  __decorateParam(1, IStorageService)
], PersistentStore);
export {
  PersistentStore,
  applyObservableDecorations,
  concatArrays,
  deepMerge,
  elementAtOrUndefined,
  join,
  leftJoin,
  setFields,
  setStyle
};
//# sourceMappingURL=utils.js.map
