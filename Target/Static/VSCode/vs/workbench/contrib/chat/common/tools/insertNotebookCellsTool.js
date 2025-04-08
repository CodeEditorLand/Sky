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
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../base/common/observable.js";
import { URI, UriComponents } from "../../../../../base/common/uri.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { localize } from "../../../../../nls.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { SaveReason } from "../../../../common/editor.js";
import { ITextFileService } from "../../../../services/textfile/common/textfiles.js";
import { CellUri } from "../../../notebook/common/notebookCommon.js";
import { INotebookService } from "../../../notebook/common/notebookService.js";
import { ICodeMapperService } from "../chatCodeMapperService.js";
import { IChatEditingService } from "../chatEditingService.js";
import { ChatModel } from "../chatModel.js";
import { IChatService } from "../chatService.js";
import { ILanguageModelIgnoredFilesService } from "../ignoredFiles.js";
import { CountTokensCallback, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolResult } from "../languageModelToolsService.js";
import { IToolInputProcessor } from "./tools.js";
const codeInstructions = `
The user is very smart and can understand how to insert cells to their new Notebook files
`;
const ExtensionEditToolId = "vscode_insert_notebook_cells";
const InternalEditToolId = "vscode_insert_notebook_cells_internal";
const EditToolData = {
  id: InternalEditToolId,
  displayName: localize("chat.tools.editFile", "Edit File"),
  modelDescription: `Insert cells into a new notebook n the workspace. Use this tool once per file that needs to be modified, even if there are multiple changes for a file. Generate the "explanation" property first. ${codeInstructions}`,
  source: { type: "internal" },
  inputSchema: {
    type: "object",
    properties: {
      explanation: {
        type: "string",
        description: "A short explanation of the edit being made. Can be the same as the explanation you showed to the user."
      },
      filePath: {
        type: "string",
        description: "An absolute path to the file to edit, or the URI of a untitled, not yet named, file, such as `untitled:Untitled-1."
      },
      cells: {
        type: "array",
        description: "The cells to insert to apply to the file. " + codeInstructions
      }
    },
    required: ["explanation", "filePath", "code"]
  }
};
let EditTool = class {
  constructor(chatService, chatEditingService, codeMapperService, workspaceContextService, ignoredFilesService, textFileService, notebookService) {
    this.chatService = chatService;
    this.chatEditingService = chatEditingService;
    this.codeMapperService = codeMapperService;
    this.workspaceContextService = workspaceContextService;
    this.ignoredFilesService = ignoredFilesService;
    this.textFileService = textFileService;
    this.notebookService = notebookService;
  }
  static {
    __name(this, "EditTool");
  }
  async invoke(invocation, countTokens, token) {
    if (!invocation.context) {
      throw new Error("toolInvocationToken is required for this tool");
    }
    const parameters = invocation.parameters;
    const uri = URI.revive(parameters.file);
    if (!this.workspaceContextService.isInsideWorkspace(uri)) {
      throw new Error(`File ${uri.fsPath} can't be edited because it's not inside the current workspace`);
    }
    if (await this.ignoredFilesService.fileIsIgnored(uri, token)) {
      throw new Error(`File ${uri.fsPath} can't be edited because it is configured to be ignored by Copilot`);
    }
    const model = this.chatService.getSession(invocation.context?.sessionId);
    const request = model.getRequests().at(-1);
    if (request.response?.response.getMarkdown().length) {
      model.acceptResponseProgress(request, {
        kind: "undoStop",
        id: generateUuid()
      });
    }
    model.acceptResponseProgress(request, {
      kind: "markdownContent",
      content: new MarkdownString("\n````\n")
    });
    model.acceptResponseProgress(request, {
      kind: "codeblockUri",
      uri
    });
    model.acceptResponseProgress(request, {
      kind: "markdownContent",
      content: new MarkdownString(parameters.code + "\n````\n")
    });
    const notebookUri = CellUri.parse(uri)?.notebook || uri;
    if (this.notebookService.hasSupportedNotebooks(notebookUri) && this.notebookService.getNotebookTextModel(notebookUri)) {
      model.acceptResponseProgress(request, {
        kind: "notebookEdit",
        edits: [],
        uri: notebookUri
      });
    } else {
      model.acceptResponseProgress(request, {
        kind: "textEdit",
        edits: [],
        uri
      });
    }
    const editSession = this.chatEditingService.getEditingSession(model.sessionId);
    if (!editSession) {
      throw new Error("This tool must be called from within an editing session");
    }
    const result = await this.codeMapperService.mapCode({
      codeBlocks: [{ code: parameters.code, resource: uri, markdownBeforeBlock: parameters.explanation }],
      location: "tool",
      chatRequestId: invocation.chatRequestId
    }, {
      textEdit: /* @__PURE__ */ __name((target, edits) => {
        model.acceptResponseProgress(request, { kind: "textEdit", uri: target, edits });
      }, "textEdit"),
      notebookEdit(target, edits) {
        model.acceptResponseProgress(request, { kind: "notebookEdit", uri: target, edits });
      }
    }, token);
    if (this.notebookService.hasSupportedNotebooks(notebookUri) && this.notebookService.getNotebookTextModel(notebookUri)) {
      model.acceptResponseProgress(request, { kind: "notebookEdit", uri: notebookUri, edits: [], done: true });
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
    await this.textFileService.save(uri, {
      reason: SaveReason.AUTO,
      skipSaveParticipants: true
    });
    return {
      content: [{ kind: "text", value: "The file was edited successfully" }]
    };
  }
  async prepareToolInvocation(parameters, token) {
    return {
      presentation: "hidden"
    };
  }
};
EditTool = __decorateClass([
  __decorateParam(0, IChatService),
  __decorateParam(1, IChatEditingService),
  __decorateParam(2, ICodeMapperService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, ILanguageModelIgnoredFilesService),
  __decorateParam(5, ITextFileService),
  __decorateParam(6, INotebookService)
], EditTool);
class EditToolInputProcessor {
  static {
    __name(this, "EditToolInputProcessor");
  }
  processInput(input) {
    if (!input.filePath) {
      return input;
    }
    const filePath = input.filePath;
    return {
      file: filePath.startsWith("untitled:") ? URI.parse(filePath) : URI.file(filePath),
      explanation: input.explanation,
      code: input.code
    };
  }
}
export {
  EditTool,
  EditToolData,
  EditToolInputProcessor,
  ExtensionEditToolId,
  InternalEditToolId
};
//# sourceMappingURL=insertNotebookCellsTool.js.map
