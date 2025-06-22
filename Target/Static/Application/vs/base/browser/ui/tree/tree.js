var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var TreeVisibility;
(function(TreeVisibility2) {
  TreeVisibility2[TreeVisibility2["Hidden"] = 0] = "Hidden";
  TreeVisibility2[TreeVisibility2["Visible"] = 1] = "Visible";
  TreeVisibility2[TreeVisibility2["Recurse"] = 2] = "Recurse";
})(TreeVisibility || (TreeVisibility = {}));
var ObjectTreeElementCollapseState;
(function(ObjectTreeElementCollapseState2) {
  ObjectTreeElementCollapseState2[ObjectTreeElementCollapseState2["Expanded"] = 0] = "Expanded";
  ObjectTreeElementCollapseState2[ObjectTreeElementCollapseState2["Collapsed"] = 1] = "Collapsed";
  ObjectTreeElementCollapseState2[ObjectTreeElementCollapseState2["PreserveOrExpanded"] = 2] = "PreserveOrExpanded";
  ObjectTreeElementCollapseState2[ObjectTreeElementCollapseState2["PreserveOrCollapsed"] = 3] = "PreserveOrCollapsed";
})(ObjectTreeElementCollapseState || (ObjectTreeElementCollapseState = {}));
var TreeMouseEventTarget;
(function(TreeMouseEventTarget2) {
  TreeMouseEventTarget2[TreeMouseEventTarget2["Unknown"] = 0] = "Unknown";
  TreeMouseEventTarget2[TreeMouseEventTarget2["Twistie"] = 1] = "Twistie";
  TreeMouseEventTarget2[TreeMouseEventTarget2["Element"] = 2] = "Element";
  TreeMouseEventTarget2[TreeMouseEventTarget2["Filter"] = 3] = "Filter";
})(TreeMouseEventTarget || (TreeMouseEventTarget = {}));
var TreeDragOverBubble;
(function(TreeDragOverBubble2) {
  TreeDragOverBubble2[TreeDragOverBubble2["Down"] = 0] = "Down";
  TreeDragOverBubble2[TreeDragOverBubble2["Up"] = 1] = "Up";
})(TreeDragOverBubble || (TreeDragOverBubble = {}));
const TreeDragOverReactions = {
  acceptBubbleUp() {
    return {
      accept: true,
      bubble: 1
      /* TreeDragOverBubble.Up */
    };
  },
  acceptBubbleDown(autoExpand = false) {
    return { accept: true, bubble: 0, autoExpand };
  },
  acceptCopyBubbleUp() {
    return { accept: true, bubble: 1, effect: {
      type: 0,
      position: "drop-target"
      /* ListDragOverEffectPosition.Over */
    } };
  },
  acceptCopyBubbleDown(autoExpand = false) {
    return { accept: true, bubble: 0, effect: {
      type: 0,
      position: "drop-target"
      /* ListDragOverEffectPosition.Over */
    }, autoExpand };
  }
};
class TreeError extends Error {
  static {
    __name(this, "TreeError");
  }
  constructor(user, message) {
    super(`TreeError [${user}] ${message}`);
  }
}
class WeakMapper {
  static {
    __name(this, "WeakMapper");
  }
  constructor(fn) {
    this.fn = fn;
    this._map = /* @__PURE__ */ new WeakMap();
  }
  map(key) {
    let result = this._map.get(key);
    if (!result) {
      result = this.fn(key);
      this._map.set(key, result);
    }
    return result;
  }
}
export {
  ObjectTreeElementCollapseState,
  TreeDragOverBubble,
  TreeDragOverReactions,
  TreeError,
  TreeMouseEventTarget,
  TreeVisibility,
  WeakMapper
};
//# sourceMappingURL=tree.js.map
