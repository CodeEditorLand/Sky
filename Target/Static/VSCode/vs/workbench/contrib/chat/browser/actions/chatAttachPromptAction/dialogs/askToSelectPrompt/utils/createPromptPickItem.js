var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../../../../../nls.js";
import { DELETE_BUTTON, EDIT_BUTTON } from "../constants.js";
import { dirname } from "../../../../../../../../../base/common/resources.js";
import { WithUriValue } from "../../../../../../../../../base/common/types.js";
import { IPromptPath } from "../../../../../../common/promptSyntax/service/types.js";
import { ILabelService } from "../../../../../../../../../platform/label/common/label.js";
import { getCleanPromptName } from "../../../../../../../../../platform/prompts/common/constants.js";
import { IQuickPickItem } from "../../../../../../../../../platform/quickinput/common/quickInput.js";
const createPromptPickItem = /* @__PURE__ */ __name((promptFile, labelService) => {
  const { uri, type } = promptFile;
  const fileWithoutExtension = getCleanPromptName(uri);
  const description = type === "user" ? localize(
    "user-prompt.capitalized",
    "User prompt"
  ) : labelService.getUriLabel(dirname(uri), { relative: true });
  const tooltip = type === "user" ? description : uri.fsPath;
  return {
    id: uri.toString(),
    type: "item",
    label: fileWithoutExtension,
    description,
    tooltip,
    value: uri,
    buttons: [EDIT_BUTTON, DELETE_BUTTON]
  };
}, "createPromptPickItem");
export {
  createPromptPickItem
};
//# sourceMappingURL=createPromptPickItem.js.map
