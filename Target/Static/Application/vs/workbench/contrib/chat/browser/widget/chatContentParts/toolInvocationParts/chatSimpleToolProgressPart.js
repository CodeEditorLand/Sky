var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
var ChatSimpleToolProgressPart_1;
import { ProgressBar } from "../../../../../../../base/browser/ui/progressbar/progressbar.js";
import { Lazy } from "../../../../../../../base/common/lazy.js";
import { toDisposable } from "../../../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../../../base/common/observable.js";
import { ILanguageService } from "../../../../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../../../../editor/common/services/model.js";
import { IConfigurationService } from "../../../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../../../platform/instantiation/common/instantiation.js";
import { ChatConfiguration } from "../../../../common/constants.js";
import { IChatToolInvocation } from "../../../../common/chatService/chatService.js";
import { ChatCollapsibleInputOutputContentPart } from "../chatToolInputOutputContentPart.js";
import { BaseChatToolInvocationSubPart } from "./chatToolInvocationSubPart.js";
import { getToolApprovalMessage } from "./chatToolPartUtilities.js";
let ChatSimpleToolProgressPart = class ChatSimpleToolProgressPart2 extends BaseChatToolInvocationSubPart {
  static {
    __name(this, "ChatSimpleToolProgressPart");
  }
  static {
    ChatSimpleToolProgressPart_1 = this;
  }
  static {
    this._expandedByDefault = /* @__PURE__ */ new WeakMap();
  }
  get codeblocks() {
    return this.collapsibleListPart.codeblocks;
  }
  constructor(toolInvocation, context, codeBlockStartIndex, message, subtitle, data, isError, instantiationService, modelService, languageService, configurationService) {
    super(toolInvocation);
    let codeBlockIndex = codeBlockStartIndex;
    const createIOPart = /* @__PURE__ */ __name((content, label) => {
      return {
        kind: "code",
        data: content,
        languageId: "plaintext",
        codeBlockIndex: codeBlockIndex++,
        ownerMarkdownPartId: this.codeblocksPartId,
        options: {
          hideToolbar: true,
          reserveWidth: 19,
          maxHeightInLines: 13,
          verticalPadding: 5,
          editorOptions: {
            wordWrap: "on"
          }
        }
      };
    }, "createIOPart");
    const inputPart = createIOPart(data.input, "Input");
    const outputParts = data.output ? [createIOPart(data.output, "Output")] : void 0;
    const collapsibleListPart = this.collapsibleListPart = this._register(instantiationService.createInstance(
      ChatCollapsibleInputOutputContentPart,
      message,
      subtitle,
      this.getAutoApprovalMessageContent(),
      context,
      inputPart,
      outputParts ? { parts: outputParts } : void 0,
      isError,
      // Expand by default when there's an error (if setting enabled),
      // otherwise use the stored expanded state (defaulting to false)
      isError && configurationService.getValue(ChatConfiguration.AutoExpandToolFailures) || (ChatSimpleToolProgressPart_1._expandedByDefault.get(toolInvocation) ?? false)
    ));
    this._register(toDisposable(() => ChatSimpleToolProgressPart_1._expandedByDefault.set(toolInvocation, collapsibleListPart.expanded)));
    const progressObservable = toolInvocation.kind === "toolInvocation" ? toolInvocation.state.map((s, r) => s.type === 2 ? s.progress.read(r) : void 0) : void 0;
    const progressBar = new Lazy(() => this._register(new ProgressBar(collapsibleListPart.domNode)));
    if (progressObservable) {
      this._register(autorun((reader) => {
        const progress = progressObservable?.read(reader);
        if (progress?.message) {
          collapsibleListPart.title = progress.message;
        }
        if (progress?.progress && !IChatToolInvocation.isComplete(toolInvocation, reader)) {
          progressBar.value.setWorked(progress.progress * 100);
        }
      }));
    }
    this.domNode = collapsibleListPart.domNode;
  }
  getAutoApprovalMessageContent() {
    return getToolApprovalMessage(this.toolInvocation);
  }
};
ChatSimpleToolProgressPart = ChatSimpleToolProgressPart_1 = __decorate([
  __param(7, IInstantiationService),
  __param(8, IModelService),
  __param(9, ILanguageService),
  __param(10, IConfigurationService)
], ChatSimpleToolProgressPart);
export {
  ChatSimpleToolProgressPart
};
//# sourceMappingURL=chatSimpleToolProgressPart.js.map
