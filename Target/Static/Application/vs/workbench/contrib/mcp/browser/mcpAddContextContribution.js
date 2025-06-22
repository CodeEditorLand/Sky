var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../base/common/codicons.js";
import { CancellationError } from "../../../../base/common/errors.js";
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { autorun, observableValue } from "../../../../base/common/observable.js";
import { localize } from "../../../../nls.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IChatContextPickService } from "../../chat/browser/chatContextPickService.js";
import { McpResourcePickHelper } from "./mcpResourceQuickAccess.js";
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
let McpAddContextContribution = class McpAddContextContribution2 extends Disposable {
  static {
    __name(this, "McpAddContextContribution");
  }
  constructor(_chatContextPickService, instantiationService) {
    super();
    this._chatContextPickService = _chatContextPickService;
    this._addContextMenu = this._register(new MutableDisposable());
    this._helper = instantiationService.createInstance(McpResourcePickHelper);
    this._register(autorun((reader) => {
      const enabled = this._helper.hasServersWithResources.read(reader);
      if (enabled && !this._addContextMenu.value) {
        this._registerAddContextMenu();
      } else {
        this._addContextMenu.clear();
      }
    }));
  }
  _registerAddContextMenu() {
    this._addContextMenu.value = this._chatContextPickService.registerChatContextItem({
      type: "pickerPick",
      label: localize("mcp.addContext", "MCP Resources..."),
      icon: Codicon.mcp,
      asPicker: /* @__PURE__ */ __name(() => ({
        placeholder: localize("mcp.addContext.placeholder", "Select MCP Resource..."),
        picks: /* @__PURE__ */ __name((_query, token) => this._getResourcePicks(token), "picks")
      }), "asPicker")
    });
  }
  _getResourcePicks(token) {
    const observable = observableValue(this, { busy: true, picks: [] });
    this._helper.getPicks((servers) => {
      const picks = [];
      for (const [server, resources] of servers) {
        if (resources.length === 0) {
          continue;
        }
        picks.push(McpResourcePickHelper.sep(server));
        for (const resource of resources) {
          picks.push({
            ...McpResourcePickHelper.item(resource),
            asAttachment: /* @__PURE__ */ __name(() => this._helper.toAttachment(resource).then((r) => {
              if (!r) {
                throw new CancellationError();
              } else {
                return r;
              }
            }), "asAttachment")
          });
        }
      }
      observable.set({ picks, busy: true }, void 0);
    }, token).finally(() => {
      observable.set({ busy: false, picks: observable.get().picks }, void 0);
    });
    return observable;
  }
};
McpAddContextContribution = __decorate([
  __param(0, IChatContextPickService),
  __param(1, IInstantiationService)
], McpAddContextContribution);
export {
  McpAddContextContribution
};
//# sourceMappingURL=mcpAddContextContribution.js.map
