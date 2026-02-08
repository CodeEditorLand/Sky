var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key2, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key2) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key2, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key2, r) : d(target, key2)) || r;
  return c > 3 && r && Object.defineProperty(target, key2, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key2) {
    decorator(target, key2, paramIndex);
  };
};
import { Disposable, DisposableMap } from "../../../../../base/common/lifecycle.js";
import { joinPath, isEqualOrParent } from "../../../../../base/common/resources.js";
import { localize } from "../../../../../nls.js";
import * as extensionsRegistry from "../../../../services/extensions/common/extensionsRegistry.js";
import { IPromptsService, PromptsStorage } from "./service/promptsService.js";
import { PromptsType } from "./promptTypes.js";
import { CommandsRegistry } from "../../../../../platform/commands/common/commands.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { SyncDescriptor } from "../../../../../platform/instantiation/common/descriptors.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { Extensions } from "../../../../services/extensionManagement/common/extensionFeatures.js";
var ChatContributionPoint;
(function(ChatContributionPoint2) {
  ChatContributionPoint2["chatInstructions"] = "chatInstructions";
  ChatContributionPoint2["chatAgents"] = "chatAgents";
  ChatContributionPoint2["chatPromptFiles"] = "chatPromptFiles";
  ChatContributionPoint2["chatSkills"] = "chatSkills";
})(ChatContributionPoint || (ChatContributionPoint = {}));
function registerChatFilesExtensionPoint(point) {
  return extensionsRegistry.ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: point,
    jsonSchema: {
      description: localize("chatContribution.schema.description", "Contributes {0} for chat prompts.", point),
      type: "array",
      items: {
        additionalProperties: false,
        type: "object",
        defaultSnippets: [{
          body: {
            path: "./relative/path/to/file.md"
          }
        }],
        required: ["path"],
        properties: {
          path: {
            description: localize("chatContribution.property.path", "Path to the file relative to the extension root."),
            type: "string"
          },
          name: {
            description: localize("chatContribution.property.name", "(Optional) Name for this entry."),
            deprecationMessage: localize("chatContribution.property.name.deprecated", 'Specify "name" in the prompt file itself instead.'),
            type: "string"
          },
          description: {
            description: localize("chatContribution.property.description", "(Optional) Description of the entry."),
            deprecationMessage: localize("chatContribution.property.description.deprecated", 'Specify "description" in the prompt file itself instead.'),
            type: "string"
          }
        }
      }
    }
  });
}
__name(registerChatFilesExtensionPoint, "registerChatFilesExtensionPoint");
const epPrompt = registerChatFilesExtensionPoint(ChatContributionPoint.chatPromptFiles);
const epInstructions = registerChatFilesExtensionPoint(ChatContributionPoint.chatInstructions);
const epAgents = registerChatFilesExtensionPoint(ChatContributionPoint.chatAgents);
const epSkills = registerChatFilesExtensionPoint(ChatContributionPoint.chatSkills);
function pointToType(contributionPoint) {
  switch (contributionPoint) {
    case ChatContributionPoint.chatPromptFiles:
      return PromptsType.prompt;
    case ChatContributionPoint.chatInstructions:
      return PromptsType.instructions;
    case ChatContributionPoint.chatAgents:
      return PromptsType.agent;
    case ChatContributionPoint.chatSkills:
      return PromptsType.skill;
    default: {
      const exhaustiveCheck = contributionPoint;
      throw new Error(`Unknown contribution point: ${exhaustiveCheck}`);
    }
  }
}
__name(pointToType, "pointToType");
function key(extensionId, type, path) {
  return `${extensionId.value}/${type}/${path}`;
}
__name(key, "key");
let ChatPromptFilesExtensionPointHandler = class ChatPromptFilesExtensionPointHandler2 {
  static {
    __name(this, "ChatPromptFilesExtensionPointHandler");
  }
  static {
    this.ID = "workbench.contrib.chatPromptFilesExtensionPointHandler";
  }
  constructor(promptsService) {
    this.promptsService = promptsService;
    this.registrations = new DisposableMap();
    this.handle(epPrompt, ChatContributionPoint.chatPromptFiles);
    this.handle(epInstructions, ChatContributionPoint.chatInstructions);
    this.handle(epAgents, ChatContributionPoint.chatAgents);
    this.handle(epSkills, ChatContributionPoint.chatSkills);
  }
  handle(extensionPoint, contributionPoint) {
    extensionPoint.setHandler((_extensions, delta) => {
      for (const ext of delta.added) {
        const type = pointToType(contributionPoint);
        for (const raw of ext.value) {
          if (!raw.path) {
            ext.collector.error(localize("extension.missing.path", "Extension '{0}' cannot register {1} entry without path.", ext.description.identifier.value, contributionPoint));
            continue;
          }
          const fileUri = joinPath(ext.description.extensionLocation, raw.path);
          if (!isEqualOrParent(fileUri, ext.description.extensionLocation)) {
            ext.collector.error(localize("extension.invalid.path", "Extension '{0}' {1} entry '{2}' resolves outside the extension.", ext.description.identifier.value, contributionPoint, raw.path));
            continue;
          }
          try {
            const d = this.promptsService.registerContributedFile(type, fileUri, ext.description, raw.name, raw.description);
            this.registrations.set(key(ext.description.identifier, type, raw.path), d);
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            ext.collector.error(localize("extension.registration.failed", "Extension '{0}' {1}. Failed to register {2}: {3}", ext.description.identifier.value, contributionPoint, raw.path, msg));
          }
        }
      }
      for (const ext of delta.removed) {
        const type = pointToType(contributionPoint);
        for (const raw of ext.value) {
          this.registrations.deleteAndDispose(key(ext.description.identifier, type, raw.path));
        }
      }
    });
  }
};
ChatPromptFilesExtensionPointHandler = __decorate([
  __param(0, IPromptsService)
], ChatPromptFilesExtensionPointHandler);
CommandsRegistry.registerCommand("_listExtensionPromptFiles", async (accessor) => {
  const promptsService = accessor.get(IPromptsService);
  const [agents, instructions, prompts, skills, hooks] = await Promise.all([
    promptsService.listPromptFiles(PromptsType.agent, CancellationToken.None),
    promptsService.listPromptFiles(PromptsType.instructions, CancellationToken.None),
    promptsService.listPromptFiles(PromptsType.prompt, CancellationToken.None),
    promptsService.listPromptFiles(PromptsType.skill, CancellationToken.None),
    promptsService.listPromptFiles(PromptsType.hook, CancellationToken.None)
  ]);
  const result = [];
  for (const file of [...agents, ...instructions, ...prompts, ...skills, ...hooks]) {
    if (file.storage === PromptsStorage.extension) {
      result.push({ uri: file.uri.toJSON(), type: file.type });
    }
  }
  return result;
});
class ChatPromptFilesDataRenderer extends Disposable {
  static {
    __name(this, "ChatPromptFilesDataRenderer");
  }
  constructor(contributionPoint) {
    super();
    this.contributionPoint = contributionPoint;
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.[this.contributionPoint];
  }
  render(manifest) {
    const contributions = manifest.contributes?.[this.contributionPoint] ?? [];
    if (!contributions.length) {
      return { data: { headers: [], rows: [] }, dispose: /* @__PURE__ */ __name(() => {
      }, "dispose") };
    }
    const headers = [
      localize("chatFilesName", "Name"),
      localize("chatFilesDescription", "Description"),
      localize("chatFilesPath", "Path")
    ];
    const rows = contributions.map((d) => {
      return [
        d.name ?? "-",
        d.description ?? "-",
        d.path
      ];
    });
    return {
      data: {
        headers,
        rows
      },
      dispose: /* @__PURE__ */ __name(() => {
      }, "dispose")
    };
  }
}
Registry.as(Extensions.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: ChatContributionPoint.chatPromptFiles,
  label: localize("chatPromptFiles", "Chat Prompt Files"),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(ChatPromptFilesDataRenderer, [ChatContributionPoint.chatPromptFiles])
});
Registry.as(Extensions.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: ChatContributionPoint.chatInstructions,
  label: localize("chatInstructions", "Chat Instructions"),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(ChatPromptFilesDataRenderer, [ChatContributionPoint.chatInstructions])
});
Registry.as(Extensions.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: ChatContributionPoint.chatAgents,
  label: localize("chatAgents", "Chat Agents"),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(ChatPromptFilesDataRenderer, [ChatContributionPoint.chatAgents])
});
Registry.as(Extensions.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: ChatContributionPoint.chatSkills,
  label: localize("chatSkills", "Chat Skills"),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(ChatPromptFilesDataRenderer, [ChatContributionPoint.chatSkills])
});
export {
  ChatPromptFilesExtensionPointHandler
};
//# sourceMappingURL=chatPromptFilesContribution.js.map
