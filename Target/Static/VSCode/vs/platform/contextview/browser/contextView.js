import { IContextMenuDelegate } from "../../../base/browser/contextmenu.js";
import { StandardMouseEvent } from "../../../base/browser/mouseEvent.js";
import { AnchorAlignment, AnchorAxisAlignment, IAnchor, IContextViewProvider } from "../../../base/browser/ui/contextview/contextview.js";
import { IAction } from "../../../base/common/actions.js";
import { Event } from "../../../base/common/event.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { IMenuActionOptions, MenuId } from "../../actions/common/actions.js";
import { IContextKeyService } from "../../contextkey/common/contextkey.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
const IContextViewService = createDecorator("contextViewService");
const IContextMenuService = createDecorator("contextMenuService");
export {
  IContextMenuService,
  IContextViewService
};
//# sourceMappingURL=contextView.js.map
