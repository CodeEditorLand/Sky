var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Action } from "../../../../base/common/actions.js";
import { IExtensionHostProfile } from "../../../services/extensions/common/extensions.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { AbstractRuntimeExtensionsEditor, IRuntimeExtension } from "./abstractRuntimeExtensionsEditor.js";
import { ReportExtensionIssueAction } from "../common/reportExtensionIssueAction.js";
class RuntimeExtensionsEditor extends AbstractRuntimeExtensionsEditor {
  static {
    __name(this, "RuntimeExtensionsEditor");
  }
  _getProfileInfo() {
    return null;
  }
  _getUnresponsiveProfile(extensionId) {
    return void 0;
  }
  _createSlowExtensionAction(element) {
    return null;
  }
  _createReportExtensionIssueAction(element) {
    if (element.marketplaceInfo) {
      return this._instantiationService.createInstance(ReportExtensionIssueAction, element.description);
    }
    return null;
  }
}
export {
  RuntimeExtensionsEditor
};
//# sourceMappingURL=browserRuntimeExtensionsEditor.js.map
