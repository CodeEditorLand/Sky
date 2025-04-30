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
import { DataTransfers } from "../../../../base/browser/dnd.js";
import { $, DragAndDropObserver } from "../../../../base/browser/dom.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { coalesce } from "../../../../base/common/arrays.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { UriList } from "../../../../base/common/dataTransfer.js";
import { Mimes } from "../../../../base/common/mime.js";
import { URI } from "../../../../base/common/uri.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../nls.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { CodeDataTransfers, containsDragType, extractEditorsDropData, extractMarkerDropData, extractNotebookCellOutputDropData, extractSymbolDropData } from "../../../../platform/dnd/browser/dnd.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IThemeService, Themable } from "../../../../platform/theme/common/themeService.js";
import { ISharedWebContentExtractorService } from "../../../../platform/webContentExtractor/common/webContentExtractor.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IExtensionService, isProposedApiEnabled } from "../../../services/extensions/common/extensions.js";
import { IChatWidgetService } from "./chat.js";
import { resolveEditorAttachContext, resolveImageAttachContext, resolveMarkerAttachContext, resolveNotebookOutputAttachContext, resolveSymbolsAttachContext } from "./chatAttachmentResolve.js";
import { convertStringToUInt8Array } from "./imageUtils.js";
var ChatDragAndDropType;
(function(ChatDragAndDropType2) {
  ChatDragAndDropType2[ChatDragAndDropType2["FILE_INTERNAL"] = 0] = "FILE_INTERNAL";
  ChatDragAndDropType2[ChatDragAndDropType2["FILE_EXTERNAL"] = 1] = "FILE_EXTERNAL";
  ChatDragAndDropType2[ChatDragAndDropType2["FOLDER"] = 2] = "FOLDER";
  ChatDragAndDropType2[ChatDragAndDropType2["IMAGE"] = 3] = "IMAGE";
  ChatDragAndDropType2[ChatDragAndDropType2["SYMBOL"] = 4] = "SYMBOL";
  ChatDragAndDropType2[ChatDragAndDropType2["HTML"] = 5] = "HTML";
  ChatDragAndDropType2[ChatDragAndDropType2["MARKER"] = 6] = "MARKER";
  ChatDragAndDropType2[ChatDragAndDropType2["NOTEBOOK_CELL_OUTPUT"] = 7] = "NOTEBOOK_CELL_OUTPUT";
})(ChatDragAndDropType || (ChatDragAndDropType = {}));
const IMAGE_DATA_REGEX = /^data:image\/[a-z]+;base64,/;
const URL_REGEX = /^https?:\/\/.+/;
let ChatDragAndDrop = class ChatDragAndDrop2 extends Themable {
  static {
    __name(this, "ChatDragAndDrop");
  }
  constructor(attachmentModel, styles, themeService, extensionService, fileService, editorService, dialogService, textModelService, webContentExtractorService, chatWidgetService, logService) {
    super(themeService);
    this.attachmentModel = attachmentModel;
    this.styles = styles;
    this.extensionService = extensionService;
    this.fileService = fileService;
    this.editorService = editorService;
    this.dialogService = dialogService;
    this.textModelService = textModelService;
    this.webContentExtractorService = webContentExtractorService;
    this.chatWidgetService = chatWidgetService;
    this.logService = logService;
    this.overlays = /* @__PURE__ */ new Map();
    this.overlayTextBackground = "";
    this.currentActiveTarget = void 0;
    this.updateStyles();
  }
  addOverlay(target, overlayContainer) {
    this.removeOverlay(target);
    const { overlay, disposable } = this.createOverlay(target, overlayContainer);
    this.overlays.set(target, { overlay, disposable });
  }
  removeOverlay(target) {
    if (this.currentActiveTarget === target) {
      this.currentActiveTarget = void 0;
    }
    const existingOverlay = this.overlays.get(target);
    if (existingOverlay) {
      existingOverlay.overlay.remove();
      existingOverlay.disposable.dispose();
      this.overlays.delete(target);
    }
  }
  createOverlay(target, overlayContainer) {
    const overlay = document.createElement("div");
    overlay.classList.add("chat-dnd-overlay");
    this.updateOverlayStyles(overlay);
    overlayContainer.appendChild(overlay);
    const disposable = new DragAndDropObserver(target, {
      onDragOver: /* @__PURE__ */ __name((e) => {
        e.stopPropagation();
        e.preventDefault();
        if (target === this.currentActiveTarget) {
          return;
        }
        if (this.currentActiveTarget) {
          this.setOverlay(this.currentActiveTarget, void 0);
        }
        this.currentActiveTarget = target;
        this.onDragEnter(e, target);
      }, "onDragOver"),
      onDragLeave: /* @__PURE__ */ __name((e) => {
        if (target === this.currentActiveTarget) {
          this.currentActiveTarget = void 0;
        }
        this.onDragLeave(e, target);
      }, "onDragLeave"),
      onDrop: /* @__PURE__ */ __name((e) => {
        e.stopPropagation();
        e.preventDefault();
        if (target !== this.currentActiveTarget) {
          return;
        }
        this.currentActiveTarget = void 0;
        this.onDrop(e, target);
      }, "onDrop")
    });
    return { overlay, disposable };
  }
  onDragEnter(e, target) {
    const estimatedDropType = this.guessDropType(e);
    this.updateDropFeedback(e, target, estimatedDropType);
  }
  onDragLeave(e, target) {
    this.updateDropFeedback(e, target, void 0);
  }
  onDrop(e, target) {
    this.updateDropFeedback(e, target, void 0);
    this.drop(e);
  }
  async drop(e) {
    const contexts = await this.resolveAttachmentsFromDragEvent(e);
    if (contexts.length === 0) {
      return;
    }
    this.attachmentModel.addContext(...contexts);
  }
  updateDropFeedback(e, target, dropType) {
    const showOverlay = dropType !== void 0;
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = showOverlay ? "copy" : "none";
    }
    this.setOverlay(target, dropType);
  }
  guessDropType(e) {
    if (containsDragType(e, CodeDataTransfers.NOTEBOOK_CELL_OUTPUT)) {
      return ChatDragAndDropType.NOTEBOOK_CELL_OUTPUT;
    } else if (containsImageDragType(e)) {
      return this.extensionService.extensions.some((ext) => isProposedApiEnabled(ext, "chatReferenceBinaryData")) ? ChatDragAndDropType.IMAGE : void 0;
    } else if (containsDragType(e, "text/html")) {
      return ChatDragAndDropType.HTML;
    } else if (containsDragType(e, CodeDataTransfers.SYMBOLS)) {
      return ChatDragAndDropType.SYMBOL;
    } else if (containsDragType(e, CodeDataTransfers.MARKERS)) {
      return ChatDragAndDropType.MARKER;
    } else if (containsDragType(e, DataTransfers.FILES)) {
      return ChatDragAndDropType.FILE_EXTERNAL;
    } else if (containsDragType(e, CodeDataTransfers.EDITORS)) {
      return ChatDragAndDropType.FILE_INTERNAL;
    } else if (containsDragType(e, Mimes.uriList, CodeDataTransfers.FILES, DataTransfers.RESOURCES, DataTransfers.INTERNAL_URI_LIST)) {
      return ChatDragAndDropType.FOLDER;
    }
    return void 0;
  }
  isDragEventSupported(e) {
    const dropType = this.guessDropType(e);
    return dropType !== void 0;
  }
  getDropTypeName(type) {
    switch (type) {
      case ChatDragAndDropType.FILE_INTERNAL:
        return localize("file", "File");
      case ChatDragAndDropType.FILE_EXTERNAL:
        return localize("file", "File");
      case ChatDragAndDropType.FOLDER:
        return localize("folder", "Folder");
      case ChatDragAndDropType.IMAGE:
        return localize("image", "Image");
      case ChatDragAndDropType.SYMBOL:
        return localize("symbol", "Symbol");
      case ChatDragAndDropType.MARKER:
        return localize("problem", "Problem");
      case ChatDragAndDropType.HTML:
        return localize("url", "URL");
      case ChatDragAndDropType.NOTEBOOK_CELL_OUTPUT:
        return localize("notebookOutput", "Output");
    }
  }
  async resolveAttachmentsFromDragEvent(e) {
    if (!this.isDragEventSupported(e)) {
      return [];
    }
    if (containsDragType(e, CodeDataTransfers.NOTEBOOK_CELL_OUTPUT)) {
      const notebookOutputData = extractNotebookCellOutputDropData(e);
      if (notebookOutputData) {
        return resolveNotebookOutputAttachContext(notebookOutputData, this.editorService);
      }
    }
    const markerData = extractMarkerDropData(e);
    if (markerData) {
      return resolveMarkerAttachContext(markerData);
    }
    if (containsDragType(e, CodeDataTransfers.SYMBOLS)) {
      const symbolsData = extractSymbolDropData(e);
      return resolveSymbolsAttachContext(symbolsData);
    }
    const editorDragData = extractEditorsDropData(e);
    if (editorDragData.length > 0) {
      return coalesce(await Promise.all(editorDragData.map((editorInput) => {
        return resolveEditorAttachContext(editorInput, this.fileService, this.editorService, this.textModelService, this.extensionService, this.dialogService);
      })));
    }
    const internal = e.dataTransfer?.getData(DataTransfers.INTERNAL_URI_LIST);
    if (internal) {
      const uriList = UriList.parse(internal);
      if (uriList.length) {
        return coalesce(await Promise.all(uriList.map((uri) => resolveEditorAttachContext({ resource: URI.parse(uri) }, this.fileService, this.editorService, this.textModelService, this.extensionService, this.dialogService))));
      }
    }
    if (!containsDragType(e, DataTransfers.INTERNAL_URI_LIST) && containsDragType(e, Mimes.uriList) && (containsDragType(e, Mimes.html) || containsDragType(e, Mimes.text))) {
      return this.resolveHTMLAttachContext(e);
    }
    return [];
  }
  async downloadImageAsUint8Array(url) {
    try {
      const extractedImages = await this.webContentExtractorService.readImage(URI.parse(url), CancellationToken.None);
      if (extractedImages) {
        return extractedImages.buffer;
      }
    } catch (error) {
      this.logService.warn("Fetch failed:", error);
    }
    const selection = this.chatWidgetService.lastFocusedWidget?.inputEditor.getSelection();
    if (selection && this.chatWidgetService.lastFocusedWidget) {
      this.chatWidgetService.lastFocusedWidget.inputEditor.executeEdits("chatInsertUrl", [{ range: selection, text: url }]);
    }
    this.logService.warn(`Image URLs must end in .jpg, .png, .gif, .webp, or .bmp. Failed to fetch image from this URL: ${url}`);
    return void 0;
  }
  async resolveHTMLAttachContext(e) {
    const existingAttachmentNames = new Set(this.attachmentModel.attachments.map((attachment) => attachment.name));
    const createDisplayName = /* @__PURE__ */ __name(() => {
      const baseName = localize("dragAndDroppedImageName", "Image from URL");
      let uniqueName = baseName;
      let baseNameInstance = 1;
      while (existingAttachmentNames.has(uniqueName)) {
        uniqueName = `${baseName} ${++baseNameInstance}`;
      }
      existingAttachmentNames.add(uniqueName);
      return uniqueName;
    }, "createDisplayName");
    const getImageTransferDataFromUrl = /* @__PURE__ */ __name(async (url) => {
      const resource = URI.parse(url);
      if (IMAGE_DATA_REGEX.test(url)) {
        return { data: convertStringToUInt8Array(url), name: createDisplayName(), resource };
      }
      if (URL_REGEX.test(url)) {
        const data = await this.downloadImageAsUint8Array(url);
        if (data) {
          return { data, name: createDisplayName(), resource, id: url };
        }
      }
      return void 0;
    }, "getImageTransferDataFromUrl");
    const getImageTransferDataFromFile = /* @__PURE__ */ __name(async (file) => {
      try {
        const buffer = await file.arrayBuffer();
        return { data: new Uint8Array(buffer), name: createDisplayName() };
      } catch (error) {
        this.logService.error("Error reading file:", error);
      }
      return void 0;
    }, "getImageTransferDataFromFile");
    const imageTransferData = [];
    const imageFiles = extractImageFilesFromDragEvent(e);
    if (imageFiles.length) {
      const imageTransferDataFromFiles = await Promise.all(imageFiles.map((file) => getImageTransferDataFromFile(file)));
      imageTransferData.push(...imageTransferDataFromFiles.filter((data) => !!data));
    }
    const imageUrls = extractUrlsFromDragEvent(e);
    if (imageUrls.length) {
      const imageTransferDataFromUrl = await Promise.all(imageUrls.map(getImageTransferDataFromUrl));
      imageTransferData.push(...imageTransferDataFromUrl.filter((data) => !!data));
    }
    return await resolveImageAttachContext(imageTransferData);
  }
  setOverlay(target, type) {
    this.overlayText?.remove();
    this.overlayText = void 0;
    const { overlay } = this.overlays.get(target);
    if (type !== void 0) {
      const iconAndtextElements = renderLabelWithIcons(`$(${Codicon.attach.id}) ${this.getOverlayText(type)}`);
      const htmlElements = iconAndtextElements.map((element) => {
        if (typeof element === "string") {
          return $("span.overlay-text", void 0, element);
        }
        return element;
      });
      this.overlayText = $("span.attach-context-overlay-text", void 0, ...htmlElements);
      this.overlayText.style.backgroundColor = this.overlayTextBackground;
      overlay.appendChild(this.overlayText);
    }
    overlay.classList.toggle("visible", type !== void 0);
  }
  getOverlayText(type) {
    const typeName = this.getDropTypeName(type);
    return localize("attacAsContext", "Attach {0} as Context", typeName);
  }
  updateOverlayStyles(overlay) {
    overlay.style.backgroundColor = this.getColor(this.styles.overlayBackground) || "";
    overlay.style.color = this.getColor(this.styles.listForeground) || "";
  }
  updateStyles() {
    this.overlays.forEach((overlay) => this.updateOverlayStyles(overlay.overlay));
    this.overlayTextBackground = this.getColor(this.styles.listBackground) || "";
  }
};
ChatDragAndDrop = __decorate([
  __param(2, IThemeService),
  __param(3, IExtensionService),
  __param(4, IFileService),
  __param(5, IEditorService),
  __param(6, IDialogService),
  __param(7, ITextModelService),
  __param(8, ISharedWebContentExtractorService),
  __param(9, IChatWidgetService),
  __param(10, ILogService)
], ChatDragAndDrop);
function containsImageDragType(e) {
  if (containsDragType(e, "image")) {
    return true;
  }
  if (containsDragType(e, DataTransfers.FILES)) {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      return Array.from(files).some((file) => file.type.startsWith("image/"));
    }
    const items = e.dataTransfer?.items;
    if (items && items.length > 0) {
      return Array.from(items).some((item) => item.type.startsWith("image/"));
    }
  }
  return false;
}
__name(containsImageDragType, "containsImageDragType");
function extractUrlsFromDragEvent(e, logService) {
  const textUrl = e.dataTransfer?.getData("text/uri-list");
  if (textUrl) {
    try {
      const urls = UriList.parse(textUrl);
      if (urls.length > 0) {
        return urls;
      }
    } catch (error) {
      logService?.error("Error parsing URI list:", error);
      return [];
    }
  }
  return [];
}
__name(extractUrlsFromDragEvent, "extractUrlsFromDragEvent");
function extractImageFilesFromDragEvent(e) {
  const files = e.dataTransfer?.files;
  if (!files) {
    return [];
  }
  return Array.from(files).filter((file) => file.type.startsWith("image/"));
}
__name(extractImageFilesFromDragEvent, "extractImageFilesFromDragEvent");
export {
  ChatDragAndDrop
};
//# sourceMappingURL=chatDragAndDrop.js.map
