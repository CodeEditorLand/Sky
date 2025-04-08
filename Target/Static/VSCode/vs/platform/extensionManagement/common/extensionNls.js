var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isObject, isString } from "../../../base/common/types.js";
import { ILocalizedString } from "../../action/common/action.js";
import { IExtensionManifest } from "../../extensions/common/extensions.js";
import { localize } from "../../../nls.js";
import { ILogger } from "../../log/common/log.js";
function localizeManifest(logger, extensionManifest, translations, fallbackTranslations) {
  try {
    replaceNLStrings(logger, extensionManifest, translations, fallbackTranslations);
  } catch (error) {
    logger.error(error?.message ?? error);
  }
  return extensionManifest;
}
__name(localizeManifest, "localizeManifest");
function replaceNLStrings(logger, extensionManifest, messages, originalMessages) {
  const processEntry = /* @__PURE__ */ __name((obj, key, command) => {
    const value = obj[key];
    if (isString(value)) {
      const str = value;
      const length = str.length;
      if (length > 1 && str[0] === "%" && str[length - 1] === "%") {
        const messageKey = str.substr(1, length - 2);
        let translated = messages[messageKey];
        if (translated === void 0 && originalMessages) {
          translated = originalMessages[messageKey];
        }
        const message = typeof translated === "string" ? translated : translated?.message;
        const original = originalMessages?.[messageKey];
        const originalMessage = typeof original === "string" ? original : original?.message;
        if (!message) {
          if (!originalMessage) {
            logger.warn(`[${extensionManifest.name}]: ${localize("missingNLSKey", "Couldn't find message for key {0}.", messageKey)}`);
          }
          return;
        }
        if (
          // if we are translating the title or category of a command
          command && (key === "title" || key === "category") && // and the original value is not the same as the translated value
          originalMessage && originalMessage !== message
        ) {
          const localizedString = {
            value: message,
            original: originalMessage
          };
          obj[key] = localizedString;
        } else {
          obj[key] = message;
        }
      }
    } else if (isObject(value)) {
      for (const k in value) {
        if (value.hasOwnProperty(k)) {
          k === "commands" ? processEntry(value, k, true) : processEntry(value, k, command);
        }
      }
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        processEntry(value, i, command);
      }
    }
  }, "processEntry");
  for (const key in extensionManifest) {
    if (extensionManifest.hasOwnProperty(key)) {
      processEntry(extensionManifest, key);
    }
  }
}
__name(replaceNLStrings, "replaceNLStrings");
export {
  localizeManifest
};
//# sourceMappingURL=extensionNls.js.map
