var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { matchesFuzzyIconAware, parseLabelWithIcons } from "../../../../base/common/iconLabels.js";
class QuickInputTreeFilter {
  static {
    __name(this, "QuickInputTreeFilter");
  }
  constructor() {
    this.filterValue = "";
    this.matchOnLabel = true;
    this.matchOnDescription = false;
  }
  filter(element, parentVisibility) {
    if (!this.filterValue || !(this.matchOnLabel || this.matchOnDescription)) {
      return element.children ? { visibility: 2, data: {} } : { visibility: 1, data: {} };
    }
    const labelHighlights = this.matchOnLabel ? matchesFuzzyIconAware(this.filterValue, parseLabelWithIcons(element.label)) ?? void 0 : void 0;
    const descriptionHighlights = this.matchOnDescription ? matchesFuzzyIconAware(this.filterValue, parseLabelWithIcons(element.description || "")) ?? void 0 : void 0;
    const visibility = parentVisibility === 1 ? 1 : labelHighlights || descriptionHighlights ? 1 : element.children ? 2 : 0;
    return {
      visibility,
      data: {
        labelHighlights,
        descriptionHighlights
      }
    };
  }
}
export {
  QuickInputTreeFilter
};
//# sourceMappingURL=quickInputTreeFilter.js.map
