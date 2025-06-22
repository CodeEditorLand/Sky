var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { groupBy } from "../../../../base/common/arrays.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { extUri } from "../../../../base/common/resources.js";
import { localize } from "../../../../nls.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IMarkerService, MarkerSeverity } from "../../../../platform/markers/common/markers.js";
import { IChatContextPickService } from "../../chat/browser/chatContextPickService.js";
import { IDiagnosticVariableEntryFilterData } from "../../chat/common/chatVariableEntries.js";
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
let MarkerChatContextPick = class MarkerChatContextPick2 {
  static {
    __name(this, "MarkerChatContextPick");
  }
  constructor(_markerService, _labelService) {
    this._markerService = _markerService;
    this._labelService = _labelService;
    this.type = "pickerPick";
    this.label = localize("chatContext.diagnstic", "Problems...");
    this.icon = Codicon.error;
    this.ordinal = -100;
  }
  asPicker() {
    const markers = this._markerService.read({ severities: MarkerSeverity.Error | MarkerSeverity.Warning | MarkerSeverity.Info });
    const grouped = groupBy(markers, (a, b) => extUri.compare(a.resource, b.resource));
    const severities = /* @__PURE__ */ new Set();
    const items = [];
    let pickCount = 0;
    for (const group of grouped) {
      const resource = group[0].resource;
      items.push({ type: "separator", label: this._labelService.getUriLabel(resource, { relative: true }) });
      for (const marker of group) {
        pickCount++;
        severities.add(marker.severity);
        items.push({
          label: marker.message,
          description: localize("markers.panel.at.ln.col.number", "[Ln {0}, Col {1}]", "" + marker.startLineNumber, "" + marker.startColumn),
          asAttachment() {
            return IDiagnosticVariableEntryFilterData.toEntry(IDiagnosticVariableEntryFilterData.fromMarker(marker));
          }
        });
      }
    }
    items.unshift({
      label: localize("markers.panel.allErrors", "All Problems"),
      asAttachment() {
        return IDiagnosticVariableEntryFilterData.toEntry({
          filterSeverity: MarkerSeverity.Info
        });
      }
    });
    return {
      placeholder: localize("chatContext.diagnstic.placeholder", "Select a problem to attach"),
      picks: Promise.resolve(items)
    };
  }
};
MarkerChatContextPick = __decorate([
  __param(0, IMarkerService),
  __param(1, ILabelService)
], MarkerChatContextPick);
let MarkerChatContextContribution = class MarkerChatContextContribution2 extends Disposable {
  static {
    __name(this, "MarkerChatContextContribution");
  }
  static {
    this.ID = "workbench.contrib.chat.markerChatContextContribution";
  }
  constructor(contextPickService, instantiationService) {
    super();
    this._store.add(contextPickService.registerChatContextItem(instantiationService.createInstance(MarkerChatContextPick)));
  }
};
MarkerChatContextContribution = __decorate([
  __param(0, IChatContextPickService),
  __param(1, IInstantiationService)
], MarkerChatContextContribution);
export {
  MarkerChatContextContribution
};
//# sourceMappingURL=markersChatContext.js.map
