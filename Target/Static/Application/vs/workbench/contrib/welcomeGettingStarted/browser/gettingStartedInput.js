var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./media/gettingStarted.css";
import { localize } from "../../../../nls.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { URI } from "../../../../base/common/uri.js";
import { Schemas } from "../../../../base/common/network.js";
const gettingStartedInputTypeId = "workbench.editors.gettingStartedInput";
class GettingStartedInput extends EditorInput {
  static {
    __name(this, "GettingStartedInput");
  }
  static {
    this.ID = gettingStartedInputTypeId;
  }
  static {
    this.RESOURCE = URI.from({ scheme: Schemas.walkThrough, authority: "vscode_getting_started_page" });
  }
  get typeId() {
    return GettingStartedInput.ID;
  }
  get editorId() {
    return this.typeId;
  }
  toUntyped() {
    return {
      resource: GettingStartedInput.RESOURCE,
      options: {
        override: GettingStartedInput.ID,
        pinned: false
      }
    };
  }
  get resource() {
    return GettingStartedInput.RESOURCE;
  }
  matches(other) {
    if (super.matches(other)) {
      return true;
    }
    if (other instanceof GettingStartedInput) {
      return other.selectedCategory === this.selectedCategory;
    }
    return false;
  }
  constructor(options) {
    super();
    this._selectedCategory = options.selectedCategory;
    this._selectedStep = options.selectedStep;
    this._showTelemetryNotice = !!options.showTelemetryNotice;
    this._showWelcome = options.showWelcome ?? true;
    this._walkthroughPageTitle = options.walkthroughPageTitle;
  }
  getName() {
    return this.walkthroughPageTitle ? localize("walkthroughPageTitle", "Walkthrough: {0}", this.walkthroughPageTitle) : localize("getStarted", "Welcome");
  }
  get selectedCategory() {
    return this._selectedCategory;
  }
  set selectedCategory(selectedCategory) {
    this._selectedCategory = selectedCategory;
    this._onDidChangeLabel.fire();
  }
  get selectedStep() {
    return this._selectedStep;
  }
  set selectedStep(selectedStep) {
    this._selectedStep = selectedStep;
  }
  get showTelemetryNotice() {
    return this._showTelemetryNotice;
  }
  set showTelemetryNotice(value) {
    this._showTelemetryNotice = value;
  }
  get showWelcome() {
    return this._showWelcome;
  }
  set showWelcome(value) {
    this._showWelcome = value;
  }
  get walkthroughPageTitle() {
    return this._walkthroughPageTitle;
  }
  set walkthroughPageTitle(value) {
    this._walkthroughPageTitle = value;
  }
}
export {
  GettingStartedInput,
  gettingStartedInputTypeId
};
//# sourceMappingURL=gettingStartedInput.js.map
