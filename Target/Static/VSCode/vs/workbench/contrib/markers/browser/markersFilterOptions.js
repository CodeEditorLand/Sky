var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IFilter, matchesFuzzy, matchesFuzzy2 } from "../../../../base/common/filters.js";
import { IExpression, splitGlobAware, getEmptyExpression, ParsedExpression, parse } from "../../../../base/common/glob.js";
import * as strings from "../../../../base/common/strings.js";
import { URI } from "../../../../base/common/uri.js";
import { relativePath } from "../../../../base/common/resources.js";
import { TernarySearchTree } from "../../../../base/common/ternarySearchTree.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
class ResourceGlobMatcher {
  static {
    __name(this, "ResourceGlobMatcher");
  }
  globalExpression;
  expressionsByRoot;
  constructor(globalExpression, rootExpressions, uriIdentityService) {
    this.globalExpression = parse(globalExpression);
    this.expressionsByRoot = TernarySearchTree.forUris((uri) => uriIdentityService.extUri.ignorePathCasing(uri));
    for (const expression of rootExpressions) {
      this.expressionsByRoot.set(expression.root, { root: expression.root, expression: parse(expression.expression) });
    }
  }
  matches(resource) {
    const rootExpression = this.expressionsByRoot.findSubstr(resource);
    if (rootExpression) {
      const path = relativePath(rootExpression.root, resource);
      if (path && !!rootExpression.expression(path)) {
        return true;
      }
    }
    return !!this.globalExpression(resource.path);
  }
}
class FilterOptions {
  constructor(filter, filesExclude, showWarnings, showErrors, showInfos, uriIdentityService) {
    this.filter = filter;
    filter = filter.trim();
    this.showWarnings = showWarnings;
    this.showErrors = showErrors;
    this.showInfos = showInfos;
    const filesExcludeByRoot = Array.isArray(filesExclude) ? filesExclude : [];
    const excludesExpression = Array.isArray(filesExclude) ? getEmptyExpression() : filesExclude;
    for (const { expression } of filesExcludeByRoot) {
      for (const pattern of Object.keys(expression)) {
        if (!pattern.endsWith("/**")) {
          expression[`${strings.rtrim(pattern, "/")}/**`] = expression[pattern];
        }
      }
    }
    const negate = filter.startsWith("!");
    this.textFilter = { text: (negate ? strings.ltrim(filter, "!") : filter).trim(), negate };
    const includeExpression = getEmptyExpression();
    if (filter) {
      const filters = splitGlobAware(filter, ",").map((s) => s.trim()).filter((s) => !!s.length);
      for (const f of filters) {
        if (f.startsWith("!")) {
          const filterText = strings.ltrim(f, "!");
          if (filterText) {
            this.setPattern(excludesExpression, filterText);
          }
        } else {
          this.setPattern(includeExpression, f);
        }
      }
    }
    this.excludesMatcher = new ResourceGlobMatcher(excludesExpression, filesExcludeByRoot, uriIdentityService);
    this.includesMatcher = new ResourceGlobMatcher(includeExpression, [], uriIdentityService);
  }
  static {
    __name(this, "FilterOptions");
  }
  static _filter = matchesFuzzy2;
  static _messageFilter = matchesFuzzy;
  showWarnings = false;
  showErrors = false;
  showInfos = false;
  textFilter;
  excludesMatcher;
  includesMatcher;
  static EMPTY(uriIdentityService) {
    return new FilterOptions("", [], false, false, false, uriIdentityService);
  }
  setPattern(expression, pattern) {
    if (pattern[0] === ".") {
      pattern = "*" + pattern;
    }
    expression[`**/${pattern}/**`] = true;
    expression[`**/${pattern}`] = true;
  }
}
export {
  FilterOptions,
  ResourceGlobMatcher
};
//# sourceMappingURL=markersFilterOptions.js.map
