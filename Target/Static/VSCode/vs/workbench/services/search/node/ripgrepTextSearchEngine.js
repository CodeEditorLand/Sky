var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as cp from "child_process";
import { EventEmitter } from "events";
import { StringDecoder } from "string_decoder";
import { coalesce, mapArrayOrNot } from "../../../../base/common/arrays.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { groupBy } from "../../../../base/common/collections.js";
import { splitGlobAware } from "../../../../base/common/glob.js";
import { createRegExp, escapeRegExpCharacters } from "../../../../base/common/strings.js";
import { URI } from "../../../../base/common/uri.js";
import { Progress } from "../../../../platform/progress/common/progress.js";
import { DEFAULT_MAX_SEARCH_RESULTS, IExtendedExtensionSearchOptions, ITextSearchPreviewOptions, SearchError, SearchErrorCode, serializeSearchError, TextSearchMatch } from "../common/search.js";
import { Range, TextSearchComplete2, TextSearchContext2, TextSearchMatch2, TextSearchProviderOptions, TextSearchQuery2, TextSearchResult2 } from "../common/searchExtTypes.js";
import { AST as ReAST, RegExpParser, RegExpVisitor } from "vscode-regexpp";
import { rgPath } from "@vscode/ripgrep";
import { anchorGlob, IOutputChannel, Maybe, rangeToSearchRange, searchRangeToRange } from "./ripgrepSearchUtils.js";
import { newToOldPreviewOptions } from "../common/searchExtConversionTypes.js";
const rgDiskPath = rgPath.replace(/\bnode_modules\.asar\b/, "node_modules.asar.unpacked");
class RipgrepTextSearchEngine {
  constructor(outputChannel, _numThreads) {
    this.outputChannel = outputChannel;
    this._numThreads = _numThreads;
  }
  static {
    __name(this, "RipgrepTextSearchEngine");
  }
  provideTextSearchResults(query, options, progress, token) {
    return Promise.all(options.folderOptions.map((folderOption) => {
      const extendedOptions = {
        folderOptions: folderOption,
        numThreads: this._numThreads,
        maxResults: options.maxResults,
        previewOptions: options.previewOptions,
        maxFileSize: options.maxFileSize,
        surroundingContext: options.surroundingContext
      };
      return this.provideTextSearchResultsWithRgOptions(query, extendedOptions, progress, token);
    })).then((e) => {
      const complete = {
        // todo: get this to actually check
        limitHit: e.some((complete2) => !!complete2 && complete2.limitHit)
      };
      return complete;
    });
  }
  provideTextSearchResultsWithRgOptions(query, options, progress, token) {
    this.outputChannel.appendLine(`provideTextSearchResults ${query.pattern}, ${JSON.stringify({
      ...options,
      ...{
        folder: options.folderOptions.folder.toString()
      }
    })}`);
    return new Promise((resolve, reject) => {
      token.onCancellationRequested(() => cancel());
      const extendedOptions = {
        ...options,
        numThreads: this._numThreads
      };
      const rgArgs = getRgArgs(query, extendedOptions);
      const cwd = options.folderOptions.folder.fsPath;
      const escapedArgs = rgArgs.map((arg) => arg.match(/^-/) ? arg : `'${arg}'`).join(" ");
      this.outputChannel.appendLine(`${rgDiskPath} ${escapedArgs}
 - cwd: ${cwd}`);
      let rgProc = cp.spawn(rgDiskPath, rgArgs, { cwd });
      rgProc.on("error", (e) => {
        console.error(e);
        this.outputChannel.appendLine("Error: " + (e && e.message));
        reject(serializeSearchError(new SearchError(e && e.message, SearchErrorCode.rgProcessError)));
      });
      let gotResult = false;
      const ripgrepParser = new RipgrepParser(options.maxResults ?? DEFAULT_MAX_SEARCH_RESULTS, options.folderOptions.folder, newToOldPreviewOptions(options.previewOptions));
      ripgrepParser.on("result", (match) => {
        gotResult = true;
        dataWithoutResult = "";
        progress.report(match);
      });
      let isDone = false;
      const cancel = /* @__PURE__ */ __name(() => {
        isDone = true;
        rgProc?.kill();
        ripgrepParser?.cancel();
      }, "cancel");
      let limitHit = false;
      ripgrepParser.on("hitLimit", () => {
        limitHit = true;
        cancel();
      });
      let dataWithoutResult = "";
      rgProc.stdout.on("data", (data) => {
        ripgrepParser.handleData(data);
        if (!gotResult) {
          dataWithoutResult += data;
        }
      });
      let gotData = false;
      rgProc.stdout.once("data", () => gotData = true);
      let stderr = "";
      rgProc.stderr.on("data", (data) => {
        const message = data.toString();
        this.outputChannel.appendLine(message);
        if (stderr.length + message.length < 1e6) {
          stderr += message;
        }
      });
      rgProc.on("close", () => {
        this.outputChannel.appendLine(gotData ? "Got data from stdout" : "No data from stdout");
        this.outputChannel.appendLine(gotResult ? "Got result from parser" : "No result from parser");
        if (dataWithoutResult) {
          this.outputChannel.appendLine(`Got data without result: ${dataWithoutResult}`);
        }
        this.outputChannel.appendLine("");
        if (isDone) {
          resolve({ limitHit });
        } else {
          ripgrepParser.flush();
          rgProc = null;
          let searchError;
          if (stderr && !gotData && (searchError = rgErrorMsgForDisplay(stderr))) {
            reject(serializeSearchError(new SearchError(searchError.message, searchError.code)));
          } else {
            resolve({ limitHit });
          }
        }
      });
    });
  }
}
function rgErrorMsgForDisplay(msg) {
  const lines = msg.split("\n");
  const firstLine = lines[0].trim();
  if (lines.some((l) => l.startsWith("regex parse error"))) {
    return new SearchError(buildRegexParseError(lines), SearchErrorCode.regexParseError);
  }
  const match = firstLine.match(/grep config error: unknown encoding: (.*)/);
  if (match) {
    return new SearchError(`Unknown encoding: ${match[1]}`, SearchErrorCode.unknownEncoding);
  }
  if (firstLine.startsWith("error parsing glob")) {
    return new SearchError(firstLine.charAt(0).toUpperCase() + firstLine.substr(1), SearchErrorCode.globParseError);
  }
  if (firstLine.startsWith("the literal")) {
    return new SearchError(firstLine.charAt(0).toUpperCase() + firstLine.substr(1), SearchErrorCode.invalidLiteral);
  }
  if (firstLine.startsWith("PCRE2: error compiling pattern")) {
    return new SearchError(firstLine, SearchErrorCode.regexParseError);
  }
  return void 0;
}
__name(rgErrorMsgForDisplay, "rgErrorMsgForDisplay");
function buildRegexParseError(lines) {
  const errorMessage = ["Regex parse error"];
  const pcre2ErrorLine = lines.filter((l) => l.startsWith("PCRE2:"));
  if (pcre2ErrorLine.length >= 1) {
    const pcre2ErrorMessage = pcre2ErrorLine[0].replace("PCRE2:", "");
    if (pcre2ErrorMessage.indexOf(":") !== -1 && pcre2ErrorMessage.split(":").length >= 2) {
      const pcre2ActualErrorMessage = pcre2ErrorMessage.split(":")[1];
      errorMessage.push(":" + pcre2ActualErrorMessage);
    }
  }
  return errorMessage.join("");
}
__name(buildRegexParseError, "buildRegexParseError");
class RipgrepParser extends EventEmitter {
  constructor(maxResults, root, previewOptions) {
    super();
    this.maxResults = maxResults;
    this.root = root;
    this.previewOptions = previewOptions;
    this.stringDecoder = new StringDecoder();
  }
  static {
    __name(this, "RipgrepParser");
  }
  remainder = "";
  isDone = false;
  hitLimit = false;
  stringDecoder;
  numResults = 0;
  cancel() {
    this.isDone = true;
  }
  flush() {
    this.handleDecodedData(this.stringDecoder.end());
  }
  on(event, listener) {
    super.on(event, listener);
    return this;
  }
  handleData(data) {
    if (this.isDone) {
      return;
    }
    const dataStr = typeof data === "string" ? data : this.stringDecoder.write(data);
    this.handleDecodedData(dataStr);
  }
  handleDecodedData(decodedData) {
    let newlineIdx = decodedData.indexOf("\n");
    const dataStr = this.remainder + decodedData;
    if (newlineIdx >= 0) {
      newlineIdx += this.remainder.length;
    } else {
      this.remainder = dataStr;
      return;
    }
    let prevIdx = 0;
    while (newlineIdx >= 0) {
      this.handleLine(dataStr.substring(prevIdx, newlineIdx).trim());
      prevIdx = newlineIdx + 1;
      newlineIdx = dataStr.indexOf("\n", prevIdx);
    }
    this.remainder = dataStr.substring(prevIdx);
  }
  handleLine(outputLine) {
    if (this.isDone || !outputLine) {
      return;
    }
    let parsedLine;
    try {
      parsedLine = JSON.parse(outputLine);
    } catch (e) {
      throw new Error(`malformed line from rg: ${outputLine}`);
    }
    if (parsedLine.type === "match") {
      const matchPath = bytesOrTextToString(parsedLine.data.path);
      const uri = URI.joinPath(this.root, matchPath);
      const result = this.createTextSearchMatch(parsedLine.data, uri);
      this.onResult(result);
      if (this.hitLimit) {
        this.cancel();
        this.emit("hitLimit");
      }
    } else if (parsedLine.type === "context") {
      const contextPath = bytesOrTextToString(parsedLine.data.path);
      const uri = URI.joinPath(this.root, contextPath);
      const result = this.createTextSearchContexts(parsedLine.data, uri);
      result.forEach((r) => this.onResult(r));
    }
  }
  createTextSearchMatch(data, uri) {
    const lineNumber = data.line_number - 1;
    const fullText = bytesOrTextToString(data.lines);
    const fullTextBytes = Buffer.from(fullText);
    let prevMatchEnd = 0;
    let prevMatchEndCol = 0;
    let prevMatchEndLine = lineNumber;
    if (data.submatches.length === 0) {
      data.submatches.push(
        fullText.length ? { start: 0, end: 1, match: { text: fullText[0] } } : { start: 0, end: 0, match: { text: "" } }
      );
    }
    const ranges = coalesce(data.submatches.map((match, i) => {
      if (this.hitLimit) {
        return null;
      }
      this.numResults++;
      if (this.numResults >= this.maxResults) {
        this.hitLimit = true;
      }
      const matchText = bytesOrTextToString(match.match);
      const inBetweenText = fullTextBytes.slice(prevMatchEnd, match.start).toString();
      const inBetweenStats = getNumLinesAndLastNewlineLength(inBetweenText);
      const startCol = inBetweenStats.numLines > 0 ? inBetweenStats.lastLineLength : inBetweenStats.lastLineLength + prevMatchEndCol;
      const stats = getNumLinesAndLastNewlineLength(matchText);
      const startLineNumber = inBetweenStats.numLines + prevMatchEndLine;
      const endLineNumber = stats.numLines + startLineNumber;
      const endCol = stats.numLines > 0 ? stats.lastLineLength : stats.lastLineLength + startCol;
      prevMatchEnd = match.end;
      prevMatchEndCol = endCol;
      prevMatchEndLine = endLineNumber;
      return new Range(startLineNumber, startCol, endLineNumber, endCol);
    }));
    const searchRange = mapArrayOrNot(ranges, rangeToSearchRange);
    const internalResult = new TextSearchMatch(fullText, searchRange, this.previewOptions);
    return new TextSearchMatch2(
      uri,
      internalResult.rangeLocations.map((e) => ({
        sourceRange: searchRangeToRange(e.source),
        previewRange: searchRangeToRange(e.preview)
      })),
      internalResult.previewText
    );
  }
  createTextSearchContexts(data, uri) {
    const text = bytesOrTextToString(data.lines);
    const startLine = data.line_number;
    return text.replace(/\r?\n$/, "").split("\n").map((line, i) => new TextSearchContext2(uri, line, startLine + i));
  }
  onResult(match) {
    this.emit("result", match);
  }
}
function bytesOrTextToString(obj) {
  return obj.bytes ? Buffer.from(obj.bytes, "base64").toString() : obj.text;
}
__name(bytesOrTextToString, "bytesOrTextToString");
function getNumLinesAndLastNewlineLength(text) {
  const re = /\n/g;
  let numLines = 0;
  let lastNewlineIdx = -1;
  let match;
  while (match = re.exec(text)) {
    numLines++;
    lastNewlineIdx = match.index;
  }
  const lastLineLength = lastNewlineIdx >= 0 ? text.length - lastNewlineIdx - 1 : text.length;
  return { numLines, lastLineLength };
}
__name(getNumLinesAndLastNewlineLength, "getNumLinesAndLastNewlineLength");
function getRgArgs(query, options) {
  const args = ["--hidden", "--no-require-git"];
  args.push(query.isCaseSensitive ? "--case-sensitive" : "--ignore-case");
  const { doubleStarIncludes, otherIncludes } = groupBy(
    options.folderOptions.includes,
    (include) => include.startsWith("**") ? "doubleStarIncludes" : "otherIncludes"
  );
  if (otherIncludes && otherIncludes.length) {
    const uniqueOthers = /* @__PURE__ */ new Set();
    otherIncludes.forEach((other) => {
      uniqueOthers.add(other);
    });
    args.push("-g", "!*");
    uniqueOthers.forEach((otherIncude) => {
      spreadGlobComponents(otherIncude).map(anchorGlob).forEach((globArg) => {
        args.push("-g", globArg);
      });
    });
  }
  if (doubleStarIncludes && doubleStarIncludes.length) {
    doubleStarIncludes.forEach((globArg) => {
      args.push("-g", globArg);
    });
  }
  options.folderOptions.excludes.map((e) => typeof e === "string" ? e : e.pattern).map(anchorGlob).forEach((rgGlob) => args.push("-g", `!${rgGlob}`));
  if (options.maxFileSize) {
    args.push("--max-filesize", options.maxFileSize + "");
  }
  if (options.folderOptions.useIgnoreFiles.local) {
    if (!options.folderOptions.useIgnoreFiles.parent) {
      args.push("--no-ignore-parent");
    }
  } else {
    args.push("--no-ignore");
  }
  if (options.folderOptions.followSymlinks) {
    args.push("--follow");
  }
  if (options.folderOptions.encoding && options.folderOptions.encoding !== "utf8") {
    args.push("--encoding", options.folderOptions.encoding);
  }
  if (options.numThreads) {
    args.push("--threads", `${options.numThreads}`);
  }
  if (query.pattern === "--") {
    query.isRegExp = true;
    query.pattern = "\\-\\-";
  }
  if (query.isMultiline && !query.isRegExp) {
    query.pattern = escapeRegExpCharacters(query.pattern);
    query.isRegExp = true;
  }
  if (options.usePCRE2) {
    args.push("--pcre2");
  }
  args.push("--crlf");
  if (query.isRegExp) {
    query.pattern = unicodeEscapesToPCRE2(query.pattern);
    args.push("--engine", "auto");
  }
  let searchPatternAfterDoubleDashes;
  if (query.isWordMatch) {
    const regexp = createRegExp(query.pattern, !!query.isRegExp, { wholeWord: query.isWordMatch });
    const regexpStr = regexp.source.replace(/\\\//g, "/");
    args.push("--regexp", regexpStr);
  } else if (query.isRegExp) {
    let fixedRegexpQuery = fixRegexNewline(query.pattern);
    fixedRegexpQuery = fixNewline(fixedRegexpQuery);
    args.push("--regexp", fixedRegexpQuery);
  } else {
    searchPatternAfterDoubleDashes = query.pattern;
    args.push("--fixed-strings");
  }
  args.push("--no-config");
  if (!options.folderOptions.useIgnoreFiles.global) {
    args.push("--no-ignore-global");
  }
  args.push("--json");
  if (query.isMultiline) {
    args.push("--multiline");
  }
  if (options.surroundingContext) {
    args.push("--before-context", options.surroundingContext + "");
    args.push("--after-context", options.surroundingContext + "");
  }
  args.push("--");
  if (searchPatternAfterDoubleDashes) {
    args.push(searchPatternAfterDoubleDashes);
  }
  args.push(".");
  return args;
}
__name(getRgArgs, "getRgArgs");
function spreadGlobComponents(globComponent) {
  const globComponentWithBraceExpansion = performBraceExpansionForRipgrep(globComponent);
  return globComponentWithBraceExpansion.flatMap((globArg) => {
    const components = splitGlobAware(globArg, "/");
    return components.map((_, i) => components.slice(0, i + 1).join("/"));
  });
}
__name(spreadGlobComponents, "spreadGlobComponents");
function unicodeEscapesToPCRE2(pattern) {
  const unicodePattern = /((?:[^\\]|^)(?:\\\\)*)\\u([a-z0-9]{4})/gi;
  while (pattern.match(unicodePattern)) {
    pattern = pattern.replace(unicodePattern, `$1\\x{$2}`);
  }
  const unicodePatternWithBraces = /((?:[^\\]|^)(?:\\\\)*)\\u\{([a-z0-9]{4})\}/gi;
  while (pattern.match(unicodePatternWithBraces)) {
    pattern = pattern.replace(unicodePatternWithBraces, `$1\\x{$2}`);
  }
  return pattern;
}
__name(unicodeEscapesToPCRE2, "unicodeEscapesToPCRE2");
const isLookBehind = /* @__PURE__ */ __name((node) => node.type === "Assertion" && node.kind === "lookbehind", "isLookBehind");
function fixRegexNewline(pattern) {
  let re;
  try {
    re = new RegExpParser().parsePattern(pattern);
  } catch {
    return pattern;
  }
  let output = "";
  let lastEmittedIndex = 0;
  const replace = /* @__PURE__ */ __name((start, end, text) => {
    output += pattern.slice(lastEmittedIndex, start) + text;
    lastEmittedIndex = end;
  }, "replace");
  const context = [];
  const visitor = new RegExpVisitor({
    onCharacterEnter(char) {
      if (char.raw !== "\\n") {
        return;
      }
      const parent = context[0];
      if (!parent) {
        replace(char.start, char.end, "\\r?\\n");
      } else if (context.some(isLookBehind)) {
      } else if (parent.type === "CharacterClass") {
        if (parent.negate) {
          const otherContent = pattern.slice(parent.start + 2, char.start) + pattern.slice(char.end, parent.end - 1);
          if (parent.parent?.type === "Quantifier") {
            replace(parent.start, parent.end, otherContent ? `[^${otherContent}]` : ".");
          } else {
            replace(parent.start, parent.end, "(?!\\r?\\n" + (otherContent ? `|[${otherContent}]` : "") + ")");
          }
        } else {
          const otherContent = pattern.slice(parent.start + 1, char.start) + pattern.slice(char.end, parent.end - 1);
          replace(parent.start, parent.end, otherContent === "" ? "\\r?\\n" : `(?:[${otherContent}]|\\r?\\n)`);
        }
      } else if (parent.type === "Quantifier") {
        replace(char.start, char.end, "(?:\\r?\\n)");
      }
    },
    onQuantifierEnter(node) {
      context.unshift(node);
    },
    onQuantifierLeave() {
      context.shift();
    },
    onCharacterClassRangeEnter(node) {
      context.unshift(node);
    },
    onCharacterClassRangeLeave() {
      context.shift();
    },
    onCharacterClassEnter(node) {
      context.unshift(node);
    },
    onCharacterClassLeave() {
      context.shift();
    },
    onAssertionEnter(node) {
      if (isLookBehind(node)) {
        context.push(node);
      }
    },
    onAssertionLeave(node) {
      if (context[0] === node) {
        context.shift();
      }
    }
  });
  visitor.visit(re);
  output += pattern.slice(lastEmittedIndex);
  return output;
}
__name(fixRegexNewline, "fixRegexNewline");
function fixNewline(pattern) {
  return pattern.replace(/\n/g, "\\r?\\n");
}
__name(fixNewline, "fixNewline");
function getEscapeAwareSplitStringForRipgrep(pattern) {
  let inBraces = false;
  let escaped = false;
  let fixedStart = "";
  let strInBraces = "";
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    switch (char) {
      case "\\":
        if (escaped) {
          if (inBraces) {
            strInBraces += "\\" + char;
          } else {
            fixedStart += "\\" + char;
          }
          escaped = false;
        } else {
          escaped = true;
        }
        break;
      case "{":
        if (escaped) {
          if (inBraces) {
            strInBraces += char;
          } else {
            fixedStart += char;
          }
          escaped = false;
        } else {
          if (inBraces) {
            return { strInBraces: fixedStart + "{" + strInBraces + "{" + pattern.substring(i + 1) };
          } else {
            inBraces = true;
          }
        }
        break;
      case "}":
        if (escaped) {
          if (inBraces) {
            strInBraces += char;
          } else {
            fixedStart += char;
          }
          escaped = false;
        } else if (inBraces) {
          return { fixedStart, strInBraces, fixedEnd: pattern.substring(i + 1) };
        } else {
          fixedStart += char;
        }
        break;
      default:
        if (inBraces) {
          strInBraces += (escaped ? "\\" : "") + char;
        } else {
          fixedStart += (escaped ? "\\" : "") + char;
        }
        escaped = false;
        break;
    }
  }
  return { strInBraces: fixedStart + (inBraces ? "{" + strInBraces : "") };
}
__name(getEscapeAwareSplitStringForRipgrep, "getEscapeAwareSplitStringForRipgrep");
function performBraceExpansionForRipgrep(pattern) {
  const { fixedStart, strInBraces, fixedEnd } = getEscapeAwareSplitStringForRipgrep(pattern);
  if (fixedStart === void 0 || fixedEnd === void 0) {
    return [strInBraces];
  }
  let arr = splitGlobAware(strInBraces, ",");
  if (!arr.length) {
    arr = [""];
  }
  const ends = performBraceExpansionForRipgrep(fixedEnd);
  return arr.flatMap((elem) => {
    const start = fixedStart + elem;
    return ends.map((end) => {
      return start + end;
    });
  });
}
__name(performBraceExpansionForRipgrep, "performBraceExpansionForRipgrep");
export {
  RipgrepParser,
  RipgrepTextSearchEngine,
  fixNewline,
  fixRegexNewline,
  getRgArgs,
  performBraceExpansionForRipgrep,
  unicodeEscapesToPCRE2
};
//# sourceMappingURL=ripgrepTextSearchEngine.js.map
