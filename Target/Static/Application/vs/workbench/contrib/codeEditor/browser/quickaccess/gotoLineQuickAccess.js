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
import { localize, localize2 } from "../../../../../nls.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { IEditorService, SIDE_GROUP } from "../../../../services/editor/common/editorService.js";
import { AbstractGotoLineQuickAccessProvider } from "../../../../../editor/contrib/quickAccess/browser/gotoLineQuickAccess.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { Extensions as QuickAccessExtensions } from "../../../../../platform/quickinput/common/quickAccess.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { Action2, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
let GotoLineQuickAccessProvider = class GotoLineQuickAccessProvider2 extends AbstractGotoLineQuickAccessProvider {
  static {
    __name(this, "GotoLineQuickAccessProvider");
  }
  constructor(editorService, configurationService, storageService) {
    super();
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.storageService = storageService;
    this.onDidActiveTextEditorControlChange = this.editorService.onDidActiveEditorChange;
  }
  get configuration() {
    const editorConfig = this.configurationService.getValue().workbench?.editor;
    return {
      openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview
    };
  }
  get activeTextEditorControl() {
    return this.editorService.activeTextEditorControl;
  }
  gotoLocation(context, options) {
    if ((options.keyMods.alt || this.configuration.openEditorPinned && options.keyMods.ctrlCmd || options.forceSideBySide) && this.editorService.activeEditor) {
      context.restoreViewState?.();
      const editorOptions = {
        selection: options.range,
        pinned: options.keyMods.ctrlCmd || this.configuration.openEditorPinned,
        preserveFocus: options.preserveFocus
      };
      this.editorService.openEditor(this.editorService.activeEditor, editorOptions, SIDE_GROUP);
    } else {
      super.gotoLocation(context, options);
    }
  }
};
GotoLineQuickAccessProvider = __decorate([
  __param(0, IEditorService),
  __param(1, IConfigurationService),
  __param(2, IStorageService)
], GotoLineQuickAccessProvider);
class GotoLineAction extends Action2 {
  static {
    __name(this, "GotoLineAction");
  }
  static {
    this.ID = "workbench.action.gotoLine";
  }
  constructor() {
    super({
      id: GotoLineAction.ID,
      title: localize2("gotoLine", "Go to Line/Column..."),
      f1: true,
      keybinding: {
        weight: 200,
        when: null,
        primary: 2048 | 37,
        mac: {
          primary: 256 | 37
          /* KeyCode.KeyG */
        }
      }
    });
  }
  async run(accessor) {
    accessor.get(IQuickInputService).quickAccess.show(GotoLineQuickAccessProvider.GO_TO_LINE_PREFIX);
  }
}
registerAction2(GotoLineAction);
Registry.as(QuickAccessExtensions.Quickaccess).registerQuickAccessProvider({
  ctor: GotoLineQuickAccessProvider,
  prefix: AbstractGotoLineQuickAccessProvider.GO_TO_LINE_PREFIX,
  placeholder: localize("gotoLineQuickAccessPlaceholder", "Type the line number and optional column to go to (e.g. :42:5 for line 42, column 5). Type :: to go to a character offset (e.g. ::1024 for character 1024 from the start of the file). Use negative values to navigate backwards."),
  helpEntries: [{ description: localize("gotoLineQuickAccess", "Go to Line/Column"), commandId: GotoLineAction.ID }]
});
class GotoOffsetAction extends Action2 {
  static {
    __name(this, "GotoOffsetAction");
  }
  static {
    this.ID = "workbench.action.gotoOffset";
  }
  constructor() {
    super({
      id: GotoOffsetAction.ID,
      title: localize2("gotoOffset", "Go to Offset..."),
      f1: true
    });
  }
  async run(accessor) {
    accessor.get(IQuickInputService).quickAccess.show(GotoLineQuickAccessProvider.GO_TO_OFFSET_PREFIX);
  }
}
registerAction2(GotoOffsetAction);
Registry.as(QuickAccessExtensions.Quickaccess).registerQuickAccessProvider({
  ctor: GotoLineQuickAccessProvider,
  prefix: GotoLineQuickAccessProvider.GO_TO_OFFSET_PREFIX,
  placeholder: localize("gotoLineQuickAccessPlaceholder", "Type the line number and optional column to go to (e.g. :42:5 for line 42, column 5). Type :: to go to a character offset (e.g. ::1024 for character 1024 from the start of the file). Use negative values to navigate backwards."),
  helpEntries: [{ description: localize("gotoOffsetQuickAccess", "Go to Offset"), commandId: GotoOffsetAction.ID }]
});
export {
  GotoLineQuickAccessProvider
};
//# sourceMappingURL=gotoLineQuickAccess.js.map
