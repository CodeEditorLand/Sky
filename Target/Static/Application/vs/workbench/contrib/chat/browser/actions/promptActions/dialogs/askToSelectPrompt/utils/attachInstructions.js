var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { showChatView } from "../../../../../chat.js";
import { ACTION_ID_NEW_CHAT } from "../../../../chatClearActions.js";
import { assertDefined } from "../../../../../../../../../base/common/types.js";
const attachInstructionsFiles = /* @__PURE__ */ __name(async (files, options) => {
  const widget = await getChatWidgetObject(options);
  for (const file of files) {
    widget.attachmentModel.promptInstructions.add(file);
  }
  return widget;
}, "attachInstructionsFiles");
const getChatWidgetObject = /* @__PURE__ */ __name(async (options) => {
  const { widget, inNewChat } = options;
  if (inNewChat === true || widget === void 0) {
    return await showChat(options, inNewChat);
  }
  return widget;
}, "getChatWidgetObject");
const showChat = /* @__PURE__ */ __name(async (options, createNew = false) => {
  const { commandService, viewsService } = options;
  if (createNew === true) {
    await commandService.executeCommand(ACTION_ID_NEW_CHAT);
  }
  const widget = await showChatView(viewsService);
  assertDefined(widget, "Chat widget must be defined.");
  return widget;
}, "showChat");
export {
  attachInstructionsFiles,
  getChatWidgetObject
};
//# sourceMappingURL=attachInstructions.js.map
