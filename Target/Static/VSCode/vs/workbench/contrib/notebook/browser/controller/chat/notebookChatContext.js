import { localize } from "../../../../../../nls.js";
import { MenuId } from "../../../../../../platform/actions/common/actions.js";
import { RawContextKey } from "../../../../../../platform/contextkey/common/contextkey.js";
const CTX_NOTEBOOK_CELL_CHAT_FOCUSED = new RawContextKey("notebookCellChatFocused", false, localize("notebookCellChatFocused", "Whether the cell chat editor is focused"));
const CTX_NOTEBOOK_CHAT_HAS_ACTIVE_REQUEST = new RawContextKey("notebookChatHasActiveRequest", false, localize("notebookChatHasActiveRequest", "Whether the cell chat editor has an active request"));
const CTX_NOTEBOOK_CHAT_USER_DID_EDIT = new RawContextKey("notebookChatUserDidEdit", false, localize("notebookChatUserDidEdit", "Whether the user did changes ontop of the notebook cell chat"));
const CTX_NOTEBOOK_CHAT_OUTER_FOCUS_POSITION = new RawContextKey("notebookChatOuterFocusPosition", "", localize("notebookChatOuterFocusPosition", "Whether the focus of the notebook editor is above or below the cell chat"));
const MENU_CELL_CHAT_INPUT = MenuId.for("cellChatInput");
const MENU_CELL_CHAT_WIDGET = MenuId.for("cellChatWidget");
const MENU_CELL_CHAT_WIDGET_STATUS = MenuId.for("cellChatWidget.status");
const MENU_CELL_CHAT_WIDGET_FEEDBACK = MenuId.for("cellChatWidget.feedback");
const MENU_CELL_CHAT_WIDGET_TOOLBAR = MenuId.for("cellChatWidget.toolbar");
const CTX_NOTEBOOK_CHAT_HAS_AGENT = new RawContextKey("notebookChatAgentRegistered", false, localize("notebookChatAgentRegistered", "Whether a chat agent for notebook is registered"));
export {
  CTX_NOTEBOOK_CELL_CHAT_FOCUSED,
  CTX_NOTEBOOK_CHAT_HAS_ACTIVE_REQUEST,
  CTX_NOTEBOOK_CHAT_HAS_AGENT,
  CTX_NOTEBOOK_CHAT_OUTER_FOCUS_POSITION,
  CTX_NOTEBOOK_CHAT_USER_DID_EDIT,
  MENU_CELL_CHAT_INPUT,
  MENU_CELL_CHAT_WIDGET,
  MENU_CELL_CHAT_WIDGET_FEEDBACK,
  MENU_CELL_CHAT_WIDGET_STATUS,
  MENU_CELL_CHAT_WIDGET_TOOLBAR
};
//# sourceMappingURL=notebookChatContext.js.map
