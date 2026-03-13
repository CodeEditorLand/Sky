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
var BrowserChatAgentToolsContribution_1;
import { Codicon } from "../../../../../base/common/codicons.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { IPlaywrightService } from "../../../../../platform/browserView/common/playwrightService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { registerWorkbenchContribution2 } from "../../../../common/contributions.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IChatContextService } from "../../../chat/browser/contextContrib/chatContextService.js";
import { ILanguageModelToolsService, ToolDataSource } from "../../../chat/common/tools/languageModelToolsService.js";
import { BrowserEditorInput } from "../browserEditorInput.js";
import { ClickBrowserTool, ClickBrowserToolData } from "./clickBrowserTool.js";
import { DragElementTool, DragElementToolData } from "./dragElementTool.js";
import { HandleDialogBrowserTool, HandleDialogBrowserToolData } from "./handleDialogBrowserTool.js";
import { HoverElementTool, HoverElementToolData } from "./hoverElementTool.js";
import { NavigateBrowserTool, NavigateBrowserToolData } from "./navigateBrowserTool.js";
import { OpenBrowserTool, OpenBrowserToolData } from "./openBrowserTool.js";
import { OpenBrowserToolNonAgentic, OpenBrowserToolNonAgenticData } from "./openBrowserToolNonAgentic.js";
import { ReadBrowserTool, ReadBrowserToolData } from "./readBrowserTool.js";
import { RunPlaywrightCodeTool, RunPlaywrightCodeToolData } from "./runPlaywrightCodeTool.js";
import { ScreenshotBrowserTool, ScreenshotBrowserToolData } from "./screenshotBrowserTool.js";
import { TypeBrowserTool, TypeBrowserToolData } from "./typeBrowserTool.js";
let BrowserChatAgentToolsContribution = class BrowserChatAgentToolsContribution2 extends Disposable {
  static {
    __name(this, "BrowserChatAgentToolsContribution");
  }
  static {
    BrowserChatAgentToolsContribution_1 = this;
  }
  static {
    this.ID = "browserView.chatAgentTools";
  }
  static {
    this.CONTEXT_ID = "browserView.trackedPages";
  }
  constructor(instantiationService, toolsService, configurationService, playwrightService, chatContextService, editorService) {
    super();
    this.instantiationService = instantiationService;
    this.toolsService = toolsService;
    this.configurationService = configurationService;
    this.playwrightService = playwrightService;
    this.chatContextService = chatContextService;
    this.editorService = editorService;
    this._toolsStore = this._register(new DisposableStore());
    this._trackedIds = /* @__PURE__ */ new Set();
    this._browserToolSet = this._register(this.toolsService.createToolSet(ToolDataSource.Internal, "browser", "browser", {
      icon: Codicon.globe,
      description: localize("browserToolSet.description", "Open and interact with integrated browser pages")
    }));
    this._updateToolRegistrations();
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("workbench.browser.enableChatTools")) {
        this._updateToolRegistrations();
      }
    }));
  }
  _updateToolRegistrations() {
    this._toolsStore.clear();
    if (!this.configurationService.getValue("workbench.browser.enableChatTools")) {
      this._toolsStore.add(this.toolsService.registerTool(OpenBrowserToolNonAgenticData, this.instantiationService.createInstance(OpenBrowserToolNonAgentic)));
      this._toolsStore.add(this._browserToolSet.addTool(OpenBrowserToolNonAgenticData));
      this.chatContextService.updateWorkspaceContextItems(BrowserChatAgentToolsContribution_1.CONTEXT_ID, []);
      return;
    }
    this._toolsStore.add(this.toolsService.registerTool(OpenBrowserToolData, this.instantiationService.createInstance(OpenBrowserTool)));
    this._toolsStore.add(this.toolsService.registerTool(ReadBrowserToolData, this.instantiationService.createInstance(ReadBrowserTool)));
    this._toolsStore.add(this.toolsService.registerTool(ScreenshotBrowserToolData, this.instantiationService.createInstance(ScreenshotBrowserTool)));
    this._toolsStore.add(this.toolsService.registerTool(NavigateBrowserToolData, this.instantiationService.createInstance(NavigateBrowserTool)));
    this._toolsStore.add(this.toolsService.registerTool(ClickBrowserToolData, this.instantiationService.createInstance(ClickBrowserTool)));
    this._toolsStore.add(this.toolsService.registerTool(DragElementToolData, this.instantiationService.createInstance(DragElementTool)));
    this._toolsStore.add(this.toolsService.registerTool(HoverElementToolData, this.instantiationService.createInstance(HoverElementTool)));
    this._toolsStore.add(this.toolsService.registerTool(TypeBrowserToolData, this.instantiationService.createInstance(TypeBrowserTool)));
    this._toolsStore.add(this.toolsService.registerTool(RunPlaywrightCodeToolData, this.instantiationService.createInstance(RunPlaywrightCodeTool)));
    this._toolsStore.add(this.toolsService.registerTool(HandleDialogBrowserToolData, this.instantiationService.createInstance(HandleDialogBrowserTool)));
    this._toolsStore.add(this._browserToolSet.addTool(OpenBrowserToolData));
    this._toolsStore.add(this._browserToolSet.addTool(ReadBrowserToolData));
    this._toolsStore.add(this._browserToolSet.addTool(ScreenshotBrowserToolData));
    this._toolsStore.add(this._browserToolSet.addTool(NavigateBrowserToolData));
    this._toolsStore.add(this._browserToolSet.addTool(ClickBrowserToolData));
    this._toolsStore.add(this._browserToolSet.addTool(DragElementToolData));
    this._toolsStore.add(this._browserToolSet.addTool(HoverElementToolData));
    this._toolsStore.add(this._browserToolSet.addTool(TypeBrowserToolData));
    this._toolsStore.add(this._browserToolSet.addTool(RunPlaywrightCodeToolData));
    this._toolsStore.add(this._browserToolSet.addTool(HandleDialogBrowserToolData));
    this.playwrightService.getTrackedPages().then((ids) => {
      this._trackedIds = new Set(ids);
      this._updateBrowserContext();
    });
    this._toolsStore.add(this.playwrightService.onDidChangeTrackedPages((ids) => {
      this._trackedIds = new Set(ids);
      this._updateBrowserContext();
    }));
    this._toolsStore.add(this.editorService.onDidEditorsChange(() => this._updateBrowserContext()));
  }
  _updateBrowserContext() {
    const lines = [];
    const activeEditor = this.editorService.activeEditor;
    const visibleEditors = new Set(this.editorService.visibleEditors);
    for (const editor of this.editorService.editors) {
      if (editor instanceof BrowserEditorInput && this._trackedIds.has(editor.id)) {
        const title = editor.getTitle() || "Untitled";
        const url = editor.getDescription() || "about:blank";
        const hint = editor === activeEditor ? " (active)" : visibleEditors.has(editor) ? " (visible)" : "";
        lines.push(`- [${editor.id}] ${title} (${url})${hint}`);
      }
    }
    if (lines.length === 0) {
      this.chatContextService.updateWorkspaceContextItems(BrowserChatAgentToolsContribution_1.CONTEXT_ID, []);
      return;
    }
    this.chatContextService.updateWorkspaceContextItems(BrowserChatAgentToolsContribution_1.CONTEXT_ID, [{
      handle: 0,
      label: localize("browserContext.label", "Browser Pages"),
      modelDescription: `The following browser pages are currently available and can be interacted with using the browser tools:`,
      value: lines.join("\n")
    }]);
  }
};
BrowserChatAgentToolsContribution = BrowserChatAgentToolsContribution_1 = __decorate([
  __param(0, IInstantiationService),
  __param(1, ILanguageModelToolsService),
  __param(2, IConfigurationService),
  __param(3, IPlaywrightService),
  __param(4, IChatContextService),
  __param(5, IEditorService)
], BrowserChatAgentToolsContribution);
registerWorkbenchContribution2(
  BrowserChatAgentToolsContribution.ID,
  BrowserChatAgentToolsContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
//# sourceMappingURL=browserTools.contribution.js.map
