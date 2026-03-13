var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assertNever } from "../../../../base/common/assert.js";
import { clamp } from "../../../../base/common/numbers.js";
import { localize } from "../../../../nls.js";
import { chartsGreen, chartsRed, chartsYellow } from "../../../../platform/theme/common/colorRegistry.js";
import { asCssVariableName } from "../../../../platform/theme/common/colorUtils.js";
import { getTotalCoveragePercent } from "../common/testCoverage.js";
const percent = /* @__PURE__ */ __name((cc) => clamp(cc.total === 0 ? 1 : cc.covered / cc.total, 0, 1), "percent");
const colorThresholds = [
  { color: `var(${asCssVariableName(chartsRed)})`, key: "red" },
  { color: `var(${asCssVariableName(chartsYellow)})`, key: "yellow" },
  { color: `var(${asCssVariableName(chartsGreen)})`, key: "green" }
];
const getCoverageColor = /* @__PURE__ */ __name((pct, thresholds) => {
  let best = colorThresholds[0].color;
  let distance = pct;
  for (const { key, color } of colorThresholds) {
    const t = thresholds[key] / 100;
    if (t && pct >= t && pct - t < distance) {
      best = color;
      distance = pct - t;
    }
  }
  return best;
}, "getCoverageColor");
const epsilon = 1e-7;
const displayPercent = /* @__PURE__ */ __name((value, precision = 2) => {
  const display = (value * 100).toFixed(precision);
  if (value < 1 - epsilon && display === "100") {
    return `${100 - 10 ** -precision}%`;
  }
  return `${display}%`;
}, "displayPercent");
const calculateDisplayedStat = /* @__PURE__ */ __name((coverage, method) => {
  switch (method) {
    case "statement":
      return percent(coverage.statement);
    case "minimum": {
      let value = percent(coverage.statement);
      if (coverage.branch) {
        value = Math.min(value, percent(coverage.branch));
      }
      if (coverage.declaration) {
        value = Math.min(value, percent(coverage.declaration));
      }
      return value;
    }
    case "totalCoverage":
      return getTotalCoveragePercent(coverage.statement, coverage.branch, coverage.declaration);
    default:
      assertNever(method);
  }
}, "calculateDisplayedStat");
function getLabelForItem(result, testId, commonPrefixLen) {
  const parts = [];
  for (const id of testId.idsFromRoot()) {
    const item = result.getTestById(id.toString());
    if (!item) {
      break;
    }
    parts.push(item.label);
  }
  return parts.slice(commonPrefixLen).join(" \u203A ");
}
__name(getLabelForItem, "getLabelForItem");
var labels;
(function(labels2) {
  labels2.showingFilterFor = (label) => localize("testing.coverageForTest", 'Showing "{0}"', label);
  labels2.clickToChangeFiltering = localize("changePerTestFilter", "Click to view coverage for a single test");
  labels2.percentCoverage = (percent2, precision) => localize("testing.percentCoverage", "{0} Coverage", displayPercent(percent2, precision));
  labels2.allTests = localize("testing.allTests", "All tests");
  labels2.pickShowCoverage = localize("testing.pickTest", "Pick a test to show coverage for");
})(labels || (labels = {}));
export {
  calculateDisplayedStat,
  displayPercent,
  getCoverageColor,
  getLabelForItem,
  labels,
  percent
};
//# sourceMappingURL=codeCoverageDisplayUtils.js.map
