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
import { VSBuffer } from "../../../../base/common/buffer.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { ITextEditorService } from "../../../services/textfile/common/textEditorService.js";
import { IUserDataProfileService } from "../../../services/userDataProfile/common/userDataProfile.js";
import { equals } from "../../../../base/common/objects.js";
import { visit } from "../../../../base/common/json.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { ITextFileService } from "../../../services/textfile/common/textfiles.js";
import { getCodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { SnippetController2 } from "../../../../editor/contrib/snippet/browser/snippetController2.js";
import { ILanguageModelsConfigurationService } from "../common/languageModelsConfiguration.js";
import { Extensions as JSONExtensions } from "../../../../platform/jsonschemas/common/jsonContributionRegistry.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { ILanguageModelsService } from "../common/languageModels.js";
let LanguageModelsConfigurationService = class LanguageModelsConfigurationService2 extends Disposable {
  static {
    __name(this, "LanguageModelsConfigurationService");
  }
  get configurationFile() {
    return this.modelsConfigurationFile;
  }
  constructor(fileService, textFileService, textModelService, editorGroupsService, textEditorService, userDataProfileService, uriIdentityService) {
    super();
    this.fileService = fileService;
    this.textFileService = textFileService;
    this.textModelService = textModelService;
    this.editorGroupsService = editorGroupsService;
    this.textEditorService = textEditorService;
    this._onDidChangeLanguageModelGroups = new Emitter();
    this.onDidChangeLanguageModelGroups = this._onDidChangeLanguageModelGroups.event;
    this.languageModelsProviderGroups = [];
    this.modelsConfigurationFile = uriIdentityService.extUri.joinPath(userDataProfileService.currentProfile.location, "chatLanguageModels.json");
    this.updateLanguageModelsConfiguration();
    this._register(fileService.watch(this.modelsConfigurationFile));
    this._register(fileService.onDidFilesChange((e) => {
      if (e.contains(this.modelsConfigurationFile)) {
        this.updateLanguageModelsConfiguration();
      }
    }));
  }
  setLanguageModelsConfiguration(languageModelsConfiguration) {
    const changedGroups = [];
    const oldGroupMap = new Map(this.languageModelsProviderGroups.map((g) => [`${g.vendor}:${g.name}`, g]));
    const newGroupMap = new Map(languageModelsConfiguration.map((g) => [`${g.vendor}:${g.name}`, g]));
    for (const [key, newGroup] of newGroupMap) {
      const oldGroup = oldGroupMap.get(key);
      if (!oldGroup || !equals(oldGroup, newGroup)) {
        changedGroups.push(newGroup);
      }
    }
    for (const [key, oldGroup] of oldGroupMap) {
      if (!newGroupMap.has(key)) {
        changedGroups.push(oldGroup);
      }
    }
    this.languageModelsProviderGroups = languageModelsConfiguration;
    if (changedGroups.length > 0) {
      this._onDidChangeLanguageModelGroups.fire(changedGroups);
    }
  }
  async updateLanguageModelsConfiguration() {
    const languageModelsProviderGroups = await this.withLanguageModelsProviderGroups();
    this.setLanguageModelsConfiguration(languageModelsProviderGroups);
  }
  getLanguageModelsProviderGroups() {
    return this.languageModelsProviderGroups;
  }
  async addLanguageModelsProviderGroup(toAdd) {
    await this.withLanguageModelsProviderGroups(async (languageModelsProviderGroups) => {
      if (languageModelsProviderGroups.some(({ name, vendor }) => name === toAdd.name && vendor === toAdd.vendor)) {
        throw new Error(`Language model group with name ${toAdd.name} already exists for vendor ${toAdd.vendor}`);
      }
      languageModelsProviderGroups.push(toAdd);
      return languageModelsProviderGroups;
    });
    await this.updateLanguageModelsConfiguration();
    const result = this.getLanguageModelsProviderGroups().find((group) => group.name === toAdd.name && group.vendor === toAdd.vendor);
    if (!result) {
      throw new Error(`Language model group with name ${toAdd.name} not found for vendor ${toAdd.vendor}`);
    }
    return result;
  }
  async updateLanguageModelsProviderGroup(from, to) {
    await this.withLanguageModelsProviderGroups(async (languageModelsProviderGroups) => {
      const result2 = [];
      for (const group of languageModelsProviderGroups) {
        if (group.name === from.name && group.vendor === from.vendor) {
          result2.push(to);
        } else {
          result2.push(group);
        }
      }
      return result2;
    });
    await this.updateLanguageModelsConfiguration();
    const result = this.getLanguageModelsProviderGroups().find((group) => group.name === to.name && group.vendor === to.vendor);
    if (!result) {
      throw new Error(`Language model group with name ${to.name} not found for vendor ${to.vendor}`);
    }
    return result;
  }
  async removeLanguageModelsProviderGroup(toRemove) {
    await this.withLanguageModelsProviderGroups(async (languageModelsProviderGroups) => {
      const result = [];
      for (const group of languageModelsProviderGroups) {
        if (group.name === toRemove.name && group.vendor === toRemove.vendor) {
          continue;
        }
        result.push(group);
      }
      return result;
    });
    await this.updateLanguageModelsConfiguration();
  }
  async configureLanguageModels(options) {
    const editor = await this.editorGroupsService.activeGroup.openEditor(this.textEditorService.createTextEditor({ resource: this.modelsConfigurationFile }));
    if (!editor || !options?.group) {
      return;
    }
    const codeEditor = getCodeEditor(editor.getControl());
    if (!codeEditor) {
      return;
    }
    if (!options.group.range) {
      return;
    }
    if (options.snippet) {
      const model = codeEditor.getModel();
      if (!model) {
        return;
      }
      const lastPropertyLine = options.group.range.endLineNumber - 1;
      const lastPropertyLineLength = model.getLineLength(lastPropertyLine);
      const insertPosition = { lineNumber: lastPropertyLine, column: lastPropertyLineLength + 1 };
      codeEditor.setPosition(insertPosition);
      codeEditor.revealPositionNearTop(insertPosition);
      codeEditor.focus();
      SnippetController2.get(codeEditor)?.insert(",\n" + options.snippet);
    } else {
      const position = { lineNumber: options.group.range.startLineNumber, column: options.group.range.startColumn };
      codeEditor.setPosition(position);
      codeEditor.revealPositionNearTop(position);
      codeEditor.focus();
    }
  }
  async withLanguageModelsProviderGroups(update) {
    const exists = await this.fileService.exists(this.modelsConfigurationFile);
    if (!exists) {
      await this.fileService.writeFile(this.modelsConfigurationFile, VSBuffer.fromString(JSON.stringify([], void 0, "	")));
    }
    const ref = await this.textModelService.createModelReference(this.modelsConfigurationFile);
    const model = ref.object.textEditorModel;
    try {
      const languageModelsProviderGroups = parseLanguageModelsProviderGroups(model);
      if (!update) {
        return languageModelsProviderGroups;
      }
      const updatedLanguageModelsProviderGroups = await update(languageModelsProviderGroups);
      for (const group of updatedLanguageModelsProviderGroups) {
        delete group.range;
      }
      model.setValue(JSON.stringify(updatedLanguageModelsProviderGroups, void 0, "	"));
      await this.textFileService.save(this.modelsConfigurationFile);
      return updatedLanguageModelsProviderGroups;
    } finally {
      ref.dispose();
    }
  }
};
LanguageModelsConfigurationService = __decorate([
  __param(0, IFileService),
  __param(1, ITextFileService),
  __param(2, ITextModelService),
  __param(3, IEditorGroupsService),
  __param(4, ITextEditorService),
  __param(5, IUserDataProfileService),
  __param(6, IUriIdentityService)
], LanguageModelsConfigurationService);
function parseLanguageModelsProviderGroups(model) {
  const configuration = [];
  let currentProperty = null;
  let currentParent = configuration;
  const previousParents = [];
  function onValue(value, offset, length) {
    if (Array.isArray(currentParent)) {
      currentParent.push(value);
    } else if (currentProperty !== null) {
      currentParent[currentProperty] = value;
    }
  }
  __name(onValue, "onValue");
  const visitor = {
    onObjectBegin: /* @__PURE__ */ __name((offset, length) => {
      const object = {};
      if (previousParents.length === 1 && Array.isArray(currentParent)) {
        const start = model.getPositionAt(offset);
        const end = model.getPositionAt(offset + length);
        object.range = {
          startLineNumber: start.lineNumber,
          startColumn: start.column,
          endLineNumber: end.lineNumber,
          endColumn: end.column
        };
      }
      onValue(object, offset, length);
      previousParents.push(currentParent);
      currentParent = object;
      currentProperty = null;
    }, "onObjectBegin"),
    onObjectProperty: /* @__PURE__ */ __name((name, offset, length) => {
      currentProperty = name;
    }, "onObjectProperty"),
    onObjectEnd: /* @__PURE__ */ __name((offset, length) => {
      const parent = currentParent;
      if (parent.range) {
        const end = model.getPositionAt(offset + length);
        parent.range = {
          startLineNumber: parent.range.startLineNumber,
          startColumn: parent.range.startColumn,
          endLineNumber: end.lineNumber,
          endColumn: end.column
        };
      }
      if (parent._parentConfigurationRange) {
        const end = model.getPositionAt(offset + length);
        parent._parentConfigurationRange.endLineNumber = end.lineNumber;
        parent._parentConfigurationRange.endColumn = end.column;
        delete parent._parentConfigurationRange;
      }
      currentParent = previousParents.pop();
    }, "onObjectEnd"),
    onArrayBegin: /* @__PURE__ */ __name((offset, length) => {
      if (currentParent === configuration && previousParents.length === 0) {
        previousParents.push(currentParent);
        currentProperty = null;
        return;
      }
      const array = [];
      onValue(array, offset, length);
      previousParents.push(currentParent);
      currentParent = array;
      currentProperty = null;
    }, "onArrayBegin"),
    onArrayEnd: /* @__PURE__ */ __name((offset, length) => {
      const parent = currentParent;
      if (parent._parentConfigurationRange) {
        const end = model.getPositionAt(offset + length);
        parent._parentConfigurationRange.endLineNumber = end.lineNumber;
        parent._parentConfigurationRange.endColumn = end.column;
        delete parent._parentConfigurationRange;
      }
      currentParent = previousParents.pop();
    }, "onArrayEnd"),
    onLiteralValue: /* @__PURE__ */ __name((value, offset, length) => {
      onValue(value, offset, length);
    }, "onLiteralValue")
  };
  visit(model.getValue(), visitor);
  return configuration;
}
__name(parseLanguageModelsProviderGroups, "parseLanguageModelsProviderGroups");
const languageModelsSchemaId = "vscode://schemas/language-models";
let ChatLanguageModelsDataContribution = class ChatLanguageModelsDataContribution2 extends Disposable {
  static {
    __name(this, "ChatLanguageModelsDataContribution");
  }
  static {
    this.ID = "workbench.contrib.chatLanguageModelsData";
  }
  constructor(languageModelsService, languageModelsConfigurationService) {
    super();
    this.languageModelsService = languageModelsService;
    const registry = Registry.as(JSONExtensions.JSONContribution);
    this._register(registry.registerSchemaAssociation(languageModelsSchemaId, languageModelsConfigurationService.configurationFile.toString()));
    this.updateSchema(registry);
    this._register(this.languageModelsService.onDidChangeLanguageModels(() => this.updateSchema(registry)));
  }
  updateSchema(registry) {
    const vendors = this.languageModelsService.getVendors();
    const schema = {
      type: "array",
      items: {
        properties: {
          vendor: {
            type: "string",
            enum: vendors.map((v) => v.vendor)
          },
          name: { type: "string" }
        },
        allOf: vendors.map((vendor) => ({
          if: {
            properties: {
              vendor: { const: vendor.vendor }
            }
          },
          then: vendor.configuration
        })),
        required: ["vendor", "name"]
      }
    };
    registry.registerSchema(languageModelsSchemaId, schema);
  }
};
ChatLanguageModelsDataContribution = __decorate([
  __param(0, ILanguageModelsService),
  __param(1, ILanguageModelsConfigurationService)
], ChatLanguageModelsDataContribution);
export {
  ChatLanguageModelsDataContribution,
  LanguageModelsConfigurationService,
  parseLanguageModelsProviderGroups
};
//# sourceMappingURL=languageModelsConfigurationService.js.map
