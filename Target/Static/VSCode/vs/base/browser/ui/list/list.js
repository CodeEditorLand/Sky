var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IDragAndDropData } from "../../dnd.js";
import { IKeyboardEvent } from "../../keyboardEvent.js";
import { IMouseEvent } from "../../mouseEvent.js";
import { GestureEvent } from "../../touch.js";
import { ListViewTargetSector } from "./listView.js";
import { IDisposable } from "../../../common/lifecycle.js";
var ListDragOverEffectType = /* @__PURE__ */ ((ListDragOverEffectType2) => {
  ListDragOverEffectType2[ListDragOverEffectType2["Copy"] = 0] = "Copy";
  ListDragOverEffectType2[ListDragOverEffectType2["Move"] = 1] = "Move";
  return ListDragOverEffectType2;
})(ListDragOverEffectType || {});
var ListDragOverEffectPosition = /* @__PURE__ */ ((ListDragOverEffectPosition2) => {
  ListDragOverEffectPosition2["Over"] = "drop-target";
  ListDragOverEffectPosition2["Before"] = "drop-target-before";
  ListDragOverEffectPosition2["After"] = "drop-target-after";
  return ListDragOverEffectPosition2;
})(ListDragOverEffectPosition || {});
const ListDragOverReactions = {
  reject() {
    return { accept: false };
  },
  accept() {
    return { accept: true };
  }
};
class ListError extends Error {
  static {
    __name(this, "ListError");
  }
  constructor(user, message) {
    super(`ListError [${user}] ${message}`);
  }
}
class CachedListVirtualDelegate {
  static {
    __name(this, "CachedListVirtualDelegate");
  }
  cache = /* @__PURE__ */ new WeakMap();
  getHeight(element) {
    return this.cache.get(element) ?? this.estimateHeight(element);
  }
  setDynamicHeight(element, height) {
    if (height > 0) {
      this.cache.set(element, height);
    }
  }
}
export {
  CachedListVirtualDelegate,
  ListDragOverEffectPosition,
  ListDragOverEffectType,
  ListDragOverReactions,
  ListError
};
//# sourceMappingURL=list.js.map
