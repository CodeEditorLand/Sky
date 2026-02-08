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
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize } from "../../../../../nls.js";
import { registerWorkbenchContribution2 } from "../../../../common/contributions.js";
import { IChatContextService } from "./chatContextService.js";
import { isProposedApiEnabled } from "../../../../services/extensions/common/extensions.js";
import { ExtensionsRegistry } from "../../../../services/extensions/common/extensionsRegistry.js";
const extensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "chatContext",
  jsonSchema: {
    description: localize("chatContextExtPoint", "Contributes chat context integrations to the chat widget."),
    type: "array",
    items: {
      type: "object",
      properties: {
        id: {
          description: localize("chatContextExtPoint.id", "A unique identifier for this item."),
          type: "string"
        },
        icon: {
          description: localize("chatContextExtPoint.icon", "The icon associated with this chat context item."),
          type: "string"
        },
        displayName: {
          description: localize("chatContextExtPoint.title", "A user-friendly name for this item which is used for display in menus."),
          type: "string"
        }
      },
      required: ["id", "icon", "displayName"]
    }
  },
  activationEventsGenerator: /* @__PURE__ */ __name(function* (contributions) {
    for (const contrib of contributions) {
      yield `onChatContextProvider:${contrib.id}`;
    }
  }, "activationEventsGenerator")
});
let ChatContextContribution = class ChatContextContribution2 extends Disposable {
  static {
    __name(this, "ChatContextContribution");
  }
  static {
    this.ID = "workbench.contrib.chatContextContribution";
  }
  constructor(_chatContextService) {
    super();
    this._chatContextService = _chatContextService;
    extensionPoint.setHandler((extensions) => {
      for (const ext of extensions) {
        if (!isProposedApiEnabled(ext.description, "chatContextProvider")) {
          continue;
        }
        if (!Array.isArray(ext.value)) {
          continue;
        }
        for (const contribution of ext.value) {
          const icon = contribution.icon ? ThemeIcon.fromString(contribution.icon) : void 0;
          if (!icon && contribution.icon) {
            ext.collector.error(localize("chatContextExtPoint.invalidIcon", "Invalid icon format for chat context contribution '{0}'. Icon must be in the format '$(iconId)' or '$(iconId~spin)', e.g. '$(copilot)'.", contribution.id));
            continue;
          }
          if (!icon) {
            continue;
          }
          this._chatContextService.setChatContextProvider(`${ext.description.id}-${contribution.id}`, { title: contribution.displayName, icon });
        }
      }
    });
  }
};
ChatContextContribution = __decorate([
  __param(0, IChatContextService)
], ChatContextContribution);
registerWorkbenchContribution2(
  ChatContextContribution.ID,
  ChatContextContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
export {
  ChatContextContribution
};
//# sourceMappingURL=chatContext.contribution.js.map
