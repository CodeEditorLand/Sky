var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../base/common/codicons.js";
import { createStringDataTransferItem, VSDataTransfer } from "../../../../base/common/dataTransfer.js";
import { HierarchicalKind } from "../../../../base/common/hierarchicalKind.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { revive } from "../../../../base/common/marshalling.js";
import { Mimes } from "../../../../base/common/mime.js";
import { Schemas } from "../../../../base/common/network.js";
import { basename, joinPath } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { localize } from "../../../../nls.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IExtensionService, isProposedApiEnabled } from "../../../services/extensions/common/extensions.js";
import { IChatVariablesService } from "../common/chatVariables.js";
import { IChatWidgetService } from "./chat.js";
import { ChatDynamicVariableModel } from "./contrib/chatDynamicVariables.js";
import { cleanupOldImages, createFileForMedia, resizeImage } from "./imageUtils.js";
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
var CopyAttachmentsProvider_1;
const COPY_MIME_TYPES = "application/vnd.code.additional-editor-data";
let PasteImageProvider = class PasteImageProvider2 {
  static {
    __name(this, "PasteImageProvider");
  }
  constructor(chatWidgetService, extensionService, fileService, environmentService, logService) {
    this.chatWidgetService = chatWidgetService;
    this.extensionService = extensionService;
    this.fileService = fileService;
    this.environmentService = environmentService;
    this.logService = logService;
    this.kind = new HierarchicalKind("chat.attach.image");
    this.providedPasteEditKinds = [this.kind];
    this.copyMimeTypes = [];
    this.pasteMimeTypes = ["image/*"];
    this.imagesFolder = joinPath(this.environmentService.workspaceStorageHome, "vscode-chat-images");
    cleanupOldImages(this.fileService, this.logService, this.imagesFolder);
  }
  async provideDocumentPasteEdits(model, ranges, dataTransfer, context, token) {
    if (!this.extensionService.extensions.some((ext) => isProposedApiEnabled(ext, "chatReferenceBinaryData"))) {
      return;
    }
    const supportedMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/bmp",
      "image/gif",
      "image/tiff"
    ];
    let mimeType;
    let imageItem;
    for (const type of supportedMimeTypes) {
      imageItem = dataTransfer.get(type);
      if (imageItem) {
        mimeType = type;
        break;
      }
    }
    if (!imageItem || !mimeType) {
      return;
    }
    const currClipboard = await imageItem.asFile()?.data();
    if (token.isCancellationRequested || !currClipboard) {
      return;
    }
    const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
    if (!widget) {
      return;
    }
    const attachedVariables = widget.attachmentModel.attachments;
    const displayName = localize("pastedImageName", "Pasted Image");
    let tempDisplayName = displayName;
    for (let appendValue = 2; attachedVariables.some((attachment) => attachment.name === tempDisplayName); appendValue++) {
      tempDisplayName = `${displayName} ${appendValue}`;
    }
    const fileReference = await createFileForMedia(this.fileService, this.imagesFolder, currClipboard, mimeType);
    if (token.isCancellationRequested || !fileReference) {
      return;
    }
    const scaledImageData = await resizeImage(currClipboard);
    if (token.isCancellationRequested || !scaledImageData) {
      return;
    }
    const scaledImageContext = await getImageAttachContext(scaledImageData, mimeType, token, tempDisplayName, fileReference);
    if (token.isCancellationRequested || !scaledImageContext) {
      return;
    }
    widget.attachmentModel.addContext(scaledImageContext);
    const currentContextIds = widget.attachmentModel.getAttachmentIDs();
    if (currentContextIds.has(scaledImageContext.id)) {
      return;
    }
    const edit = createCustomPasteEdit(model, [scaledImageContext], mimeType, this.kind, localize("pastedImageAttachment", "Pasted Image Attachment"), this.chatWidgetService);
    return createEditSession(edit);
  }
};
PasteImageProvider = __decorate([
  __param(2, IFileService),
  __param(3, IEnvironmentService),
  __param(4, ILogService)
], PasteImageProvider);
async function getImageAttachContext(data, mimeType, token, displayName, resource) {
  const imageHash = await imageToHash(data);
  if (token.isCancellationRequested) {
    return void 0;
  }
  return {
    kind: "image",
    value: data,
    id: imageHash,
    name: displayName,
    icon: Codicon.fileMedia,
    mimeType,
    isPasted: true,
    references: [{ reference: resource, kind: "reference" }]
  };
}
__name(getImageAttachContext, "getImageAttachContext");
async function imageToHash(data) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(imageToHash, "imageToHash");
function isImage(array) {
  if (array.length < 4) {
    return false;
  }
  const identifier = {
    png: [137, 80, 78, 71, 13, 10, 26, 10],
    jpeg: [255, 216, 255],
    bmp: [66, 77],
    gif: [71, 73, 70, 56],
    tiff: [73, 73, 42, 0]
  };
  return Object.values(identifier).some((signature) => signature.every((byte, index) => array[index] === byte));
}
__name(isImage, "isImage");
class CopyTextProvider {
  static {
    __name(this, "CopyTextProvider");
  }
  constructor() {
    this.providedPasteEditKinds = [];
    this.copyMimeTypes = [COPY_MIME_TYPES];
    this.pasteMimeTypes = [];
  }
  async prepareDocumentPaste(model, ranges, dataTransfer, token) {
    if (model.uri.scheme === Schemas.vscodeChatInput) {
      return;
    }
    const customDataTransfer = new VSDataTransfer();
    const data = { range: ranges[0], uri: model.uri.toJSON() };
    customDataTransfer.append(COPY_MIME_TYPES, createStringDataTransferItem(JSON.stringify(data)));
    return customDataTransfer;
  }
}
let CopyAttachmentsProvider = class CopyAttachmentsProvider2 {
  static {
    __name(this, "CopyAttachmentsProvider");
  }
  static {
    CopyAttachmentsProvider_1 = this;
  }
  static {
    this.ATTACHMENT_MIME_TYPE = "application/vnd.chat.attachment+json";
  }
  constructor(chatWidgetService, chatVariableService) {
    this.chatWidgetService = chatWidgetService;
    this.chatVariableService = chatVariableService;
    this.kind = new HierarchicalKind("chat.attach.attachments");
    this.providedPasteEditKinds = [this.kind];
    this.copyMimeTypes = [CopyAttachmentsProvider_1.ATTACHMENT_MIME_TYPE];
    this.pasteMimeTypes = [CopyAttachmentsProvider_1.ATTACHMENT_MIME_TYPE];
  }
  async prepareDocumentPaste(model, _ranges, _dataTransfer, _token) {
    const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
    if (!widget || !widget.viewModel) {
      return void 0;
    }
    const attachments = widget.attachmentModel.attachments;
    const dynamicVariables = this.chatVariableService.getDynamicVariables(widget.viewModel.sessionId);
    if (attachments.length === 0 && dynamicVariables.length === 0) {
      return void 0;
    }
    const result = new VSDataTransfer();
    result.append(CopyAttachmentsProvider_1.ATTACHMENT_MIME_TYPE, createStringDataTransferItem(JSON.stringify({ attachments, dynamicVariables })));
    return result;
  }
  async provideDocumentPasteEdits(model, _ranges, dataTransfer, _context, token) {
    const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
    if (!widget || !widget.viewModel) {
      return void 0;
    }
    const chatDynamicVariable = widget.getContrib(ChatDynamicVariableModel.ID);
    if (!chatDynamicVariable) {
      return void 0;
    }
    const text = dataTransfer.get(Mimes.text);
    const data = dataTransfer.get(CopyAttachmentsProvider_1.ATTACHMENT_MIME_TYPE);
    const rawData = await data?.asString();
    const textdata = await text?.asString();
    if (textdata === void 0 || rawData === void 0) {
      return;
    }
    if (token.isCancellationRequested) {
      return;
    }
    let pastedData;
    try {
      pastedData = revive(JSON.parse(rawData));
    } catch {
    }
    if (!Array.isArray(pastedData?.attachments) && !Array.isArray(pastedData?.dynamicVariables)) {
      return;
    }
    const edit = {
      insertText: textdata,
      title: localize("pastedChatAttachments", "Insert Prompt & Attachments"),
      kind: this.kind,
      handledMimeType: CopyAttachmentsProvider_1.ATTACHMENT_MIME_TYPE,
      additionalEdit: {
        edits: []
      }
    };
    edit.additionalEdit?.edits.push({
      resource: model.uri,
      redo: /* @__PURE__ */ __name(() => {
        widget.attachmentModel.addContext(...pastedData.attachments);
        for (const dynamicVariable of pastedData.dynamicVariables) {
          chatDynamicVariable?.addReference(dynamicVariable);
        }
        widget.refreshParsedInput();
      }, "redo"),
      undo: /* @__PURE__ */ __name(() => {
        widget.attachmentModel.delete(...pastedData.attachments.map((c) => c.id));
        widget.refreshParsedInput();
      }, "undo")
    });
    return createEditSession(edit);
  }
};
CopyAttachmentsProvider = CopyAttachmentsProvider_1 = __decorate([
  __param(0, IChatWidgetService),
  __param(1, IChatVariablesService)
], CopyAttachmentsProvider);
class PasteTextProvider {
  static {
    __name(this, "PasteTextProvider");
  }
  constructor(chatWidgetService, modelService) {
    this.chatWidgetService = chatWidgetService;
    this.modelService = modelService;
    this.kind = new HierarchicalKind("chat.attach.text");
    this.providedPasteEditKinds = [this.kind];
    this.copyMimeTypes = [];
    this.pasteMimeTypes = [COPY_MIME_TYPES];
  }
  async provideDocumentPasteEdits(model, ranges, dataTransfer, _context, token) {
    if (model.uri.scheme !== Schemas.vscodeChatInput) {
      return;
    }
    const text = dataTransfer.get(Mimes.text);
    const editorData = dataTransfer.get("vscode-editor-data");
    const additionalEditorData = dataTransfer.get(COPY_MIME_TYPES);
    if (!editorData || !text || !additionalEditorData) {
      return;
    }
    const textdata = await text.asString();
    const metadata = JSON.parse(await editorData.asString());
    const additionalData = JSON.parse(await additionalEditorData.asString());
    const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
    if (!widget) {
      return;
    }
    const start = additionalData.range.startLineNumber;
    const end = additionalData.range.endLineNumber;
    if (start === end) {
      const textModel = this.modelService.getModel(URI.revive(additionalData.uri));
      if (!textModel) {
        return;
      }
      const lineContent = textModel.getLineContent(start);
      if (lineContent !== textdata) {
        return;
      }
    }
    const copiedContext = getCopiedContext(textdata, URI.revive(additionalData.uri), metadata.mode, additionalData.range);
    if (token.isCancellationRequested || !copiedContext) {
      return;
    }
    const currentContextIds = widget.attachmentModel.getAttachmentIDs();
    if (currentContextIds.has(copiedContext.id)) {
      return;
    }
    const edit = createCustomPasteEdit(model, [copiedContext], Mimes.text, this.kind, localize("pastedCodeAttachment", "Pasted Code Attachment"), this.chatWidgetService);
    edit.yieldTo = [{ kind: HierarchicalKind.Empty.append("text", "plain") }];
    return createEditSession(edit);
  }
}
function getCopiedContext(code, file, language, range) {
  const fileName = basename(file);
  const start = range.startLineNumber;
  const end = range.endLineNumber;
  const resultText = `Copied Selection of Code: 


 From the file: ${fileName} From lines ${start} to ${end} 
 \`\`\`${code}\`\`\``;
  const pastedLines = start === end ? localize("pastedAttachment.oneLine", "1 line") : localize("pastedAttachment.multipleLines", "{0} lines", end + 1 - start);
  return {
    kind: "paste",
    value: resultText,
    id: `${fileName}${start}${end}${range.startColumn}${range.endColumn}`,
    name: `${fileName} ${pastedLines}`,
    icon: Codicon.code,
    pastedLines,
    language,
    fileName: file.toString(),
    copiedFrom: {
      uri: file,
      range
    },
    code,
    references: [{
      reference: file,
      kind: "reference"
    }]
  };
}
__name(getCopiedContext, "getCopiedContext");
function createCustomPasteEdit(model, context, handledMimeType, kind, title, chatWidgetService) {
  const label = context.length === 1 ? context[0].name : localize("pastedAttachment.multiple", "{0} and {1} more", context[0].name, context.length - 1);
  const customEdit = {
    resource: model.uri,
    variable: context,
    undo: /* @__PURE__ */ __name(() => {
      const widget = chatWidgetService.getWidgetByInputUri(model.uri);
      if (!widget) {
        throw new Error("No widget found for undo");
      }
      widget.attachmentModel.delete(...context.map((c) => c.id));
    }, "undo"),
    redo: /* @__PURE__ */ __name(() => {
      const widget = chatWidgetService.getWidgetByInputUri(model.uri);
      if (!widget) {
        throw new Error("No widget found for redo");
      }
      widget.attachmentModel.addContext(...context);
    }, "redo"),
    metadata: {
      needsConfirmation: false,
      label
    }
  };
  return {
    insertText: "",
    title,
    kind,
    handledMimeType,
    additionalEdit: {
      edits: [customEdit]
    }
  };
}
__name(createCustomPasteEdit, "createCustomPasteEdit");
function createEditSession(edit) {
  return {
    edits: [edit],
    dispose: /* @__PURE__ */ __name(() => {
    }, "dispose")
  };
}
__name(createEditSession, "createEditSession");
let ChatPasteProvidersFeature = class ChatPasteProvidersFeature2 extends Disposable {
  static {
    __name(this, "ChatPasteProvidersFeature");
  }
  constructor(instaService, languageFeaturesService, chatWidgetService, extensionService, fileService, modelService, environmentService, logService) {
    super();
    this._register(languageFeaturesService.documentPasteEditProvider.register({ scheme: Schemas.vscodeChatInput, pattern: "*", hasAccessToAllModels: true }, instaService.createInstance(CopyAttachmentsProvider)));
    this._register(languageFeaturesService.documentPasteEditProvider.register({ scheme: Schemas.vscodeChatInput, pattern: "*", hasAccessToAllModels: true }, new PasteImageProvider(chatWidgetService, extensionService, fileService, environmentService, logService)));
    this._register(languageFeaturesService.documentPasteEditProvider.register({ scheme: Schemas.vscodeChatInput, pattern: "*", hasAccessToAllModels: true }, new PasteTextProvider(chatWidgetService, modelService)));
    this._register(languageFeaturesService.documentPasteEditProvider.register("*", new CopyTextProvider()));
    this._register(languageFeaturesService.documentPasteEditProvider.register("*", new CopyTextProvider()));
  }
};
ChatPasteProvidersFeature = __decorate([
  __param(0, IInstantiationService),
  __param(1, ILanguageFeaturesService),
  __param(2, IChatWidgetService),
  __param(3, IExtensionService),
  __param(4, IFileService),
  __param(5, IModelService),
  __param(6, IEnvironmentService),
  __param(7, ILogService)
], ChatPasteProvidersFeature);
export {
  ChatPasteProvidersFeature,
  CopyTextProvider,
  PasteImageProvider,
  PasteTextProvider,
  imageToHash,
  isImage
};
//# sourceMappingURL=chatPasteProviders.js.map
