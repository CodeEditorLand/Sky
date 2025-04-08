var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize, localize2 } from "../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
class ToggleMinimapAction extends Action2 {
  static {
    __name(this, "ToggleMinimapAction");
  }
  static ID = "editor.action.toggleMinimap";
  constructor() {
    super({
      id: ToggleMinimapAction.ID,
      title: {
        ...localize2("toggleMinimap", "Toggle Minimap"),
        mnemonicTitle: localize({ key: "miMinimap", comment: ["&& denotes a mnemonic"] }, "&&Minimap")
      },
      category: Categories.View,
      f1: true,
      toggled: ContextKeyExpr.equals("config.editor.minimap.enabled", true),
      menu: {
        id: MenuId.MenubarAppearanceMenu,
        group: "4_editor",
        order: 1
      }
    });
  }
  async run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const newValue = !configurationService.getValue("editor.minimap.enabled");
    return configurationService.updateValue("editor.minimap.enabled", newValue);
  }
}
registerAction2(ToggleMinimapAction);
export {
  ToggleMinimapAction
};
//# sourceMappingURL=toggleMinimap.js.map
