var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { isElectron } from "../../../../../base/common/platform.js";
import { dirname } from "../../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize } from "../../../../../nls.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { EditorResourceAccessor, SideBySideEditor } from "../../../../common/editor.js";
import { DiffEditorInput } from "../../../../common/editor/diffEditorInput.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IHostService } from "../../../../services/host/browser/host.js";
import { UntitledTextEditorInput } from "../../../../services/untitled/common/untitledTextEditorInput.js";
import { FileEditorInput } from "../../../files/browser/editors/fileEditorInput.js";
import { NotebookEditorInput } from "../../../notebook/common/notebookEditorInput.js";
import { IChatContextPickService } from "../chatContextPickService.js";
import { IChatEditingService } from "../../common/chatEditingService.js";
import { ToolDataSource, ToolSet } from "../../common/languageModelToolsService.js";
import { imageToHash, isImage } from "../chatPasteProviders.js";
import { convertBufferToScreenshotVariable } from "../contrib/screenshot.js";
import { ChatInstructionsPickerPick } from "../promptSyntax/attachInstructionsAction.js";
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
let ChatContextContributions = class ChatContextContributions2 extends Disposable {
  static {
    __name(this, "ChatContextContributions");
  }
  static {
    this.ID = "chat.contextContributions";
  }
  constructor(instantiationService, contextPickService) {
    super();
    this._store.add(contextPickService.registerChatContextItem(instantiationService.createInstance(ToolsContextPickerPick)));
    this._store.add(contextPickService.registerChatContextItem(instantiationService.createInstance(ChatInstructionsPickerPick)));
    this._store.add(contextPickService.registerChatContextItem(instantiationService.createInstance(OpenEditorContextValuePick)));
    this._store.add(contextPickService.registerChatContextItem(instantiationService.createInstance(RelatedFilesContextPickerPick)));
    this._store.add(contextPickService.registerChatContextItem(instantiationService.createInstance(ClipboardImageContextValuePick)));
    this._store.add(contextPickService.registerChatContextItem(instantiationService.createInstance(ScreenshotContextValuePick)));
  }
};
ChatContextContributions = __decorate([
  __param(0, IInstantiationService),
  __param(1, IChatContextPickService)
], ChatContextContributions);
class ToolsContextPickerPick {
  static {
    __name(this, "ToolsContextPickerPick");
  }
  constructor() {
    this.type = "pickerPick";
    this.label = localize("chatContext.tools", "Tools...");
    this.icon = Codicon.tools;
    this.ordinal = -500;
  }
  asPicker(widget) {
    const items = [];
    for (const entry of widget.input.selectedToolsModel.entries.get()) {
      if (entry instanceof ToolSet) {
        items.push({
          toolInfo: ToolDataSource.classify(entry.source),
          label: entry.referenceName,
          description: entry.description,
          asAttachment: /* @__PURE__ */ __name(() => this._asToolSetAttachment(entry), "asAttachment")
        });
      } else {
        items.push({
          toolInfo: ToolDataSource.classify(entry.source),
          label: entry.toolReferenceName ?? entry.displayName,
          description: entry.userDescription ?? entry.modelDescription,
          asAttachment: /* @__PURE__ */ __name(() => this._asToolAttachment(entry), "asAttachment")
        });
      }
    }
    items.sort((a, b) => {
      let res = a.toolInfo.ordinal - b.toolInfo.ordinal;
      if (res === 0) {
        res = a.toolInfo.label.localeCompare(b.toolInfo.label);
      }
      if (res === 0) {
        res = a.label.localeCompare(b.label);
      }
      return res;
    });
    let lastGroupLabel;
    const picks = [];
    for (const item of items) {
      if (lastGroupLabel !== item.toolInfo.label) {
        picks.push({ type: "separator", label: item.toolInfo.label });
        lastGroupLabel = item.toolInfo.label;
      }
      picks.push(item);
    }
    return {
      placeholder: localize("chatContext.tools.placeholder", "Select a tool"),
      picks: Promise.resolve(picks)
    };
  }
  _asToolAttachment(entry) {
    return {
      kind: "tool",
      id: entry.id,
      icon: ThemeIcon.isThemeIcon(entry.icon) ? entry.icon : void 0,
      name: entry.displayName,
      value: void 0
    };
  }
  _asToolSetAttachment(entry) {
    return {
      kind: "toolset",
      id: entry.id,
      icon: entry.icon,
      name: entry.referenceName,
      value: Array.from(entry.getTools()).map((t) => this._asToolAttachment(t))
    };
  }
}
let OpenEditorContextValuePick = class OpenEditorContextValuePick2 {
  static {
    __name(this, "OpenEditorContextValuePick");
  }
  constructor(_editorService, _labelService) {
    this._editorService = _editorService;
    this._labelService = _labelService;
    this.type = "valuePick";
    this.label = localize("chatContext.editors", "Open Editors");
    this.icon = Codicon.file;
    this.ordinal = 800;
  }
  isEnabled() {
    return this._editorService.editors.filter((e) => e instanceof FileEditorInput || e instanceof DiffEditorInput || e instanceof UntitledTextEditorInput).length > 0;
  }
  async asAttachment() {
    const result = [];
    for (const editor of this._editorService.editors) {
      if (!(editor instanceof FileEditorInput || editor instanceof DiffEditorInput || editor instanceof UntitledTextEditorInput || editor instanceof NotebookEditorInput)) {
        continue;
      }
      const uri = EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: SideBySideEditor.PRIMARY });
      if (!uri) {
        continue;
      }
      result.push({
        kind: "file",
        id: uri.toString(),
        value: uri,
        name: this._labelService.getUriBasenameLabel(uri)
      });
    }
    return result;
  }
};
OpenEditorContextValuePick = __decorate([
  __param(0, IEditorService),
  __param(1, ILabelService)
], OpenEditorContextValuePick);
let RelatedFilesContextPickerPick = class RelatedFilesContextPickerPick2 {
  static {
    __name(this, "RelatedFilesContextPickerPick");
  }
  constructor(_chatEditingService, _labelService) {
    this._chatEditingService = _chatEditingService;
    this._labelService = _labelService;
    this.type = "pickerPick";
    this.label = localize("chatContext.relatedFiles", "Related Files");
    this.icon = Codicon.sparkle;
    this.ordinal = 300;
  }
  isEnabled(widget) {
    return this._chatEditingService.hasRelatedFilesProviders() && (Boolean(widget.getInput()) || widget.attachmentModel.fileAttachments.length > 0);
  }
  asPicker(widget) {
    const picks = (async () => {
      const chatSessionId = widget.viewModel?.sessionId;
      if (!chatSessionId) {
        return [];
      }
      const relatedFiles = await this._chatEditingService.getRelatedFiles(chatSessionId, widget.getInput(), widget.attachmentModel.fileAttachments, CancellationToken.None);
      if (!relatedFiles) {
        return [];
      }
      const attachments = widget.attachmentModel.getAttachmentIDs();
      return this._chatEditingService.getRelatedFiles(chatSessionId, widget.getInput(), widget.attachmentModel.fileAttachments, CancellationToken.None).then((files) => (files ?? []).reduce((acc, cur) => {
        acc.push({ type: "separator", label: cur.group });
        for (const file of cur.files) {
          const label = this._labelService.getUriBasenameLabel(file.uri);
          acc.push({
            label,
            description: this._labelService.getUriLabel(dirname(file.uri), { relative: true }),
            disabled: attachments.has(file.uri.toString()),
            asAttachment: /* @__PURE__ */ __name(() => {
              return {
                kind: "file",
                id: file.uri.toString(),
                value: file.uri,
                name: label,
                omittedState: 0
                /* OmittedState.NotOmitted */
              };
            }, "asAttachment")
          });
        }
        return acc;
      }, []));
    })();
    return {
      placeholder: localize("relatedFiles", "Add related files to your working set"),
      picks
    };
  }
};
RelatedFilesContextPickerPick = __decorate([
  __param(0, IChatEditingService),
  __param(1, ILabelService)
], RelatedFilesContextPickerPick);
let ClipboardImageContextValuePick = class ClipboardImageContextValuePick2 {
  static {
    __name(this, "ClipboardImageContextValuePick");
  }
  constructor(_clipboardService) {
    this._clipboardService = _clipboardService;
    this.type = "valuePick";
    this.label = localize("imageFromClipboard", "Image from Clipboard");
    this.icon = Codicon.fileMedia;
  }
  async isEnabled(widget) {
    if (!widget.input.selectedLanguageModel?.metadata.capabilities?.vision) {
      return false;
    }
    const imageData = await this._clipboardService.readImage();
    return isImage(imageData);
  }
  async asAttachment() {
    const fileBuffer = await this._clipboardService.readImage();
    return {
      id: await imageToHash(fileBuffer),
      name: localize("pastedImage", "Pasted Image"),
      fullName: localize("pastedImage", "Pasted Image"),
      value: fileBuffer,
      kind: "image"
    };
  }
};
ClipboardImageContextValuePick = __decorate([
  __param(0, IClipboardService)
], ClipboardImageContextValuePick);
let ScreenshotContextValuePick = class ScreenshotContextValuePick2 {
  static {
    __name(this, "ScreenshotContextValuePick");
  }
  constructor(_hostService) {
    this._hostService = _hostService;
    this.type = "valuePick";
    this.icon = Codicon.deviceCamera;
    this.label = isElectron ? localize("chatContext.attachScreenshot.labelElectron.Window", "Screenshot Window") : localize("chatContext.attachScreenshot.labelWeb", "Screenshot");
  }
  async isEnabled(widget) {
    return !!widget.input.selectedLanguageModel?.metadata.capabilities?.vision;
  }
  async asAttachment() {
    const blob = await this._hostService.getScreenshot();
    return blob && convertBufferToScreenshotVariable(blob);
  }
};
ScreenshotContextValuePick = __decorate([
  __param(0, IHostService)
], ScreenshotContextValuePick);
export {
  ChatContextContributions
};
//# sourceMappingURL=chatContext.js.map
