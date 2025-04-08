var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IFilter, matchesFuzzy, matchesFuzzy2 } from "../../../../base/common/filters.js";
import * as strings from "../../../../base/common/strings.js";
class FilterOptions {
  constructor(filter, showResolved, showUnresolved) {
    this.filter = filter;
    filter = filter.trim();
    this.showResolved = showResolved;
    this.showUnresolved = showUnresolved;
    const negate = filter.startsWith("!");
    this.textFilter = { text: (negate ? strings.ltrim(filter, "!") : filter).trim(), negate };
  }
  static {
    __name(this, "FilterOptions");
  }
  static _filter = matchesFuzzy2;
  static _messageFilter = matchesFuzzy;
  showResolved = true;
  showUnresolved = true;
  textFilter;
}
export {
  FilterOptions
};
//# sourceMappingURL=commentsFilterOptions.js.map
