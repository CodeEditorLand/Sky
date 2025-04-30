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
import * as nls from "../../../../nls.js";
import * as json from "../../../../base/common/json.js";
import { setProperty } from "../../../../base/common/jsonEdit.js";
import { Queue } from "../../../../base/common/async.js";
import { EditOperation } from "../../../../editor/common/core/editOperation.js";
import { Range } from "../../../../editor/common/core/range.js";
import { Selection } from "../../../../editor/common/core/selection.js";
import { ITextFileService } from "../../textfile/common/textfiles.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { IJSONEditingService, JSONEditingError } from "./jsonEditing.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IFilesConfigurationService } from "../../filesConfiguration/common/filesConfigurationService.js";
let JSONEditingService = class JSONEditingService2 {
  static {
    __name(this, "JSONEditingService");
  }
  constructor(fileService, textModelResolverService, textFileService, filesConfigurationService) {
    this.fileService = fileService;
    this.textModelResolverService = textModelResolverService;
    this.textFileService = textFileService;
    this.filesConfigurationService = filesConfigurationService;
    this.queue = new Queue();
  }
  write(resource, values) {
    return Promise.resolve(this.queue.queue(() => this.doWriteConfiguration(resource, values)));
  }
  async doWriteConfiguration(resource, values) {
    const reference = await this.resolveAndValidate(resource, true);
    try {
      await this.writeToBuffer(reference.object.textEditorModel, values);
    } finally {
      reference.dispose();
    }
  }
  async writeToBuffer(model, values) {
    let disposable;
    try {
      disposable = this.filesConfigurationService.enableAutoSaveAfterShortDelay(model.uri);
      let hasEdits = false;
      for (const value of values) {
        const edit = this.getEdits(model, value)[0];
        hasEdits = !!edit && this.applyEditsToBuffer(edit, model) || hasEdits;
      }
      if (hasEdits) {
        return this.textFileService.save(model.uri);
      }
    } finally {
      disposable?.dispose();
    }
  }
  applyEditsToBuffer(edit, model) {
    const startPosition = model.getPositionAt(edit.offset);
    const endPosition = model.getPositionAt(edit.offset + edit.length);
    const range = new Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
    const currentText = model.getValueInRange(range);
    if (edit.content !== currentText) {
      const editOperation = currentText ? EditOperation.replace(range, edit.content) : EditOperation.insert(startPosition, edit.content);
      model.pushEditOperations([new Selection(startPosition.lineNumber, startPosition.column, startPosition.lineNumber, startPosition.column)], [editOperation], () => []);
      return true;
    }
    return false;
  }
  getEdits(model, configurationValue) {
    const { tabSize, insertSpaces } = model.getOptions();
    const eol = model.getEOL();
    const { path, value } = configurationValue;
    if (!path.length) {
      const content = JSON.stringify(value, null, insertSpaces ? " ".repeat(tabSize) : "	");
      return [{
        content,
        length: content.length,
        offset: 0
      }];
    }
    return setProperty(model.getValue(), path, value, { tabSize, insertSpaces, eol });
  }
  async resolveModelReference(resource) {
    const exists = await this.fileService.exists(resource);
    if (!exists) {
      await this.textFileService.write(resource, "{}", { encoding: "utf8" });
    }
    return this.textModelResolverService.createModelReference(resource);
  }
  hasParseErrors(model) {
    const parseErrors = [];
    json.parse(model.getValue(), parseErrors, { allowTrailingComma: true, allowEmptyContent: true });
    return parseErrors.length > 0;
  }
  async resolveAndValidate(resource, checkDirty) {
    const reference = await this.resolveModelReference(resource);
    const model = reference.object.textEditorModel;
    if (this.hasParseErrors(model)) {
      reference.dispose();
      return this.reject(
        0
        /* JSONEditingErrorCode.ERROR_INVALID_FILE */
      );
    }
    return reference;
  }
  reject(code) {
    const message = this.toErrorMessage(code);
    return Promise.reject(new JSONEditingError(message, code));
  }
  toErrorMessage(error) {
    switch (error) {
      // User issues
      case 0: {
        return nls.localize("errorInvalidFile", "Unable to write into the file. Please open the file to correct errors/warnings in the file and try again.");
      }
    }
  }
};
JSONEditingService = __decorate([
  __param(0, IFileService),
  __param(1, ITextModelService),
  __param(2, ITextFileService),
  __param(3, IFilesConfigurationService)
], JSONEditingService);
registerSingleton(
  IJSONEditingService,
  JSONEditingService,
  1
  /* InstantiationType.Delayed */
);
export {
  JSONEditingService
};
//# sourceMappingURL=jsonEditingService.js.map
