import { localize } from "../../../../../../../../nls.js";
import { URI } from "../../../../../../../../base/common/uri.js";
import { Codicon } from "../../../../../../../../base/common/codicons.js";
import { WithUriValue } from "../../../../../../../../base/common/types.js";
import { ThemeIcon } from "../../../../../../../../base/common/themables.js";
import { DOCUMENTATION_URL } from "../../../../../common/promptSyntax/constants.js";
import { isLinux, isWindows } from "../../../../../../../../base/common/platform.js";
import { IQuickInputButton, IQuickPickItem } from "../../../../../../../../platform/quickinput/common/quickInput.js";
const SUPER_KEY_NAME = isWindows || isLinux ? "Ctrl" : "\u2318";
const ALT_KEY_NAME = isWindows || isLinux ? "Alt" : "\u2325";
const DOCS_OPTION = Object.freeze({
  type: "item",
  label: localize(
    "commands.prompts.use.select-dialog.docs-label",
    "Learn how to create reusable prompts"
  ),
  description: DOCUMENTATION_URL,
  tooltip: DOCUMENTATION_URL,
  value: URI.parse(DOCUMENTATION_URL)
});
const EDIT_BUTTON = Object.freeze({
  tooltip: localize(
    "commands.prompts.use.select-dialog.open-button.tooltip",
    "edit ({0}-key + enter)",
    SUPER_KEY_NAME
  ),
  iconClass: ThemeIcon.asClassName(Codicon.edit)
});
const DELETE_BUTTON = Object.freeze({
  tooltip: localize("delete", "delete"),
  iconClass: ThemeIcon.asClassName(Codicon.trash)
});
export {
  ALT_KEY_NAME,
  DELETE_BUTTON,
  DOCS_OPTION,
  EDIT_BUTTON,
  SUPER_KEY_NAME
};
//# sourceMappingURL=constants.js.map
