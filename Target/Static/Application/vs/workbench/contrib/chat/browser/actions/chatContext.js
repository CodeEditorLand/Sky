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
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { isElectron } from "../../../../../base/common/platform.js";
import { dirname } from "../../../../../base/common/resources.js";
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
import { IChatContextPickService } from "../attachments/chatContextPickService.js";
import { IChatEditingService } from "../../common/editing/chatEditingService.js";
import { toToolSetVariableEntry, toToolVariableEntry } from "../../common/attachments/chatVariableEntries.js";
import { ToolDataSource, ToolSet } from "../../common/tools/languageModelToolsService.js";
import { imageToHash, isImage } from "../widget/input/editor/chatPasteProviders.js";
import { convertBufferToScreenshotVariable } from "../attachments/chatScreenshotContext.js";
import { ChatInstructionsPickerPick } from "../promptSyntax/attachInstructionsAction.js";
import { ITerminalService } from "../../../terminal/browser/terminal.js";
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
  isEnabled(widget) {
    return !!widget.attachmentCapabilities.supportsToolAttachments;
  }
  asPicker(widget) {
    const items = [];
    for (const [entry, enabled] of widget.input.selectedToolsModel.entriesMap.get()) {
      if (enabled) {
        if (entry instanceof ToolSet) {
          items.push({
            toolInfo: ToolDataSource.classify(entry.source),
            label: entry.referenceName,
            description: entry.description,
            asAttachment: /* @__PURE__ */ __name(() => toToolSetVariableEntry(entry), "asAttachment")
          });
        } else {
          items.push({
            toolInfo: ToolDataSource.classify(entry.source),
            label: entry.toolReferenceName ?? entry.displayName,
            description: entry.userDescription ?? entry.modelDescription,
            asAttachment: /* @__PURE__ */ __name(() => toToolVariableEntry(entry), "asAttachment")
          });
        }
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
      const chatSessionResource = widget.viewModel?.sessionResource;
      if (!chatSessionResource) {
        return [];
      }
      const relatedFiles = await this._chatEditingService.getRelatedFiles(chatSessionResource, widget.getInput(), widget.attachmentModel.fileAttachments, CancellationToken.None);
      if (!relatedFiles) {
        return [];
      }
      const attachments = widget.attachmentModel.getAttachmentIDs();
      return this._chatEditingService.getRelatedFiles(chatSessionResource, widget.getInput(), widget.attachmentModel.fileAttachments, CancellationToken.None).then((files) => (files ?? []).reduce((acc, cur) => {
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
    if (!widget.attachmentCapabilities.supportsImageAttachments) {
      return false;
    }
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
let TerminalContext = class TerminalContext2 {
  static {
    __name(this, "TerminalContext");
  }
  constructor(_resource, _terminalService) {
    this._resource = _resource;
    this._terminalService = _terminalService;
    this.type = "valuePick";
    this.icon = Codicon.terminal;
    this.label = localize("terminal", "Terminal");
  }
  isEnabled(widget) {
    const terminal = this._terminalService.getInstanceFromResource(this._resource);
    return !!widget.attachmentCapabilities.supportsTerminalAttachments && terminal?.isDisposed === false;
  }
  async asAttachment(widget) {
    const terminal = this._terminalService.getInstanceFromResource(this._resource);
    if (!terminal) {
      return;
    }
    const params = new URLSearchParams(this._resource.query);
    const command = terminal.capabilities.get(
      2
      /* TerminalCapability.CommandDetection */
    )?.commands.find((cmd) => cmd.id === params.get("command"));
    if (!command) {
      return;
    }
    const attachment = {
      kind: "terminalCommand",
      id: `terminalCommand:${Date.now()}}`,
      value: this.asValue(command),
      name: command.command,
      command: command.command,
      output: command.getOutput(),
      exitCode: command.exitCode,
      resource: this._resource
    };
    const cleanup = new DisposableStore();
    let disposed = false;
    const disposeCleanup = /* @__PURE__ */ __name(() => {
      if (disposed) {
        return;
      }
      disposed = true;
      cleanup.dispose();
    }, "disposeCleanup");
    cleanup.add(widget.attachmentModel.onDidChange((e) => {
      if (e.deleted.includes(attachment.id)) {
        disposeCleanup();
      }
    }));
    cleanup.add(terminal.onDisposed(() => {
      widget.attachmentModel.delete(attachment.id);
      widget.refreshParsedInput();
      disposeCleanup();
    }));
    return attachment;
  }
  asValue(command) {
    let value = `Command: ${command.command}`;
    const output = command.getOutput();
    if (output) {
      value += `
Output:
${output}`;
    }
    if (typeof command.exitCode === "number") {
      value += `
Exit Code: ${command.exitCode}`;
    }
    return value;
  }
};
TerminalContext = __decorate([
  __param(1, ITerminalService)
], TerminalContext);
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
    return !!widget.attachmentCapabilities.supportsImageAttachments && !!widget.input.selectedLanguageModel?.metadata.capabilities?.vision;
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
  ChatContextContributions,
  TerminalContext
};
//# sourceMappingURL=chatContext.js.map
