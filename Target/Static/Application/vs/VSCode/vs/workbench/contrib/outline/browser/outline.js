import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
var OutlineSortOrder;
(function(OutlineSortOrder2) {
  OutlineSortOrder2[OutlineSortOrder2["ByPosition"] = 0] = "ByPosition";
  OutlineSortOrder2[OutlineSortOrder2["ByName"] = 1] = "ByName";
  OutlineSortOrder2[OutlineSortOrder2["ByKind"] = 2] = "ByKind";
})(OutlineSortOrder || (OutlineSortOrder = {}));
var IOutlinePane;
(function(IOutlinePane2) {
  IOutlinePane2.Id = "outline";
})(IOutlinePane || (IOutlinePane = {}));
const ctxFollowsCursor = new RawContextKey("outlineFollowsCursor", false);
const ctxFilterOnType = new RawContextKey("outlineFiltersOnType", false);
const ctxSortMode = new RawContextKey(
  "outlineSortMode",
  0
  /* OutlineSortOrder.ByPosition */
);
const ctxAllCollapsed = new RawContextKey("outlineAllCollapsed", false);
const ctxFocused = new RawContextKey("outlineFocused", true);
export {
  IOutlinePane,
  OutlineSortOrder,
  ctxAllCollapsed,
  ctxFilterOnType,
  ctxFocused,
  ctxFollowsCursor,
  ctxSortMode
};
//# sourceMappingURL=outline.js.map
