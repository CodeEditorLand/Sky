var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as browser from "../../../../base/browser/browser.js";
import { getActiveDocument, getActiveWindow } from "../../../../base/browser/dom.js";
import * as platform from "../../../../base/common/platform.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import * as nls from "../../../../nls.js";
import { MenuId, MenuRegistry } from "../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { CopyOptions, InMemoryClipboardMetadataManager } from "../../../browser/controller/editContext/clipboardUtils.js";
import { NativeEditContextRegistry } from "../../../browser/controller/editContext/native/nativeEditContextRegistry.js";
import { EditorAction, MultiCommand, registerEditorAction } from "../../../browser/editorExtensions.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { CopyPasteController } from "../../dropOrPasteInto/browser/copyPasteController.js";
const CLIPBOARD_CONTEXT_MENU_GROUP = "9_cutcopypaste";
const supportsCut = platform.isNative || document.queryCommandSupported("cut");
const supportsCopy = platform.isNative || document.queryCommandSupported("copy");
const supportsPaste = typeof navigator.clipboard === "undefined" || browser.isFirefox ? document.queryCommandSupported("paste") : true;
function registerCommand(command) {
  command.register();
  return command;
}
__name(registerCommand, "registerCommand");
const CutAction = supportsCut ? registerCommand(new MultiCommand({
  id: "editor.action.clipboardCutAction",
  precondition: void 0,
  kbOpts: (
    // Do not bind cut keybindings in the browser,
    // since browsers do that for us and it avoids security prompts
    platform.isNative ? {
      primary: 2048 | 54,
      win: { primary: 2048 | 54, secondary: [
        1024 | 20
        /* KeyCode.Delete */
      ] },
      weight: 100
      /* KeybindingWeight.EditorContrib */
    } : void 0
  ),
  menuOpts: [{
    menuId: MenuId.MenubarEditMenu,
    group: "2_ccp",
    title: nls.localize({ key: "miCut", comment: ["&& denotes a mnemonic"] }, "Cu&&t"),
    order: 1
  }, {
    menuId: MenuId.EditorContext,
    group: CLIPBOARD_CONTEXT_MENU_GROUP,
    title: nls.localize("actions.clipboard.cutLabel", "Cut"),
    when: EditorContextKeys.writable,
    order: 1
  }, {
    menuId: MenuId.CommandPalette,
    group: "",
    title: nls.localize("actions.clipboard.cutLabel", "Cut"),
    order: 1
  }, {
    menuId: MenuId.SimpleEditorContext,
    group: CLIPBOARD_CONTEXT_MENU_GROUP,
    title: nls.localize("actions.clipboard.cutLabel", "Cut"),
    when: EditorContextKeys.writable,
    order: 1
  }]
})) : void 0;
const CopyAction = supportsCopy ? registerCommand(new MultiCommand({
  id: "editor.action.clipboardCopyAction",
  precondition: void 0,
  kbOpts: (
    // Do not bind copy keybindings in the browser,
    // since browsers do that for us and it avoids security prompts
    platform.isNative ? {
      primary: 2048 | 33,
      win: { primary: 2048 | 33, secondary: [
        2048 | 19
        /* KeyCode.Insert */
      ] },
      weight: 100
      /* KeybindingWeight.EditorContrib */
    } : void 0
  ),
  menuOpts: [{
    menuId: MenuId.MenubarEditMenu,
    group: "2_ccp",
    title: nls.localize({ key: "miCopy", comment: ["&& denotes a mnemonic"] }, "&&Copy"),
    order: 2
  }, {
    menuId: MenuId.EditorContext,
    group: CLIPBOARD_CONTEXT_MENU_GROUP,
    title: nls.localize("actions.clipboard.copyLabel", "Copy"),
    order: 2
  }, {
    menuId: MenuId.CommandPalette,
    group: "",
    title: nls.localize("actions.clipboard.copyLabel", "Copy"),
    order: 1
  }, {
    menuId: MenuId.SimpleEditorContext,
    group: CLIPBOARD_CONTEXT_MENU_GROUP,
    title: nls.localize("actions.clipboard.copyLabel", "Copy"),
    order: 2
  }]
})) : void 0;
MenuRegistry.appendMenuItem(MenuId.MenubarEditMenu, { submenu: MenuId.MenubarCopy, title: nls.localize2("copy as", "Copy As"), group: "2_ccp", order: 3 });
MenuRegistry.appendMenuItem(MenuId.EditorContext, { submenu: MenuId.EditorContextCopy, title: nls.localize2("copy as", "Copy As"), group: CLIPBOARD_CONTEXT_MENU_GROUP, order: 3 });
MenuRegistry.appendMenuItem(MenuId.EditorContext, { submenu: MenuId.EditorContextShare, title: nls.localize2("share", "Share"), group: "11_share", order: -1, when: ContextKeyExpr.and(ContextKeyExpr.notEquals("resourceScheme", "output"), EditorContextKeys.editorTextFocus) });
MenuRegistry.appendMenuItem(MenuId.ExplorerContext, { submenu: MenuId.ExplorerContextShare, title: nls.localize2("share", "Share"), group: "11_share", order: -1 });
const PasteAction = supportsPaste ? registerCommand(new MultiCommand({
  id: "editor.action.clipboardPasteAction",
  precondition: void 0,
  kbOpts: (
    // Do not bind paste keybindings in the browser,
    // since browsers do that for us and it avoids security prompts
    platform.isNative ? {
      primary: 2048 | 52,
      win: { primary: 2048 | 52, secondary: [
        1024 | 19
        /* KeyCode.Insert */
      ] },
      linux: { primary: 2048 | 52, secondary: [
        1024 | 19
        /* KeyCode.Insert */
      ] },
      weight: 100
      /* KeybindingWeight.EditorContrib */
    } : void 0
  ),
  menuOpts: [{
    menuId: MenuId.MenubarEditMenu,
    group: "2_ccp",
    title: nls.localize({ key: "miPaste", comment: ["&& denotes a mnemonic"] }, "&&Paste"),
    order: 4
  }, {
    menuId: MenuId.EditorContext,
    group: CLIPBOARD_CONTEXT_MENU_GROUP,
    title: nls.localize("actions.clipboard.pasteLabel", "Paste"),
    when: EditorContextKeys.writable,
    order: 4
  }, {
    menuId: MenuId.CommandPalette,
    group: "",
    title: nls.localize("actions.clipboard.pasteLabel", "Paste"),
    order: 1
  }, {
    menuId: MenuId.SimpleEditorContext,
    group: CLIPBOARD_CONTEXT_MENU_GROUP,
    title: nls.localize("actions.clipboard.pasteLabel", "Paste"),
    when: EditorContextKeys.writable,
    order: 4
  }]
})) : void 0;
class ExecCommandCopyWithSyntaxHighlightingAction extends EditorAction {
  static {
    __name(this, "ExecCommandCopyWithSyntaxHighlightingAction");
  }
  constructor() {
    super({
      id: "editor.action.clipboardCopyWithSyntaxHighlightingAction",
      label: nls.localize2("actions.clipboard.copyWithSyntaxHighlightingLabel", "Copy with Syntax Highlighting"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 0,
        weight: 100
        /* KeybindingWeight.EditorContrib */
      }
    });
  }
  run(accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const emptySelectionClipboard = editor.getOption(
      41
      /* EditorOption.emptySelectionClipboard */
    );
    if (!emptySelectionClipboard && editor.getSelection().isEmpty()) {
      return;
    }
    CopyOptions.forceCopyWithSyntaxHighlighting = true;
    editor.focus();
    editor.getContainerDomNode().ownerDocument.execCommand("copy");
    CopyOptions.forceCopyWithSyntaxHighlighting = false;
  }
}
function registerExecCommandImpl(target, browserCommand) {
  if (!target) {
    return;
  }
  target.addImplementation(1e4, "code-editor", (accessor, args) => {
    const focusedEditor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
    if (focusedEditor && focusedEditor.hasTextFocus()) {
      const emptySelectionClipboard = focusedEditor.getOption(
        41
        /* EditorOption.emptySelectionClipboard */
      );
      const selection = focusedEditor.getSelection();
      if (selection && selection.isEmpty() && !emptySelectionClipboard) {
        return true;
      }
      if (focusedEditor.getOption(
        159
        /* EditorOption.effectiveEditContext */
      ) && browserCommand === "cut") {
        focusedEditor.getContainerDomNode().ownerDocument.execCommand("copy");
        focusedEditor.trigger(void 0, "cut", void 0);
      } else {
        focusedEditor.getContainerDomNode().ownerDocument.execCommand(browserCommand);
      }
      return true;
    }
    return false;
  });
  target.addImplementation(0, "generic-dom", (accessor, args) => {
    getActiveDocument().execCommand(browserCommand);
    return true;
  });
}
__name(registerExecCommandImpl, "registerExecCommandImpl");
registerExecCommandImpl(CutAction, "cut");
registerExecCommandImpl(CopyAction, "copy");
if (PasteAction) {
  PasteAction.addImplementation(1e4, "code-editor", (accessor, args) => {
    const codeEditorService = accessor.get(ICodeEditorService);
    const clipboardService = accessor.get(IClipboardService);
    const telemetryService = accessor.get(ITelemetryService);
    const productService = accessor.get(IProductService);
    const focusedEditor = codeEditorService.getFocusedCodeEditor();
    if (focusedEditor && focusedEditor.hasModel() && focusedEditor.hasTextFocus()) {
      const editContextEnabled = focusedEditor.getOption(
        159
        /* EditorOption.effectiveEditContext */
      );
      if (editContextEnabled) {
        const nativeEditContext = NativeEditContextRegistry.get(focusedEditor.getId());
        if (nativeEditContext) {
          nativeEditContext.onWillPaste();
        }
      }
      const sw = StopWatch.create(true);
      const triggerPaste = clipboardService.triggerPaste(getActiveWindow().vscodeWindowId);
      if (triggerPaste) {
        return triggerPaste.then(async () => {
          if (productService.quality !== "stable") {
            const duration = sw.elapsed();
            telemetryService.publicLog2("editorAsyncPaste", { duration });
          }
          return CopyPasteController.get(focusedEditor)?.finishedPaste() ?? Promise.resolve();
        });
      }
      if (platform.isWeb) {
        return (async () => {
          const clipboardText = await clipboardService.readText();
          if (clipboardText !== "") {
            const metadata = InMemoryClipboardMetadataManager.INSTANCE.get(clipboardText);
            let pasteOnNewLine = false;
            let multicursorText = null;
            let mode = null;
            if (metadata) {
              pasteOnNewLine = focusedEditor.getOption(
                41
                /* EditorOption.emptySelectionClipboard */
              ) && !!metadata.isFromEmptySelection;
              multicursorText = typeof metadata.multicursorText !== "undefined" ? metadata.multicursorText : null;
              mode = metadata.mode;
            }
            focusedEditor.trigger("keyboard", "paste", {
              text: clipboardText,
              pasteOnNewLine,
              multicursorText,
              mode
            });
          }
        })();
      }
      return true;
    }
    return false;
  });
  PasteAction.addImplementation(0, "generic-dom", (accessor, args) => {
    const triggerPaste = accessor.get(IClipboardService).triggerPaste(getActiveWindow().vscodeWindowId);
    return triggerPaste ?? false;
  });
}
if (supportsCopy) {
  registerEditorAction(ExecCommandCopyWithSyntaxHighlightingAction);
}
export {
  CopyAction,
  CutAction,
  PasteAction
};
//# sourceMappingURL=clipboard.js.map
