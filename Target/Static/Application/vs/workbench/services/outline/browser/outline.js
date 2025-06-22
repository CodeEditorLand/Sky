import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const IOutlineService = createDecorator("IOutlineService");
var OutlineTarget;
(function(OutlineTarget2) {
  OutlineTarget2[OutlineTarget2["OutlinePane"] = 1] = "OutlinePane";
  OutlineTarget2[OutlineTarget2["Breadcrumbs"] = 2] = "Breadcrumbs";
  OutlineTarget2[OutlineTarget2["QuickPick"] = 4] = "QuickPick";
})(OutlineTarget || (OutlineTarget = {}));
var OutlineConfigKeys;
(function(OutlineConfigKeys2) {
  OutlineConfigKeys2["icons"] = "outline.icons";
  OutlineConfigKeys2["collapseItems"] = "outline.collapseItems";
  OutlineConfigKeys2["problemsEnabled"] = "outline.problems.enabled";
  OutlineConfigKeys2["problemsColors"] = "outline.problems.colors";
  OutlineConfigKeys2["problemsBadges"] = "outline.problems.badges";
})(OutlineConfigKeys || (OutlineConfigKeys = {}));
var OutlineConfigCollapseItemsValues;
(function(OutlineConfigCollapseItemsValues2) {
  OutlineConfigCollapseItemsValues2["Collapsed"] = "alwaysCollapse";
  OutlineConfigCollapseItemsValues2["Expanded"] = "alwaysExpand";
})(OutlineConfigCollapseItemsValues || (OutlineConfigCollapseItemsValues = {}));
export {
  IOutlineService,
  OutlineConfigCollapseItemsValues,
  OutlineConfigKeys,
  OutlineTarget
};
//# sourceMappingURL=outline.js.map
