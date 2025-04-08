var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import "./media/editorHoverWrapper.css";
import * as dom from "../../../../../base/browser/dom.js";
import { IHoverAction } from "../../../../../base/browser/ui/hover/hover.js";
import { HoverAction } from "../../../../../base/browser/ui/hover/hoverWidget.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
const $ = dom.$;
const h = dom.h;
let ChatEditorHoverWrapper = class {
  constructor(hoverContentElement, actions, keybindingService) {
    this.keybindingService = keybindingService;
    const hoverElement = h(
      ".chat-editor-hover-wrapper@root",
      [h(".chat-editor-hover-wrapper-content@content")]
    );
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
  static {
    __name(this, "ChatEditorHoverWrapper");
  }
  domNode;
};
ChatEditorHoverWrapper = __decorateClass([
  __decorateParam(2, IKeybindingService)
], ChatEditorHoverWrapper);
export {
  ChatEditorHoverWrapper
};
//# sourceMappingURL=editorHoverWrapper.js.map
