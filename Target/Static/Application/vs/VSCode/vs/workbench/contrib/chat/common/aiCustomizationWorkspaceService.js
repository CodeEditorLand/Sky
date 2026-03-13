var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isEqualOrParent } from "../../../../base/common/resources.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { PromptsStorage } from "./promptSyntax/service/promptsService.js";
const IAICustomizationWorkspaceService = createDecorator("aiCustomizationWorkspaceService");
const AICustomizationManagementSection = {
  Agents: "agents",
  Skills: "skills",
  Instructions: "instructions",
  Prompts: "prompts",
  Hooks: "hooks",
  McpServers: "mcpServers",
  Plugins: "plugins",
  Models: "models"
};
function applyStorageSourceFilter(items, filter) {
  const sourceSet = new Set(filter.sources);
  return items.filter((item) => {
    if (!sourceSet.has(item.storage)) {
      return false;
    }
    if (item.storage === PromptsStorage.user && filter.includedUserFileRoots) {
      return filter.includedUserFileRoots.some((root) => isEqualOrParent(item.uri, root));
    }
    return true;
  });
}
__name(applyStorageSourceFilter, "applyStorageSourceFilter");
export {
  AICustomizationManagementSection,
  IAICustomizationWorkspaceService,
  applyStorageSourceFilter
};
//# sourceMappingURL=aiCustomizationWorkspaceService.js.map
