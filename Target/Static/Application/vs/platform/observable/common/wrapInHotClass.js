var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isHotReloadEnabled } from "../../../base/common/hotReload.js";
import { autorunWithStore } from "../../../base/common/observable.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
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
function hotClassGetOriginalInstance(value) {
  if (value instanceof BaseClass) {
    return value._instance;
  }
  return value;
}
__name(hotClassGetOriginalInstance, "hotClassGetOriginalInstance");
function wrapInHotClass0(clazz) {
  return !isHotReloadEnabled() ? clazz.get() : createWrapper(clazz, BaseClass0);
}
__name(wrapInHotClass0, "wrapInHotClass0");
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
function createWrapper(clazz, B) {
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
        const clazz_ = clazz.read(reader);
        this._instance = store.add(this.instantiationService.createInstance(clazz_, ...params));
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
function wrapInHotClass1(clazz) {
  return !isHotReloadEnabled() ? clazz.get() : createWrapper(clazz, BaseClass1);
}
__name(wrapInHotClass1, "wrapInHotClass1");
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
  hotClassGetOriginalInstance,
  wrapInHotClass0,
  wrapInHotClass1
};
//# sourceMappingURL=wrapInHotClass.js.map
