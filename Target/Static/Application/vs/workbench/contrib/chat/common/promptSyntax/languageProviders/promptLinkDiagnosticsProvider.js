var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IPromptsService } from "../service/promptsService.js";
import { ProviderInstanceBase } from "./providerInstanceBase.js";
import { assert } from "../../../../../../base/common/assert.js";
import { NotPromptFile } from "../../promptFileReferenceErrors.js";
import { assertDefined } from "../../../../../../base/common/types.js";
import { ProviderInstanceManagerBase } from "./providerInstanceManagerBase.js";
import { IMarkerService, MarkerSeverity } from "../../../../../../platform/markers/common/markers.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
const MARKERS_OWNER_ID = "prompt-link-diagnostics-provider";
let PromptLinkDiagnosticsProvider = class PromptLinkDiagnosticsProvider2 extends ProviderInstanceBase {
  static {
    __name(this, "PromptLinkDiagnosticsProvider");
  }
  constructor(model, promptsService, markerService) {
    super(model, promptsService);
    this.markerService = markerService;
  }
  /**
   * Update diagnostic markers for the current editor.
   */
  onPromptSettled() {
    this.markerService.remove(MARKERS_OWNER_ID, [this.model.uri]);
    const markers = [];
    for (const link of this.parser.references) {
      const { topError, linkRange } = link;
      if (!topError || !linkRange) {
        continue;
      }
      const { originalError } = topError;
      if (originalError instanceof NotPromptFile) {
        continue;
      }
      markers.push(toMarker(link));
    }
    this.markerService.changeOne(MARKERS_OWNER_ID, this.model.uri, markers);
    return this;
  }
  /**
   * Returns a string representation of this object.
   */
  toString() {
    return `prompt-link-diagnostics:${this.model.uri.path}`;
  }
};
PromptLinkDiagnosticsProvider = __decorate([
  __param(1, IPromptsService),
  __param(2, IMarkerService)
], PromptLinkDiagnosticsProvider);
function toMarker(link) {
  const { topError, linkRange } = link;
  assertDefined(topError, "Top error must to be defined.");
  assertDefined(linkRange, "Link range must to be defined.");
  const { originalError } = topError;
  assert(!(originalError instanceof NotPromptFile), 'Error must not be of "not prompt file" type.');
  const severity = topError.errorSubject === "root" ? MarkerSeverity.Error : MarkerSeverity.Warning;
  return {
    message: topError.localizedMessage,
    severity,
    ...linkRange
  };
}
__name(toMarker, "toMarker");
class PromptLinkDiagnosticsInstanceManager extends ProviderInstanceManagerBase {
  static {
    __name(this, "PromptLinkDiagnosticsInstanceManager");
  }
  get InstanceClass() {
    return PromptLinkDiagnosticsProvider;
  }
}
export {
  PromptLinkDiagnosticsInstanceManager
};
//# sourceMappingURL=promptLinkDiagnosticsProvider.js.map
