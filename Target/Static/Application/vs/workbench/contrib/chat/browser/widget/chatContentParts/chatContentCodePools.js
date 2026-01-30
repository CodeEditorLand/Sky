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
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { MenuId } from "../../../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { CodeBlockPart, CodeCompareBlockPart } from "./codeBlockPart.js";
import { ResourcePool } from "./chatCollections.js";
let EditorPool = class EditorPool2 extends Disposable {
  static {
    __name(this, "EditorPool");
  }
  inUse() {
    return this._pool.inUse;
  }
  constructor(options, delegate, overflowWidgetsDomNode, isSimpleWidget = false, instantiationService) {
    super();
    this.isSimpleWidget = isSimpleWidget;
    this._pool = this._register(new ResourcePool(() => {
      return instantiationService.createInstance(CodeBlockPart, options, MenuId.ChatCodeBlock, delegate, overflowWidgetsDomNode, this.isSimpleWidget);
    }));
  }
  get() {
    const codeBlock = this._pool.get();
    let stale = false;
    return {
      object: codeBlock,
      isStale: /* @__PURE__ */ __name(() => stale, "isStale"),
      dispose: /* @__PURE__ */ __name(() => {
        codeBlock.reset();
        stale = true;
        this._pool.release(codeBlock);
      }, "dispose")
    };
  }
};
EditorPool = __decorate([
  __param(4, IInstantiationService)
], EditorPool);
let DiffEditorPool = class DiffEditorPool2 extends Disposable {
  static {
    __name(this, "DiffEditorPool");
  }
  inUse() {
    return this._pool.inUse;
  }
  constructor(options, delegate, overflowWidgetsDomNode, isSimpleWidget = false, instantiationService) {
    super();
    this.isSimpleWidget = isSimpleWidget;
    this._pool = this._register(new ResourcePool(() => {
      return instantiationService.createInstance(CodeCompareBlockPart, options, MenuId.ChatCompareBlock, delegate, overflowWidgetsDomNode, this.isSimpleWidget);
    }));
  }
  get() {
    const codeBlock = this._pool.get();
    let stale = false;
    return {
      object: codeBlock,
      isStale: /* @__PURE__ */ __name(() => stale, "isStale"),
      dispose: /* @__PURE__ */ __name(() => {
        codeBlock.reset();
        stale = true;
        this._pool.release(codeBlock);
      }, "dispose")
    };
  }
};
DiffEditorPool = __decorate([
  __param(4, IInstantiationService)
], DiffEditorPool);
export {
  DiffEditorPool,
  EditorPool
};
//# sourceMappingURL=chatContentCodePools.js.map
