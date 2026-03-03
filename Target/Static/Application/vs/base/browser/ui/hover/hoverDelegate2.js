var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../common/lifecycle.js";
let baseHoverDelegate = {
  showInstantHover: /* @__PURE__ */ __name(() => void 0, "showInstantHover"),
  showDelayedHover: /* @__PURE__ */ __name(() => void 0, "showDelayedHover"),
  setupDelayedHover: /* @__PURE__ */ __name(() => Disposable.None, "setupDelayedHover"),
  setupDelayedHoverAtMouse: /* @__PURE__ */ __name(() => Disposable.None, "setupDelayedHoverAtMouse"),
  hideHover: /* @__PURE__ */ __name(() => void 0, "hideHover"),
  showAndFocusLastHover: /* @__PURE__ */ __name(() => void 0, "showAndFocusLastHover"),
  setupManagedHover: /* @__PURE__ */ __name(() => ({
    dispose: /* @__PURE__ */ __name(() => void 0, "dispose"),
    show: /* @__PURE__ */ __name(() => void 0, "show"),
    hide: /* @__PURE__ */ __name(() => void 0, "hide"),
    update: /* @__PURE__ */ __name(() => void 0, "update")
  }), "setupManagedHover"),
  showManagedHover: /* @__PURE__ */ __name(() => void 0, "showManagedHover")
};
function setBaseLayerHoverDelegate(hoverDelegate) {
  baseHoverDelegate = hoverDelegate;
}
__name(setBaseLayerHoverDelegate, "setBaseLayerHoverDelegate");
function getBaseLayerHoverDelegate() {
  return baseHoverDelegate;
}
__name(getBaseLayerHoverDelegate, "getBaseLayerHoverDelegate");
export {
  getBaseLayerHoverDelegate,
  setBaseLayerHoverDelegate
};
//# sourceMappingURL=hoverDelegate2.js.map
