var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../../base/common/event.js";
import { HierarchicalKind } from "../../../../base/common/hierarchicalKind.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { editorConfigurationBaseNode } from "../../../../editor/common/config/editorConfigurationSchema.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { codeActionCommandId, refactorCommandId, sourceActionCommandId } from "../../../../editor/contrib/codeAction/browser/codeAction.js";
import { CodeActionKind } from "../../../../editor/contrib/codeAction/common/types.js";
import * as nls from "../../../../nls.js";
import { Extensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
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
const createCodeActionsAutoSave = /* @__PURE__ */ __name((description) => {
  return {
    type: "string",
    enum: ["always", "explicit", "never", true, false],
    enumDescriptions: [
      nls.localize("alwaysSave", "Triggers Code Actions on explicit saves and auto saves triggered by window or focus changes."),
      nls.localize("explicitSave", "Triggers Code Actions only when explicitly saved"),
      nls.localize("neverSave", "Never triggers Code Actions on save"),
      nls.localize("explicitSaveBoolean", 'Triggers Code Actions only when explicitly saved. This value will be deprecated in favor of "explicit".'),
      nls.localize("neverSaveBoolean", 'Never triggers Code Actions on save. This value will be deprecated in favor of "never".')
    ],
    default: "explicit",
    description
  };
}, "createCodeActionsAutoSave");
const createNotebookCodeActionsAutoSave = /* @__PURE__ */ __name((description) => {
  return {
    type: ["string", "boolean"],
    enum: ["explicit", "never", true, false],
    enumDescriptions: [
      nls.localize("explicit", "Triggers Code Actions only when explicitly saved."),
      nls.localize("never", "Never triggers Code Actions on save."),
      nls.localize("explicitBoolean", 'Triggers Code Actions only when explicitly saved. This value will be deprecated in favor of "explicit".'),
      nls.localize("neverBoolean", 'Triggers Code Actions only when explicitly saved. This value will be deprecated in favor of "never".')
    ],
    default: "explicit",
    description
  };
}, "createNotebookCodeActionsAutoSave");
const codeActionsOnSaveSchema = {
  oneOf: [
    {
      type: "object",
      additionalProperties: {
        type: "string"
      }
    },
    {
      type: "array",
      items: { type: "string" }
    }
  ],
  markdownDescription: nls.localize("editor.codeActionsOnSave", 'Run Code Actions for the editor on save. Code Actions must be specified and the editor must not be shutting down. When {0} is set to `afterDelay`, Code Actions will only be run when the file is saved explicitly. Example: `"source.organizeImports": "explicit" `', "`#files.autoSave#`"),
  type: ["object", "array"],
  additionalProperties: {
    type: "string",
    enum: ["always", "explicit", "never", true, false]
  },
  default: {},
  scope: 6
};
const editorConfiguration = Object.freeze({
  ...editorConfigurationBaseNode,
  properties: {
    "editor.codeActionsOnSave": codeActionsOnSaveSchema
  }
});
const notebookCodeActionsOnSaveSchema = {
  oneOf: [
    {
      type: "object",
      additionalProperties: {
        type: "string"
      }
    },
    {
      type: "array",
      items: { type: "string" }
    }
  ],
  markdownDescription: nls.localize("notebook.codeActionsOnSave", 'Run a series of Code Actions for a notebook on save. Code Actions must be specified and the editor must not be shutting down. When {0} is set to `afterDelay`, Code Actions will only be run when the file is saved explicitly. Example: `"notebook.source.organizeImports": "explicit"`', "`#files.autoSave#`"),
  type: "object",
  additionalProperties: {
    type: ["string", "boolean"],
    enum: ["explicit", "never", true, false]
    // enum: ['explicit', 'always', 'never'], -- autosave support needs to be built first
    // nls.localize('always', 'Always triggers Code Actions on save, including autosave, focus, and window change events.'),
  },
  default: {}
};
const notebookEditorConfiguration = Object.freeze({
  ...editorConfigurationBaseNode,
  properties: {
    "notebook.codeActionsOnSave": notebookCodeActionsOnSaveSchema
  }
});
let CodeActionsContribution = class CodeActionsContribution2 extends Disposable {
  static {
    __name(this, "CodeActionsContribution");
  }
  constructor(keybindingService, languageFeatures) {
    super();
    this.languageFeatures = languageFeatures;
    this._onDidChangeSchemaContributions = this._register(new Emitter());
    this._allProvidedCodeActionKinds = [];
    this._register(Event.runAndSubscribe(Event.debounce(languageFeatures.codeActionProvider.onDidChange, () => {
    }, 1e3), () => {
      this._allProvidedCodeActionKinds = this.getAllProvidedCodeActionKinds();
      this.updateConfigurationSchema(this._allProvidedCodeActionKinds);
      this._onDidChangeSchemaContributions.fire();
    }));
    this._register(keybindingService.registerSchemaContribution({
      getSchemaAdditions: /* @__PURE__ */ __name(() => this.getKeybindingSchemaAdditions(), "getSchemaAdditions"),
      onDidChange: this._onDidChangeSchemaContributions.event
    }));
  }
  getAllProvidedCodeActionKinds() {
    const out = /* @__PURE__ */ new Map();
    for (const provider of this.languageFeatures.codeActionProvider.allNoModel()) {
      for (const kind of provider.providedCodeActionKinds ?? []) {
        out.set(kind, new HierarchicalKind(kind));
      }
    }
    return Array.from(out.values());
  }
  updateConfigurationSchema(allProvidedKinds) {
    const properties = { ...codeActionsOnSaveSchema.properties };
    const notebookProperties = { ...notebookCodeActionsOnSaveSchema.properties };
    for (const codeActionKind of allProvidedKinds) {
      if (CodeActionKind.Source.contains(codeActionKind) && !properties[codeActionKind.value]) {
        properties[codeActionKind.value] = createCodeActionsAutoSave(nls.localize("codeActionsOnSave.generic", "Controls whether '{0}' actions should be run on file save.", codeActionKind.value));
        notebookProperties[codeActionKind.value] = createNotebookCodeActionsAutoSave(nls.localize("codeActionsOnSave.generic", "Controls whether '{0}' actions should be run on file save.", codeActionKind.value));
      }
    }
    codeActionsOnSaveSchema.properties = properties;
    notebookCodeActionsOnSaveSchema.properties = notebookProperties;
    Registry.as(Extensions.Configuration).notifyConfigurationSchemaUpdated(editorConfiguration);
  }
  getKeybindingSchemaAdditions() {
    const conditionalSchema = /* @__PURE__ */ __name((command, kinds) => {
      return {
        if: {
          required: ["command"],
          properties: {
            "command": { const: command }
          }
        },
        then: {
          properties: {
            "args": {
              required: ["kind"],
              properties: {
                "kind": {
                  anyOf: [
                    { enum: Array.from(kinds) },
                    { type: "string" }
                  ]
                }
              }
            }
          }
        }
      };
    }, "conditionalSchema");
    const filterProvidedKinds = /* @__PURE__ */ __name((ofKind) => {
      const out = /* @__PURE__ */ new Set();
      for (const providedKind of this._allProvidedCodeActionKinds) {
        if (ofKind.contains(providedKind)) {
          out.add(providedKind.value);
        }
      }
      return Array.from(out);
    }, "filterProvidedKinds");
    return [
      conditionalSchema(codeActionCommandId, filterProvidedKinds(HierarchicalKind.Empty)),
      conditionalSchema(refactorCommandId, filterProvidedKinds(CodeActionKind.Refactor)),
      conditionalSchema(sourceActionCommandId, filterProvidedKinds(CodeActionKind.Source))
    ];
  }
};
CodeActionsContribution = __decorate([
  __param(0, IKeybindingService),
  __param(1, ILanguageFeaturesService)
], CodeActionsContribution);
export {
  CodeActionsContribution,
  editorConfiguration,
  notebookEditorConfiguration
};
//# sourceMappingURL=codeActionsContribution.js.map
