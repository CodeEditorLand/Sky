var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./media/editorHoverWrapper.css";
import * as dom from "../../../../../base/browser/dom.js";
import { HoverAction } from "../../../../../base/browser/ui/hover/hoverWidget.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
const $ = dom.$;
const h = dom.h;
let ChatEditorHoverWrapper = class ChatEditorHoverWrapper2 {
  static {
    __name(this, "ChatEditorHoverWrapper");
  }
  constructor(hoverContentElement, actions, keybindingService) {
    this.keybindingService = keybindingService;
    const hoverElement = h(".chat-editor-hover-wrapper@root", [h(".chat-editor-hover-wrapper-content@content")]);
    this.domNode = hoverElement.root;
    hoverElement.content.appendChild(hoverContentElement);
    if (actions && actions.length > 0) {
      const statusBarElement = $(".hover-row.status-bar");
      const actionsElement = $(".actions");
      actions.forEach((action) => {
        const keybinding = this.keybindingService.lookupKeybinding(action.commandId);
        const keybindingLabel = keybinding ? keybinding.getLabel() : null;
        HoverAction.render(actionsElement, {
          label: action.label,
          commandId: action.commandId,
          run: /* @__PURE__ */ __name((e) => {
            action.run(e);
          }, "run"),
          iconClass: action.iconClass
        }, keybindingLabel);
      });
      statusBarElement.appendChild(actionsElement);
      this.domNode.appendChild(statusBarElement);
    }
  }
};
ChatEditorHoverWrapper = __decorate([
  __param(2, IKeybindingService)
], ChatEditorHoverWrapper);
export {
  ChatEditorHoverWrapper
};
//# sourceMappingURL=editorHoverWrapper.js.map
