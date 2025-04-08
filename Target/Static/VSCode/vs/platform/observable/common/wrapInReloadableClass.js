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
import { isHotReloadEnabled } from "../../../base/common/hotReload.js";
import { readHotReloadableExport } from "../../../base/common/hotReloadHelpers.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { autorunWithStore } from "../../../base/common/observable.js";
import { BrandedService, GetLeadingNonServiceArgs, IInstantiationService } from "../../instantiation/common/instantiation.js";
function wrapInReloadableClass0(getClass) {
  return !isHotReloadEnabled() ? getClass() : createWrapper(getClass, BaseClass0);
}
__name(wrapInReloadableClass0, "wrapInReloadableClass0");
class BaseClass {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "BaseClass");
  }
  init(...params) {
  }
}
function createWrapper(getClass, B) {
  return class ReloadableWrapper extends B {
    static {
      __name(this, "ReloadableWrapper");
    }
    _autorun = void 0;
    init(...params) {
      this._autorun = autorunWithStore((reader, store) => {
        const clazz = readHotReloadableExport(getClass(), reader);
        store.add(this.instantiationService.createInstance(clazz, ...params));
      });
    }
    dispose() {
      this._autorun?.dispose();
    }
  };
}
__name(createWrapper, "createWrapper");
let BaseClass0 = class extends BaseClass {
  static {
    __name(this, "BaseClass0");
  }
  constructor(i) {
    super(i);
    this.init();
  }
};
BaseClass0 = __decorateClass([
  __decorateParam(0, IInstantiationService)
], BaseClass0);
function wrapInReloadableClass1(getClass) {
  return !isHotReloadEnabled() ? getClass() : createWrapper(getClass, BaseClass1);
}
__name(wrapInReloadableClass1, "wrapInReloadableClass1");
let BaseClass1 = class extends BaseClass {
  static {
    __name(this, "BaseClass1");
  }
  constructor(param1, i) {
    super(i);
    this.init(param1);
  }
};
BaseClass1 = __decorateClass([
  __decorateParam(1, IInstantiationService)
], BaseClass1);
export {
  wrapInReloadableClass0,
  wrapInReloadableClass1
};
//# sourceMappingURL=wrapInReloadableClass.js.map
