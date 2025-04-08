var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import Severity from "../../../../base/common/severity.js";
import { compare } from "../../../../base/common/strings.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { Command } from "../../../../editor/common/languages.js";
import { LanguageFeatureRegistry } from "../../../../editor/common/languageFeatureRegistry.js";
import { LanguageSelector } from "../../../../editor/common/languageSelector.js";
import { IAccessibilityInformation } from "../../../../platform/accessibility/common/accessibility.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const ILanguageStatusService = createDecorator("ILanguageStatusService");
class LanguageStatusServiceImpl {
  static {
    __name(this, "LanguageStatusServiceImpl");
  }
  _provider = new LanguageFeatureRegistry();
  onDidChange = this._provider.onDidChange;
  addStatus(status) {
    return this._provider.register(status.selector, status);
  }
  getLanguageStatus(model) {
    return this._provider.ordered(model).sort((a, b) => {
      let res = b.severity - a.severity;
      if (res === 0) {
        res = compare(a.source, b.source);
      }
      if (res === 0) {
        res = compare(a.id, b.id);
      }
      return res;
    });
  }
}
registerSingleton(ILanguageStatusService, LanguageStatusServiceImpl, InstantiationType.Delayed);
export {
  ILanguageStatusService
};
//# sourceMappingURL=languageStatusService.js.map
