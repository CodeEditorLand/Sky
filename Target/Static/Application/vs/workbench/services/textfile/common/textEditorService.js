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
var TextEditorService_1;
import { Event } from "../../../../base/common/event.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { createDecorator, IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { EditorExtensions, isResourceDiffEditorInput, isResourceSideBySideEditorInput, DEFAULT_EDITOR_ASSOCIATION, isResourceMergeEditorInput } from "../../../common/editor.js";
import { IUntitledTextEditorService } from "../../untitled/common/untitledTextEditorService.js";
import { Schemas } from "../../../../base/common/network.js";
import { DiffEditorInput } from "../../../common/editor/diffEditorInput.js";
import { SideBySideEditorInput } from "../../../common/editor/sideBySideEditorInput.js";
import { TextResourceEditorInput } from "../../../common/editor/textResourceEditorInput.js";
import { UntitledTextEditorInput } from "../../untitled/common/untitledTextEditorInput.js";
import { basename } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IEditorResolverService, RegisteredEditorPriority } from "../../editor/common/editorResolverService.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
const ITextEditorService = createDecorator("textEditorService");
class FileEditorInputLeakError extends Error {
  static {
    __name(this, "FileEditorInputLeakError");
  }
  constructor(message, stack) {
    super(message);
    this.name = "FileEditorInputLeakError";
    this.stack = stack;
  }
}
let TextEditorService = class TextEditorService2 extends Disposable {
  static {
    __name(this, "TextEditorService");
  }
  static {
    TextEditorService_1 = this;
  }
  constructor(untitledTextEditorService, instantiationService, uriIdentityService, fileService, editorResolverService) {
    super();
    this.untitledTextEditorService = untitledTextEditorService;
    this.instantiationService = instantiationService;
    this.uriIdentityService = uriIdentityService;
    this.fileService = fileService;
    this.editorResolverService = editorResolverService;
    this.editorInputCache = new ResourceMap();
    this.fileEditorFactory = Registry.as(EditorExtensions.EditorFactory).getFileEditorFactory();
    this.mapLeakToCounter = /* @__PURE__ */ new Map();
    this.registerDefaultEditor();
  }
  registerDefaultEditor() {
    this._register(this.editorResolverService.registerEditor("*", {
      id: DEFAULT_EDITOR_ASSOCIATION.id,
      label: DEFAULT_EDITOR_ASSOCIATION.displayName,
      detail: DEFAULT_EDITOR_ASSOCIATION.providerDisplayName,
      priority: RegisteredEditorPriority.builtin
    }, {}, {
      createEditorInput: /* @__PURE__ */ __name((editor) => ({ editor: this.createTextEditor(editor) }), "createEditorInput"),
      createUntitledEditorInput: /* @__PURE__ */ __name((untitledEditor) => ({ editor: this.createTextEditor(untitledEditor) }), "createUntitledEditorInput"),
      createDiffEditorInput: /* @__PURE__ */ __name((diffEditor) => ({ editor: this.createTextEditor(diffEditor) }), "createDiffEditorInput")
    }));
  }
  async resolveTextEditor(input) {
    return this.createTextEditor(input);
  }
  createTextEditor(input) {
    if (isResourceMergeEditorInput(input)) {
      return this.createTextEditor(input.result);
    }
    if (isResourceDiffEditorInput(input)) {
      const original = this.createTextEditor(input.original);
      const modified = this.createTextEditor(input.modified);
      return this.instantiationService.createInstance(DiffEditorInput, input.label, input.description, original, modified, void 0);
    }
    if (isResourceSideBySideEditorInput(input)) {
      const primary = this.createTextEditor(input.primary);
      const secondary = this.createTextEditor(input.secondary);
      return this.instantiationService.createInstance(SideBySideEditorInput, input.label, input.description, secondary, primary);
    }
    const untitledInput = input;
    if (untitledInput.forceUntitled || !untitledInput.resource || untitledInput.resource.scheme === Schemas.untitled) {
      const untitledOptions = {
        languageId: untitledInput.languageId,
        initialValue: untitledInput.contents,
        encoding: untitledInput.encoding
      };
      let untitledModel;
      if (untitledInput.resource?.scheme === Schemas.untitled) {
        untitledModel = this.untitledTextEditorService.create({ untitledResource: untitledInput.resource, ...untitledOptions });
      } else {
        untitledModel = this.untitledTextEditorService.create({ associatedResource: untitledInput.resource, ...untitledOptions });
      }
      return this.createOrGetCached(untitledModel.resource, () => this.instantiationService.createInstance(UntitledTextEditorInput, untitledModel));
    }
    const textResourceEditorInput = input;
    if (textResourceEditorInput.resource instanceof URI) {
      const label = textResourceEditorInput.label || basename(textResourceEditorInput.resource);
      const preferredResource = textResourceEditorInput.resource;
      const canonicalResource = this.uriIdentityService.asCanonicalUri(preferredResource);
      return this.createOrGetCached(canonicalResource, () => {
        if (textResourceEditorInput.forceFile || this.fileService.hasProvider(canonicalResource)) {
          return this.fileEditorFactory.createFileEditor(canonicalResource, preferredResource, textResourceEditorInput.label, textResourceEditorInput.description, textResourceEditorInput.encoding, textResourceEditorInput.languageId, textResourceEditorInput.contents, this.instantiationService);
        }
        return this.instantiationService.createInstance(TextResourceEditorInput, canonicalResource, textResourceEditorInput.label, textResourceEditorInput.description, textResourceEditorInput.languageId, textResourceEditorInput.contents);
      }, (cachedInput) => {
        if (cachedInput instanceof UntitledTextEditorInput) {
          return;
        } else if (!(cachedInput instanceof TextResourceEditorInput)) {
          cachedInput.setPreferredResource(preferredResource);
          if (textResourceEditorInput.label) {
            cachedInput.setPreferredName(textResourceEditorInput.label);
          }
          if (textResourceEditorInput.description) {
            cachedInput.setPreferredDescription(textResourceEditorInput.description);
          }
          if (textResourceEditorInput.encoding) {
            cachedInput.setPreferredEncoding(textResourceEditorInput.encoding);
          }
          if (textResourceEditorInput.languageId) {
            cachedInput.setPreferredLanguageId(textResourceEditorInput.languageId);
          }
          if (typeof textResourceEditorInput.contents === "string") {
            cachedInput.setPreferredContents(textResourceEditorInput.contents);
          }
        } else {
          if (label) {
            cachedInput.setName(label);
          }
          if (textResourceEditorInput.description) {
            cachedInput.setDescription(textResourceEditorInput.description);
          }
          if (textResourceEditorInput.languageId) {
            cachedInput.setPreferredLanguageId(textResourceEditorInput.languageId);
          }
          if (typeof textResourceEditorInput.contents === "string") {
            cachedInput.setPreferredContents(textResourceEditorInput.contents);
          }
        }
      });
    }
    throw new Error(`ITextEditorService: Unable to create texteditor from ${JSON.stringify(input)}`);
  }
  createOrGetCached(resource, factoryFn, cachedFn) {
    let input = this.editorInputCache.get(resource);
    if (input) {
      cachedFn?.(input);
      return input;
    }
    input = factoryFn();
    this.editorInputCache.set(resource, input);
    const leakId = this.trackLeaks(input);
    Event.once(input.onWillDispose)(() => {
      this.editorInputCache.delete(resource);
      if (leakId) {
        this.untrackLeaks(leakId);
      }
    });
    return input;
  }
  static {
    this.LEAK_TRACKING_THRESHOLD = 256;
  }
  static {
    this.LEAK_REPORTING_THRESHOLD = 2 * this.LEAK_TRACKING_THRESHOLD;
  }
  static {
    this.LEAK_REPORTED = false;
  }
  trackLeaks(input) {
    if (TextEditorService_1.LEAK_REPORTED || this.editorInputCache.size < TextEditorService_1.LEAK_TRACKING_THRESHOLD) {
      return void 0;
    }
    const leakId = `${input.resource.scheme}#${input.typeId || "<no typeId>"}#${input.editorId || "<no editorId>"}
${new Error().stack?.split("\n").slice(2).join("\n") ?? ""}`;
    const leakCounter = (this.mapLeakToCounter.get(leakId) ?? 0) + 1;
    this.mapLeakToCounter.set(leakId, leakCounter);
    if (this.editorInputCache.size > TextEditorService_1.LEAK_REPORTING_THRESHOLD) {
      TextEditorService_1.LEAK_REPORTED = true;
      const [topLeak, topCount] = Array.from(this.mapLeakToCounter.entries()).reduce(([topLeak2, topCount2], [key, val]) => val > topCount2 ? [key, val] : [topLeak2, topCount2]);
      const message = `Potential text editor input LEAK detected, having ${this.editorInputCache.size} text editor inputs already. Most frequent owner (${topCount})`;
      onUnexpectedError(new FileEditorInputLeakError(message, topLeak));
    }
    return leakId;
  }
  untrackLeaks(leakId) {
    const stackCounter = (this.mapLeakToCounter.get(leakId) ?? 1) - 1;
    this.mapLeakToCounter.set(leakId, stackCounter);
    if (stackCounter === 0) {
      this.mapLeakToCounter.delete(leakId);
    }
  }
};
TextEditorService = TextEditorService_1 = __decorate([
  __param(0, IUntitledTextEditorService),
  __param(1, IInstantiationService),
  __param(2, IUriIdentityService),
  __param(3, IFileService),
  __param(4, IEditorResolverService)
], TextEditorService);
registerSingleton(
  ITextEditorService,
  TextEditorService,
  0
  /* InstantiationType.Eager */
);
export {
  ITextEditorService,
  TextEditorService
};
//# sourceMappingURL=textEditorService.js.map
