var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as resources from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { LanguageId, StandardTokenType } from "../../../../editor/common/encodedTokenAttributes.js";
class TMScopeRegistry {
  static {
    __name(this, "TMScopeRegistry");
  }
  _scopeNameToLanguageRegistration;
  constructor() {
    this._scopeNameToLanguageRegistration = /* @__PURE__ */ Object.create(null);
  }
  reset() {
    this._scopeNameToLanguageRegistration = /* @__PURE__ */ Object.create(null);
  }
  register(def) {
    if (this._scopeNameToLanguageRegistration[def.scopeName]) {
      const existingRegistration = this._scopeNameToLanguageRegistration[def.scopeName];
      if (!resources.isEqual(existingRegistration.location, def.location)) {
        console.warn(
          `Overwriting grammar scope name to file mapping for scope ${def.scopeName}.
Old grammar file: ${existingRegistration.location.toString()}.
New grammar file: ${def.location.toString()}`
        );
      }
    }
    this._scopeNameToLanguageRegistration[def.scopeName] = def;
  }
  getGrammarDefinition(scopeName) {
    return this._scopeNameToLanguageRegistration[scopeName] || null;
  }
}
export {
  TMScopeRegistry
};
//# sourceMappingURL=TMScopeRegistry.js.map
