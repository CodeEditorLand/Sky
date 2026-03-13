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
import { EditorModel } from "./editorModel.js";
import { IFileService } from "../../../platform/files/common/files.js";
import { Mimes } from "../../../base/common/mime.js";
let BinaryEditorModel = class BinaryEditorModel2 extends EditorModel {
  static {
    __name(this, "BinaryEditorModel");
  }
  constructor(resource, name, fileService) {
    super();
    this.resource = resource;
    this.name = name;
    this.fileService = fileService;
    this.mime = Mimes.binary;
  }
  /**
   * The name of the binary resource.
   */
  getName() {
    return this.name;
  }
  /**
   * The size of the binary resource if known.
   */
  getSize() {
    return this.size;
  }
  /**
   * The mime of the binary resource if known.
   */
  getMime() {
    return this.mime;
  }
  /**
   * The etag of the binary resource if known.
   */
  getETag() {
    return this.etag;
  }
  async resolve() {
    if (this.fileService.hasProvider(this.resource)) {
      const stat = await this.fileService.stat(this.resource);
      this.etag = stat.etag;
      if (typeof stat.size === "number") {
        this.size = stat.size;
      }
    }
    return super.resolve();
  }
};
BinaryEditorModel = __decorate([
  __param(2, IFileService)
], BinaryEditorModel);
export {
  BinaryEditorModel
};
//# sourceMappingURL=binaryEditorModel.js.map
