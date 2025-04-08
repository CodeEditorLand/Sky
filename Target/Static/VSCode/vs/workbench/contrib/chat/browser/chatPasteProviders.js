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
import { VSBuffer } from "../../../../base/common/buffer.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { createStringDataTransferItem, IDataTransferItem, IReadonlyVSDataTransfer, VSDataTransfer } from "../../../../base/common/dataTransfer.js";
import { HierarchicalKind } from "../../../../base/common/hierarchicalKind.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Mimes } from "../../../../base/common/mime.js";
import { basename, joinPath } from "../../../../base/common/resources.js";
import { URI, UriComponents } from "../../../../base/common/uri.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { DocumentPasteContext, DocumentPasteEdit, DocumentPasteEditProvider, DocumentPasteEditsSession } from "../../../../editor/common/languages.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { localize } from "../../../../nls.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IExtensionService, isProposedApiEnabled } from "../../../services/extensions/common/extensions.js";
import { IChatRequestPasteVariableEntry, IChatRequestVariableEntry } from "../common/chatModel.js";
import { IChatWidgetService } from "./chat.js";
import { ChatInputPart } from "./chatInputPart.js";
import { resizeImage } from "./imageUtils.js";
const COPY_MIME_TYPES = "application/vnd.code.additional-editor-data";
let PasteImageProvider = class {
  constructor(chatWidgetService, extensionService, fileService, environmentService, logService) {
    this.chatWidgetService = chatWidgetService;
    this.extensionService = extensionService;
    this.fileService = fileService;
    this.environmentService = environmentService;
    this.logService = logService;
    this.imagesFolder = joinPath(this.environmentService.workspaceStorageHome, "vscode-chat-images");
    this.cleanupOldImages();
  }
  static {
    __name(this, "PasteImageProvider");
  }
  imagesFolder;
  kind = new HierarchicalKind("chat.attach.image");
  providedPasteEditKinds = [this.kind];
  copyMimeTypes = [];
  pasteMimeTypes = ["image/*"];
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
    const fileReference = await this.createFileForMedia(currClipboard, mimeType);
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
    const edit = createCustomPasteEdit(model, scaledImageContext, mimeType, this.kind, localize("pastedImageAttachment", "Pasted Image Attachment"), this.chatWidgetService);
    return createEditSession(edit);
  }
  async createFileForMedia(dataTransfer, mimeType) {
    const exists = await this.fileService.exists(this.imagesFolder);
    if (!exists) {
      await this.fileService.createFolder(this.imagesFolder);
    }
    const ext = mimeType.split("/")[1] || "png";
    const filename = `image-${Date.now()}.${ext}`;
    const fileUri = joinPath(this.imagesFolder, filename);
    const buffer = VSBuffer.wrap(dataTransfer);
    await this.fileService.writeFile(fileUri, buffer);
    return fileUri;
  }
  async cleanupOldImages() {
    const exists = await this.fileService.exists(this.imagesFolder);
    if (!exists) {
      return;
    }
    const duration = 7 * 24 * 60 * 60 * 1e3;
    const files = await this.fileService.resolve(this.imagesFolder);
    if (!files.children) {
      return;
    }
    await Promise.all(files.children.map(async (file) => {
      try {
        const timestamp = this.getTimestampFromFilename(file.name);
        if (timestamp && Date.now() - timestamp > duration) {
          await this.fileService.del(file.resource);
        }
      } catch (err) {
        this.logService.error("Failed to clean up old images", err);
      }
    }));
  }
  getTimestampFromFilename(filename) {
    const match = filename.match(/image-(\d+)\./);
    if (match) {
      return parseInt(match[1], 10);
    }
    return void 0;
  }
};
PasteImageProvider = __decorateClass([
  __decorateParam(2, IFileService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, ILogService)
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
  return Object.values(identifier).some(
    (signature) => signature.every((byte, index) => array[index] === byte)
  );
}
__name(isImage, "isImage");
class CopyTextProvider {
  static {
    __name(this, "CopyTextProvider");
  }
  providedPasteEditKinds = [];
  copyMimeTypes = [COPY_MIME_TYPES];
  pasteMimeTypes = [];
  async prepareDocumentPaste(model, ranges, dataTransfer, token) {
    if (model.uri.scheme === ChatInputPart.INPUT_SCHEME) {
      return;
    }
    const customDataTransfer = new VSDataTransfer();
    const data = { range: ranges[0], uri: model.uri.toJSON() };
    customDataTransfer.append(COPY_MIME_TYPES, createStringDataTransferItem(JSON.stringify(data)));
    return customDataTransfer;
  }
}
class PasteTextProvider {
  constructor(chatWidgetService, modelService) {
    this.chatWidgetService = chatWidgetService;
    this.modelService = modelService;
  }
  static {
    __name(this, "PasteTextProvider");
  }
  kind = new HierarchicalKind("chat.attach.text");
  providedPasteEditKinds = [this.kind];
  copyMimeTypes = [];
  pasteMimeTypes = [COPY_MIME_TYPES];
  async provideDocumentPasteEdits(model, ranges, dataTransfer, context, token) {
    if (model.uri.scheme !== ChatInputPart.INPUT_SCHEME) {
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
    const edit = createCustomPasteEdit(model, copiedContext, Mimes.text, this.kind, localize("pastedCodeAttachment", "Pasted Code Attachment"), this.chatWidgetService);
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
  const customEdit = {
    resource: model.uri,
    variable: context,
    undo: /* @__PURE__ */ __name(() => {
      const widget = chatWidgetService.getWidgetByInputUri(model.uri);
      if (!widget) {
        throw new Error("No widget found for undo");
      }
      widget.attachmentModel.delete(context.id);
    }, "undo"),
    redo: /* @__PURE__ */ __name(() => {
      const widget = chatWidgetService.getWidgetByInputUri(model.uri);
      if (!widget) {
        throw new Error("No widget found for redo");
      }
      widget.attachmentModel.addContext(context);
    }, "redo"),
    metadata: { needsConfirmation: false, label: context.name }
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
let ChatPasteProvidersFeature = class extends Disposable {
  static {
    __name(this, "ChatPasteProvidersFeature");
  }
  constructor(languageFeaturesService, chatWidgetService, extensionService, fileService, modelService, environmentService, logService) {
    super();
    this._register(languageFeaturesService.documentPasteEditProvider.register({ scheme: ChatInputPart.INPUT_SCHEME, pattern: "*", hasAccessToAllModels: true }, new PasteImageProvider(chatWidgetService, extensionService, fileService, environmentService, logService)));
    this._register(languageFeaturesService.documentPasteEditProvider.register({ scheme: ChatInputPart.INPUT_SCHEME, pattern: "*", hasAccessToAllModels: true }, new PasteTextProvider(chatWidgetService, modelService)));
    this._register(languageFeaturesService.documentPasteEditProvider.register("*", new CopyTextProvider()));
  }
};
ChatPasteProvidersFeature = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IChatWidgetService),
  __decorateParam(2, IExtensionService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IModelService),
  __decorateParam(5, IEnvironmentService),
  __decorateParam(6, ILogService)
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
