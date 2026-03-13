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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { MenuRegistry } from "../../../../platform/actions/common/actions.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions as WorkbenchExtensions } from "../../../common/contributions.js";
import { isProposedApiEnabled } from "../../../services/extensions/common/extensions.js";
import { ExtensionsRegistry } from "../../../services/extensions/common/extensionsRegistry.js";
import { IRemoteCodingAgentsService } from "../common/remoteCodingAgentsService.js";
const extensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "remoteCodingAgents",
  jsonSchema: {
    description: localize("remoteCodingAgentsExtPoint", "Contributes remote coding agent integrations to the chat widget."),
    type: "array",
    items: {
      type: "object",
      properties: {
        id: {
          description: localize("remoteCodingAgentsExtPoint.id", "A unique identifier for this item."),
          type: "string"
        },
        command: {
          description: localize("remoteCodingAgentsExtPoint.command", 'Identifier of the command to execute. The command must be declared in the "commands" section.'),
          type: "string"
        },
        displayName: {
          description: localize("remoteCodingAgentsExtPoint.displayName", "A user-friendly name for this item which is used for display in menus."),
          type: "string"
        },
        description: {
          description: localize("remoteCodingAgentsExtPoint.description", "Description of the remote agent for use in menus and tooltips."),
          type: "string"
        },
        followUpRegex: {
          description: localize("remoteCodingAgentsExtPoint.followUpRegex", "The last occurrence of pattern in an existing chat conversation is sent to the contributing extension to facilitate follow-up responses."),
          type: "string"
        },
        when: {
          description: localize("remoteCodingAgentsExtPoint.when", "Condition which must be true to show this item."),
          type: "string"
        }
      },
      required: ["command", "displayName"]
    }
  }
});
let RemoteCodingAgentsContribution = class RemoteCodingAgentsContribution2 extends Disposable {
  static {
    __name(this, "RemoteCodingAgentsContribution");
  }
  constructor(remoteCodingAgentsService) {
    super();
    this.remoteCodingAgentsService = remoteCodingAgentsService;
    extensionPoint.setHandler((extensions) => {
      for (const ext of extensions) {
        if (!isProposedApiEnabled(ext.description, "remoteCodingAgents")) {
          continue;
        }
        if (!Array.isArray(ext.value)) {
          continue;
        }
        for (const contribution of ext.value) {
          const command = MenuRegistry.getCommand(contribution.command);
          if (!command) {
            continue;
          }
          const agent = {
            id: contribution.id,
            command: contribution.command,
            displayName: contribution.displayName,
            description: contribution.description,
            followUpRegex: contribution.followUpRegex,
            when: contribution.when
          };
          this.remoteCodingAgentsService.registerAgent(agent);
        }
      }
    });
  }
};
RemoteCodingAgentsContribution = __decorate([
  __param(0, IRemoteCodingAgentsService)
], RemoteCodingAgentsContribution);
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(
  RemoteCodingAgentsContribution,
  3
  /* LifecyclePhase.Restored */
);
export {
  RemoteCodingAgentsContribution
};
//# sourceMappingURL=remoteCodingAgents.contribution.js.map
