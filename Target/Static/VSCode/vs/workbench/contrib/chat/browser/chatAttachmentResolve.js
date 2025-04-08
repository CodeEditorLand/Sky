var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../base/common/codicons.js";
import { basename } from "../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { SymbolKinds } from "../../../../editor/common/languages.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../nls.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IDraggedResourceEditorInput, MarkerTransferData, DocumentSymbolTransferData } from "../../../../platform/dnd/browser/dnd.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { MarkerSeverity } from "../../../../platform/markers/common/markers.js";
import { isUntitledResourceEditorInput } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IExtensionService, isProposedApiEnabled } from "../../../services/extensions/common/extensions.js";
import { UntitledTextEditorInput } from "../../../services/untitled/common/untitledTextEditorInput.js";
import { IChatRequestVariableEntry, IDiagnosticVariableEntry, IDiagnosticVariableEntryFilterData, ISymbolVariableEntry, OmittedState } from "../common/chatModel.js";
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
  const imageContext = await resolveImageEditorAttachContext(editor, fileService, dialogService);
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
  let omittedState = OmittedState.NotOmitted;
  if (!isDirectory) {
    try {
      const createdModel = await textModelService.createModelReference(resource);
      createdModel.dispose();
    } catch {
      omittedState = OmittedState.Full;
    }
    if (/\.(svg)$/i.test(resource.path)) {
      omittedState = OmittedState.Full;
    }
  }
  return {
    value: resource,
    id: resource.toString(),
    name: basename(resource),
    isFile: !isDirectory,
    isDirectory,
    omittedState
  };
}
__name(resolveResourceAttachContext, "resolveResourceAttachContext");
const SUPPORTED_IMAGE_EXTENSIONS_REGEX = /\.(png|jpg|jpeg|gif|webp)$/i;
async function resolveImageEditorAttachContext(editor, fileService, dialogService) {
  if (!editor.resource) {
    return void 0;
  }
  const match = SUPPORTED_IMAGE_EXTENSIONS_REGEX.exec(editor.resource.path);
  if (!match) {
    return void 0;
  }
  const mimeType = getMimeTypeFromPath(match);
  const fileName = basename(editor.resource);
  const readFile = await fileService.readFile(editor.resource);
  if (readFile.size > 30 * 1024 * 1024) {
    dialogService.error(localize("imageTooLarge", "Image is too large"), localize("imageTooLargeMessage", "The image {0} is too large to be attached.", fileName));
    throw new Error("Image is too large");
  }
  const isPartiallyOmitted = /\.gif$/i.test(editor.resource.path);
  const imageFileContext = await resolveImageAttachContext([{
    id: editor.resource.toString(),
    name: fileName,
    data: readFile.value.buffer,
    icon: Codicon.fileMedia,
    resource: editor.resource,
    mimeType,
    omittedState: isPartiallyOmitted ? OmittedState.Partial : OmittedState.NotOmitted
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
    omittedState: image.omittedState || OmittedState.NotOmitted,
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
      fullName: `$(${SymbolKinds.toIcon(symbol.kind).id}) ${symbol.name}`,
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
export {
  resolveEditorAttachContext,
  resolveImageAttachContext,
  resolveImageEditorAttachContext,
  resolveMarkerAttachContext,
  resolveResourceAttachContext,
  resolveSymbolsAttachContext
};
//# sourceMappingURL=chatAttachmentResolve.js.map
