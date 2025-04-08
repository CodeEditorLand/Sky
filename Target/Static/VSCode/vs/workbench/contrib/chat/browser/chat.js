var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { Selection } from "../../../../editor/common/core/selection.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IViewDescriptorService, ViewContainerLocation } from "../../../common/views.js";
import { IWorkbenchLayoutService, Parts } from "../../../services/layout/browser/layoutService.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { IChatAgentCommand, IChatAgentData } from "../common/chatAgents.js";
import { IChatResponseModel } from "../common/chatModel.js";
import { IParsedChatRequest } from "../common/chatParserTypes.js";
import { CHAT_PROVIDER_ID } from "../common/chatParticipantContribTypes.js";
import { IChatRequestViewModel, IChatResponseViewModel, IChatViewModel } from "../common/chatViewModel.js";
import { ChatAgentLocation, ChatMode } from "../common/constants.js";
import { ChatAttachmentModel } from "./chatAttachmentModel.js";
import { ChatInputPart } from "./chatInputPart.js";
import { ChatViewPane } from "./chatViewPane.js";
import { IChatViewState, IChatWidgetContrib } from "./chatWidget.js";
import { ICodeBlockActionContext } from "./codeBlockPart.js";
const IChatWidgetService = createDecorator("chatWidgetService");
async function showChatView(viewsService) {
  return (await viewsService.openView(ChatViewId))?.widget;
}
__name(showChatView, "showChatView");
function showCopilotView(viewsService, layoutService) {
  if (layoutService.activeContainer !== layoutService.mainContainer) {
    layoutService.mainContainer.focus();
  }
  return showChatView(viewsService);
}
__name(showCopilotView, "showCopilotView");
function ensureSideBarChatViewSize(viewDescriptorService, layoutService, viewsService) {
  const location = viewDescriptorService.getViewLocationById(ChatViewId);
  if (location === ViewContainerLocation.Panel) {
    return;
  }
  const viewPart = location === ViewContainerLocation.Sidebar ? Parts.SIDEBAR_PART : Parts.AUXILIARYBAR_PART;
  const partSize = layoutService.getSize(viewPart);
  let adjustedChatWidth;
  if (partSize.width < 400 && layoutService.mainContainerDimension.width > 1200) {
    adjustedChatWidth = 400;
  } else if (partSize.width < 300) {
    adjustedChatWidth = 300;
  }
  if (typeof adjustedChatWidth === "number") {
    layoutService.setSize(viewPart, { width: adjustedChatWidth, height: partSize.height });
  }
}
__name(ensureSideBarChatViewSize, "ensureSideBarChatViewSize");
const IQuickChatService = createDecorator("quickChatService");
const IChatAccessibilityService = createDecorator("chatAccessibilityService");
const IChatCodeBlockContextProviderService = createDecorator("chatCodeBlockContextProviderService");
const ChatViewId = `workbench.panel.chat.view.${CHAT_PROVIDER_ID}`;
export {
  ChatViewId,
  IChatAccessibilityService,
  IChatCodeBlockContextProviderService,
  IChatWidgetService,
  IQuickChatService,
  ensureSideBarChatViewSize,
  showChatView,
  showCopilotView
};
//# sourceMappingURL=chat.js.map
