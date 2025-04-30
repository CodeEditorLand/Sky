var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
import { IPromptsService } from "../../../service/types.js";
import { ProviderInstanceBase } from "./providerInstanceBase.js";
import { assertNever } from "../../../../../../../../base/common/assert.js";
import { ProviderInstanceManagerBase } from "./providerInstanceManagerBase.js";
import { PromptMetadataError, PromptMetadataWarning } from "../../../parsers/promptHeader/diagnostics.js";
import { IMarkerService, MarkerSeverity } from "../../../../../../../../platform/markers/common/markers.js";
const MARKERS_OWNER_ID = "prompts-header-diagnostics-provider";
let PromptHeaderDiagnosticsProvider = class PromptHeaderDiagnosticsProvider2 extends ProviderInstanceBase {
  static {
    __name(this, "PromptHeaderDiagnosticsProvider");
  }
  constructor(model, promptsService, markerService) {
    super(model, promptsService);
    this.markerService = markerService;
  }
  /**
   * Update diagnostic markers for the current editor.
   */
  async onPromptParserUpdate() {
    await this.parser.allSettled();
    this.markerService.remove(MARKERS_OWNER_ID, [this.model.uri]);
    const { header } = this.parser;
    if (header === void 0) {
      return this;
    }
    const markers = [];
    for (const diagnostic of header.diagnostics) {
      markers.push(toMarker(diagnostic));
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
PromptHeaderDiagnosticsProvider = __decorate([
  __param(1, IPromptsService),
  __param(2, IMarkerService)
], PromptHeaderDiagnosticsProvider);
const toMarker = /* @__PURE__ */ __name((diagnostic) => {
  if (diagnostic instanceof PromptMetadataWarning) {
    return {
      message: diagnostic.message,
      severity: MarkerSeverity.Warning,
      ...diagnostic.range
    };
  }
  if (diagnostic instanceof PromptMetadataError) {
    return {
      message: diagnostic.message,
      severity: MarkerSeverity.Error,
      ...diagnostic.range
    };
  }
  assertNever(diagnostic, `Unknown prompt metadata diagnostic type '${diagnostic}'.`);
}, "toMarker");
class PromptHeaderDiagnosticsInstanceManager extends ProviderInstanceManagerBase {
  static {
    __name(this, "PromptHeaderDiagnosticsInstanceManager");
  }
  get InstanceClass() {
    return PromptHeaderDiagnosticsProvider;
  }
}
export {
  PromptHeaderDiagnosticsInstanceManager
};
//# sourceMappingURL=promptHeaderDiagnosticsProvider.js.map
