var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IHoverDelegate, IScopedHoverDelegate } from "./hoverDelegate.js";
import { Lazy } from "../../../common/lazy.js";
const nullHoverDelegateFactory = /* @__PURE__ */ __name(() => ({
  get delay() {
    return -1;
  },
  dispose: /* @__PURE__ */ __name(() => {
  }, "dispose"),
  showHover: /* @__PURE__ */ __name(() => {
    return void 0;
  }, "showHover")
}), "nullHoverDelegateFactory");
let hoverDelegateFactory = nullHoverDelegateFactory;
const defaultHoverDelegateMouse = new Lazy(() => hoverDelegateFactory("mouse", false));
const defaultHoverDelegateElement = new Lazy(() => hoverDelegateFactory("element", false));
function setHoverDelegateFactory(hoverDelegateProvider) {
  hoverDelegateFactory = hoverDelegateProvider;
}
__name(setHoverDelegateFactory, "setHoverDelegateFactory");
function getDefaultHoverDelegate(placement) {
  if (placement === "element") {
    return defaultHoverDelegateElement.value;
  }
  return defaultHoverDelegateMouse.value;
}
__name(getDefaultHoverDelegate, "getDefaultHoverDelegate");
function createInstantHoverDelegate() {
  return hoverDelegateFactory("element", true);
}
__name(createInstantHoverDelegate, "createInstantHoverDelegate");
export {
  createInstantHoverDelegate,
  getDefaultHoverDelegate,
  setHoverDelegateFactory
};
//# sourceMappingURL=hoverDelegateFactory.js.map
