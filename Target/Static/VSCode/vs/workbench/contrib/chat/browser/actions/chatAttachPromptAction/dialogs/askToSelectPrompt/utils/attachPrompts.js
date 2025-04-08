var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assertDefined, WithUriValue } from "../../../../../../../../../base/common/types.js";
import { IKeyMods, IQuickPickItem } from "../../../../../../../../../platform/quickinput/common/quickInput.js";
import { IChatWidget, showChatView } from "../../../../../chat.js";
import { ACTION_ID_NEW_CHAT } from "../../../../chatClearActions.js";
import { IChatAttachPromptActionOptions } from "../../../chatAttachPromptAction.js";
import { ISelectPromptOptions } from "../askToSelectPrompt.js";
const attachPrompts = /* @__PURE__ */ __name(async (files, options, keyMods) => {
  const widget = await getChatWidgetObject(options, keyMods);
  for (const file of files) {
    widget.attachmentModel.promptInstructions.add(file.value);
  }
  return widget;
}, "attachPrompts");
const getChatWidgetObject = /* @__PURE__ */ __name(async (options, keyMods) => {
  const { widget } = options;
  const { ctrlCmd } = keyMods;
  if (ctrlCmd) {
    return await openNewChat(options);
  }
  if (!widget) {
    return await showExistingChat(options);
  }
  return widget;
}, "getChatWidgetObject");
const openNewChat = /* @__PURE__ */ __name(async (options) => {
  const { commandService, viewsService } = options;
  await commandService.executeCommand(ACTION_ID_NEW_CHAT);
  const widget = await showChatView(viewsService);
  assertDefined(
    widget,
    "Chat widget must be defined."
  );
  return widget;
}, "openNewChat");
const showExistingChat = /* @__PURE__ */ __name(async (options) => {
  const { viewsService } = options;
  const widget = await showChatView(viewsService);
  assertDefined(
    widget,
    "Revealed chat widget must be defined."
  );
  return widget;
}, "showExistingChat");
export {
  attachPrompts
};
//# sourceMappingURL=attachPrompts.js.map
