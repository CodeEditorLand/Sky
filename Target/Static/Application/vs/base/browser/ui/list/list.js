var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const NotSelectableGroupId = "notSelectable";
var ListDragOverEffectType;
(function(ListDragOverEffectType2) {
  ListDragOverEffectType2[ListDragOverEffectType2["Copy"] = 0] = "Copy";
  ListDragOverEffectType2[ListDragOverEffectType2["Move"] = 1] = "Move";
})(ListDragOverEffectType || (ListDragOverEffectType = {}));
var ListDragOverEffectPosition;
(function(ListDragOverEffectPosition2) {
  ListDragOverEffectPosition2["Over"] = "drop-target";
  ListDragOverEffectPosition2["Before"] = "drop-target-before";
  ListDragOverEffectPosition2["After"] = "drop-target-after";
})(ListDragOverEffectPosition || (ListDragOverEffectPosition = {}));
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
  constructor() {
    this.cache = /* @__PURE__ */ new WeakMap();
  }
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
  ListError,
  NotSelectableGroupId
};
//# sourceMappingURL=list.js.map
