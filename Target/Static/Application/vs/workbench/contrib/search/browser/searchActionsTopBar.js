var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import { WorkbenchListFocusContextKey } from "../../../../platform/list/browser/listService.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { searchClearIcon, searchCollapseAllIcon, searchExpandAllIcon, searchRefreshIcon, searchShowAsList, searchShowAsTree, searchStopIcon } from "./searchIcons.js";
import * as Constants from "../common/constants.js";
import { ISearchHistoryService } from "../common/searchHistoryService.js";
import { VIEW_ID } from "../../../services/search/common/search.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { SearchStateKey, SearchUIState } from "../common/search.js";
import { category, getSearchView } from "./searchActionsBase.js";
import { isSearchTreeMatch, isSearchTreeFolderMatch, isSearchTreeFolderMatchNoRoot, isSearchTreeFolderMatchWorkspaceRoot, isSearchResult, isTextSearchHeading, isSearchTreeFileMatch } from "./searchTreeModel/searchTreeCommon.js";
registerAction2(class ClearSearchHistoryCommandAction extends Action2 {
  static {
    __name(this, "ClearSearchHistoryCommandAction");
  }
  constructor() {
    super({
      id: "search.action.clearHistory",
      title: nls.localize2("clearSearchHistoryLabel", "Clear Search History"),
      category,
      f1: true
    });
  }
  async run(accessor) {
    clearHistoryCommand(accessor);
  }
});
registerAction2(class CancelSearchAction extends Action2 {
  static {
    __name(this, "CancelSearchAction");
  }
  constructor() {
    super({
      id: "search.action.cancel",
      title: nls.localize2("CancelSearchAction.label", "Cancel Search"),
      icon: searchStopIcon,
      category,
      f1: true,
      precondition: SearchStateKey.isEqualTo(SearchUIState.Idle).negate(),
      keybinding: {
        weight: 200,
        when: ContextKeyExpr.and(Constants.SearchContext.SearchViewVisibleKey, WorkbenchListFocusContextKey),
        primary: 9
      },
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 0,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", VIEW_ID), SearchStateKey.isEqualTo(SearchUIState.SlowSearch))
      }]
    });
  }
  run(accessor) {
    return cancelSearch(accessor);
  }
});
registerAction2(class RefreshAction extends Action2 {
  static {
    __name(this, "RefreshAction");
  }
  constructor() {
    super({
      id: "search.action.refreshSearchResults",
      title: nls.localize2("RefreshAction.label", "Refresh"),
      icon: searchRefreshIcon,
      precondition: Constants.SearchContext.ViewHasSearchPatternKey,
      category,
      f1: true,
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 0,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", VIEW_ID), SearchStateKey.isEqualTo(SearchUIState.SlowSearch).negate())
      }]
    });
  }
  run(accessor, ...args) {
    return refreshSearch(accessor);
  }
});
registerAction2(class CollapseDeepestExpandedLevelAction extends Action2 {
  static {
    __name(this, "CollapseDeepestExpandedLevelAction");
  }
  constructor() {
    super({
      id: "search.action.collapseSearchResults",
      title: nls.localize2("CollapseDeepestExpandedLevelAction.label", "Collapse All"),
      category,
      icon: searchCollapseAllIcon,
      f1: true,
      precondition: ContextKeyExpr.and(Constants.SearchContext.HasSearchResults, Constants.SearchContext.ViewHasSomeCollapsibleKey),
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 4,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", VIEW_ID), ContextKeyExpr.or(Constants.SearchContext.HasSearchResults.negate(), Constants.SearchContext.ViewHasSomeCollapsibleKey))
      }]
    });
  }
  run(accessor, ...args) {
    return collapseDeepestExpandedLevel(accessor);
  }
});
registerAction2(class ExpandAllAction extends Action2 {
  static {
    __name(this, "ExpandAllAction");
  }
  constructor() {
    super({
      id: "search.action.expandSearchResults",
      title: nls.localize2("ExpandAllAction.label", "Expand All"),
      category,
      icon: searchExpandAllIcon,
      f1: true,
      precondition: ContextKeyExpr.and(Constants.SearchContext.HasSearchResults, Constants.SearchContext.ViewHasSomeCollapsibleKey.toNegated()),
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 4,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", VIEW_ID), Constants.SearchContext.HasSearchResults, Constants.SearchContext.ViewHasSomeCollapsibleKey.toNegated())
      }]
    });
  }
  async run(accessor, ...args) {
    return expandAll(accessor);
  }
});
registerAction2(class ClearSearchResultsAction extends Action2 {
  static {
    __name(this, "ClearSearchResultsAction");
  }
  constructor() {
    super({
      id: "search.action.clearSearchResults",
      title: nls.localize2("ClearSearchResultsAction.label", "Clear Search Results"),
      category,
      icon: searchClearIcon,
      f1: true,
      precondition: ContextKeyExpr.or(Constants.SearchContext.HasSearchResults, Constants.SearchContext.ViewHasSearchPatternKey, Constants.SearchContext.ViewHasReplacePatternKey, Constants.SearchContext.ViewHasFilePatternKey),
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 1,
        when: ContextKeyExpr.equals("view", VIEW_ID)
      }]
    });
  }
  run(accessor, ...args) {
    return clearSearchResults(accessor);
  }
});
registerAction2(class ViewAsTreeAction extends Action2 {
  static {
    __name(this, "ViewAsTreeAction");
  }
  constructor() {
    super({
      id: "search.action.viewAsTree",
      title: nls.localize2("ViewAsTreeAction.label", "View as Tree"),
      category,
      icon: searchShowAsList,
      f1: true,
      precondition: ContextKeyExpr.and(Constants.SearchContext.HasSearchResults, Constants.SearchContext.InTreeViewKey.toNegated()),
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", VIEW_ID), Constants.SearchContext.InTreeViewKey.toNegated())
      }]
    });
  }
  async run(accessor, ...args) {
    const searchView = getSearchView(accessor.get(IViewsService));
    if (searchView) {
      await searchView.setTreeView(true);
    }
  }
});
registerAction2(class ViewAsListAction extends Action2 {
  static {
    __name(this, "ViewAsListAction");
  }
  constructor() {
    super({
      id: "search.action.viewAsList",
      title: nls.localize2("ViewAsListAction.label", "View as List"),
      category,
      icon: searchShowAsTree,
      f1: true,
      precondition: ContextKeyExpr.and(Constants.SearchContext.HasSearchResults, Constants.SearchContext.InTreeViewKey),
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", VIEW_ID), Constants.SearchContext.InTreeViewKey)
      }]
    });
  }
  async run(accessor, ...args) {
    const searchView = getSearchView(accessor.get(IViewsService));
    if (searchView) {
      await searchView.setTreeView(false);
    }
  }
});
registerAction2(class SearchWithAIAction extends Action2 {
  static {
    __name(this, "SearchWithAIAction");
  }
  constructor() {
    super({
      id: "search.action.searchWithAI",
      title: nls.localize2("SearchWithAIAction.label", "Search with AI"),
      category,
      f1: true,
      precondition: Constants.SearchContext.hasAIResultProvider,
      keybinding: {
        weight: 200,
        when: ContextKeyExpr.and(Constants.SearchContext.hasAIResultProvider, Constants.SearchContext.SearchViewFocusedKey),
        primary: 2048 | 39
        /* KeyCode.KeyI */
      }
    });
  }
  async run(accessor, ...args) {
    const searchView = getSearchView(accessor.get(IViewsService));
    if (searchView) {
      const viewer = searchView.getControl();
      searchView.model.searchResult.aiTextSearchResult.hidden = false;
      searchView.model.cancelAISearch(true);
      searchView.model.clearAiSearchResults();
      await searchView.queueRefreshTree();
      await forcedExpandRecursively(viewer, searchView.model.searchResult.aiTextSearchResult);
    }
  }
});
const clearHistoryCommand = /* @__PURE__ */ __name((accessor) => {
  const searchHistoryService = accessor.get(ISearchHistoryService);
  searchHistoryService.clearHistory();
}, "clearHistoryCommand");
async function expandAll(accessor) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  if (searchView) {
    const viewer = searchView.getControl();
    if (searchView.shouldShowAIResults()) {
      if (searchView.model.hasAIResults) {
        await forcedExpandRecursively(viewer, void 0);
      } else {
        await forcedExpandRecursively(viewer, searchView.model.searchResult.plainTextSearchResult);
      }
    } else {
      await forcedExpandRecursively(viewer, void 0);
    }
  }
}
__name(expandAll, "expandAll");
async function forcedExpandRecursively(viewer, element) {
  if (element) {
    if (!viewer.hasNode(element)) {
      return;
    }
    await viewer.expand(element, true);
  }
  const children = viewer.getNode(element)?.children;
  if (children) {
    for (const child of children) {
      if (isSearchResult(child.element)) {
        throw Error("SearchResult should not be a child of a RenderableMatch");
      }
      forcedExpandRecursively(viewer, child.element);
    }
  }
}
__name(forcedExpandRecursively, "forcedExpandRecursively");
function clearSearchResults(accessor) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  searchView?.clearSearchResults();
}
__name(clearSearchResults, "clearSearchResults");
function cancelSearch(accessor) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  searchView?.cancelSearch();
}
__name(cancelSearch, "cancelSearch");
function refreshSearch(accessor) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  searchView?.triggerQueryChange({ preserveFocus: false, shouldUpdateAISearch: !searchView.model.searchResult.aiTextSearchResult.hidden });
}
__name(refreshSearch, "refreshSearch");
function collapseDeepestExpandedLevel(accessor) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  if (searchView) {
    const viewer = searchView.getControl();
    const navigator = viewer.navigate();
    let node = navigator.first();
    let canCollapseFileMatchLevel = false;
    let canCollapseFirstLevel = false;
    do {
      node = navigator.next();
    } while (isTextSearchHeading(node));
    if (isSearchTreeFolderMatchWorkspaceRoot(node) || searchView.isTreeLayoutViewVisible) {
      while (node = navigator.next()) {
        if (isTextSearchHeading(node)) {
          continue;
        }
        if (isSearchTreeMatch(node)) {
          canCollapseFileMatchLevel = true;
          break;
        }
        if (searchView.isTreeLayoutViewVisible && !canCollapseFirstLevel) {
          let nodeToTest = node;
          if (isSearchTreeFolderMatch(node)) {
            const compressionStartNode = viewer.getCompressedTreeNode(node)?.elements[0].element;
            nodeToTest = compressionStartNode && !isSearchTreeMatch(compressionStartNode) && !isTextSearchHeading(compressionStartNode) && !isSearchResult(compressionStartNode) ? compressionStartNode : node;
          }
          const immediateParent = nodeToTest.parent();
          if (!(isTextSearchHeading(immediateParent) || isSearchTreeFolderMatchWorkspaceRoot(immediateParent) || isSearchTreeFolderMatchNoRoot(immediateParent) || isSearchResult(immediateParent))) {
            canCollapseFirstLevel = true;
          }
        }
      }
    }
    if (canCollapseFileMatchLevel) {
      node = navigator.first();
      do {
        if (isSearchTreeFileMatch(node)) {
          viewer.collapse(node);
        }
      } while (node = navigator.next());
    } else if (canCollapseFirstLevel) {
      node = navigator.first();
      if (node) {
        do {
          let nodeToTest = node;
          if (isSearchTreeFolderMatch(node)) {
            const compressionStartNode = viewer.getCompressedTreeNode(node)?.elements[0].element;
            nodeToTest = compressionStartNode && !isSearchTreeMatch(compressionStartNode) && !isSearchResult(compressionStartNode) ? compressionStartNode : node;
          }
          const immediateParent = nodeToTest.parent();
          if (isSearchTreeFolderMatchWorkspaceRoot(immediateParent) || isSearchTreeFolderMatchNoRoot(immediateParent)) {
            if (viewer.hasNode(node)) {
              viewer.collapse(node, true);
            } else {
              viewer.collapseAll();
            }
          }
        } while (node = navigator.next());
      }
    } else if (isTextSearchHeading(navigator.first())) {
      node = navigator.first();
      do {
        if (!node) {
          break;
        }
        if (isTextSearchHeading(viewer.getParentElement(node))) {
          viewer.collapse(node);
        }
      } while (node = navigator.next());
    } else {
      viewer.collapseAll();
    }
    const firstFocusParent = viewer.getFocus()[0]?.parent();
    if (firstFocusParent && (isSearchTreeFolderMatch(firstFocusParent) || isSearchTreeFileMatch(firstFocusParent)) && viewer.hasNode(firstFocusParent) && viewer.isCollapsed(firstFocusParent)) {
      viewer.domFocus();
      viewer.focusFirst();
      viewer.setSelection(viewer.getFocus());
    }
  }
}
__name(collapseDeepestExpandedLevel, "collapseDeepestExpandedLevel");
export {
  forcedExpandRecursively
};
//# sourceMappingURL=searchActionsTopBar.js.map
