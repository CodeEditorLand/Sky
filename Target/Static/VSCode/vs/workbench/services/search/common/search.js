var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { mapArrayOrNot } from "../../../../base/common/arrays.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import * as glob from "../../../../base/common/glob.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import * as objects from "../../../../base/common/objects.js";
import * as extpath from "../../../../base/common/extpath.js";
import { fuzzyContains, getNLines } from "../../../../base/common/strings.js";
import { URI, UriComponents } from "../../../../base/common/uri.js";
import { IFilesConfiguration } from "../../../../platform/files/common/files.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ITelemetryData } from "../../../../platform/telemetry/common/telemetry.js";
import { Event } from "../../../../base/common/event.js";
import * as paths from "../../../../base/common/path.js";
import { isCancellationError } from "../../../../base/common/errors.js";
import { GlobPattern, TextSearchCompleteMessageType } from "./searchExtTypes.js";
import { isThenable } from "../../../../base/common/async.js";
import { ResourceSet } from "../../../../base/common/map.js";
const VIEWLET_ID = "workbench.view.search";
const PANEL_ID = "workbench.panel.search";
const VIEW_ID = "workbench.view.search";
const SEARCH_RESULT_LANGUAGE_ID = "search-result";
const SEARCH_EXCLUDE_CONFIG = "search.exclude";
const DEFAULT_MAX_SEARCH_RESULTS = 2e4;
const SEARCH_ELIDED_PREFIX = "\u27EA ";
const SEARCH_ELIDED_SUFFIX = " characters skipped \u27EB";
const SEARCH_ELIDED_MIN_LEN = (SEARCH_ELIDED_PREFIX.length + SEARCH_ELIDED_SUFFIX.length + 5) * 2;
const ISearchService = createDecorator("searchService");
var SearchProviderType = /* @__PURE__ */ ((SearchProviderType2) => {
  SearchProviderType2[SearchProviderType2["file"] = 0] = "file";
  SearchProviderType2[SearchProviderType2["text"] = 1] = "text";
  SearchProviderType2[SearchProviderType2["aiText"] = 2] = "aiText";
  return SearchProviderType2;
})(SearchProviderType || {});
var QueryType = /* @__PURE__ */ ((QueryType2) => {
  QueryType2[QueryType2["File"] = 1] = "File";
  QueryType2[QueryType2["Text"] = 2] = "Text";
  QueryType2[QueryType2["aiText"] = 3] = "aiText";
  return QueryType2;
})(QueryType || {});
function resultIsMatch(result) {
  return !!result.rangeLocations && !!result.previewText;
}
__name(resultIsMatch, "resultIsMatch");
function isFileMatch(p) {
  return !!p.resource;
}
__name(isFileMatch, "isFileMatch");
function isProgressMessage(p) {
  return !!p.message;
}
__name(isProgressMessage, "isProgressMessage");
var SearchCompletionExitCode = /* @__PURE__ */ ((SearchCompletionExitCode2) => {
  SearchCompletionExitCode2[SearchCompletionExitCode2["Normal"] = 0] = "Normal";
  SearchCompletionExitCode2[SearchCompletionExitCode2["NewSearchStarted"] = 1] = "NewSearchStarted";
  return SearchCompletionExitCode2;
})(SearchCompletionExitCode || {});
class FileMatch {
  constructor(resource) {
    this.resource = resource;
  }
  static {
    __name(this, "FileMatch");
  }
  results = [];
}
class TextSearchMatch {
  static {
    __name(this, "TextSearchMatch");
  }
  rangeLocations = [];
  previewText;
  webviewIndex;
  constructor(text, ranges, previewOptions, webviewIndex) {
    this.webviewIndex = webviewIndex;
    const rangesArr = Array.isArray(ranges) ? ranges : [ranges];
    if (previewOptions && previewOptions.matchLines === 1 && isSingleLineRangeList(rangesArr)) {
      text = getNLines(text, previewOptions.matchLines);
      let result = "";
      let shift = 0;
      let lastEnd = 0;
      const leadingChars = Math.floor(previewOptions.charsPerLine / 5);
      for (const range of rangesArr) {
        const previewStart = Math.max(range.startColumn - leadingChars, 0);
        const previewEnd = range.startColumn + previewOptions.charsPerLine;
        if (previewStart > lastEnd + leadingChars + SEARCH_ELIDED_MIN_LEN) {
          const elision = SEARCH_ELIDED_PREFIX + (previewStart - lastEnd) + SEARCH_ELIDED_SUFFIX;
          result += elision + text.slice(previewStart, previewEnd);
          shift += previewStart - (lastEnd + elision.length);
        } else {
          result += text.slice(lastEnd, previewEnd);
        }
        lastEnd = previewEnd;
        this.rangeLocations.push({
          source: range,
          preview: new OneLineRange(0, range.startColumn - shift, range.endColumn - shift)
        });
      }
      this.previewText = result;
    } else {
      const firstMatchLine = Array.isArray(ranges) ? ranges[0].startLineNumber : ranges.startLineNumber;
      const rangeLocs = mapArrayOrNot(ranges, (r) => ({
        preview: new SearchRange(r.startLineNumber - firstMatchLine, r.startColumn, r.endLineNumber - firstMatchLine, r.endColumn),
        source: r
      }));
      this.rangeLocations = Array.isArray(rangeLocs) ? rangeLocs : [rangeLocs];
      this.previewText = text;
    }
  }
}
function isSingleLineRangeList(ranges) {
  const line = ranges[0].startLineNumber;
  for (const r of ranges) {
    if (r.startLineNumber !== line || r.endLineNumber !== line) {
      return false;
    }
  }
  return true;
}
__name(isSingleLineRangeList, "isSingleLineRangeList");
class SearchRange {
  static {
    __name(this, "SearchRange");
  }
  startLineNumber;
  startColumn;
  endLineNumber;
  endColumn;
  constructor(startLineNumber, startColumn, endLineNumber, endColumn) {
    this.startLineNumber = startLineNumber;
    this.startColumn = startColumn;
    this.endLineNumber = endLineNumber;
    this.endColumn = endColumn;
  }
}
class OneLineRange extends SearchRange {
  static {
    __name(this, "OneLineRange");
  }
  constructor(lineNumber, startColumn, endColumn) {
    super(lineNumber, startColumn, lineNumber, endColumn);
  }
}
var ViewMode = /* @__PURE__ */ ((ViewMode2) => {
  ViewMode2["List"] = "list";
  ViewMode2["Tree"] = "tree";
  return ViewMode2;
})(ViewMode || {});
var SearchSortOrder = /* @__PURE__ */ ((SearchSortOrder2) => {
  SearchSortOrder2["Default"] = "default";
  SearchSortOrder2["FileNames"] = "fileNames";
  SearchSortOrder2["Type"] = "type";
  SearchSortOrder2["Modified"] = "modified";
  SearchSortOrder2["CountDescending"] = "countDescending";
  SearchSortOrder2["CountAscending"] = "countAscending";
  return SearchSortOrder2;
})(SearchSortOrder || {});
function getExcludes(configuration, includeSearchExcludes = true) {
  const fileExcludes = configuration && configuration.files && configuration.files.exclude;
  const searchExcludes = includeSearchExcludes && configuration && configuration.search && configuration.search.exclude;
  if (!fileExcludes && !searchExcludes) {
    return void 0;
  }
  if (!fileExcludes || !searchExcludes) {
    return fileExcludes || searchExcludes || void 0;
  }
  let allExcludes = /* @__PURE__ */ Object.create(null);
  allExcludes = objects.mixin(allExcludes, objects.deepClone(fileExcludes));
  allExcludes = objects.mixin(allExcludes, objects.deepClone(searchExcludes), true);
  return allExcludes;
}
__name(getExcludes, "getExcludes");
function pathIncludedInQuery(queryProps, fsPath) {
  if (queryProps.excludePattern && glob.match(queryProps.excludePattern, fsPath)) {
    return false;
  }
  if (queryProps.includePattern || queryProps.usingSearchPaths) {
    if (queryProps.includePattern && glob.match(queryProps.includePattern, fsPath)) {
      return true;
    }
    if (queryProps.usingSearchPaths) {
      return !!queryProps.folderQueries && queryProps.folderQueries.some((fq) => {
        const searchPath = fq.folder.fsPath;
        if (extpath.isEqualOrParent(fsPath, searchPath)) {
          const relPath = paths.relative(searchPath, fsPath);
          return !fq.includePattern || !!glob.match(fq.includePattern, relPath);
        } else {
          return false;
        }
      });
    }
    return false;
  }
  return true;
}
__name(pathIncludedInQuery, "pathIncludedInQuery");
var SearchErrorCode = /* @__PURE__ */ ((SearchErrorCode2) => {
  SearchErrorCode2[SearchErrorCode2["unknownEncoding"] = 1] = "unknownEncoding";
  SearchErrorCode2[SearchErrorCode2["regexParseError"] = 2] = "regexParseError";
  SearchErrorCode2[SearchErrorCode2["globParseError"] = 3] = "globParseError";
  SearchErrorCode2[SearchErrorCode2["invalidLiteral"] = 4] = "invalidLiteral";
  SearchErrorCode2[SearchErrorCode2["rgProcessError"] = 5] = "rgProcessError";
  SearchErrorCode2[SearchErrorCode2["other"] = 6] = "other";
  SearchErrorCode2[SearchErrorCode2["canceled"] = 7] = "canceled";
  return SearchErrorCode2;
})(SearchErrorCode || {});
class SearchError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
  static {
    __name(this, "SearchError");
  }
}
function deserializeSearchError(error) {
  const errorMsg = error.message;
  if (isCancellationError(error)) {
    return new SearchError(errorMsg, 7 /* canceled */);
  }
  try {
    const details = JSON.parse(errorMsg);
    return new SearchError(details.message, details.code);
  } catch (e) {
    return new SearchError(errorMsg, 6 /* other */);
  }
}
__name(deserializeSearchError, "deserializeSearchError");
function serializeSearchError(searchError) {
  const details = { message: searchError.message, code: searchError.code };
  return new Error(JSON.stringify(details));
}
__name(serializeSearchError, "serializeSearchError");
function isSerializedSearchComplete(arg) {
  if (arg.type === "error") {
    return true;
  } else if (arg.type === "success") {
    return true;
  } else {
    return false;
  }
}
__name(isSerializedSearchComplete, "isSerializedSearchComplete");
function isSerializedSearchSuccess(arg) {
  return arg.type === "success";
}
__name(isSerializedSearchSuccess, "isSerializedSearchSuccess");
function isSerializedFileMatch(arg) {
  return !!arg.path;
}
__name(isSerializedFileMatch, "isSerializedFileMatch");
function isFilePatternMatch(candidate, filePatternToUse, fuzzy = true) {
  const pathToMatch = candidate.searchPath ? candidate.searchPath : candidate.relativePath;
  return fuzzy ? fuzzyContains(pathToMatch, filePatternToUse) : glob.match(filePatternToUse, pathToMatch);
}
__name(isFilePatternMatch, "isFilePatternMatch");
class SerializableFileMatch {
  static {
    __name(this, "SerializableFileMatch");
  }
  path;
  results;
  constructor(path) {
    this.path = path;
    this.results = [];
  }
  addMatch(match) {
    this.results.push(match);
  }
  serialize() {
    return {
      path: this.path,
      results: this.results,
      numMatches: this.results.length
    };
  }
}
function resolvePatternsForProvider(globalPattern, folderPattern) {
  const merged = {
    ...globalPattern || {},
    ...folderPattern || {}
  };
  return Object.keys(merged).filter((key) => {
    const value = merged[key];
    return typeof value === "boolean" && value;
  });
}
__name(resolvePatternsForProvider, "resolvePatternsForProvider");
class QueryGlobTester {
  static {
    __name(this, "QueryGlobTester");
  }
  _excludeExpression;
  // TODO: evaluate globs based on baseURI of pattern
  _parsedExcludeExpression;
  _parsedIncludeExpression = null;
  constructor(config, folderQuery) {
    this._excludeExpression = folderQuery.excludePattern?.map((excludePattern) => {
      return {
        ...config.excludePattern || {},
        ...excludePattern.pattern || {}
      };
    }) ?? [];
    if (this._excludeExpression.length === 0) {
      this._excludeExpression = [config.excludePattern || {}];
    }
    this._parsedExcludeExpression = this._excludeExpression.map((e) => glob.parse(e));
    let includeExpression = config.includePattern;
    if (folderQuery.includePattern) {
      if (includeExpression) {
        includeExpression = {
          ...includeExpression,
          ...folderQuery.includePattern
        };
      } else {
        includeExpression = folderQuery.includePattern;
      }
    }
    if (includeExpression) {
      this._parsedIncludeExpression = glob.parse(includeExpression);
    }
  }
  _evalParsedExcludeExpression(testPath, basename, hasSibling) {
    let result = null;
    for (const folderExclude of this._parsedExcludeExpression) {
      const evaluation = folderExclude(testPath, basename, hasSibling);
      if (typeof evaluation === "string") {
        result = evaluation;
        break;
      }
    }
    return result;
  }
  matchesExcludesSync(testPath, basename, hasSibling) {
    if (this._parsedExcludeExpression && this._evalParsedExcludeExpression(testPath, basename, hasSibling)) {
      return true;
    }
    return false;
  }
  /**
   * Guaranteed sync - siblingsFn should not return a promise.
   */
  includedInQuerySync(testPath, basename, hasSibling) {
    if (this._parsedExcludeExpression && this._evalParsedExcludeExpression(testPath, basename, hasSibling)) {
      return false;
    }
    if (this._parsedIncludeExpression && !this._parsedIncludeExpression(testPath, basename, hasSibling)) {
      return false;
    }
    return true;
  }
  /**
   * Evaluating the exclude expression is only async if it includes sibling clauses. As an optimization, avoid doing anything with Promises
   * unless the expression is async.
   */
  includedInQuery(testPath, basename, hasSibling) {
    const isIncluded = /* @__PURE__ */ __name(() => {
      return this._parsedIncludeExpression ? !!this._parsedIncludeExpression(testPath, basename, hasSibling) : true;
    }, "isIncluded");
    return Promise.all(this._parsedExcludeExpression.map((e) => {
      const excluded = e(testPath, basename, hasSibling);
      if (isThenable(excluded)) {
        return excluded.then((excluded2) => {
          if (excluded2) {
            return false;
          }
          return isIncluded();
        });
      }
      return isIncluded();
    })).then((e) => e.some((e2) => !!e2));
  }
  hasSiblingExcludeClauses() {
    return this._excludeExpression.reduce((prev, curr) => hasSiblingClauses(curr) || prev, false);
  }
}
function hasSiblingClauses(pattern) {
  for (const key in pattern) {
    if (typeof pattern[key] !== "boolean") {
      return true;
    }
  }
  return false;
}
__name(hasSiblingClauses, "hasSiblingClauses");
function hasSiblingPromiseFn(siblingsFn) {
  if (!siblingsFn) {
    return void 0;
  }
  let siblings;
  return (name) => {
    if (!siblings) {
      siblings = (siblingsFn() || Promise.resolve([])).then((list) => list ? listToMap(list) : {});
    }
    return siblings.then((map) => !!map[name]);
  };
}
__name(hasSiblingPromiseFn, "hasSiblingPromiseFn");
function hasSiblingFn(siblingsFn) {
  if (!siblingsFn) {
    return void 0;
  }
  let siblings;
  return (name) => {
    if (!siblings) {
      const list = siblingsFn();
      siblings = list ? listToMap(list) : {};
    }
    return !!siblings[name];
  };
}
__name(hasSiblingFn, "hasSiblingFn");
function listToMap(list) {
  const map = {};
  for (const key of list) {
    map[key] = true;
  }
  return map;
}
__name(listToMap, "listToMap");
function excludeToGlobPattern(excludesForFolder) {
  return excludesForFolder.flatMap((exclude) => exclude.patterns.map((pattern) => {
    return exclude.baseUri ? {
      baseUri: exclude.baseUri,
      pattern
    } : pattern;
  }));
}
__name(excludeToGlobPattern, "excludeToGlobPattern");
const DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS = {
  matchLines: 100,
  charsPerLine: 1e4
};
export {
  DEFAULT_MAX_SEARCH_RESULTS,
  DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS,
  FileMatch,
  ISearchService,
  OneLineRange,
  PANEL_ID,
  QueryGlobTester,
  QueryType,
  SEARCH_EXCLUDE_CONFIG,
  SEARCH_RESULT_LANGUAGE_ID,
  SearchCompletionExitCode,
  SearchError,
  SearchErrorCode,
  SearchProviderType,
  SearchRange,
  SearchSortOrder,
  SerializableFileMatch,
  TextSearchCompleteMessageType,
  TextSearchMatch,
  VIEWLET_ID,
  VIEW_ID,
  ViewMode,
  deserializeSearchError,
  excludeToGlobPattern,
  getExcludes,
  hasSiblingFn,
  hasSiblingPromiseFn,
  isFileMatch,
  isFilePatternMatch,
  isProgressMessage,
  isSerializedFileMatch,
  isSerializedSearchComplete,
  isSerializedSearchSuccess,
  pathIncludedInQuery,
  resolvePatternsForProvider,
  resultIsMatch,
  serializeSearchError
};
//# sourceMappingURL=search.js.map
