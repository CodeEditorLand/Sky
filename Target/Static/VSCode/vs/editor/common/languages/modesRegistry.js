var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../nls.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { ILanguageExtensionPoint } from "./language.js";
import { Registry } from "../../../platform/registry/common/platform.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { Mimes } from "../../../base/common/mime.js";
import { IConfigurationRegistry, Extensions as ConfigurationExtensions } from "../../../platform/configuration/common/configurationRegistry.js";
const Extensions = {
  ModesRegistry: "editor.modesRegistry"
};
class EditorModesRegistry {
  static {
    __name(this, "EditorModesRegistry");
  }
  _languages;
  _onDidChangeLanguages = new Emitter();
  onDidChangeLanguages = this._onDidChangeLanguages.event;
  constructor() {
    this._languages = [];
  }
  registerLanguage(def) {
    this._languages.push(def);
    this._onDidChangeLanguages.fire(void 0);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        for (let i = 0, len = this._languages.length; i < len; i++) {
          if (this._languages[i] === def) {
            this._languages.splice(i, 1);
            return;
          }
        }
      }, "dispose")
    };
  }
  getLanguages() {
    return this._languages;
  }
}
const ModesRegistry = new EditorModesRegistry();
Registry.add(Extensions.ModesRegistry, ModesRegistry);
const PLAINTEXT_LANGUAGE_ID = "plaintext";
const PLAINTEXT_EXTENSION = ".txt";
ModesRegistry.registerLanguage({
  id: PLAINTEXT_LANGUAGE_ID,
  extensions: [PLAINTEXT_EXTENSION],
  aliases: [nls.localize("plainText.alias", "Plain Text"), "text"],
  mimetypes: [Mimes.text]
});
Registry.as(ConfigurationExtensions.Configuration).registerDefaultConfigurations([{
  overrides: {
    "[plaintext]": {
      "editor.unicodeHighlight.ambiguousCharacters": false,
      "editor.unicodeHighlight.invisibleCharacters": false
    },
    // TODO: Below is a workaround for: https://github.com/microsoft/vscode/issues/240567
    "[go]": {
      "editor.insertSpaces": false
    },
    "[makefile]": {
      "editor.insertSpaces": false
    },
    "[shellscript]": {
      "files.eol": "\n"
    },
    "[yaml]": {
      "editor.insertSpaces": true,
      "editor.tabSize": 2
    }
  }
}]);
export {
  EditorModesRegistry,
  Extensions,
  ModesRegistry,
  PLAINTEXT_EXTENSION,
  PLAINTEXT_LANGUAGE_ID
};
//# sourceMappingURL=modesRegistry.js.map
