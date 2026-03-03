var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize, localize2 } from "../../../../nls.js";
import { Action2, MenuRegistry, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { AICustomizationItemMenuId } from "./aiCustomizationTreeView.js";
import { AICustomizationItemTypeContextKey } from "./aiCustomizationTreeViewViews.js";
import { PromptsType } from "../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { URI } from "../../../../base/common/uri.js";
import { IEditorService } from "../../../../workbench/services/editor/common/editorService.js";
function extractURI(context) {
  if (URI.isUri(context)) {
    return context;
  }
  if (typeof context === "string") {
    return URI.parse(context);
  }
  if (URI.isUri(context.uri)) {
    return context.uri;
  }
  return URI.parse(context.uri);
}
__name(extractURI, "extractURI");
const OPEN_AI_CUSTOMIZATION_FILE_ID = "aiCustomization.openFile";
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: OPEN_AI_CUSTOMIZATION_FILE_ID,
      title: localize2("open", "Open"),
      icon: Codicon.goToFile
    });
  }
  async run(accessor, context) {
    const editorService = accessor.get(IEditorService);
    await editorService.openEditor({
      resource: extractURI(context)
    });
  }
});
const RUN_PROMPT_FROM_VIEW_ID = "aiCustomization.runPrompt";
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: RUN_PROMPT_FROM_VIEW_ID,
      title: localize2("runPrompt", "Run Prompt"),
      icon: Codicon.play
    });
  }
  async run(accessor, context) {
    const commandService = accessor.get(ICommandService);
    await commandService.executeCommand("workbench.action.chat.run.prompt.current", extractURI(context));
  }
});
MenuRegistry.appendMenuItem(AICustomizationItemMenuId, {
  command: { id: OPEN_AI_CUSTOMIZATION_FILE_ID, title: localize("open", "Open") },
  group: "1_open",
  order: 1
});
MenuRegistry.appendMenuItem(AICustomizationItemMenuId, {
  command: { id: RUN_PROMPT_FROM_VIEW_ID, title: localize("runPrompt", "Run Prompt"), icon: Codicon.play },
  group: "2_run",
  order: 1,
  when: ContextKeyExpr.equals(AICustomizationItemTypeContextKey.key, PromptsType.prompt)
});
//# sourceMappingURL=aiCustomizationTreeView.contribution.js.map
