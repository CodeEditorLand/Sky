var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { dirname } from "../../../../base/common/resources.js";
import * as nls from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IListService, WorkbenchCompressibleAsyncDataTree } from "../../../../platform/list/browser/listService.js";
import { ViewContainerLocation } from "../../../common/views.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import * as Constants from "../common/constants.js";
import * as SearchEditorConstants from "../../searchEditor/browser/constants.js";
import { OpenSearchEditorArgs } from "../../searchEditor/browser/searchEditor.contribution.js";
import { ISearchConfiguration, ISearchConfigurationProperties } from "../../../services/search/common/search.js";
import { URI } from "../../../../base/common/uri.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { resolveResourcesForSearchIncludes } from "../../../services/search/common/queryBuilder.js";
import { getMultiSelectedResources, IExplorerService } from "../../files/browser/files.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ExplorerFolderContext, ExplorerRootContext, FilesExplorerFocusCondition, VIEWLET_ID as VIEWLET_ID_FILES } from "../../files/common/files.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
import { ExplorerViewPaneContainer } from "../../files/browser/explorerViewlet.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { category, getElementsToOperateOn, getSearchView, openSearchView } from "./searchActionsBase.js";
import { IConfigurationResolverService } from "../../../services/configurationResolver/common/configurationResolver.js";
import { IHistoryService } from "../../../services/history/common/history.js";
import { Schemas } from "../../../../base/common/network.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { forcedExpandRecursively } from "./searchActionsTopBar.js";
import { RenderableMatch, ISearchTreeFileMatch, ISearchTreeFolderMatchWithResource, ISearchResult, isSearchTreeFileMatch, isSearchTreeMatch } from "./searchTreeModel/searchTreeCommon.js";
registerAction2(class RestrictSearchToFolderAction extends Action2 {
  static {
    __name(this, "RestrictSearchToFolderAction");
  }
  constructor() {
    super({
      id: Constants.SearchCommandIds.RestrictSearchToFolderId,
      title: nls.localize2("restrictResultsToFolder", "Restrict Search to Folder"),
      category,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        when: ContextKeyExpr.and(Constants.SearchContext.SearchViewVisibleKey, Constants.SearchContext.ResourceFolderFocusKey),
        primary: KeyMod.Shift | KeyMod.Alt | KeyCode.KeyF
      },
      menu: [
        {
          id: MenuId.SearchContext,
          group: "search",
          order: 3,
          when: ContextKeyExpr.and(Constants.SearchContext.ResourceFolderFocusKey)
        }
      ]
    });
  }
  async run(accessor, folderMatch) {
    await searchWithFolderCommand(accessor, false, true, void 0, folderMatch);
  }
});
registerAction2(class ExpandSelectedTreeCommandAction extends Action2 {
  static {
    __name(this, "ExpandSelectedTreeCommandAction");
  }
  constructor() {
    super({
      id: Constants.SearchCommandIds.ExpandRecursivelyCommandId,
      title: nls.localize("search.expandRecursively", "Expand Recursively"),
      category,
      menu: [{
        id: MenuId.SearchContext,
        when: ContextKeyExpr.and(
          Constants.SearchContext.FolderFocusKey,
          Constants.SearchContext.HasSearchResults
        ),
        group: "search",
        order: 4
      }]
    });
  }
  async run(accessor) {
    return expandSelectSubtree(accessor);
  }
});
registerAction2(class ExcludeFolderFromSearchAction extends Action2 {
  static {
    __name(this, "ExcludeFolderFromSearchAction");
  }
  constructor() {
    super({
      id: Constants.SearchCommandIds.ExcludeFolderFromSearchId,
      title: nls.localize2("excludeFolderFromSearch", "Exclude Folder from Search"),
      category,
      menu: [
        {
          id: MenuId.SearchContext,
          group: "search",
          order: 4,
          when: ContextKeyExpr.and(Constants.SearchContext.ResourceFolderFocusKey)
        }
      ]
    });
  }
  async run(accessor, folderMatch) {
    await searchWithFolderCommand(accessor, false, false, void 0, folderMatch);
  }
});
registerAction2(class RevealInSideBarForSearchResultsAction extends Action2 {
  static {
    __name(this, "RevealInSideBarForSearchResultsAction");
  }
  constructor() {
    super({
      id: Constants.SearchCommandIds.RevealInSideBarForSearchResults,
      title: nls.localize2("revealInSideBar", "Reveal in Explorer View"),
      category,
      menu: [{
        id: MenuId.SearchContext,
        when: ContextKeyExpr.and(Constants.SearchContext.FileFocusKey, Constants.SearchContext.HasSearchResults),
        group: "search_3",
        order: 1
      }]
    });
  }
  async run(accessor, args) {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    const explorerService = accessor.get(IExplorerService);
    const contextService = accessor.get(IWorkspaceContextService);
    const searchView = getSearchView(accessor.get(IViewsService));
    if (!searchView) {
      return;
    }
    let fileMatch;
    if (isSearchTreeFileMatch(args)) {
      fileMatch = args;
    } else {
      args = searchView.getControl().getFocus()[0];
      return;
    }
    paneCompositeService.openPaneComposite(VIEWLET_ID_FILES, ViewContainerLocation.Sidebar, false).then((viewlet) => {
      if (!viewlet) {
        return;
      }
      const explorerViewContainer = viewlet.getViewPaneContainer();
      const uri = fileMatch.resource;
      if (uri && contextService.isInsideWorkspace(uri)) {
        const explorerView = explorerViewContainer.getExplorerView();
        explorerView.setExpanded(true);
        explorerService.select(uri, true).then(() => explorerView.focus(), onUnexpectedError);
      }
    });
  }
});
registerAction2(class FindInFilesAction extends Action2 {
  static {
    __name(this, "FindInFilesAction");
  }
  constructor() {
    super({
      id: Constants.SearchCommandIds.FindInFilesActionId,
      title: {
        ...nls.localize2("findInFiles", "Find in Files"),
        mnemonicTitle: nls.localize({ key: "miFindInFiles", comment: ["&& denotes a mnemonic"] }, "Find &&in Files")
      },
      metadata: {
        description: nls.localize("findInFiles.description", "Open a workspace search"),
        args: [
          {
            name: nls.localize("findInFiles.args", "A set of options for the search"),
            schema: {
              type: "object",
              properties: {
                query: { "type": "string" },
                replace: { "type": "string" },
                preserveCase: { "type": "boolean" },
                triggerSearch: { "type": "boolean" },
                filesToInclude: { "type": "string" },
                filesToExclude: { "type": "string" },
                isRegex: { "type": "boolean" },
                isCaseSensitive: { "type": "boolean" },
                matchWholeWord: { "type": "boolean" },
                useExcludeSettingsAndIgnoreFiles: { "type": "boolean" },
                onlyOpenEditors: { "type": "boolean" },
                showIncludesExcludes: { "type": "boolean" }
              }
            }
          }
        ]
      },
      category,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyF
      },
      menu: [{
        id: MenuId.MenubarEditMenu,
        group: "4_find_global",
        order: 1
      }],
      f1: true
    });
  }
  async run(accessor, args = {}) {
    findInFilesCommand(accessor, args);
  }
});
registerAction2(class FindInFolderAction extends Action2 {
  static {
    __name(this, "FindInFolderAction");
  }
  // from explorer
  constructor() {
    super({
      id: Constants.SearchCommandIds.FindInFolderId,
      title: nls.localize2("findInFolder", "Find in Folder..."),
      category,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        when: ContextKeyExpr.and(FilesExplorerFocusCondition, ExplorerFolderContext),
        primary: KeyMod.Shift | KeyMod.Alt | KeyCode.KeyF
      },
      menu: [
        {
          id: MenuId.ExplorerContext,
          group: "4_search",
          order: 10,
          when: ContextKeyExpr.and(ExplorerFolderContext)
        }
      ]
    });
  }
  async run(accessor, resource) {
    await searchWithFolderCommand(accessor, true, true, resource);
  }
});
registerAction2(class FindInWorkspaceAction extends Action2 {
  static {
    __name(this, "FindInWorkspaceAction");
  }
  // from explorer
  constructor() {
    super({
      id: Constants.SearchCommandIds.FindInWorkspaceId,
      title: nls.localize2("findInWorkspace", "Find in Workspace..."),
      category,
      menu: [
        {
          id: MenuId.ExplorerContext,
          group: "4_search",
          order: 10,
          when: ContextKeyExpr.and(ExplorerRootContext, ExplorerFolderContext.toNegated())
        }
      ]
    });
  }
  async run(accessor) {
    const searchConfig = accessor.get(IConfigurationService).getValue().search;
    const mode = searchConfig.mode;
    if (mode === "view") {
      const searchView = await openSearchView(accessor.get(IViewsService), true);
      searchView?.searchInFolders();
    } else {
      return accessor.get(ICommandService).executeCommand(SearchEditorConstants.OpenEditorCommandId, {
        location: mode === "newEditor" ? "new" : "reuse",
        filesToInclude: ""
      });
    }
  }
});
async function expandSelectSubtree(accessor) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  if (searchView) {
    const viewer = searchView.getControl();
    const selected = viewer.getFocus()[0];
    await forcedExpandRecursively(viewer, selected);
  }
}
__name(expandSelectSubtree, "expandSelectSubtree");
async function searchWithFolderCommand(accessor, isFromExplorer, isIncludes, resource, folderMatch) {
  const fileService = accessor.get(IFileService);
  const viewsService = accessor.get(IViewsService);
  const contextService = accessor.get(IWorkspaceContextService);
  const commandService = accessor.get(ICommandService);
  const searchConfig = accessor.get(IConfigurationService).getValue().search;
  const mode = searchConfig.mode;
  let resources;
  if (isFromExplorer) {
    resources = getMultiSelectedResources(resource, accessor.get(IListService), accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IExplorerService));
  } else {
    const searchView = getSearchView(viewsService);
    if (!searchView) {
      return;
    }
    resources = getMultiSelectedSearchResources(searchView.getControl(), folderMatch, searchConfig);
  }
  const resolvedResources = fileService.resolveAll(resources.map((resource2) => ({ resource: resource2 }))).then((results) => {
    const folders = [];
    results.forEach((result) => {
      if (result.success && result.stat) {
        folders.push(result.stat.isDirectory ? result.stat.resource : dirname(result.stat.resource));
      }
    });
    return resolveResourcesForSearchIncludes(folders, contextService);
  });
  if (mode === "view") {
    const searchView = await openSearchView(viewsService, true);
    if (resources && resources.length && searchView) {
      if (isIncludes) {
        searchView.searchInFolders(await resolvedResources);
      } else {
        searchView.searchOutsideOfFolders(await resolvedResources);
      }
    }
    return void 0;
  } else {
    if (isIncludes) {
      return commandService.executeCommand(SearchEditorConstants.OpenEditorCommandId, {
        filesToInclude: (await resolvedResources).join(", "),
        showIncludesExcludes: true,
        location: mode === "newEditor" ? "new" : "reuse"
      });
    } else {
      return commandService.executeCommand(SearchEditorConstants.OpenEditorCommandId, {
        filesToExclude: (await resolvedResources).join(", "),
        showIncludesExcludes: true,
        location: mode === "newEditor" ? "new" : "reuse"
      });
    }
  }
}
__name(searchWithFolderCommand, "searchWithFolderCommand");
function getMultiSelectedSearchResources(viewer, currElement, sortConfig) {
  return getElementsToOperateOn(viewer, currElement, sortConfig).map((renderableMatch) => isSearchTreeMatch(renderableMatch) ? null : renderableMatch.resource).filter((renderableMatch) => renderableMatch !== null);
}
__name(getMultiSelectedSearchResources, "getMultiSelectedSearchResources");
async function findInFilesCommand(accessor, _args = {}) {
  const searchConfig = accessor.get(IConfigurationService).getValue().search;
  const viewsService = accessor.get(IViewsService);
  const commandService = accessor.get(ICommandService);
  const args = {};
  if (Object.keys(_args).length !== 0) {
    const configurationResolverService = accessor.get(IConfigurationResolverService);
    const historyService = accessor.get(IHistoryService);
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot();
    const filteredActiveWorkspaceRootUri = activeWorkspaceRootUri?.scheme === Schemas.file || activeWorkspaceRootUri?.scheme === Schemas.vscodeRemote ? activeWorkspaceRootUri : void 0;
    const lastActiveWorkspaceRoot = filteredActiveWorkspaceRootUri ? workspaceContextService.getWorkspaceFolder(filteredActiveWorkspaceRootUri) ?? void 0 : void 0;
    for (const entry of Object.entries(_args)) {
      const name = entry[0];
      const value = entry[1];
      if (value !== void 0) {
        args[name] = typeof value === "string" ? await configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, value) : value;
      }
    }
  }
  const mode = searchConfig.mode;
  if (mode === "view") {
    openSearchView(viewsService, false).then((openedView) => {
      if (openedView) {
        const searchAndReplaceWidget = openedView.searchAndReplaceWidget;
        searchAndReplaceWidget.toggleReplace(typeof args.replace === "string");
        let updatedText = false;
        if (typeof args.query !== "string") {
          updatedText = openedView.updateTextFromFindWidgetOrSelection({ allowUnselectedWord: typeof args.replace !== "string" });
        }
        openedView.setSearchParameters(args);
        if (typeof args.showIncludesExcludes === "boolean") {
          openedView.toggleQueryDetails(false, args.showIncludesExcludes);
        }
        openedView.searchAndReplaceWidget.focus(void 0, updatedText, updatedText);
      }
    });
  } else {
    const convertArgs = /* @__PURE__ */ __name((args2) => ({
      location: mode === "newEditor" ? "new" : "reuse",
      query: args2.query,
      filesToInclude: args2.filesToInclude,
      filesToExclude: args2.filesToExclude,
      matchWholeWord: args2.matchWholeWord,
      isCaseSensitive: args2.isCaseSensitive,
      isRegexp: args2.isRegex,
      useExcludeSettingsAndIgnoreFiles: args2.useExcludeSettingsAndIgnoreFiles,
      onlyOpenEditors: args2.onlyOpenEditors,
      showIncludesExcludes: !!(args2.filesToExclude || args2.filesToExclude || !args2.useExcludeSettingsAndIgnoreFiles)
    }), "convertArgs");
    commandService.executeCommand(SearchEditorConstants.OpenEditorCommandId, convertArgs(args));
  }
}
__name(findInFilesCommand, "findInFilesCommand");
export {
  findInFilesCommand
};
//# sourceMappingURL=searchActionsFind.js.map
