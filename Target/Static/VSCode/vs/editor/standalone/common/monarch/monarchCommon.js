var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var MonarchBracket = /* @__PURE__ */ ((MonarchBracket2) => {
  MonarchBracket2[MonarchBracket2["None"] = 0] = "None";
  MonarchBracket2[MonarchBracket2["Open"] = 1] = "Open";
  MonarchBracket2[MonarchBracket2["Close"] = -1] = "Close";
  return MonarchBracket2;
})(MonarchBracket || {});
function isFuzzyActionArr(what) {
  return Array.isArray(what);
}
__name(isFuzzyActionArr, "isFuzzyActionArr");
function isFuzzyAction(what) {
  return !isFuzzyActionArr(what);
}
__name(isFuzzyAction, "isFuzzyAction");
function isString(what) {
  return typeof what === "string";
}
__name(isString, "isString");
function isIAction(what) {
  return !isString(what);
}
__name(isIAction, "isIAction");
function empty(s) {
  return s ? false : true;
}
__name(empty, "empty");
function fixCase(lexer, str) {
  return lexer.ignoreCase && str ? str.toLowerCase() : str;
}
__name(fixCase, "fixCase");
function sanitize(s) {
  return s.replace(/[&<>'"_]/g, "-");
}
__name(sanitize, "sanitize");
function log(lexer, msg) {
  console.log(`${lexer.languageId}: ${msg}`);
}
__name(log, "log");
function createError(lexer, msg) {
  return new Error(`${lexer.languageId}: ${msg}`);
}
__name(createError, "createError");
function substituteMatches(lexer, str, id, matches, state) {
  const re = /\$((\$)|(#)|(\d\d?)|[sS](\d\d?)|@(\w+))/g;
  let stateMatches = null;
  return str.replace(re, function(full, sub, dollar, hash, n, s, attr, ofs, total) {
    if (!empty(dollar)) {
      return "$";
    }
    if (!empty(hash)) {
      return fixCase(lexer, id);
    }
    if (!empty(n) && n < matches.length) {
      return fixCase(lexer, matches[n]);
    }
    if (!empty(attr) && lexer && typeof lexer[attr] === "string") {
      return lexer[attr];
    }
    if (stateMatches === null) {
      stateMatches = state.split(".");
      stateMatches.unshift(state);
    }
    if (!empty(s) && s < stateMatches.length) {
      return fixCase(lexer, stateMatches[s]);
    }
    return "";
  });
}
__name(substituteMatches, "substituteMatches");
function substituteMatchesRe(lexer, str, state) {
  const re = /\$[sS](\d\d?)/g;
  let stateMatches = null;
  return str.replace(re, function(full, s) {
    if (stateMatches === null) {
      stateMatches = state.split(".");
      stateMatches.unshift(state);
    }
    if (!empty(s) && s < stateMatches.length) {
      return fixCase(lexer, stateMatches[s]);
    }
    return "";
  });
}
__name(substituteMatchesRe, "substituteMatchesRe");
function findRules(lexer, inState) {
  let state = inState;
  while (state && state.length > 0) {
    const rules = lexer.tokenizer[state];
    if (rules) {
      return rules;
    }
    const idx = state.lastIndexOf(".");
    if (idx < 0) {
      state = null;
    } else {
      state = state.substr(0, idx);
    }
  }
  return null;
}
__name(findRules, "findRules");
function stateExists(lexer, inState) {
  let state = inState;
  while (state && state.length > 0) {
    const exist = lexer.stateNames[state];
    if (exist) {
      return true;
    }
    const idx = state.lastIndexOf(".");
    if (idx < 0) {
      state = null;
    } else {
      state = state.substr(0, idx);
    }
  }
  return false;
}
__name(stateExists, "stateExists");
export {
  MonarchBracket,
  createError,
  empty,
  findRules,
  fixCase,
  isFuzzyAction,
  isFuzzyActionArr,
  isIAction,
  isString,
  log,
  sanitize,
  stateExists,
  substituteMatches,
  substituteMatchesRe
};
//# sourceMappingURL=monarchCommon.js.map
