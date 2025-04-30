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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { registerAction2 } from "../../../../platform/actions/common/actions.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { EditorPaneDescriptor } from "../../../browser/editor.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { EditorExtensions } from "../../../common/editor.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { HideWebViewEditorFindCommand, ReloadWebviewAction, ShowWebViewEditorFindWidgetAction, WebViewEditorFindNextCommand, WebViewEditorFindPreviousCommand } from "./webviewCommands.js";
import { WebviewEditor } from "./webviewEditor.js";
import { WebviewInput } from "./webviewEditorInput.js";
import { WebviewEditorInputSerializer } from "./webviewEditorInputSerializer.js";
import { IWebviewWorkbenchService, WebviewEditorService } from "./webviewWorkbenchService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(WebviewEditor, WebviewEditor.ID, localize("webview.editor.label", "webview editor")), [new SyncDescriptor(WebviewInput)]);
let WebviewPanelContribution = class WebviewPanelContribution2 extends Disposable {
  static {
    __name(this, "WebviewPanelContribution");
  }
  static {
    this.ID = "workbench.contrib.webviewPanel";
  }
  constructor(editorService, editorGroupService) {
    super();
    this.editorGroupService = editorGroupService;
    this._register(editorService.onWillOpenEditor((e) => {
      const group = editorGroupService.getGroup(e.groupId);
      if (group) {
        this.onEditorOpening(e.editor, group);
      }
    }));
  }
  onEditorOpening(editor, group) {
    if (!(editor instanceof WebviewInput) || editor.typeId !== WebviewInput.typeId) {
      return;
    }
    if (group.contains(editor)) {
      return;
    }
    let previousGroup;
    const groups = this.editorGroupService.groups;
    for (const group2 of groups) {
      if (group2.contains(editor)) {
        previousGroup = group2;
        break;
      }
    }
    if (!previousGroup) {
      return;
    }
    previousGroup.closeEditor(editor);
  }
};
WebviewPanelContribution = __decorate([
  __param(0, IEditorService),
  __param(1, IEditorGroupsService)
], WebviewPanelContribution);
registerWorkbenchContribution2(
  WebviewPanelContribution.ID,
  WebviewPanelContribution,
  1
  /* WorkbenchPhase.BlockStartup */
);
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(WebviewEditorInputSerializer.ID, WebviewEditorInputSerializer);
registerSingleton(
  IWebviewWorkbenchService,
  WebviewEditorService,
  1
  /* InstantiationType.Delayed */
);
registerAction2(ShowWebViewEditorFindWidgetAction);
registerAction2(HideWebViewEditorFindCommand);
registerAction2(WebViewEditorFindNextCommand);
registerAction2(WebViewEditorFindPreviousCommand);
registerAction2(ReloadWebviewAction);
//# sourceMappingURL=webviewPanel.contribution.js.map
