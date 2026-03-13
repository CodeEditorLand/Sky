var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../../base/common/uri.js";
function arrayContainsElementOrParent(element, testArray) {
  do {
    if (testArray.includes(element)) {
      return true;
    }
  } while (!isSearchResult(element.parent()) && (element = element.parent()));
  return false;
}
__name(arrayContainsElementOrParent, "arrayContainsElementOrParent");
var SearchModelLocation;
(function(SearchModelLocation2) {
  SearchModelLocation2[SearchModelLocation2["PANEL"] = 0] = "PANEL";
  SearchModelLocation2[SearchModelLocation2["QUICK_ACCESS"] = 1] = "QUICK_ACCESS";
})(SearchModelLocation || (SearchModelLocation = {}));
const PLAIN_TEXT_SEARCH__RESULT_ID = "plainTextSearch";
const AI_TEXT_SEARCH_RESULT_ID = "aiTextSearch";
function createParentList(element) {
  const parentArray = [];
  let currElement = element;
  while (!isTextSearchHeading(currElement)) {
    parentArray.push(currElement);
    currElement = currElement.parent();
  }
  return parentArray;
}
__name(createParentList, "createParentList");
const SEARCH_MODEL_PREFIX = "SEARCH_MODEL_";
const SEARCH_RESULT_PREFIX = "SEARCH_RESULT_";
const TEXT_SEARCH_HEADING_PREFIX = "TEXT_SEARCH_HEADING_";
const FOLDER_MATCH_PREFIX = "FOLDER_MATCH_";
const FILE_MATCH_PREFIX = "FILE_MATCH_";
const MATCH_PREFIX = "MATCH_";
function mergeSearchResultEvents(events) {
  const retEvent = {
    elements: [],
    added: false,
    removed: false
  };
  events.forEach((e) => {
    if (e.added) {
      retEvent.added = true;
    }
    if (e.removed) {
      retEvent.removed = true;
    }
    retEvent.elements = retEvent.elements.concat(e.elements);
  });
  return retEvent;
}
__name(mergeSearchResultEvents, "mergeSearchResultEvents");
function isSearchModel(obj) {
  return typeof obj === "object" && obj !== null && typeof obj.id === "function" && obj.id().startsWith(SEARCH_MODEL_PREFIX);
}
__name(isSearchModel, "isSearchModel");
function isSearchResult(obj) {
  return typeof obj === "object" && obj !== null && typeof obj.id === "function" && obj.id().startsWith(SEARCH_RESULT_PREFIX);
}
__name(isSearchResult, "isSearchResult");
function isTextSearchHeading(obj) {
  return typeof obj === "object" && obj !== null && typeof obj.id === "function" && obj.id().startsWith(TEXT_SEARCH_HEADING_PREFIX);
}
__name(isTextSearchHeading, "isTextSearchHeading");
function isPlainTextSearchHeading(obj) {
  return isTextSearchHeading(obj) && // eslint-disable-next-line local/code-no-any-casts
  typeof obj.replace === "function" && // eslint-disable-next-line local/code-no-any-casts
  typeof obj.replaceAll === "function";
}
__name(isPlainTextSearchHeading, "isPlainTextSearchHeading");
function isSearchTreeFolderMatch(obj) {
  return typeof obj === "object" && obj !== null && typeof obj.id === "function" && obj.id().startsWith(FOLDER_MATCH_PREFIX);
}
__name(isSearchTreeFolderMatch, "isSearchTreeFolderMatch");
function isSearchTreeFolderMatchWithResource(obj) {
  return isSearchTreeFolderMatch(obj) && obj.resource instanceof URI;
}
__name(isSearchTreeFolderMatchWithResource, "isSearchTreeFolderMatchWithResource");
function isSearchTreeFolderMatchWorkspaceRoot(obj) {
  return isSearchTreeFolderMatchWithResource(obj) && // eslint-disable-next-line local/code-no-any-casts
  typeof obj.createAndConfigureFileMatch === "function";
}
__name(isSearchTreeFolderMatchWorkspaceRoot, "isSearchTreeFolderMatchWorkspaceRoot");
function isSearchTreeFolderMatchNoRoot(obj) {
  return isSearchTreeFolderMatch(obj) && // eslint-disable-next-line local/code-no-any-casts
  typeof obj.createAndConfigureFileMatch === "function";
}
__name(isSearchTreeFolderMatchNoRoot, "isSearchTreeFolderMatchNoRoot");
function isSearchTreeFileMatch(obj) {
  return typeof obj === "object" && obj !== null && typeof obj.id === "function" && obj.id().startsWith(FILE_MATCH_PREFIX);
}
__name(isSearchTreeFileMatch, "isSearchTreeFileMatch");
function isSearchTreeMatch(obj) {
  return typeof obj === "object" && obj !== null && typeof obj.id === "function" && obj.id().startsWith(MATCH_PREFIX);
}
__name(isSearchTreeMatch, "isSearchTreeMatch");
function isSearchHeader(obj) {
  return typeof obj === "object" && obj !== null && typeof obj.id === "function" && obj.id().startsWith(TEXT_SEARCH_HEADING_PREFIX);
}
__name(isSearchHeader, "isSearchHeader");
function getFileMatches(matches) {
  const folderMatches = [];
  const fileMatches = [];
  matches.forEach((e) => {
    if (isSearchTreeFileMatch(e)) {
      fileMatches.push(e);
    } else {
      folderMatches.push(e);
    }
  });
  return fileMatches.concat(folderMatches.map((e) => e.allDownstreamFileMatches()).flat());
}
__name(getFileMatches, "getFileMatches");
export {
  AI_TEXT_SEARCH_RESULT_ID,
  FILE_MATCH_PREFIX,
  FOLDER_MATCH_PREFIX,
  MATCH_PREFIX,
  PLAIN_TEXT_SEARCH__RESULT_ID,
  SEARCH_MODEL_PREFIX,
  SEARCH_RESULT_PREFIX,
  SearchModelLocation,
  TEXT_SEARCH_HEADING_PREFIX,
  arrayContainsElementOrParent,
  createParentList,
  getFileMatches,
  isPlainTextSearchHeading,
  isSearchHeader,
  isSearchModel,
  isSearchResult,
  isSearchTreeFileMatch,
  isSearchTreeFolderMatch,
  isSearchTreeFolderMatchNoRoot,
  isSearchTreeFolderMatchWithResource,
  isSearchTreeFolderMatchWorkspaceRoot,
  isSearchTreeMatch,
  isTextSearchHeading,
  mergeSearchResultEvents
};
//# sourceMappingURL=searchTreeCommon.js.map
