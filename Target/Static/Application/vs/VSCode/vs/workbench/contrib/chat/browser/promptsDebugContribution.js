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
var PromptsDebugContribution_1;
import { Disposable } from "../../../../base/common/lifecycle.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { IChatDebugService } from "../common/chatDebugService.js";
import { IPromptsService } from "../common/promptSyntax/service/promptsService.js";
let PromptsDebugContribution = class PromptsDebugContribution2 extends Disposable {
  static {
    __name(this, "PromptsDebugContribution");
  }
  static {
    PromptsDebugContribution_1 = this;
  }
  static {
    this.ID = "workbench.contrib.promptsDebug";
  }
  static {
    this.MAX_DISCOVERY_DETAILS = 1e4;
  }
  constructor(promptsService, chatDebugService) {
    super();
    this._discoveryEventDetails = /* @__PURE__ */ new Map();
    this._register(promptsService.onDidLogDiscovery((entry) => {
      let eventId;
      if (entry.discoveryInfo) {
        eventId = generateUuid();
        this._discoveryEventDetails.set(eventId, entry.discoveryInfo);
        if (this._discoveryEventDetails.size > PromptsDebugContribution_1.MAX_DISCOVERY_DETAILS) {
          const first = this._discoveryEventDetails.keys().next().value;
          if (first !== void 0) {
            this._discoveryEventDetails.delete(first);
          }
        }
      }
      let details = entry.details;
      if (entry.discoveryInfo) {
        const info = entry.discoveryInfo;
        const loaded = info.files.filter((f) => f.status === "loaded").map((f) => f.name ?? f.uri.path.split("/").pop() ?? f.uri.toString());
        const skipped = info.files.filter((f) => f.status === "skipped").map((f) => {
          const label = f.uri.toString();
          return f.skipReason ? `${label} (${f.skipReason})` : label;
        });
        const folders = info.sourceFolders?.map((sf) => sf.uri.path) ?? [];
        const parts = [];
        if (details) {
          parts.push(details);
        }
        if (loaded.length > 0) {
          parts.push(`loaded: [${truncateList(loaded)}]`);
        }
        if (skipped.length > 0) {
          parts.push(`skipped: [${truncateList(skipped)}]`);
        }
        if (folders.length > 0) {
          parts.push(`folders: [${truncateList(folders)}]`);
        }
        details = parts.join(" | ") || void 0;
      }
      chatDebugService.log(entry.sessionResource, entry.name, details, void 0, { id: eventId, category: entry.category });
    }));
    this._register(chatDebugService.registerProvider({
      provideChatDebugLog: /* @__PURE__ */ __name(async () => void 0, "provideChatDebugLog"),
      resolveChatDebugLogEvent: /* @__PURE__ */ __name(async (eventId) => {
        return this._resolveDiscoveryEvent(eventId);
      }, "resolveChatDebugLogEvent")
    }));
  }
  _resolveDiscoveryEvent(eventId) {
    const info = this._discoveryEventDetails.get(eventId);
    if (!info) {
      return void 0;
    }
    return {
      kind: "fileList",
      discoveryType: info.type,
      files: info.files.map((f) => ({
        uri: f.uri,
        name: f.name,
        status: f.status,
        storage: f.storage,
        extensionId: f.extensionId,
        skipReason: f.skipReason,
        errorMessage: f.errorMessage,
        duplicateOf: f.duplicateOf
      })),
      sourceFolders: info.sourceFolders?.map((sf) => ({
        uri: sf.uri,
        storage: sf.storage
      }))
    };
  }
};
PromptsDebugContribution = PromptsDebugContribution_1 = __decorate([
  __param(0, IPromptsService),
  __param(1, IChatDebugService)
], PromptsDebugContribution);
const MAX_LIST_ITEMS = 100;
function truncateList(items) {
  if (items.length <= MAX_LIST_ITEMS) {
    return items.join(", ");
  }
  return items.slice(0, MAX_LIST_ITEMS).join(", ") + ` (+${items.length - MAX_LIST_ITEMS} more)`;
}
__name(truncateList, "truncateList");
export {
  PromptsDebugContribution
};
//# sourceMappingURL=promptsDebugContribution.js.map
