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
import { Codicon } from "../../../../../base/common/codicons.js";
import { basename } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { SymbolKinds } from "../../../../../editor/common/languages.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../../nls.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
import { MarkerSeverity } from "../../../../../platform/markers/common/markers.js";
import { isUntitledResourceEditorInput } from "../../../../common/editor.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IExtensionService, isProposedApiEnabled } from "../../../../services/extensions/common/extensions.js";
import { UntitledTextEditorInput } from "../../../../services/untitled/common/untitledTextEditorInput.js";
import { createNotebookOutputVariableEntry, NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT_CONST } from "../../../notebook/browser/contrib/chat/notebookChatUtils.js";
import { getOutputViewModelFromId } from "../../../notebook/browser/controller/cellOutputActions.js";
import { getNotebookEditorFromEditorPane } from "../../../notebook/browser/notebookBrowser.js";
import { CHAT_ATTACHABLE_IMAGE_MIME_TYPES, getAttachableImageExtension } from "../../common/model/chatModel.js";
import { IDiagnosticVariableEntryFilterData, toPromptFileVariableEntry, PromptFileVariableKind } from "../../common/attachments/chatVariableEntries.js";
import { getPromptsTypeForLanguageId, PromptsType } from "../../common/promptSyntax/promptTypes.js";
import { imageToHash } from "../widget/input/editor/chatPasteProviders.js";
import { resizeImage } from "../chatImageUtils.js";
const IChatAttachmentResolveService = createDecorator("IChatAttachmentResolveService");
let ChatAttachmentResolveService = class ChatAttachmentResolveService2 {
  static {
    __name(this, "ChatAttachmentResolveService");
  }
  constructor(fileService, editorService, textModelService, extensionService, dialogService) {
    this.fileService = fileService;
    this.editorService = editorService;
    this.textModelService = textModelService;
    this.extensionService = extensionService;
    this.dialogService = dialogService;
  }
  // --- EDITORS ---
  async resolveEditorAttachContext(editor) {
    if (isUntitledResourceEditorInput(editor)) {
      return await this.resolveUntitledEditorAttachContext(editor);
    }
    if (!editor.resource) {
      return void 0;
    }
    let stat;
    try {
      stat = await this.fileService.stat(editor.resource);
    } catch {
      return void 0;
    }
    if (!stat.isDirectory && !stat.isFile) {
      return void 0;
    }
    const imageContext = await this.resolveImageEditorAttachContext(editor.resource);
    if (imageContext) {
      return this.extensionService.extensions.some((ext) => isProposedApiEnabled(ext, "chatReferenceBinaryData")) ? imageContext : void 0;
    }
    return await this.resolveResourceAttachContext(editor.resource, stat.isDirectory);
  }
  async resolveUntitledEditorAttachContext(editor) {
    if (editor.resource) {
      return await this.resolveResourceAttachContext(editor.resource, false);
    }
    const openUntitledEditors = this.editorService.editors.filter((editor2) => editor2 instanceof UntitledTextEditorInput);
    for (const canidate of openUntitledEditors) {
      const model = await canidate.resolve();
      const contents = model.textEditorModel?.getValue();
      if (contents === editor.contents) {
        return await this.resolveResourceAttachContext(canidate.resource, false);
      }
    }
    return void 0;
  }
  async resolveResourceAttachContext(resource, isDirectory) {
    let omittedState = 0;
    if (!isDirectory) {
      let languageId;
      try {
        const createdModel = await this.textModelService.createModelReference(resource);
        languageId = createdModel.object.getLanguageId();
        createdModel.dispose();
      } catch {
        omittedState = 2;
      }
      if (/\.(svg)$/i.test(resource.path)) {
        omittedState = 2;
      }
      if (languageId) {
        const promptsType = getPromptsTypeForLanguageId(languageId);
        if (promptsType === PromptsType.prompt) {
          return toPromptFileVariableEntry(resource, PromptFileVariableKind.PromptFile);
        } else if (promptsType === PromptsType.instructions) {
          return toPromptFileVariableEntry(resource, PromptFileVariableKind.Instruction);
        }
      }
    }
    return {
      kind: isDirectory ? "directory" : "file",
      value: resource,
      id: resource.toString(),
      name: basename(resource),
      omittedState
    };
  }
  // --- IMAGES ---
  async resolveImageEditorAttachContext(resource, data, mimeType) {
    if (!resource) {
      return void 0;
    }
    if (mimeType) {
      if (!getAttachableImageExtension(mimeType)) {
        return void 0;
      }
    } else {
      const match = SUPPORTED_IMAGE_EXTENSIONS_REGEX.exec(resource.path);
      if (!match) {
        return void 0;
      }
      mimeType = getMimeTypeFromPath(match);
    }
    const fileName = basename(resource);
    let dataBuffer;
    if (data) {
      dataBuffer = data;
    } else {
      let stat;
      try {
        stat = await this.fileService.stat(resource);
      } catch {
        return void 0;
      }
      const readFile = await this.fileService.readFile(resource);
      if (stat.size > 30 * 1024 * 1024) {
        this.dialogService.error(localize("imageTooLarge", "Image is too large"), localize("imageTooLargeMessage", "The image {0} is too large to be attached.", fileName));
        throw new Error("Image is too large");
      }
      dataBuffer = readFile.value;
    }
    const isPartiallyOmitted = /\.gif$/i.test(resource.path);
    const imageFileContext = await this.resolveImageAttachContext([{
      id: resource.toString(),
      name: fileName,
      data: dataBuffer.buffer,
      icon: Codicon.fileMedia,
      resource,
      mimeType,
      omittedState: isPartiallyOmitted ? 1 : 0
      /* OmittedState.NotOmitted */
    }]);
    return imageFileContext[0];
  }
  resolveImageAttachContext(images) {
    return Promise.all(images.map(async (image) => ({
      id: image.id || await imageToHash(image.data),
      name: image.name,
      fullName: image.resource ? image.resource.path : void 0,
      value: await resizeImage(image.data, image.mimeType),
      icon: image.icon,
      kind: "image",
      isFile: false,
      isDirectory: false,
      omittedState: image.omittedState || 0,
      references: image.resource ? [{ reference: image.resource, kind: "reference" }] : []
    })));
  }
  // --- MARKERS ---
  resolveMarkerAttachContext(markers) {
    return markers.map((marker) => {
      let filter;
      if (!("severity" in marker)) {
        filter = { filterUri: URI.revive(marker.uri), filterSeverity: MarkerSeverity.Warning };
      } else {
        filter = IDiagnosticVariableEntryFilterData.fromMarker(marker);
      }
      return IDiagnosticVariableEntryFilterData.toEntry(filter);
    });
  }
  // --- SYMBOLS ---
  resolveSymbolsAttachContext(symbols) {
    return symbols.map((symbol) => {
      const resource = URI.file(symbol.fsPath);
      return {
        kind: "symbol",
        id: symbolId(resource, symbol.range),
        value: { uri: resource, range: symbol.range },
        symbolKind: symbol.kind,
        icon: SymbolKinds.toIcon(symbol.kind),
        fullName: symbol.name,
        name: symbol.name
      };
    });
  }
  // --- NOTEBOOKS ---
  resolveNotebookOutputAttachContext(data) {
    const notebookEditor = getNotebookEditorFromEditorPane(this.editorService.activeEditorPane);
    if (!notebookEditor) {
      return [];
    }
    const outputViewModel = getOutputViewModelFromId(data.outputId, notebookEditor);
    if (!outputViewModel) {
      return [];
    }
    const mimeType = outputViewModel.pickedMimeType?.mimeType;
    if (mimeType && NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT_CONST.includes(mimeType)) {
      const entry = createNotebookOutputVariableEntry(outputViewModel, mimeType, notebookEditor);
      if (!entry) {
        return [];
      }
      return [entry];
    }
    return [];
  }
  // --- DIRECTORIES ---
  async resolveDirectoryImages(directoryUri) {
    const imageEntries = [];
    await this._collectDirectoryImages(directoryUri, imageEntries);
    return imageEntries;
  }
  async _collectDirectoryImages(directoryUri, results) {
    let stat;
    try {
      stat = await this.fileService.resolve(directoryUri);
    } catch {
      return;
    }
    if (!stat.children) {
      return;
    }
    const childPromises = [];
    for (const child of stat.children) {
      if (child.isDirectory && !child.isSymbolicLink) {
        childPromises.push(this._collectDirectoryImages(child.resource, results));
      } else if (child.isFile && !child.isSymbolicLink && SUPPORTED_IMAGE_EXTENSIONS_REGEX.test(child.resource.path)) {
        childPromises.push(this.resolveImageEditorAttachContext(child.resource).then((entry) => {
          if (entry) {
            results.push(entry);
          }
        }).catch(() => {
        }));
      }
    }
    await Promise.all(childPromises);
  }
  // --- SOURCE CONTROL ---
  resolveSourceControlHistoryItemAttachContext(data) {
    return data.map((d) => ({
      id: d.historyItem.id,
      name: d.name,
      value: URI.revive(d.resource),
      historyItem: {
        ...d.historyItem,
        references: []
      },
      kind: "scmHistoryItem"
    }));
  }
};
ChatAttachmentResolveService = __decorate([
  __param(0, IFileService),
  __param(1, IEditorService),
  __param(2, ITextModelService),
  __param(3, IExtensionService),
  __param(4, IDialogService)
], ChatAttachmentResolveService);
function symbolId(resource, range) {
  let rangePart = "";
  if (range) {
    rangePart = `:${range.startLineNumber}`;
    if (range.startLineNumber !== range.endLineNumber) {
      rangePart += `-${range.endLineNumber}`;
    }
  }
  return resource.fsPath + rangePart;
}
__name(symbolId, "symbolId");
const SUPPORTED_IMAGE_EXTENSIONS_REGEX = new RegExp(`\\.(${Object.keys(CHAT_ATTACHABLE_IMAGE_MIME_TYPES).join("|")})$`, "i");
function getMimeTypeFromPath(match) {
  const ext = match[1].toLowerCase();
  return CHAT_ATTACHABLE_IMAGE_MIME_TYPES[ext];
}
__name(getMimeTypeFromPath, "getMimeTypeFromPath");
export {
  ChatAttachmentResolveService,
  IChatAttachmentResolveService
};
//# sourceMappingURL=chatAttachmentResolveService.js.map
