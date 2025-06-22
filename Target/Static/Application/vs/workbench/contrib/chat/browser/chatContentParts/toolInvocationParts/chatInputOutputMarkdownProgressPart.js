var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { decodeBase64 } from "../../../../../../base/common/buffer.js";
import { toDisposable } from "../../../../../../base/common/lifecycle.js";
import { getExtensionForMimeType } from "../../../../../../base/common/mime.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { basename } from "../../../../../../base/common/resources.js";
import { ILanguageService } from "../../../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../../../editor/common/services/model.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ChatResponseResource } from "../../../common/chatModel.js";
import { isResponseVM } from "../../../common/chatViewModel.js";
import { ChatCollapsibleInputOutputContentPart } from "../chatToolInputOutputContentPart.js";
import { BaseChatToolInvocationSubPart } from "./chatToolInvocationSubPart.js";
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
var ChatInputOutputMarkdownProgressPart_1;
let ChatInputOutputMarkdownProgressPart = class ChatInputOutputMarkdownProgressPart2 extends BaseChatToolInvocationSubPart {
  static {
    __name(this, "ChatInputOutputMarkdownProgressPart");
  }
  static {
    ChatInputOutputMarkdownProgressPart_1 = this;
  }
  static {
    this._expandedByDefault = /* @__PURE__ */ new WeakMap();
  }
  get codeblocks() {
    return this._codeblocks;
  }
  constructor(toolInvocation, context, editorPool, codeBlockStartIndex, message, subtitle, input, output, isError, currentWidthDelegate, instantiationService, modelService, languageService) {
    super(toolInvocation);
    this._codeblocks = [];
    let codeBlockIndex = codeBlockStartIndex;
    const toCodePart = /* @__PURE__ */ __name((data) => {
      const model = this._register(modelService.createModel(data, languageService.createById("json"), void 0, true));
      return {
        kind: "code",
        textModel: model,
        languageId: model.getLanguageId(),
        options: {
          hideToolbar: true,
          reserveWidth: 19,
          maxHeightInLines: 13,
          verticalPadding: 5,
          editorOptions: {
            wordWrap: "on"
          }
        },
        codeBlockInfo: {
          codeBlockIndex: codeBlockIndex++,
          codemapperUri: void 0,
          elementId: context.element.id,
          focus: /* @__PURE__ */ __name(() => {
          }, "focus"),
          isStreaming: false,
          ownerMarkdownPartId: this.codeblocksPartId,
          uri: model.uri,
          chatSessionId: context.element.sessionId,
          uriPromise: Promise.resolve(model.uri)
        }
      };
    }, "toCodePart");
    let processedOutput = output;
    if (typeof output === "string") {
      processedOutput = [{ value: output, isText: true }];
    }
    const requestId = isResponseVM(context.element) ? context.element.requestId : context.element.id;
    const collapsibleListPart = this._register(instantiationService.createInstance(ChatCollapsibleInputOutputContentPart, message, subtitle, context, editorPool, toCodePart(input), processedOutput && {
      parts: processedOutput.map((o, i) => {
        const permalinkBasename = o.uri ? basename(o.uri) : o.mimeType && getExtensionForMimeType(o.mimeType) ? `file${getExtensionForMimeType(o.mimeType)}` : "file" + (o.isText ? ".txt" : ".bin");
        const permalinkUri = ChatResponseResource.createUri(context.element.sessionId, requestId, toolInvocation.toolCallId, i, permalinkBasename);
        if (o.isText && !o.asResource) {
          return toCodePart(o.value);
        } else {
          let decoded;
          try {
            if (!o.isText) {
              decoded = decodeBase64(o.value).buffer;
            }
          } catch {
          }
          return { kind: "data", value: decoded || new TextEncoder().encode(o.value), mimeType: o.mimeType, uri: permalinkUri };
        }
      })
    }, isError, ChatInputOutputMarkdownProgressPart_1._expandedByDefault.get(toolInvocation) ?? false, currentWidthDelegate()));
    this._codeblocks.push(...collapsibleListPart.codeblocks);
    this._register(collapsibleListPart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    this._register(toDisposable(() => ChatInputOutputMarkdownProgressPart_1._expandedByDefault.set(toolInvocation, collapsibleListPart.expanded)));
    const progressObservable = toolInvocation.kind === "toolInvocation" ? toolInvocation.progress : void 0;
    if (progressObservable) {
      this._register(autorun((reader) => {
        const progress = progressObservable?.read(reader);
        if (progress.message) {
          collapsibleListPart.title = progress.message;
        }
      }));
    }
    this.domNode = collapsibleListPart.domNode;
  }
};
ChatInputOutputMarkdownProgressPart = ChatInputOutputMarkdownProgressPart_1 = __decorate([
  __param(10, IInstantiationService),
  __param(11, IModelService),
  __param(12, ILanguageService)
], ChatInputOutputMarkdownProgressPart);
export {
  ChatInputOutputMarkdownProgressPart
};
//# sourceMappingURL=chatInputOutputMarkdownProgressPart.js.map
