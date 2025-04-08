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
import { IPromptsService } from "../service/types.js";
import { assert } from "../../../../../../base/common/assert.js";
import { NotPromptFile } from "../../promptFileReferenceErrors.js";
import { ITextModel } from "../../../../../../editor/common/model.js";
import { assertDefined } from "../../../../../../base/common/types.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { IEditor } from "../../../../../../editor/common/editorCommon.js";
import { ObjectCache } from "../../../../../../base/common/objectCache.js";
import { TextModelPromptParser } from "../parsers/textModelPromptParser.js";
import { Registry } from "../../../../../../platform/registry/common/platform.js";
import { PromptsConfig } from "../../../../../../platform/prompts/common/config.js";
import { isPromptFile } from "../../../../../../platform/prompts/common/constants.js";
import { LifecyclePhase } from "../../../../../services/lifecycle/common/lifecycle.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
import { ObservableDisposable } from "../../../../../../base/common/observableDisposable.js";
import { IWorkbenchContributionsRegistry, Extensions } from "../../../../../common/contributions.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IMarkerData, IMarkerService, MarkerSeverity } from "../../../../../../platform/markers/common/markers.js";
const MARKERS_OWNER_ID = "reusable-prompts-syntax";
let PromptLinkDiagnosticsProvider = class extends ObservableDisposable {
  constructor(editor, markerService, promptsService) {
    super();
    this.editor = editor;
    this.markerService = markerService;
    this.promptsService = promptsService;
    this.parser = this.promptsService.getSyntaxParserFor(this.editor).onUpdate(this.updateMarkers.bind(this)).onDispose(this.dispose.bind(this)).start();
    this.updateMarkers();
  }
  static {
    __name(this, "PromptLinkDiagnosticsProvider");
  }
  /**
   * Reference to the current prompt syntax parser instance.
   */
  parser;
  /**
   * Update diagnostic markers for the current editor.
   */
  async updateMarkers() {
    await this.parser.allSettled();
    this.markerService.remove(MARKERS_OWNER_ID, [this.editor.uri]);
    const markers = [];
    for (const link of this.parser.references) {
      const { topError, linkRange } = link;
      if (!topError || !linkRange) {
        continue;
      }
      const { originalError } = topError;
      if (originalError instanceof NotPromptFile) {
        continue;
      }
      markers.push(toMarker(link));
    }
    this.markerService.changeOne(
      MARKERS_OWNER_ID,
      this.editor.uri,
      markers
    );
  }
};
PromptLinkDiagnosticsProvider = __decorateClass([
  __decorateParam(1, IMarkerService),
  __decorateParam(2, IPromptsService)
], PromptLinkDiagnosticsProvider);
const toMarker = /* @__PURE__ */ __name((link) => {
  const { topError, linkRange } = link;
  assertDefined(
    topError,
    "Top error must to be defined."
  );
  assertDefined(
    linkRange,
    "Link range must to be defined."
  );
  const { originalError } = topError;
  assert(
    !(originalError instanceof NotPromptFile),
    'Error must not be of "not prompt file" type.'
  );
  const severity = topError.errorSubject === "root" ? MarkerSeverity.Error : MarkerSeverity.Warning;
  return {
    message: topError.localizedMessage,
    severity,
    ...linkRange
  };
}, "toMarker");
let PromptLinkDiagnosticsInstanceManager = class extends Disposable {
  static {
    __name(this, "PromptLinkDiagnosticsInstanceManager");
  }
  /**
   * Currently available {@link PromptLinkDiagnosticsProvider} instances.
   */
  providers;
  constructor(editorService, initService, configService) {
    super();
    this.providers = this._register(
      new ObjectCache((editor) => {
        const parser = initService.createInstance(
          PromptLinkDiagnosticsProvider,
          editor
        );
        parser.assertNotDisposed(
          "Created prompt parser must not be disposed."
        );
        return parser;
      })
    );
    if (!PromptsConfig.enabled(configService)) {
      return;
    }
    this._register(editorService.onDidActiveEditorChange(() => {
      const { activeTextEditorControl } = editorService;
      if (!activeTextEditorControl) {
        return;
      }
      this.handleNewEditor(activeTextEditorControl);
    }));
    editorService.visibleTextEditorControls.forEach(this.handleNewEditor.bind(this));
  }
  /**
   * Initialize a new {@link PromptLinkDiagnosticsProvider} for the given editor.
   */
  handleNewEditor(editor) {
    const model = editor.getModel();
    if (!model) {
      return this;
    }
    if ("modified" in model || "model" in model) {
      return this;
    }
    if (!isPromptFile(model.uri)) {
      return this;
    }
    this.providers.get(model);
    return this;
  }
};
PromptLinkDiagnosticsInstanceManager = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IConfigurationService)
], PromptLinkDiagnosticsInstanceManager);
Registry.as(Extensions.Workbench).registerWorkbenchContribution(PromptLinkDiagnosticsInstanceManager, LifecyclePhase.Eventually);
export {
  PromptLinkDiagnosticsInstanceManager
};
//# sourceMappingURL=promptLinkDiagnosticsProvider.js.map
