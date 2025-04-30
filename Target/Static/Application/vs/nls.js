var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getNLSLanguage, getNLSMessages } from "./nls.messages.js";
import { getNLSLanguage as getNLSLanguage2, getNLSMessages as getNLSMessages2 } from "./nls.messages.js";
const isPseudo = getNLSLanguage() === "pseudo" || typeof document !== "undefined" && document.location && typeof document.location.hash === "string" && document.location.hash.indexOf("pseudo=true") >= 0;
function _format(message, args) {
  let result;
  if (args.length === 0) {
    result = message;
  } else {
    result = message.replace(/\{(\d+)\}/g, (match, rest) => {
      const index = rest[0];
      const arg = args[index];
      let result2 = match;
      if (typeof arg === "string") {
        result2 = arg;
      } else if (typeof arg === "number" || typeof arg === "boolean" || arg === void 0 || arg === null) {
        result2 = String(arg);
      }
      return result2;
    });
  }
  if (isPseudo) {
    result = "\uFF3B" + result.replace(/[aouei]/g, "$&$&") + "\uFF3D";
  }
  return result;
}
__name(_format, "_format");
function localize(data, message, ...args) {
  if (typeof data === "number") {
    return _format(lookupMessage(data, message), args);
  }
  return _format(message, args);
}
__name(localize, "localize");
function lookupMessage(index, fallback) {
  const message = getNLSMessages()?.[index];
  if (typeof message !== "string") {
    if (typeof fallback === "string") {
      return fallback;
    }
    throw new Error(`!!! NLS MISSING: ${index} !!!`);
  }
  return message;
}
__name(lookupMessage, "lookupMessage");
function localize2(data, originalMessage, ...args) {
  let message;
  if (typeof data === "number") {
    message = lookupMessage(data, originalMessage);
  } else {
    message = originalMessage;
  }
  const value = _format(message, args);
  return {
    value,
    original: originalMessage === message ? value : _format(originalMessage, args)
  };
}
__name(localize2, "localize2");
export {
  getNLSLanguage2 as getNLSLanguage,
  getNLSMessages2 as getNLSMessages,
  localize,
  localize2
};
//# sourceMappingURL=nls.js.map
