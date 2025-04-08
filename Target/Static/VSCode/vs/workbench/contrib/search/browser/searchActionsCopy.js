var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import * as Constants from "../common/constants.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { category, getSearchView } from "./searchActionsBase.js";
import { isWindows } from "../../../../base/common/platform.js";
import { searchMatchComparer } from "./searchCompare.js";
import { RenderableMatch, ISearchTreeMatch, isSearchTreeMatch, ISearchTreeFileMatch, ISearchTreeFolderMatch, ISearchTreeFolderMatchWithResource, isSearchTreeFileMatch, isSearchTreeFolderMatch, isSearchTreeFolderMatchWithResource } from "./searchTreeModel/searchTreeCommon.js";
registerAction2(class CopyMatchCommandAction extends Action2 {
  static {
    __name(this, "CopyMatchCommandAction");
  }
  constructor() {
    super({
      id: Constants.SearchCommandIds.CopyMatchCommandId,
      title: nls.localize2("copyMatchLabel", "Copy"),
      category,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        when: Constants.SearchContext.FileMatchOrMatchFocusKey,
        primary: KeyMod.CtrlCmd | KeyCode.KeyC
      },
      menu: [{
        id: MenuId.SearchContext,
        when: Constants.SearchContext.FileMatchOrMatchFocusKey,
        group: "search_2",
        order: 1
      }]
    });
  }
  async run(accessor, match) {
    await copyMatchCommand(accessor, match);
  }
});
registerAction2(class CopyPathCommandAction extends Action2 {
  static {
    __name(this, "CopyPathCommandAction");
  }
  constructor() {
    super({
      id: Constants.SearchCommandIds.CopyPathCommandId,
      title: nls.localize2("copyPathLabel", "Copy Path"),
      category,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        when: Constants.SearchContext.FileMatchOrFolderMatchWithResourceFocusKey,
        primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyC,
        win: {
          primary: KeyMod.Shift | KeyMod.Alt | KeyCode.KeyC
        }
      },
      menu: [{
        id: MenuId.SearchContext,
        when: Constants.SearchContext.FileMatchOrFolderMatchWithResourceFocusKey,
        group: "search_2",
        order: 2
      }]
    });
  }
  async run(accessor, fileMatch) {
    await copyPathCommand(accessor, fileMatch);
  }
});
registerAction2(class CopyAllCommandAction extends Action2 {
  static {
    __name(this, "CopyAllCommandAction");
  }
  constructor() {
    super({
      id: Constants.SearchCommandIds.CopyAllCommandId,
      title: nls.localize2("copyAllLabel", "Copy All"),
      category,
      menu: [{
        id: MenuId.SearchContext,
        when: Constants.SearchContext.HasSearchResults,
        group: "search_2",
        order: 3
      }]
    });
  }
  async run(accessor) {
    await copyAllCommand(accessor);
  }
});
registerAction2(class GetSearchResultsAction extends Action2 {
  static {
    __name(this, "GetSearchResultsAction");
  }
  constructor() {
    super({
      id: Constants.SearchCommandIds.GetSearchResultsActionId,
      title: nls.localize2("getSearchResultsLabel", "Get Search Results"),
      category,
      f1: false
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const labelService = accessor.get(ILabelService);
    const searchView = getSearchView(viewsService);
    if (searchView) {
      const root = searchView.searchResult;
      const textSearchResult = allFolderMatchesToString(root.folderMatches(), labelService);
      const aiSearchResult = allFolderMatchesToString(root.folderMatches(true), labelService);
      const text = `${textSearchResult}${lineDelimiter}${lineDelimiter}${aiSearchResult}`;
      return text;
    }
    return void 0;
  }
});
const lineDelimiter = isWindows ? "\r\n" : "\n";
async function copyPathCommand(accessor, fileMatch) {
  if (!fileMatch) {
    const selection = getSelectedRow(accessor);
    if (!isSearchTreeFileMatch(selection) || isSearchTreeFolderMatchWithResource(selection)) {
      return;
    }
    fileMatch = selection;
  }
  const clipboardService = accessor.get(IClipboardService);
  const labelService = accessor.get(ILabelService);
  const text = labelService.getUriLabel(fileMatch.resource, { noPrefix: true });
  await clipboardService.writeText(text);
}
__name(copyPathCommand, "copyPathCommand");
async function copyMatchCommand(accessor, match) {
  if (!match) {
    const selection = getSelectedRow(accessor);
    if (!selection) {
      return;
    }
    match = selection;
  }
  const clipboardService = accessor.get(IClipboardService);
  const labelService = accessor.get(ILabelService);
  let text;
  if (isSearchTreeMatch(match)) {
    text = matchToString(match);
  } else if (isSearchTreeFileMatch(match)) {
    text = fileMatchToString(match, labelService).text;
  } else if (isSearchTreeFolderMatch(match)) {
    text = folderMatchToString(match, labelService).text;
  }
  if (text) {
    await clipboardService.writeText(text);
  }
}
__name(copyMatchCommand, "copyMatchCommand");
async function copyAllCommand(accessor) {
  const viewsService = accessor.get(IViewsService);
  const clipboardService = accessor.get(IClipboardService);
  const labelService = accessor.get(ILabelService);
  const searchView = getSearchView(viewsService);
  if (searchView) {
    const root = searchView.searchResult;
    const text = allFolderMatchesToString(root.folderMatches(), labelService);
    await clipboardService.writeText(text);
  }
}
__name(copyAllCommand, "copyAllCommand");
function matchToString(match, indent = 0) {
  const getFirstLinePrefix = /* @__PURE__ */ __name(() => `${match.range().startLineNumber},${match.range().startColumn}`, "getFirstLinePrefix");
  const getOtherLinePrefix = /* @__PURE__ */ __name((i) => match.range().startLineNumber + i + "", "getOtherLinePrefix");
  const fullMatchLines = match.fullPreviewLines();
  const largestPrefixSize = fullMatchLines.reduce((largest, _, i) => {
    const thisSize = i === 0 ? getFirstLinePrefix().length : getOtherLinePrefix(i).length;
    return Math.max(thisSize, largest);
  }, 0);
  const formattedLines = fullMatchLines.map((line, i) => {
    const prefix = i === 0 ? getFirstLinePrefix() : getOtherLinePrefix(i);
    const paddingStr = " ".repeat(largestPrefixSize - prefix.length);
    const indentStr = " ".repeat(indent);
    return `${indentStr}${prefix}: ${paddingStr}${line}`;
  });
  return formattedLines.join("\n");
}
__name(matchToString, "matchToString");
function fileFolderMatchToString(match, labelService) {
  if (isSearchTreeFileMatch(match)) {
    return fileMatchToString(match, labelService);
  } else {
    return folderMatchToString(match, labelService);
  }
}
__name(fileFolderMatchToString, "fileFolderMatchToString");
function fileMatchToString(fileMatch, labelService) {
  const matchTextRows = fileMatch.matches().sort(searchMatchComparer).map((match) => matchToString(match, 2));
  const uriString = labelService.getUriLabel(fileMatch.resource, { noPrefix: true });
  return {
    text: `${uriString}${lineDelimiter}${matchTextRows.join(lineDelimiter)}`,
    count: matchTextRows.length
  };
}
__name(fileMatchToString, "fileMatchToString");
function folderMatchToString(folderMatch, labelService) {
  const results = [];
  let numMatches = 0;
  const matches = folderMatch.matches().sort(searchMatchComparer);
  matches.forEach((match) => {
    const result = fileFolderMatchToString(match, labelService);
    numMatches += result.count;
    results.push(result.text);
  });
  return {
    text: results.join(lineDelimiter + lineDelimiter),
    count: numMatches
  };
}
__name(folderMatchToString, "folderMatchToString");
function allFolderMatchesToString(folderMatches, labelService) {
  const folderResults = [];
  folderMatches = folderMatches.sort(searchMatchComparer);
  for (let i = 0; i < folderMatches.length; i++) {
    const folderResult = folderMatchToString(folderMatches[i], labelService);
    if (folderResult.count) {
      folderResults.push(folderResult.text);
    }
  }
  return folderResults.join(lineDelimiter + lineDelimiter);
}
__name(allFolderMatchesToString, "allFolderMatchesToString");
function getSelectedRow(accessor) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  return searchView?.getControl().getSelection()[0];
}
__name(getSelectedRow, "getSelectedRow");
export {
  lineDelimiter
};
//# sourceMappingURL=searchActionsCopy.js.map
