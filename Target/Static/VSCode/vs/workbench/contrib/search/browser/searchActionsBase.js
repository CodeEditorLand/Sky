var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as DOM from "../../../../base/browser/dom.js";
import { ResolvedKeybinding } from "../../../../base/common/keybindings.js";
import * as nls from "../../../../nls.js";
import { WorkbenchCompressibleAsyncDataTree } from "../../../../platform/list/browser/listService.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { SearchView } from "./searchView.js";
import { ISearchConfigurationProperties, VIEW_ID } from "../../../services/search/common/search.js";
import { isSearchTreeMatch, RenderableMatch, ISearchResult, isSearchTreeFileMatch, isSearchTreeFolderMatch } from "./searchTreeModel/searchTreeCommon.js";
import { searchComparer } from "./searchCompare.js";
const category = nls.localize2("search", "Search");
function isSearchViewFocused(viewsService) {
  const searchView = getSearchView(viewsService);
  return !!(searchView && DOM.isAncestorOfActiveElement(searchView.getContainer()));
}
__name(isSearchViewFocused, "isSearchViewFocused");
function appendKeyBindingLabel(label, inputKeyBinding) {
  return doAppendKeyBindingLabel(label, inputKeyBinding);
}
__name(appendKeyBindingLabel, "appendKeyBindingLabel");
function getSearchView(viewsService) {
  return viewsService.getActiveViewWithId(VIEW_ID);
}
__name(getSearchView, "getSearchView");
function getElementsToOperateOn(viewer, currElement, sortConfig) {
  let elements = viewer.getSelection().filter((x) => x !== null).sort((a, b) => searchComparer(a, b, sortConfig.sortOrder));
  if (currElement && !(elements.length > 1 && elements.includes(currElement))) {
    elements = [currElement];
  }
  return elements;
}
__name(getElementsToOperateOn, "getElementsToOperateOn");
function shouldRefocus(elements, focusElement) {
  if (!focusElement) {
    return false;
  }
  return !focusElement || elements.includes(focusElement) || hasDownstreamMatch(elements, focusElement);
}
__name(shouldRefocus, "shouldRefocus");
function hasDownstreamMatch(elements, focusElement) {
  for (const elem of elements) {
    if (isSearchTreeFileMatch(elem) && isSearchTreeMatch(focusElement) && elem.matches().includes(focusElement) || isSearchTreeFolderMatch(elem) && (isSearchTreeFileMatch(focusElement) && elem.getDownstreamFileMatch(focusElement.resource) || isSearchTreeMatch(focusElement) && elem.getDownstreamFileMatch(focusElement.parent().resource))) {
      return true;
    }
  }
  return false;
}
__name(hasDownstreamMatch, "hasDownstreamMatch");
function openSearchView(viewsService, focus) {
  return viewsService.openView(VIEW_ID, focus).then((view) => view ?? void 0);
}
__name(openSearchView, "openSearchView");
function doAppendKeyBindingLabel(label, keyBinding) {
  return keyBinding ? label + " (" + keyBinding.getLabel() + ")" : label;
}
__name(doAppendKeyBindingLabel, "doAppendKeyBindingLabel");
export {
  appendKeyBindingLabel,
  category,
  getElementsToOperateOn,
  getSearchView,
  isSearchViewFocused,
  openSearchView,
  shouldRefocus
};
//# sourceMappingURL=searchActionsBase.js.map
