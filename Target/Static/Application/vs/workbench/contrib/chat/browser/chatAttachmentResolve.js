var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../base/common/codicons.js";
import { basename } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { SymbolKinds } from "../../../../editor/common/languages.js";
import { localize } from "../../../../nls.js";
import { MarkerSeverity } from "../../../../platform/markers/common/markers.js";
import { isUntitledResourceEditorInput } from "../../../common/editor.js";
import { isProposedApiEnabled } from "../../../services/extensions/common/extensions.js";
import { UntitledTextEditorInput } from "../../../services/untitled/common/untitledTextEditorInput.js";
import { createNotebookOutputVariableEntry, NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT_CONST } from "../../notebook/browser/contrib/chat/notebookChatUtils.js";
import { getOutputViewModelFromId } from "../../notebook/browser/controller/cellOutputActions.js";
import { getNotebookEditorFromEditorPane } from "../../notebook/browser/notebookBrowser.js";
import { IDiagnosticVariableEntryFilterData } from "../common/chatModel.js";
import { imageToHash } from "./chatPasteProviders.js";
import { resizeImage } from "./imageUtils.js";
async function resolveEditorAttachContext(editor, fileService, editorService, textModelService, extensionService, dialogService) {
  if (isUntitledResourceEditorInput(editor)) {
    return await resolveUntitledEditorAttachContext(editor, editorService, textModelService);
  }
  if (!editor.resource) {
    return void 0;
  }
  let stat;
  try {
    stat = await fileService.stat(editor.resource);
  } catch {
    return void 0;
  }
  if (!stat.isDirectory && !stat.isFile) {
    return void 0;
  }
  const imageContext = await resolveImageEditorAttachContext(fileService, dialogService, editor.resource);
  if (imageContext) {
    return extensionService.extensions.some((ext) => isProposedApiEnabled(ext, "chatReferenceBinaryData")) ? imageContext : void 0;
  }
  return await resolveResourceAttachContext(editor.resource, stat.isDirectory, textModelService);
}
__name(resolveEditorAttachContext, "resolveEditorAttachContext");
async function resolveUntitledEditorAttachContext(editor, editorService, textModelService) {
  if (editor.resource) {
    return await resolveResourceAttachContext(editor.resource, false, textModelService);
  }
  const openUntitledEditors = editorService.editors.filter((editor2) => editor2 instanceof UntitledTextEditorInput);
  for (const canidate of openUntitledEditors) {
    const model = await canidate.resolve();
    const contents = model.textEditorModel?.getValue();
    if (contents === editor.contents) {
      return await resolveResourceAttachContext(canidate.resource, false, textModelService);
    }
  }
  return void 0;
}
__name(resolveUntitledEditorAttachContext, "resolveUntitledEditorAttachContext");
async function resolveResourceAttachContext(resource, isDirectory, textModelService) {
  let omittedState = 0;
  if (!isDirectory) {
    try {
      const createdModel = await textModelService.createModelReference(resource);
      createdModel.dispose();
    } catch {
      omittedState = 2;
    }
    if (/\.(svg)$/i.test(resource.path)) {
      omittedState = 2;
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
__name(resolveResourceAttachContext, "resolveResourceAttachContext");
const SUPPORTED_IMAGE_EXTENSIONS_REGEX = /\.(png|jpg|jpeg|gif|webp)$/i;
async function resolveImageEditorAttachContext(fileService, dialogService, resource, data) {
  if (!resource) {
    return void 0;
  }
  const match = SUPPORTED_IMAGE_EXTENSIONS_REGEX.exec(resource.path);
  if (!match) {
    return void 0;
  }
  const mimeType = getMimeTypeFromPath(match);
  const fileName = basename(resource);
  let dataBuffer;
  if (data) {
    dataBuffer = data;
  } else {
    let stat;
    try {
      stat = await fileService.stat(resource);
    } catch {
      return void 0;
    }
    const readFile = await fileService.readFile(resource);
    if (stat.size > 30 * 1024 * 1024) {
      dialogService.error(localize("imageTooLarge", "Image is too large"), localize("imageTooLargeMessage", "The image {0} is too large to be attached.", fileName));
      throw new Error("Image is too large");
    }
    dataBuffer = readFile.value;
  }
  const isPartiallyOmitted = /\.gif$/i.test(resource.path);
  const imageFileContext = await resolveImageAttachContext([{
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
__name(resolveImageEditorAttachContext, "resolveImageEditorAttachContext");
async function resolveImageAttachContext(images) {
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
__name(resolveImageAttachContext, "resolveImageAttachContext");
const MIME_TYPES = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp"
};
function getMimeTypeFromPath(match) {
  const ext = match[1].toLowerCase();
  return MIME_TYPES[ext];
}
__name(getMimeTypeFromPath, "getMimeTypeFromPath");
function getAttachableImageExtension(mimeType) {
  return Object.entries(MIME_TYPES).find(([_, value]) => value === mimeType)?.[0];
}
__name(getAttachableImageExtension, "getAttachableImageExtension");
function resolveMarkerAttachContext(markers) {
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
__name(resolveMarkerAttachContext, "resolveMarkerAttachContext");
function resolveSymbolsAttachContext(symbols) {
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
__name(resolveSymbolsAttachContext, "resolveSymbolsAttachContext");
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
function resolveNotebookOutputAttachContext(data, editorService) {
  const notebookEditor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
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
__name(resolveNotebookOutputAttachContext, "resolveNotebookOutputAttachContext");
export {
  getAttachableImageExtension,
  resolveEditorAttachContext,
  resolveImageAttachContext,
  resolveImageEditorAttachContext,
  resolveMarkerAttachContext,
  resolveNotebookOutputAttachContext,
  resolveResourceAttachContext,
  resolveSymbolsAttachContext
};
//# sourceMappingURL=chatAttachmentResolve.js.map
