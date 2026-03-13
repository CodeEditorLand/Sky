var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
import { isHotReloadEnabled } from "../../../base/common/hotReload.js";
import { readHotReloadableExport } from "../../../base/common/hotReloadHelpers.js";
import { autorunWithStore } from "../../../base/common/observable.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
function wrapInReloadableClass0(getClass) {
  return !isHotReloadEnabled() ? getClass() : createWrapper(getClass, BaseClass0);
}
__name(wrapInReloadableClass0, "wrapInReloadableClass0");
class BaseClass {
  static {
    __name(this, "BaseClass");
  }
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
  }
  init(...params) {
  }
}
function createWrapper(getClass, B) {
  return class ReloadableWrapper extends B {
    static {
      __name(this, "ReloadableWrapper");
    }
    constructor() {
      super(...arguments);
      this._autorun = void 0;
    }
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
let BaseClass0 = class BaseClass02 extends BaseClass {
  static {
    __name(this, "BaseClass0");
  }
  constructor(i) {
    super(i);
    this.init();
  }
};
BaseClass0 = __decorate([
  __param(0, IInstantiationService)
], BaseClass0);
function wrapInReloadableClass1(getClass) {
  return !isHotReloadEnabled() ? getClass() : createWrapper(getClass, BaseClass1);
}
__name(wrapInReloadableClass1, "wrapInReloadableClass1");
let BaseClass1 = class BaseClass12 extends BaseClass {
  static {
    __name(this, "BaseClass1");
  }
  constructor(param1, i) {
    super(i);
    this.init(param1);
  }
};
BaseClass1 = __decorate([
  __param(1, IInstantiationService)
], BaseClass1);
export {
  wrapInReloadableClass0,
  wrapInReloadableClass1
};
//# sourceMappingURL=wrapInReloadableClass.js.map
