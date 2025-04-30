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
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize } from "../../../../../nls.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { checkProposedApiEnabled } from "../../../../services/extensions/common/extensions.js";
import * as extensionsRegistry from "../../../../services/extensions/common/extensionsRegistry.js";
const chatViewsWelcomeExtensionPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "chatViewsWelcome",
  jsonSchema: {
    description: localize("vscode.extension.contributes.chatViewsWelcome", "Contributes a welcome message to a chat view"),
    type: "array",
    items: {
      additionalProperties: false,
      type: "object",
      properties: {
        icon: {
          type: "string",
          description: localize("chatViewsWelcome.icon", "The icon for the welcome message.")
        },
        title: {
          type: "string",
          description: localize("chatViewsWelcome.title", "The title of the welcome message.")
        },
        content: {
          type: "string",
          description: localize("chatViewsWelcome.content", "The content of the welcome message. The first command link will be rendered as a button.")
        },
        when: {
          type: "string",
          description: localize("chatViewsWelcome.when", "Condition when the welcome message is shown.")
        }
      }
    },
    required: ["icon", "title", "contents", "when"]
  }
});
let ChatViewsWelcomeHandler = class ChatViewsWelcomeHandler2 {
  static {
    __name(this, "ChatViewsWelcomeHandler");
  }
  static {
    this.ID = "workbench.contrib.chatViewsWelcomeHandler";
  }
  constructor(logService) {
    this.logService = logService;
    chatViewsWelcomeExtensionPoint.setHandler((extensions, delta) => {
      for (const extension of delta.added) {
        for (const providerDescriptor of extension.value) {
          checkProposedApiEnabled(extension.description, "chatParticipantPrivate");
          const when = ContextKeyExpr.deserialize(providerDescriptor.when);
          if (!when) {
            this.logService.error(`Could not deserialize 'when' clause for chatViewsWelcome contribution: ${providerDescriptor.when}`);
            continue;
          }
          const descriptor = {
            ...providerDescriptor,
            when,
            icon: ThemeIcon.fromString(providerDescriptor.icon),
            content: new MarkdownString(providerDescriptor.content, { isTrusted: true })
            // private API with command links
          };
          Registry.as(
            "workbench.registry.chat.viewsWelcome"
            /* ChatViewsWelcomeExtensions.ChatViewsWelcomeRegistry */
          ).register(descriptor);
        }
      }
    });
  }
};
ChatViewsWelcomeHandler = __decorate([
  __param(0, ILogService)
], ChatViewsWelcomeHandler);
export {
  ChatViewsWelcomeHandler
};
//# sourceMappingURL=chatViewsWelcomeHandler.js.map
