import { Event } from "../../../base/common/event.js";
import { IJSONSchema } from "../../../base/common/jsonSchema.js";
import { KeyCode } from "../../../base/common/keyCodes.js";
import { ResolvedKeybinding, Keybinding } from "../../../base/common/keybindings.js";
import { IContextKeyService, IContextKeyServiceTarget } from "../../contextkey/common/contextkey.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { ResolutionResult } from "./keybindingResolver.js";
import { ResolvedKeybindingItem } from "./resolvedKeybindingItem.js";
const IKeybindingService = createDecorator("keybindingService");
export {
  IKeybindingService
};
//# sourceMappingURL=keybinding.js.map
