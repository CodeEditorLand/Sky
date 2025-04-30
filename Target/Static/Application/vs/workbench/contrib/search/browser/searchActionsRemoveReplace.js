var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { getSelectionKeyboardEvent } from "../../../../platform/list/browser/listService.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { searchRemoveIcon, searchReplaceIcon } from "./searchIcons.js";
import * as Constants from "../common/constants.js";
import { IReplaceService } from "./replace.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { category, getElementsToOperateOn, getSearchView, shouldRefocus } from "./searchActionsBase.js";
import { equals } from "../../../../base/common/arrays.js";
import { arrayContainsElementOrParent, isSearchTreeFileMatch, isSearchTreeFolderMatch, isSearchTreeMatch, isSearchResult, isTextSearchHeading } from "./searchTreeModel/searchTreeCommon.js";
import { MatchInNotebook } from "./notebookSearch/notebookSearchModel.js";
import { AITextSearchHeadingImpl } from "./AISearch/aiSearchModel.js";
registerAction2(class RemoveAction extends Action2 {
  static {
    __name(this, "RemoveAction");
  }
  constructor() {
    super({
      id: "search.action.remove",
      title: nls.localize2("RemoveAction.label", "Dismiss"),
      category,
      icon: searchRemoveIcon,
      keybinding: {
        weight: 200,
        when: ContextKeyExpr.and(Constants.SearchContext.SearchViewVisibleKey, Constants.SearchContext.FileMatchOrMatchFocusKey),
        primary: 20,
        mac: {
          primary: 2048 | 1
        }
      },
      menu: [
        {
          id: MenuId.SearchContext,
          group: "search",
          order: 2
        },
        {
          id: MenuId.SearchActionMenu,
          group: "inline",
          when: ContextKeyExpr.or(Constants.SearchContext.FileFocusKey, Constants.SearchContext.MatchFocusKey, Constants.SearchContext.FolderFocusKey),
          order: 2
        }
      ]
    });
  }
  async run(accessor, context) {
    const viewsService = accessor.get(IViewsService);
    const configurationService = accessor.get(IConfigurationService);
    const searchView = getSearchView(viewsService);
    if (!searchView) {
      return;
    }
    let element = context?.element;
    let viewer = context?.viewer;
    if (!viewer) {
      viewer = searchView.getControl();
    }
    if (!element) {
      element = viewer.getFocus()[0] ?? void 0;
    }
    const elementsToRemove = getElementsToOperateOn(viewer, element, configurationService.getValue("search"));
    let focusElement = viewer.getFocus()[0] ?? void 0;
    if (elementsToRemove.length === 0) {
      return;
    }
    if (!focusElement || isSearchResult(focusElement)) {
      focusElement = element;
    }
    let nextFocusElement;
    const shouldRefocusMatch = shouldRefocus(elementsToRemove, focusElement);
    if (focusElement && shouldRefocusMatch) {
      nextFocusElement = await getElementToFocusAfterRemoved(viewer, focusElement, elementsToRemove);
    }
    const searchResult = searchView.searchResult;
    if (searchResult) {
      searchResult.batchRemove(elementsToRemove);
    }
    await searchView.queueRefreshTree();
    if (focusElement && shouldRefocusMatch) {
      if (!nextFocusElement) {
        nextFocusElement = await getLastNodeFromSameType(viewer, focusElement);
      }
      if (nextFocusElement && !arrayContainsElementOrParent(nextFocusElement, elementsToRemove)) {
        viewer.reveal(nextFocusElement);
        viewer.setFocus([nextFocusElement], getSelectionKeyboardEvent());
        viewer.setSelection([nextFocusElement], getSelectionKeyboardEvent());
      }
    } else if (!equals(viewer.getFocus(), viewer.getSelection())) {
      viewer.setSelection(viewer.getFocus());
    }
    viewer.domFocus();
    return;
  }
});
registerAction2(class ReplaceAction extends Action2 {
  static {
    __name(this, "ReplaceAction");
  }
  constructor() {
    super({
      id: "search.action.replace",
      title: nls.localize2("match.replace.label", "Replace"),
      category,
      keybinding: {
        weight: 200,
        when: ContextKeyExpr.and(Constants.SearchContext.SearchViewVisibleKey, Constants.SearchContext.ReplaceActiveKey, Constants.SearchContext.MatchFocusKey, Constants.SearchContext.IsEditableItemKey),
        primary: 1024 | 2048 | 22
      },
      icon: searchReplaceIcon,
      menu: [
        {
          id: MenuId.SearchContext,
          when: ContextKeyExpr.and(Constants.SearchContext.ReplaceActiveKey, Constants.SearchContext.MatchFocusKey, Constants.SearchContext.IsEditableItemKey),
          group: "search",
          order: 1
        },
        {
          id: MenuId.SearchActionMenu,
          when: ContextKeyExpr.and(Constants.SearchContext.ReplaceActiveKey, Constants.SearchContext.MatchFocusKey, Constants.SearchContext.IsEditableItemKey),
          group: "inline",
          order: 1
        }
      ]
    });
  }
  async run(accessor, context) {
    return performReplace(accessor, context);
  }
});
registerAction2(class ReplaceAllAction extends Action2 {
  static {
    __name(this, "ReplaceAllAction");
  }
  constructor() {
    super({
      id: "search.action.replaceAllInFile",
      title: nls.localize2("file.replaceAll.label", "Replace All"),
      category,
      keybinding: {
        weight: 200,
        when: ContextKeyExpr.and(Constants.SearchContext.SearchViewVisibleKey, Constants.SearchContext.ReplaceActiveKey, Constants.SearchContext.FileFocusKey, Constants.SearchContext.IsEditableItemKey),
        primary: 1024 | 2048 | 22,
        secondary: [
          2048 | 1024 | 3
          /* KeyCode.Enter */
        ]
      },
      icon: searchReplaceIcon,
      menu: [
        {
          id: MenuId.SearchContext,
          when: ContextKeyExpr.and(Constants.SearchContext.ReplaceActiveKey, Constants.SearchContext.FileFocusKey, Constants.SearchContext.IsEditableItemKey),
          group: "search",
          order: 1
        },
        {
          id: MenuId.SearchActionMenu,
          when: ContextKeyExpr.and(Constants.SearchContext.ReplaceActiveKey, Constants.SearchContext.FileFocusKey, Constants.SearchContext.IsEditableItemKey),
          group: "inline",
          order: 1
        }
      ]
    });
  }
  async run(accessor, context) {
    return performReplace(accessor, context);
  }
});
registerAction2(class ReplaceAllInFolderAction extends Action2 {
  static {
    __name(this, "ReplaceAllInFolderAction");
  }
  constructor() {
    super({
      id: "search.action.replaceAllInFolder",
      title: nls.localize2("file.replaceAll.label", "Replace All"),
      category,
      keybinding: {
        weight: 200,
        when: ContextKeyExpr.and(Constants.SearchContext.SearchViewVisibleKey, Constants.SearchContext.ReplaceActiveKey, Constants.SearchContext.FolderFocusKey, Constants.SearchContext.IsEditableItemKey),
        primary: 1024 | 2048 | 22,
        secondary: [
          2048 | 1024 | 3
          /* KeyCode.Enter */
        ]
      },
      icon: searchReplaceIcon,
      menu: [
        {
          id: MenuId.SearchContext,
          when: ContextKeyExpr.and(Constants.SearchContext.ReplaceActiveKey, Constants.SearchContext.FolderFocusKey, Constants.SearchContext.IsEditableItemKey),
          group: "search",
          order: 1
        },
        {
          id: MenuId.SearchActionMenu,
          when: ContextKeyExpr.and(Constants.SearchContext.ReplaceActiveKey, Constants.SearchContext.FolderFocusKey, Constants.SearchContext.IsEditableItemKey),
          group: "inline",
          order: 1
        }
      ]
    });
  }
  async run(accessor, context) {
    return performReplace(accessor, context);
  }
});
async function performReplace(accessor, context) {
  const configurationService = accessor.get(IConfigurationService);
  const viewsService = accessor.get(IViewsService);
  const viewlet = getSearchView(viewsService);
  const viewer = context?.viewer ?? viewlet?.getControl();
  if (!viewer) {
    return;
  }
  const element = context?.element ?? viewer.getFocus()[0];
  const elementsToReplace = getElementsToOperateOn(viewer, element ?? void 0, configurationService.getValue("search"));
  let focusElement = viewer.getFocus()[0];
  if (!focusElement || focusElement && !arrayContainsElementOrParent(focusElement, elementsToReplace) || isSearchResult(focusElement)) {
    focusElement = element;
  }
  if (elementsToReplace.length === 0) {
    return;
  }
  let nextFocusElement;
  if (focusElement) {
    nextFocusElement = await getElementToFocusAfterRemoved(viewer, focusElement, elementsToReplace);
  }
  const searchResult = viewlet?.searchResult;
  if (searchResult) {
    await searchResult.batchReplace(elementsToReplace);
  }
  await viewlet?.queueRefreshTree();
  if (focusElement) {
    if (!nextFocusElement) {
      nextFocusElement = await getLastNodeFromSameType(viewer, focusElement);
    }
    if (nextFocusElement) {
      viewer.reveal(nextFocusElement);
      viewer.setFocus([nextFocusElement], getSelectionKeyboardEvent());
      viewer.setSelection([nextFocusElement], getSelectionKeyboardEvent());
      if (isSearchTreeMatch(nextFocusElement)) {
        const useReplacePreview = configurationService.getValue().search.useReplacePreview;
        if (!useReplacePreview || hasToOpenFile(accessor, nextFocusElement) || nextFocusElement instanceof MatchInNotebook) {
          viewlet?.open(nextFocusElement, true);
        } else {
          accessor.get(IReplaceService).openReplacePreview(nextFocusElement, true);
        }
      } else if (isSearchTreeFileMatch(nextFocusElement)) {
        viewlet?.open(nextFocusElement, true);
      }
    }
  }
  viewer.domFocus();
}
__name(performReplace, "performReplace");
function hasToOpenFile(accessor, currBottomElem) {
  if (!isSearchTreeMatch(currBottomElem)) {
    return false;
  }
  const activeEditor = accessor.get(IEditorService).activeEditor;
  const file = activeEditor?.resource;
  if (file) {
    return accessor.get(IUriIdentityService).extUri.isEqual(file, currBottomElem.parent().resource);
  }
  return false;
}
__name(hasToOpenFile, "hasToOpenFile");
function compareLevels(elem1, elem2) {
  if (isSearchTreeMatch(elem1)) {
    if (isSearchTreeMatch(elem2)) {
      return 0;
    } else {
      return -1;
    }
  } else if (isSearchTreeFileMatch(elem1)) {
    if (isSearchTreeMatch(elem2)) {
      return 1;
    } else if (isSearchTreeFileMatch(elem2)) {
      return 0;
    } else {
      return -1;
    }
  } else if (isSearchTreeFolderMatch(elem1)) {
    if (isTextSearchHeading(elem2)) {
      return -1;
    } else if (isSearchTreeFolderMatch(elem2)) {
      return 0;
    } else {
      return 1;
    }
  } else {
    if (isTextSearchHeading(elem2)) {
      return 0;
    } else {
      return 1;
    }
  }
}
__name(compareLevels, "compareLevels");
async function getElementToFocusAfterRemoved(viewer, element, elementsToRemove) {
  const navigator = viewer.navigate(element);
  if (isSearchTreeFolderMatch(element)) {
    while (!!navigator.next() && (!isSearchTreeFolderMatch(navigator.current()) || arrayContainsElementOrParent(navigator.current(), elementsToRemove))) {
    }
  } else if (isSearchTreeFileMatch(element)) {
    while (!!navigator.next() && (!isSearchTreeFileMatch(navigator.current()) || arrayContainsElementOrParent(navigator.current(), elementsToRemove))) {
      if (navigator.current() instanceof AITextSearchHeadingImpl) {
        return navigator.current();
      }
      await viewer.expand(navigator.current());
    }
  } else {
    while (navigator.next() && (!isSearchTreeMatch(navigator.current()) || arrayContainsElementOrParent(navigator.current(), elementsToRemove))) {
      if (navigator.current() instanceof AITextSearchHeadingImpl) {
        return navigator.current();
      }
      await viewer.expand(navigator.current());
    }
  }
  return navigator.current();
}
__name(getElementToFocusAfterRemoved, "getElementToFocusAfterRemoved");
async function getLastNodeFromSameType(viewer, element) {
  let lastElem = viewer.lastVisibleElement ?? null;
  while (lastElem) {
    const compareVal = compareLevels(element, lastElem);
    if (compareVal === -1) {
      const expanded = await viewer.expand(lastElem);
      if (!expanded) {
        return lastElem;
      }
      lastElem = viewer.lastVisibleElement;
    } else if (compareVal === 1) {
      const potentialLastElem = viewer.getParentElement(lastElem);
      if (isSearchResult(potentialLastElem)) {
        break;
      } else {
        lastElem = potentialLastElem;
      }
    } else {
      return lastElem;
    }
  }
  return void 0;
}
__name(getLastNodeFromSameType, "getLastNodeFromSameType");
export {
  getElementToFocusAfterRemoved,
  getLastNodeFromSameType
};
//# sourceMappingURL=searchActionsRemoveReplace.js.map
