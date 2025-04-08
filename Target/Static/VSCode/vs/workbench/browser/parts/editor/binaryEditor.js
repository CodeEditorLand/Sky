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
import { localize } from "../../../../nls.js";
import { Emitter } from "../../../../base/common/event.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { BinaryEditorModel } from "../../../common/editor/binaryEditorModel.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ByteSize } from "../../../../platform/files/common/files.js";
import { IEditorOptions } from "../../../../platform/editor/common/editor.js";
import { EditorPlaceholder, IEditorPlaceholderContents } from "./editorPlaceholder.js";
import { IEditorGroup } from "../../../services/editor/common/editorGroupsService.js";
let BaseBinaryResourceEditor = class extends EditorPlaceholder {
  constructor(id, group, callbacks, telemetryService, themeService, storageService) {
    super(id, group, telemetryService, themeService, storageService);
    this.callbacks = callbacks;
  }
  static {
    __name(this, "BaseBinaryResourceEditor");
  }
  _onDidChangeMetadata = this._register(new Emitter());
  onDidChangeMetadata = this._onDidChangeMetadata.event;
  _onDidOpenInPlace = this._register(new Emitter());
  onDidOpenInPlace = this._onDidOpenInPlace.event;
  metadata;
  getTitle() {
    return this.input ? this.input.getName() : localize("binaryEditor", "Binary Viewer");
  }
  async getContents(input, options) {
    const model = await input.resolve();
    if (!(model instanceof BinaryEditorModel)) {
      throw new Error("Unable to open file as binary");
    }
    const size = model.getSize();
    this.handleMetadataChanged(typeof size === "number" ? ByteSize.formatSize(size) : "");
    return {
      icon: "$(warning)",
      label: localize("binaryError", "The file is not displayed in the text editor because it is either binary or uses an unsupported text encoding."),
      actions: [
        {
          label: localize("openAnyway", "Open Anyway"),
          run: /* @__PURE__ */ __name(async () => {
            await this.callbacks.openInternal(input, options);
            this._onDidOpenInPlace.fire();
          }, "run")
        }
      ]
    };
  }
  handleMetadataChanged(meta) {
    this.metadata = meta;
    this._onDidChangeMetadata.fire();
  }
  getMetadata() {
    return this.metadata;
  }
};
BaseBinaryResourceEditor = __decorateClass([
  __decorateParam(5, IStorageService)
], BaseBinaryResourceEditor);
export {
  BaseBinaryResourceEditor
};
//# sourceMappingURL=binaryEditor.js.map
