var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { stripIcons } from "../../../../base/common/iconLabels.js";
import { IEditor } from "../../../common/editorCommon.js";
import { ILocalizedString } from "../../../../nls.js";
import { isLocalizedString } from "../../../../platform/action/common/action.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { AbstractCommandsQuickAccessProvider, ICommandQuickPick, ICommandsQuickAccessOptions } from "../../../../platform/quickinput/browser/commandsQuickAccess.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
class AbstractEditorCommandsQuickAccessProvider extends AbstractCommandsQuickAccessProvider {
  static {
    __name(this, "AbstractEditorCommandsQuickAccessProvider");
  }
  constructor(options, instantiationService, keybindingService, commandService, telemetryService, dialogService) {
    super(options, instantiationService, keybindingService, commandService, telemetryService, dialogService);
  }
  getCodeEditorCommandPicks() {
    const activeTextEditorControl = this.activeTextEditorControl;
    if (!activeTextEditorControl) {
      return [];
    }
    const editorCommandPicks = [];
    for (const editorAction of activeTextEditorControl.getSupportedActions()) {
      let commandDescription;
      if (editorAction.metadata?.description) {
        if (isLocalizedString(editorAction.metadata.description)) {
          commandDescription = editorAction.metadata.description;
        } else {
          commandDescription = { original: editorAction.metadata.description, value: editorAction.metadata.description };
        }
      }
      editorCommandPicks.push({
        commandId: editorAction.id,
        commandAlias: editorAction.alias,
        commandDescription,
        label: stripIcons(editorAction.label) || editorAction.id
      });
    }
    return editorCommandPicks;
  }
}
export {
  AbstractEditorCommandsQuickAccessProvider
};
//# sourceMappingURL=commandsQuickAccess.js.map
