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
import { localize } from "../../../../nls.js";
import { Emitter } from "../../../../base/common/event.js";
import { BinaryEditorModel } from "../../../common/editor/binaryEditorModel.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ByteSize } from "../../../../platform/files/common/files.js";
import { EditorPlaceholder } from "./editorPlaceholder.js";
let BaseBinaryResourceEditor = class BaseBinaryResourceEditor2 extends EditorPlaceholder {
  static {
    __name(this, "BaseBinaryResourceEditor");
  }
  constructor(id, group, callbacks, telemetryService, themeService, storageService) {
    super(id, group, telemetryService, themeService, storageService);
    this.callbacks = callbacks;
    this._onDidChangeMetadata = this._register(new Emitter());
    this.onDidChangeMetadata = this._onDidChangeMetadata.event;
    this._onDidOpenInPlace = this._register(new Emitter());
    this.onDidOpenInPlace = this._onDidOpenInPlace.event;
  }
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
BaseBinaryResourceEditor = __decorate([
  __param(5, IStorageService)
], BaseBinaryResourceEditor);
export {
  BaseBinaryResourceEditor
};
//# sourceMappingURL=binaryEditor.js.map
