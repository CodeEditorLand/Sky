import { VSBuffer } from "../../../base/common/buffer.js";
import { Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
import { MessageBoxOptions, MessageBoxReturnValue, OpenDevToolsOptions, OpenDialogOptions, OpenDialogReturnValue, SaveDialogOptions, SaveDialogReturnValue } from "../../../base/parts/sandbox/common/electronTypes.js";
import { ISerializableCommandAction } from "../../action/common/action.js";
import { INativeOpenDialogOptions } from "../../dialogs/common/dialogs.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { IV8Profile } from "../../profiling/common/profiling.js";
import { AuthInfo, Credentials } from "../../request/common/request.js";
import { IPartsSplash } from "../../theme/common/themeService.js";
import { IColorScheme, IOpenedAuxiliaryWindow, IOpenedMainWindow, IOpenEmptyWindowOptions, IOpenWindowOptions, IPoint, IRectangle, IWindowOpenable } from "../../window/common/window.js";
const INativeHostService = createDecorator("nativeHostService");
export {
  INativeHostService
};
//# sourceMappingURL=native.js.map
