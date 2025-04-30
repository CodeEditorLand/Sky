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
var InlineAnchorWidget_1;
import * as dom from "../../../../base/browser/dom.js";
import { StandardMouseEvent } from "../../../../base/browser/mouseEvent.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { SymbolKinds } from "../../../../editor/common/languages.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { getIconClasses } from "../../../../editor/common/services/getIconClasses.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { DefinitionAction } from "../../../../editor/contrib/gotoSymbol/browser/goToCommands.js";
import * as nls from "../../../../nls.js";
import { getFlatContextMenuActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { Action2, IMenuService, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { FileKind, IFileService } from "../../../../platform/files/common/files.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { FolderThemeIcon, IThemeService } from "../../../../platform/theme/common/themeService.js";
import { fillEditorsDragData } from "../../../browser/dnd.js";
import { ResourceContextKey } from "../../../common/contextkeys.js";
import { IEditorService, SIDE_GROUP } from "../../../services/editor/common/editorService.js";
import { ExplorerFolderContext } from "../../files/common/files.js";
import { IChatWidgetService } from "./chat.js";
import { chatAttachmentResourceContextKey, hookUpSymbolAttachmentDragAndContextMenu } from "./chatContentParts/chatAttachmentsContentPart.js";
import { IChatMarkdownAnchorService } from "./chatContentParts/chatMarkdownAnchorService.js";
let InlineAnchorWidget = class InlineAnchorWidget2 extends Disposable {
  static {
    __name(this, "InlineAnchorWidget");
  }
  static {
    InlineAnchorWidget_1 = this;
  }
  static {
    this.className = "chat-inline-anchor-widget";
  }
  constructor(element, inlineReference, originalContextKeyService, contextMenuService, fileService, hoverService, instantiationService, labelService, languageService, menuService, modelService, telemetryService, themeService) {
    super();
    this.element = element;
    this.inlineReference = inlineReference;
    this._isDisposed = false;
    this.data = "uri" in inlineReference.inlineReference ? inlineReference.inlineReference : "name" in inlineReference.inlineReference ? { kind: "symbol", symbol: inlineReference.inlineReference } : { uri: inlineReference.inlineReference };
    const contextKeyService = this._register(originalContextKeyService.createScoped(element));
    this._chatResourceContext = chatAttachmentResourceContextKey.bindTo(contextKeyService);
    element.classList.add(InlineAnchorWidget_1.className, "show-file-icons");
    let iconText;
    let iconClasses;
    let location;
    let updateContextKeys;
    if (this.data.kind === "symbol") {
      const symbol = this.data.symbol;
      location = this.data.symbol.location;
      iconText = this.data.symbol.name;
      iconClasses = ["codicon", ...getIconClasses(modelService, languageService, void 0, void 0, SymbolKinds.toIcon(symbol.kind))];
      this._store.add(instantiationService.invokeFunction((accessor) => hookUpSymbolAttachmentDragAndContextMenu(accessor, element, contextKeyService, { value: symbol.location, name: symbol.name, kind: symbol.kind }, MenuId.ChatInlineSymbolAnchorContext)));
    } else {
      location = this.data;
      const label = labelService.getUriBasenameLabel(location.uri);
      iconText = location.range && this.data.kind !== "symbol" ? `${label}#${location.range.startLineNumber}-${location.range.endLineNumber}` : label;
      let fileKind = location.uri.path.endsWith("/") ? FileKind.FOLDER : FileKind.FILE;
      const recomputeIconClasses = /* @__PURE__ */ __name(() => getIconClasses(modelService, languageService, location.uri, fileKind, fileKind === FileKind.FOLDER && !themeService.getFileIconTheme().hasFolderIcons ? FolderThemeIcon : void 0), "recomputeIconClasses");
      iconClasses = recomputeIconClasses();
      const refreshIconClasses = /* @__PURE__ */ __name(() => {
        iconEl.classList.remove(...iconClasses);
        iconClasses = recomputeIconClasses();
        iconEl.classList.add(...iconClasses);
      }, "refreshIconClasses");
      this._register(themeService.onDidFileIconThemeChange(() => {
        refreshIconClasses();
      }));
      const isFolderContext = ExplorerFolderContext.bindTo(contextKeyService);
      fileService.stat(location.uri).then((stat) => {
        isFolderContext.set(stat.isDirectory);
        if (stat.isDirectory) {
          fileKind = FileKind.FOLDER;
          refreshIconClasses();
        }
      }).catch(() => {
      });
      this._register(dom.addDisposableListener(element, dom.EventType.CONTEXT_MENU, async (domEvent) => {
        const event = new StandardMouseEvent(dom.getWindow(domEvent), domEvent);
        dom.EventHelper.stop(domEvent, true);
        try {
          await updateContextKeys?.();
        } catch (e) {
          console.error(e);
        }
        if (this._isDisposed) {
          return;
        }
        contextMenuService.showContextMenu({
          contextKeyService,
          getAnchor: /* @__PURE__ */ __name(() => event, "getAnchor"),
          getActions: /* @__PURE__ */ __name(() => {
            const menu = menuService.getMenuActions(MenuId.ChatInlineResourceAnchorContext, contextKeyService, { arg: location.uri });
            return getFlatContextMenuActions(menu);
          }, "getActions")
        });
      }));
    }
    const resourceContextKey = this._register(new ResourceContextKey(contextKeyService, fileService, languageService, modelService));
    resourceContextKey.set(location.uri);
    this._chatResourceContext.set(location.uri.toString());
    const iconEl = dom.$("span.icon");
    iconEl.classList.add(...iconClasses);
    element.replaceChildren(iconEl, dom.$("span.icon-label", {}, iconText));
    const fragment = location.range ? `${location.range.startLineNumber},${location.range.startColumn}` : "";
    element.setAttribute("data-href", (fragment ? location.uri.with({ fragment }) : location.uri).toString());
    const relativeLabel = labelService.getUriLabel(location.uri, { relative: true });
    this._register(hoverService.setupManagedHover(getDefaultHoverDelegate("element"), element, relativeLabel));
    if (this.data.kind !== "symbol") {
      element.draggable = true;
      this._register(dom.addDisposableListener(element, "dragstart", (e) => {
        const stat = {
          resource: location.uri,
          selection: location.range
        };
        instantiationService.invokeFunction((accessor) => fillEditorsDragData(accessor, [stat], e));
        e.dataTransfer?.setDragImage(element, 0, 0);
      }));
    }
  }
  dispose() {
    this._isDisposed = true;
    super.dispose();
  }
  getHTMLElement() {
    return this.element;
  }
};
InlineAnchorWidget = InlineAnchorWidget_1 = __decorate([
  __param(2, IContextKeyService),
  __param(3, IContextMenuService),
  __param(4, IFileService),
  __param(5, IHoverService),
  __param(6, IInstantiationService),
  __param(7, ILabelService),
  __param(8, ILanguageService),
  __param(9, IMenuService),
  __param(10, IModelService),
  __param(11, ITelemetryService),
  __param(12, IThemeService)
], InlineAnchorWidget);
registerAction2(class AddFileToChatAction extends Action2 {
  static {
    __name(this, "AddFileToChatAction");
  }
  static {
    this.id = "chat.inlineResourceAnchor.addFileToChat";
  }
  constructor() {
    super({
      id: AddFileToChatAction.id,
      title: nls.localize2("actions.attach.label", "Add File to Chat"),
      menu: [{
        id: MenuId.ChatInlineResourceAnchorContext,
        group: "chat",
        order: 1,
        when: ExplorerFolderContext.negate()
      }]
    });
  }
  async run(accessor, resource) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = chatWidgetService.lastFocusedWidget;
    if (widget) {
      widget.attachmentModel.addFile(resource);
    }
  }
});
registerAction2(class CopyResourceAction extends Action2 {
  static {
    __name(this, "CopyResourceAction");
  }
  static {
    this.id = "chat.inlineResourceAnchor.copyResource";
  }
  constructor() {
    super({
      id: CopyResourceAction.id,
      title: nls.localize2("actions.copy.label", "Copy"),
      f1: false,
      precondition: chatAttachmentResourceContextKey,
      keybinding: {
        weight: 200,
        primary: 2048 | 33
      }
    });
  }
  async run(accessor) {
    const chatWidgetService = accessor.get(IChatMarkdownAnchorService);
    const clipboardService = accessor.get(IClipboardService);
    const anchor = chatWidgetService.lastFocusedAnchor;
    if (!anchor) {
      return;
    }
    const resource = anchor.data.kind === "symbol" ? anchor.data.symbol.location.uri : anchor.data.uri;
    clipboardService.writeResources([resource]);
  }
});
registerAction2(class OpenToSideResourceAction extends Action2 {
  static {
    __name(this, "OpenToSideResourceAction");
  }
  static {
    this.id = "chat.inlineResourceAnchor.openToSide";
  }
  constructor() {
    super({
      id: OpenToSideResourceAction.id,
      title: nls.localize2("actions.openToSide.label", "Open to the Side"),
      f1: false,
      precondition: chatAttachmentResourceContextKey,
      keybinding: {
        weight: 400 + 2,
        primary: 2048 | 3,
        mac: {
          primary: 256 | 3
          /* KeyCode.Enter */
        }
      },
      menu: [MenuId.ChatInlineSymbolAnchorContext, MenuId.ChatInputSymbolAttachmentContext].map((id) => ({
        id,
        group: "navigation",
        order: 1
      }))
    });
  }
  async run(accessor, arg) {
    const editorService = accessor.get(IEditorService);
    const target = this.getTarget(accessor, arg);
    if (!target) {
      return;
    }
    const input = URI.isUri(target) ? { resource: target } : {
      resource: target.uri,
      options: {
        selection: {
          startColumn: target.range.startColumn,
          startLineNumber: target.range.startLineNumber
        }
      }
    };
    await editorService.openEditors([input], SIDE_GROUP);
  }
  getTarget(accessor, arg) {
    const chatWidgetService = accessor.get(IChatMarkdownAnchorService);
    if (arg) {
      return arg;
    }
    const anchor = chatWidgetService.lastFocusedAnchor;
    if (!anchor) {
      return void 0;
    }
    return anchor.data.kind === "symbol" ? anchor.data.symbol.location : anchor.data.uri;
  }
});
registerAction2(class GoToDefinitionAction extends Action2 {
  static {
    __name(this, "GoToDefinitionAction");
  }
  static {
    this.id = "chat.inlineSymbolAnchor.goToDefinition";
  }
  constructor() {
    super({
      id: GoToDefinitionAction.id,
      title: {
        ...nls.localize2("actions.goToDecl.label", "Go to Definition"),
        mnemonicTitle: nls.localize({ key: "miGotoDefinition", comment: ["&& denotes a mnemonic"] }, "Go to &&Definition")
      },
      menu: [MenuId.ChatInlineSymbolAnchorContext, MenuId.ChatInputSymbolAttachmentContext].map((id) => ({
        id,
        group: "4_symbol_nav",
        order: 1.1,
        when: EditorContextKeys.hasDefinitionProvider
      }))
    });
  }
  async run(accessor, location) {
    const editorService = accessor.get(ICodeEditorService);
    const instantiationService = accessor.get(IInstantiationService);
    await openEditorWithSelection(editorService, location);
    const action = new DefinitionAction({ openToSide: false, openInPeek: false, muteMessage: true }, { title: { value: "", original: "" }, id: "", precondition: void 0 });
    return instantiationService.invokeFunction((accessor2) => action.run(accessor2));
  }
});
async function openEditorWithSelection(editorService, location) {
  await editorService.openCodeEditor({
    resource: location.uri,
    options: {
      selection: {
        startColumn: location.range.startColumn,
        startLineNumber: location.range.startLineNumber
      }
    }
  }, null);
}
__name(openEditorWithSelection, "openEditorWithSelection");
async function runGoToCommand(accessor, command, location) {
  const editorService = accessor.get(ICodeEditorService);
  const commandService = accessor.get(ICommandService);
  await openEditorWithSelection(editorService, location);
  return commandService.executeCommand(command);
}
__name(runGoToCommand, "runGoToCommand");
registerAction2(class GoToTypeDefinitionsAction extends Action2 {
  static {
    __name(this, "GoToTypeDefinitionsAction");
  }
  static {
    this.id = "chat.inlineSymbolAnchor.goToTypeDefinitions";
  }
  constructor() {
    super({
      id: GoToTypeDefinitionsAction.id,
      title: {
        ...nls.localize2("goToTypeDefinitions.label", "Go to Type Definitions"),
        mnemonicTitle: nls.localize({ key: "miGotoTypeDefinition", comment: ["&& denotes a mnemonic"] }, "Go to &&Type Definitions")
      },
      menu: [MenuId.ChatInlineSymbolAnchorContext, MenuId.ChatInputSymbolAttachmentContext].map((id) => ({
        id,
        group: "4_symbol_nav",
        order: 1.1,
        when: EditorContextKeys.hasTypeDefinitionProvider
      }))
    });
  }
  async run(accessor, location) {
    return runGoToCommand(accessor, "editor.action.goToTypeDefinition", location);
  }
});
registerAction2(class GoToImplementations extends Action2 {
  static {
    __name(this, "GoToImplementations");
  }
  static {
    this.id = "chat.inlineSymbolAnchor.goToImplementations";
  }
  constructor() {
    super({
      id: GoToImplementations.id,
      title: {
        ...nls.localize2("goToImplementations.label", "Go to Implementations"),
        mnemonicTitle: nls.localize({ key: "miGotoImplementations", comment: ["&& denotes a mnemonic"] }, "Go to &&Implementations")
      },
      menu: [MenuId.ChatInlineSymbolAnchorContext, MenuId.ChatInputSymbolAttachmentContext].map((id) => ({
        id,
        group: "4_symbol_nav",
        order: 1.2,
        when: EditorContextKeys.hasImplementationProvider
      }))
    });
  }
  async run(accessor, location) {
    return runGoToCommand(accessor, "editor.action.goToImplementation", location);
  }
});
registerAction2(class GoToReferencesAction extends Action2 {
  static {
    __name(this, "GoToReferencesAction");
  }
  static {
    this.id = "chat.inlineSymbolAnchor.goToReferences";
  }
  constructor() {
    super({
      id: GoToReferencesAction.id,
      title: {
        ...nls.localize2("goToReferences.label", "Go to References"),
        mnemonicTitle: nls.localize({ key: "miGotoReference", comment: ["&& denotes a mnemonic"] }, "Go to &&References")
      },
      menu: [MenuId.ChatInlineSymbolAnchorContext, MenuId.ChatInputSymbolAttachmentContext].map((id) => ({
        id,
        group: "4_symbol_nav",
        order: 1.3,
        when: EditorContextKeys.hasReferenceProvider
      }))
    });
  }
  async run(accessor, location) {
    return runGoToCommand(accessor, "editor.action.goToReferences", location);
  }
});
export {
  InlineAnchorWidget
};
//# sourceMappingURL=chatInlineAnchorWidget.js.map
