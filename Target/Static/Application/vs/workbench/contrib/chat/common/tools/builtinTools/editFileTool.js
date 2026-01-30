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
import { MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { URI } from "../../../../../../base/common/uri.js";
import { CellUri } from "../../../../notebook/common/notebookCommon.js";
import { INotebookService } from "../../../../notebook/common/notebookService.js";
import { ICodeMapperService } from "../../editing/chatCodeMapperService.js";
import { IChatService } from "../../chatService/chatService.js";
import { ToolDataSource, ToolInvocationPresentation } from "../languageModelToolsService.js";
import { LocalChatSessionUri } from "../../model/chatUri.js";
const ExtensionEditToolId = "vscode_editFile";
const InternalEditToolId = "vscode_editFile_internal";
const EditToolData = {
  id: InternalEditToolId,
  displayName: "",
  // not used
  modelDescription: "",
  // Not used
  source: ToolDataSource.Internal
};
let EditTool = class EditTool2 {
  static {
    __name(this, "EditTool");
  }
  constructor(chatService, codeMapperService, notebookService) {
    this.chatService = chatService;
    this.codeMapperService = codeMapperService;
    this.notebookService = notebookService;
  }
  async invoke(invocation, countTokens, _progress, token) {
    if (!invocation.context) {
      throw new Error("toolInvocationToken is required for this tool");
    }
    const parameters = invocation.parameters;
    const fileUri = URI.revive(parameters.uri);
    const uri = CellUri.parse(fileUri)?.notebook || fileUri;
    const model = this.chatService.getSession(LocalChatSessionUri.forSession(invocation.context?.sessionId));
    const request = model.getRequests().at(-1);
    model.acceptResponseProgress(request, {
      kind: "markdownContent",
      content: new MarkdownString("\n````\n")
    });
    model.acceptResponseProgress(request, {
      kind: "codeblockUri",
      uri,
      isEdit: true
    });
    model.acceptResponseProgress(request, {
      kind: "markdownContent",
      content: new MarkdownString("\n````\n")
    });
    if (this.notebookService.hasSupportedNotebooks(uri) && this.notebookService.getNotebookTextModel(uri)) {
      model.acceptResponseProgress(request, {
        kind: "notebookEdit",
        edits: [],
        uri
      });
    } else {
      model.acceptResponseProgress(request, {
        kind: "textEdit",
        edits: [],
        uri
      });
    }
    const editSession = model.editingSession;
    if (!editSession) {
      throw new Error("This tool must be called from within an editing session");
    }
    const result = await this.codeMapperService.mapCode({
      codeBlocks: [{ code: parameters.code, resource: uri, markdownBeforeBlock: parameters.explanation }],
      location: "tool",
      chatRequestId: invocation.chatRequestId,
      chatRequestModel: invocation.modelId,
      chatSessionResource: invocation.context.sessionResource
    }, {
      textEdit: /* @__PURE__ */ __name((target, edits) => {
        model.acceptResponseProgress(request, { kind: "textEdit", uri: target, edits });
      }, "textEdit"),
      notebookEdit(target, edits) {
        model.acceptResponseProgress(request, { kind: "notebookEdit", uri: target, edits });
      }
    }, token);
    if (this.notebookService.hasSupportedNotebooks(uri) && this.notebookService.getNotebookTextModel(uri)) {
      model.acceptResponseProgress(request, { kind: "notebookEdit", uri, edits: [], done: true });
    } else {
      model.acceptResponseProgress(request, { kind: "textEdit", uri, edits: [], done: true });
    }
    if (result?.errorMessage) {
      throw new Error(result.errorMessage);
    }
    let dispose;
    await new Promise((resolve) => {
      let wasFileBeingModified = false;
      dispose = autorun((r) => {
        const entries = editSession.entries.read(r);
        const currentFile = entries?.find((e) => e.modifiedURI.toString() === uri.toString());
        if (currentFile) {
          if (currentFile.isCurrentlyBeingModifiedBy.read(r)) {
            wasFileBeingModified = true;
          } else if (wasFileBeingModified) {
            resolve(true);
          }
        }
      });
    }).finally(() => {
      dispose.dispose();
    });
    return {
      content: [{ kind: "text", value: "The file was edited successfully" }]
    };
  }
  async prepareToolInvocation(context, token) {
    return {
      presentation: ToolInvocationPresentation.Hidden
    };
  }
};
EditTool = __decorate([
  __param(0, IChatService),
  __param(1, ICodeMapperService),
  __param(2, INotebookService)
], EditTool);
export {
  EditTool,
  EditToolData,
  ExtensionEditToolId,
  InternalEditToolId
};
//# sourceMappingURL=editFileTool.js.map
