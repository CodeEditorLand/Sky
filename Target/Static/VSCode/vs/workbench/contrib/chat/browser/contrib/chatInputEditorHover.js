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
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { IModelDecoration } from "../../../../../editor/common/model.js";
import { HoverAnchor, HoverAnchorType, HoverParticipantRegistry, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart, IRenderedHoverPart, IRenderedHoverParts, RenderedHoverParts } from "../../../../../editor/contrib/hover/browser/hoverTypes.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IChatWidgetService } from "../chat.js";
import { ChatAgentHover, getChatAgentHoverOptions } from "../chatAgentHover.js";
import { ChatEditorHoverWrapper } from "./editorHoverWrapper.js";
import { IChatAgentData } from "../../common/chatAgents.js";
import { extractAgentAndCommand } from "../../common/chatParserTypes.js";
import * as nls from "../../../../../nls.js";
let ChatAgentHoverParticipant = class {
  constructor(editor, instantiationService, chatWidgetService, commandService) {
    this.editor = editor;
    this.instantiationService = instantiationService;
    this.chatWidgetService = chatWidgetService;
    this.commandService = commandService;
  }
  static {
    __name(this, "ChatAgentHoverParticipant");
  }
  hoverOrdinal = 1;
  computeSync(anchor, _lineDecorations) {
    if (!this.editor.hasModel()) {
      return [];
    }
    const widget = this.chatWidgetService.getWidgetByInputUri(this.editor.getModel().uri);
    if (!widget) {
      return [];
    }
    const { agentPart } = extractAgentAndCommand(widget.parsedInput);
    if (!agentPart) {
      return [];
    }
    if (Range.containsPosition(agentPart.editorRange, anchor.range.getStartPosition())) {
      return [new ChatAgentHoverPart(this, Range.lift(agentPart.editorRange), agentPart.agent)];
    }
    return [];
  }
  renderHoverParts(context, hoverParts) {
    if (!hoverParts.length) {
      return new RenderedHoverParts([]);
    }
    const disposables = new DisposableStore();
    const hover = disposables.add(this.instantiationService.createInstance(ChatAgentHover));
    disposables.add(hover.onDidChangeContents(() => context.onContentsChanged()));
    const hoverPart = hoverParts[0];
    const agent = hoverPart.agent;
    hover.setAgent(agent.id);
    const actions = getChatAgentHoverOptions(() => agent, this.commandService).actions;
    const wrapper = this.instantiationService.createInstance(ChatEditorHoverWrapper, hover.domNode, actions);
    const wrapperNode = wrapper.domNode;
    context.fragment.appendChild(wrapperNode);
    const renderedHoverPart = {
      hoverPart,
      hoverElement: wrapperNode,
      dispose() {
        disposables.dispose();
      }
    };
    return new RenderedHoverParts([renderedHoverPart]);
  }
  getAccessibleContent(hoverPart) {
    return nls.localize("hoverAccessibilityChatAgent", "There is a chat agent hover part here.");
  }
};
ChatAgentHoverParticipant = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IChatWidgetService),
  __decorateParam(3, ICommandService)
], ChatAgentHoverParticipant);
class ChatAgentHoverPart {
  constructor(owner, range, agent) {
    this.owner = owner;
    this.range = range;
    this.agent = agent;
  }
  static {
    __name(this, "ChatAgentHoverPart");
  }
  isValidForHoverAnchor(anchor) {
    return anchor.type === HoverAnchorType.Range && this.range.startColumn <= anchor.range.startColumn && this.range.endColumn >= anchor.range.endColumn;
  }
}
HoverParticipantRegistry.register(ChatAgentHoverParticipant);
export {
  ChatAgentHoverPart,
  ChatAgentHoverParticipant
};
//# sourceMappingURL=chatInputEditorHover.js.map
