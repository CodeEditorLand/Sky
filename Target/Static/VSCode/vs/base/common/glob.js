var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equals } from "./arrays.js";
import { isThenable } from "./async.js";
import { CharCode } from "./charCode.js";
import { isEqualOrParent } from "./extpath.js";
import { LRUCache } from "./map.js";
import { basename, extname, posix, sep } from "./path.js";
import { isLinux } from "./platform.js";
import { escapeRegExpCharacters, ltrim } from "./strings.js";
function getEmptyExpression() {
  return /* @__PURE__ */ Object.create(null);
}
__name(getEmptyExpression, "getEmptyExpression");
const GLOBSTAR = "**";
const GLOB_SPLIT = "/";
const PATH_REGEX = "[/\\\\]";
const NO_PATH_REGEX = "[^/\\\\]";
const ALL_FORWARD_SLASHES = /\//g;
function starsToRegExp(starCount, isLastPattern) {
  switch (starCount) {
    case 0:
      return "";
    case 1:
      return `${NO_PATH_REGEX}*?`;
    // 1 star matches any number of characters except path separator (/ and \) - non greedy (?)
    default:
      return `(?:${PATH_REGEX}|${NO_PATH_REGEX}+${PATH_REGEX}${isLastPattern ? `|${PATH_REGEX}${NO_PATH_REGEX}+` : ""})*?`;
  }
}
__name(starsToRegExp, "starsToRegExp");
function splitGlobAware(pattern, splitChar) {
  if (!pattern) {
    return [];
  }
  const segments = [];
  let inBraces = false;
  let inBrackets = false;
  let curVal = "";
  for (const char of pattern) {
    switch (char) {
      case splitChar:
        if (!inBraces && !inBrackets) {
          segments.push(curVal);
          curVal = "";
          continue;
        }
        break;
      case "{":
        inBraces = true;
        break;
      case "}":
        inBraces = false;
        break;
      case "[":
        inBrackets = true;
        break;
      case "]":
        inBrackets = false;
        break;
    }
    curVal += char;
  }
  if (curVal) {
    segments.push(curVal);
  }
  return segments;
}
__name(splitGlobAware, "splitGlobAware");
function parseRegExp(pattern) {
  if (!pattern) {
    return "";
  }
  let regEx = "";
  const segments = splitGlobAware(pattern, GLOB_SPLIT);
  if (segments.every((segment) => segment === GLOBSTAR)) {
    regEx = ".*";
  } else {
    let previousSegmentWasGlobStar = false;
    segments.forEach((segment, index) => {
      if (segment === GLOBSTAR) {
        if (previousSegmentWasGlobStar) {
          return;
        }
        regEx += starsToRegExp(2, index === segments.length - 1);
      } else {
        let inBraces = false;
        let braceVal = "";
        let inBrackets = false;
        let bracketVal = "";
        for (const char of segment) {
          if (char !== "}" && inBraces) {
            braceVal += char;
            continue;
          }
          if (inBrackets && (char !== "]" || !bracketVal)) {
            let res;
            if (char === "-") {
              res = char;
            } else if ((char === "^" || char === "!") && !bracketVal) {
              res = "^";
            } else if (char === GLOB_SPLIT) {
              res = "";
            } else {
              res = escapeRegExpCharacters(char);
            }
            bracketVal += res;
            continue;
          }
          switch (char) {
            case "{":
              inBraces = true;
              continue;
            case "[":
              inBrackets = true;
              continue;
            case "}": {
              const choices = splitGlobAware(braceVal, ",");
              const braceRegExp = `(?:${choices.map((choice) => parseRegExp(choice)).join("|")})`;
              regEx += braceRegExp;
              inBraces = false;
              braceVal = "";
              break;
            }
            case "]": {
              regEx += "[" + bracketVal + "]";
              inBrackets = false;
              bracketVal = "";
              break;
            }
            case "?":
              regEx += NO_PATH_REGEX;
              continue;
            case "*":
              regEx += starsToRegExp(1);
              continue;
            default:
              regEx += escapeRegExpCharacters(char);
          }
        }
        if (index < segments.length - 1 && // more segments to come after this
        (segments[index + 1] !== GLOBSTAR || // next segment is not **, or...
        index + 2 < segments.length)) {
          regEx += PATH_REGEX;
        }
      }
      previousSegmentWasGlobStar = segment === GLOBSTAR;
    });
  }
  return regEx;
}
__name(parseRegExp, "parseRegExp");
const T1 = /^\*\*\/\*\.[\w\.-]+$/;
const T2 = /^\*\*\/([\w\.-]+)\/?$/;
const T3 = /^{\*\*\/\*?[\w\.-]+\/?(,\*\*\/\*?[\w\.-]+\/?)*}$/;
const T3_2 = /^{\*\*\/\*?[\w\.-]+(\/(\*\*)?)?(,\*\*\/\*?[\w\.-]+(\/(\*\*)?)?)*}$/;
const T4 = /^\*\*((\/[\w\.-]+)+)\/?$/;
const T5 = /^([\w\.-]+(\/[\w\.-]+)*)\/?$/;
const CACHE = new LRUCache(1e4);
const FALSE = /* @__PURE__ */ __name(function() {
  return false;
}, "FALSE");
const NULL = /* @__PURE__ */ __name(function() {
  return null;
}, "NULL");
function parsePattern(arg1, options) {
  if (!arg1) {
    return NULL;
  }
  let pattern;
  if (typeof arg1 !== "string") {
    pattern = arg1.pattern;
  } else {
    pattern = arg1;
  }
  pattern = pattern.trim();
  const patternKey = `${pattern}_${!!options.trimForExclusions}`;
  let parsedPattern = CACHE.get(patternKey);
  if (parsedPattern) {
    return wrapRelativePattern(parsedPattern, arg1);
  }
  let match2;
  if (T1.test(pattern)) {
    parsedPattern = trivia1(pattern.substr(4), pattern);
  } else if (match2 = T2.exec(trimForExclusions(pattern, options))) {
    parsedPattern = trivia2(match2[1], pattern);
  } else if ((options.trimForExclusions ? T3_2 : T3).test(pattern)) {
    parsedPattern = trivia3(pattern, options);
  } else if (match2 = T4.exec(trimForExclusions(pattern, options))) {
    parsedPattern = trivia4and5(match2[1].substr(1), pattern, true);
  } else if (match2 = T5.exec(trimForExclusions(pattern, options))) {
    parsedPattern = trivia4and5(match2[1], pattern, false);
  } else {
    parsedPattern = toRegExp(pattern);
  }
  CACHE.set(patternKey, parsedPattern);
  return wrapRelativePattern(parsedPattern, arg1);
}
__name(parsePattern, "parsePattern");
function wrapRelativePattern(parsedPattern, arg2) {
  if (typeof arg2 === "string") {
    return parsedPattern;
  }
  const wrappedPattern = /* @__PURE__ */ __name(function(path, basename2) {
    if (!isEqualOrParent(path, arg2.base, !isLinux)) {
      return null;
    }
    return parsedPattern(ltrim(path.substr(arg2.base.length), sep), basename2);
  }, "wrappedPattern");
  wrappedPattern.allBasenames = parsedPattern.allBasenames;
  wrappedPattern.allPaths = parsedPattern.allPaths;
  wrappedPattern.basenames = parsedPattern.basenames;
  wrappedPattern.patterns = parsedPattern.patterns;
  return wrappedPattern;
}
__name(wrapRelativePattern, "wrapRelativePattern");
function trimForExclusions(pattern, options) {
  return options.trimForExclusions && pattern.endsWith("/**") ? pattern.substr(0, pattern.length - 2) : pattern;
}
__name(trimForExclusions, "trimForExclusions");
function trivia1(base, pattern) {
  return function(path, basename2) {
    return typeof path === "string" && path.endsWith(base) ? pattern : null;
  };
}
__name(trivia1, "trivia1");
function trivia2(base, pattern) {
  const slashBase = `/${base}`;
  const backslashBase = `\\${base}`;
  const parsedPattern = /* @__PURE__ */ __name(function(path, basename2) {
    if (typeof path !== "string") {
      return null;
    }
    if (basename2) {
      return basename2 === base ? pattern : null;
    }
    return path === base || path.endsWith(slashBase) || path.endsWith(backslashBase) ? pattern : null;
  }, "parsedPattern");
  const basenames = [base];
  parsedPattern.basenames = basenames;
  parsedPattern.patterns = [pattern];
  parsedPattern.allBasenames = basenames;
  return parsedPattern;
}
__name(trivia2, "trivia2");
function trivia3(pattern, options) {
  const parsedPatterns = aggregateBasenameMatches(pattern.slice(1, -1).split(",").map((pattern2) => parsePattern(pattern2, options)).filter((pattern2) => pattern2 !== NULL), pattern);
  const patternsLength = parsedPatterns.length;
  if (!patternsLength) {
    return NULL;
  }
  if (patternsLength === 1) {
    return parsedPatterns[0];
  }
  const parsedPattern = /* @__PURE__ */ __name(function(path, basename2) {
    for (let i = 0, n = parsedPatterns.length; i < n; i++) {
      if (parsedPatterns[i](path, basename2)) {
        return pattern;
      }
    }
    return null;
  }, "parsedPattern");
  const withBasenames = parsedPatterns.find((pattern2) => !!pattern2.allBasenames);
  if (withBasenames) {
    parsedPattern.allBasenames = withBasenames.allBasenames;
  }
  const allPaths = parsedPatterns.reduce((all, current) => current.allPaths ? all.concat(current.allPaths) : all, []);
  if (allPaths.length) {
    parsedPattern.allPaths = allPaths;
  }
  return parsedPattern;
}
__name(trivia3, "trivia3");
function trivia4and5(targetPath, pattern, matchPathEnds) {
  const usingPosixSep = sep === posix.sep;
  const nativePath = usingPosixSep ? targetPath : targetPath.replace(ALL_FORWARD_SLASHES, sep);
  const nativePathEnd = sep + nativePath;
  const targetPathEnd = posix.sep + targetPath;
  let parsedPattern;
  if (matchPathEnds) {
    parsedPattern = /* @__PURE__ */ __name(function(path, basename2) {
      return typeof path === "string" && (path === nativePath || path.endsWith(nativePathEnd) || !usingPosixSep && (path === targetPath || path.endsWith(targetPathEnd))) ? pattern : null;
    }, "parsedPattern");
  } else {
    parsedPattern = /* @__PURE__ */ __name(function(path, basename2) {
      return typeof path === "string" && (path === nativePath || !usingPosixSep && path === targetPath) ? pattern : null;
    }, "parsedPattern");
  }
  parsedPattern.allPaths = [(matchPathEnds ? "*/" : "./") + targetPath];
  return parsedPattern;
}
__name(trivia4and5, "trivia4and5");
function toRegExp(pattern) {
  try {
    const regExp = new RegExp(`^${parseRegExp(pattern)}$`);
    return function(path) {
      regExp.lastIndex = 0;
      return typeof path === "string" && regExp.test(path) ? pattern : null;
    };
  } catch (error) {
    return NULL;
  }
}
__name(toRegExp, "toRegExp");
function match(arg1, path, hasSibling) {
  if (!arg1 || typeof path !== "string") {
    return false;
  }
  return parse(arg1)(path, void 0, hasSibling);
}
__name(match, "match");
function parse(arg1, options = {}) {
  if (!arg1) {
    return FALSE;
  }
  if (typeof arg1 === "string" || isRelativePattern(arg1)) {
    const parsedPattern = parsePattern(arg1, options);
    if (parsedPattern === NULL) {
      return FALSE;
    }
    const resultPattern = /* @__PURE__ */ __name(function(path, basename2) {
      return !!parsedPattern(path, basename2);
    }, "resultPattern");
    if (parsedPattern.allBasenames) {
      resultPattern.allBasenames = parsedPattern.allBasenames;
    }
    if (parsedPattern.allPaths) {
      resultPattern.allPaths = parsedPattern.allPaths;
    }
    return resultPattern;
  }
  return parsedExpression(arg1, options);
}
__name(parse, "parse");
function isRelativePattern(obj) {
  const rp = obj;
  if (!rp) {
    return false;
  }
  return typeof rp.base === "string" && typeof rp.pattern === "string";
}
__name(isRelativePattern, "isRelativePattern");
function getBasenameTerms(patternOrExpression) {
  return patternOrExpression.allBasenames || [];
}
__name(getBasenameTerms, "getBasenameTerms");
function getPathTerms(patternOrExpression) {
  return patternOrExpression.allPaths || [];
}
__name(getPathTerms, "getPathTerms");
function parsedExpression(expression, options) {
  const parsedPatterns = aggregateBasenameMatches(Object.getOwnPropertyNames(expression).map((pattern) => parseExpressionPattern(pattern, expression[pattern], options)).filter((pattern) => pattern !== NULL));
  const patternsLength = parsedPatterns.length;
  if (!patternsLength) {
    return NULL;
  }
  if (!parsedPatterns.some((parsedPattern) => !!parsedPattern.requiresSiblings)) {
    if (patternsLength === 1) {
      return parsedPatterns[0];
    }
    const resultExpression2 = /* @__PURE__ */ __name(function(path, basename2) {
      let resultPromises = void 0;
      for (let i = 0, n = parsedPatterns.length; i < n; i++) {
        const result = parsedPatterns[i](path, basename2);
        if (typeof result === "string") {
          return result;
        }
        if (isThenable(result)) {
          if (!resultPromises) {
            resultPromises = [];
          }
          resultPromises.push(result);
        }
      }
      if (resultPromises) {
        return (async () => {
          for (const resultPromise of resultPromises) {
            const result = await resultPromise;
            if (typeof result === "string") {
              return result;
            }
          }
          return null;
        })();
      }
      return null;
    }, "resultExpression");
    const withBasenames2 = parsedPatterns.find((pattern) => !!pattern.allBasenames);
    if (withBasenames2) {
      resultExpression2.allBasenames = withBasenames2.allBasenames;
    }
    const allPaths2 = parsedPatterns.reduce((all, current) => current.allPaths ? all.concat(current.allPaths) : all, []);
    if (allPaths2.length) {
      resultExpression2.allPaths = allPaths2;
    }
    return resultExpression2;
  }
  const resultExpression = /* @__PURE__ */ __name(function(path, base, hasSibling) {
    let name = void 0;
    let resultPromises = void 0;
    for (let i = 0, n = parsedPatterns.length; i < n; i++) {
      const parsedPattern = parsedPatterns[i];
      if (parsedPattern.requiresSiblings && hasSibling) {
        if (!base) {
          base = basename(path);
        }
        if (!name) {
          name = base.substr(0, base.length - extname(path).length);
        }
      }
      const result = parsedPattern(path, base, name, hasSibling);
      if (typeof result === "string") {
        return result;
      }
      if (isThenable(result)) {
        if (!resultPromises) {
          resultPromises = [];
        }
        resultPromises.push(result);
      }
    }
    if (resultPromises) {
      return (async () => {
        for (const resultPromise of resultPromises) {
          const result = await resultPromise;
          if (typeof result === "string") {
            return result;
          }
        }
        return null;
      })();
    }
    return null;
  }, "resultExpression");
  const withBasenames = parsedPatterns.find((pattern) => !!pattern.allBasenames);
  if (withBasenames) {
    resultExpression.allBasenames = withBasenames.allBasenames;
  }
  const allPaths = parsedPatterns.reduce((all, current) => current.allPaths ? all.concat(current.allPaths) : all, []);
  if (allPaths.length) {
    resultExpression.allPaths = allPaths;
  }
  return resultExpression;
}
__name(parsedExpression, "parsedExpression");
function parseExpressionPattern(pattern, value, options) {
  if (value === false) {
    return NULL;
  }
  const parsedPattern = parsePattern(pattern, options);
  if (parsedPattern === NULL) {
    return NULL;
  }
  if (typeof value === "boolean") {
    return parsedPattern;
  }
  if (value) {
    const when = value.when;
    if (typeof when === "string") {
      const result = /* @__PURE__ */ __name((path, basename2, name, hasSibling) => {
        if (!hasSibling || !parsedPattern(path, basename2)) {
          return null;
        }
        const clausePattern = when.replace("$(basename)", () => name);
        const matched = hasSibling(clausePattern);
        return isThenable(matched) ? matched.then((match2) => match2 ? pattern : null) : matched ? pattern : null;
      }, "result");
      result.requiresSiblings = true;
      return result;
    }
  }
  return parsedPattern;
}
__name(parseExpressionPattern, "parseExpressionPattern");
function aggregateBasenameMatches(parsedPatterns, result) {
  const basenamePatterns = parsedPatterns.filter((parsedPattern) => !!parsedPattern.basenames);
  if (basenamePatterns.length < 2) {
    return parsedPatterns;
  }
  const basenames = basenamePatterns.reduce((all, current) => {
    const basenames2 = current.basenames;
    return basenames2 ? all.concat(basenames2) : all;
  }, []);
  let patterns;
  if (result) {
    patterns = [];
    for (let i = 0, n = basenames.length; i < n; i++) {
      patterns.push(result);
    }
  } else {
    patterns = basenamePatterns.reduce((all, current) => {
      const patterns2 = current.patterns;
      return patterns2 ? all.concat(patterns2) : all;
    }, []);
  }
  const aggregate = /* @__PURE__ */ __name(function(path, basename2) {
    if (typeof path !== "string") {
      return null;
    }
    if (!basename2) {
      let i;
      for (i = path.length; i > 0; i--) {
        const ch = path.charCodeAt(i - 1);
        if (ch === CharCode.Slash || ch === CharCode.Backslash) {
          break;
        }
      }
      basename2 = path.substr(i);
    }
    const index = basenames.indexOf(basename2);
    return index !== -1 ? patterns[index] : null;
  }, "aggregate");
  aggregate.basenames = basenames;
  aggregate.patterns = patterns;
  aggregate.allBasenames = basenames;
  const aggregatedPatterns = parsedPatterns.filter((parsedPattern) => !parsedPattern.basenames);
  aggregatedPatterns.push(aggregate);
  return aggregatedPatterns;
}
__name(aggregateBasenameMatches, "aggregateBasenameMatches");
function patternsEquals(patternsA, patternsB) {
  return equals(patternsA, patternsB, (a, b) => {
    if (typeof a === "string" && typeof b === "string") {
      return a === b;
    }
    if (typeof a !== "string" && typeof b !== "string") {
      return a.base === b.base && a.pattern === b.pattern;
    }
    return false;
  });
}
__name(patternsEquals, "patternsEquals");
export {
  GLOBSTAR,
  GLOB_SPLIT,
  getBasenameTerms,
  getEmptyExpression,
  getPathTerms,
  isRelativePattern,
  match,
  parse,
  patternsEquals,
  splitGlobAware
};
//# sourceMappingURL=glob.js.map
