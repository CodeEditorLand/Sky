var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createMarkdownCommandLink, MarkdownString } from "../../../../../../../base/common/htmlContent.js";
import { localize } from "../../../../../../../nls.js";
import { IChatToolInvocation } from "../../../../common/chatService/chatService.js";
function getToolApprovalMessage(toolInvocation) {
  const reason = IChatToolInvocation.executionConfirmedOrDenied(toolInvocation);
  if (!reason || typeof reason === "boolean") {
    return void 0;
  }
  return getApprovalMessageFromReason(reason);
}
__name(getToolApprovalMessage, "getToolApprovalMessage");
function getApprovalMessageFromReason(reason) {
  let md;
  switch (reason.type) {
    case 2:
      md = localize("chat.autoapprove.setting", "Auto approved by {0}", createMarkdownCommandLink({ text: "`" + reason.id + "`", id: "workbench.action.openSettings", arguments: [reason.id], tooltip: localize("openSettings.tooltip", "Open settings") }, false));
      break;
    case 3:
      md = reason.scope === "session" ? localize("chat.autoapprove.lmServicePerTool.session", "Auto approved for this session") : reason.scope === "workspace" ? localize("chat.autoapprove.lmServicePerTool.workspace", "Auto approved for this workspace") : localize("chat.autoapprove.lmServicePerTool.profile", "Auto approved for this profile");
      md += " (" + createMarkdownCommandLink({ text: localize("edit", "Edit"), id: "workbench.action.chat.editToolApproval", arguments: [reason.scope], tooltip: localize("editToolApproval.tooltip", "Edit tool approval settings") }) + ")";
      break;
    case 1:
      if (reason.reason) {
        return typeof reason.reason === "string" ? new MarkdownString(reason.reason, { isTrusted: true }) : reason.reason;
      }
      return void 0;
    case 4:
    case 0:
    default:
      return void 0;
  }
  return new MarkdownString(md, { isTrusted: true });
}
__name(getApprovalMessageFromReason, "getApprovalMessageFromReason");
export {
  getApprovalMessageFromReason,
  getToolApprovalMessage
};
//# sourceMappingURL=chatToolPartUtilities.js.map
