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
import { IAction, SubmenuAction } from "../../../base/common/actions.js";
import { Event, MicrotaskEmitter } from "../../../base/common/event.js";
import { DisposableStore, dispose, IDisposable, markAsSingleton, toDisposable } from "../../../base/common/lifecycle.js";
import { LinkedList } from "../../../base/common/linkedList.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { ICommandAction, ICommandActionTitle, Icon, ILocalizedString } from "../../action/common/action.js";
import { Categories } from "../../action/common/actionCommonCategories.js";
import { CommandsRegistry, ICommandService } from "../../commands/common/commands.js";
import { ContextKeyExpr, ContextKeyExpression, IContextKeyService } from "../../contextkey/common/contextkey.js";
import { createDecorator, ServicesAccessor } from "../../instantiation/common/instantiation.js";
import { IKeybindingRule, KeybindingsRegistry } from "../../keybinding/common/keybindingsRegistry.js";
function isIMenuItem(item) {
  return item.command !== void 0;
}
__name(isIMenuItem, "isIMenuItem");
function isISubmenuItem(item) {
  return item.submenu !== void 0;
}
__name(isISubmenuItem, "isISubmenuItem");
class MenuId {
  static {
    __name(this, "MenuId");
  }
  static _instances = /* @__PURE__ */ new Map();
  static CommandPalette = new MenuId("CommandPalette");
  static DebugBreakpointsContext = new MenuId("DebugBreakpointsContext");
  static DebugCallStackContext = new MenuId("DebugCallStackContext");
  static DebugConsoleContext = new MenuId("DebugConsoleContext");
  static DebugVariablesContext = new MenuId("DebugVariablesContext");
  static NotebookVariablesContext = new MenuId("NotebookVariablesContext");
  static DebugHoverContext = new MenuId("DebugHoverContext");
  static DebugWatchContext = new MenuId("DebugWatchContext");
  static DebugToolBar = new MenuId("DebugToolBar");
  static DebugToolBarStop = new MenuId("DebugToolBarStop");
  static DebugDisassemblyContext = new MenuId("DebugDisassemblyContext");
  static DebugCallStackToolbar = new MenuId("DebugCallStackToolbar");
  static DebugCreateConfiguration = new MenuId("DebugCreateConfiguration");
  static EditorContext = new MenuId("EditorContext");
  static SimpleEditorContext = new MenuId("SimpleEditorContext");
  static EditorContent = new MenuId("EditorContent");
  static EditorLineNumberContext = new MenuId("EditorLineNumberContext");
  static EditorContextCopy = new MenuId("EditorContextCopy");
  static EditorContextPeek = new MenuId("EditorContextPeek");
  static EditorContextShare = new MenuId("EditorContextShare");
  static EditorTitle = new MenuId("EditorTitle");
  static EditorTitleRun = new MenuId("EditorTitleRun");
  static EditorTitleContext = new MenuId("EditorTitleContext");
  static EditorTitleContextShare = new MenuId("EditorTitleContextShare");
  static EmptyEditorGroup = new MenuId("EmptyEditorGroup");
  static EmptyEditorGroupContext = new MenuId("EmptyEditorGroupContext");
  static EditorTabsBarContext = new MenuId("EditorTabsBarContext");
  static EditorTabsBarShowTabsSubmenu = new MenuId("EditorTabsBarShowTabsSubmenu");
  static EditorTabsBarShowTabsZenModeSubmenu = new MenuId("EditorTabsBarShowTabsZenModeSubmenu");
  static EditorActionsPositionSubmenu = new MenuId("EditorActionsPositionSubmenu");
  static ExplorerContext = new MenuId("ExplorerContext");
  static ExplorerContextShare = new MenuId("ExplorerContextShare");
  static ExtensionContext = new MenuId("ExtensionContext");
  static ExtensionEditorContextMenu = new MenuId("ExtensionEditorContextMenu");
  static GlobalActivity = new MenuId("GlobalActivity");
  static CommandCenter = new MenuId("CommandCenter");
  static CommandCenterCenter = new MenuId("CommandCenterCenter");
  static LayoutControlMenuSubmenu = new MenuId("LayoutControlMenuSubmenu");
  static LayoutControlMenu = new MenuId("LayoutControlMenu");
  static MenubarMainMenu = new MenuId("MenubarMainMenu");
  static MenubarAppearanceMenu = new MenuId("MenubarAppearanceMenu");
  static MenubarDebugMenu = new MenuId("MenubarDebugMenu");
  static MenubarEditMenu = new MenuId("MenubarEditMenu");
  static MenubarCopy = new MenuId("MenubarCopy");
  static MenubarFileMenu = new MenuId("MenubarFileMenu");
  static MenubarGoMenu = new MenuId("MenubarGoMenu");
  static MenubarHelpMenu = new MenuId("MenubarHelpMenu");
  static MenubarLayoutMenu = new MenuId("MenubarLayoutMenu");
  static MenubarNewBreakpointMenu = new MenuId("MenubarNewBreakpointMenu");
  static PanelAlignmentMenu = new MenuId("PanelAlignmentMenu");
  static PanelPositionMenu = new MenuId("PanelPositionMenu");
  static ActivityBarPositionMenu = new MenuId("ActivityBarPositionMenu");
  static MenubarPreferencesMenu = new MenuId("MenubarPreferencesMenu");
  static MenubarRecentMenu = new MenuId("MenubarRecentMenu");
  static MenubarSelectionMenu = new MenuId("MenubarSelectionMenu");
  static MenubarShare = new MenuId("MenubarShare");
  static MenubarSwitchEditorMenu = new MenuId("MenubarSwitchEditorMenu");
  static MenubarSwitchGroupMenu = new MenuId("MenubarSwitchGroupMenu");
  static MenubarTerminalMenu = new MenuId("MenubarTerminalMenu");
  static MenubarTerminalSuggestStatusMenu = new MenuId("MenubarTerminalSuggestStatusMenu");
  static MenubarViewMenu = new MenuId("MenubarViewMenu");
  static MenubarHomeMenu = new MenuId("MenubarHomeMenu");
  static OpenEditorsContext = new MenuId("OpenEditorsContext");
  static OpenEditorsContextShare = new MenuId("OpenEditorsContextShare");
  static ProblemsPanelContext = new MenuId("ProblemsPanelContext");
  static SCMInputBox = new MenuId("SCMInputBox");
  static SCMChangeContext = new MenuId("SCMChangeContext");
  static SCMResourceContext = new MenuId("SCMResourceContext");
  static SCMResourceContextShare = new MenuId("SCMResourceContextShare");
  static SCMResourceFolderContext = new MenuId("SCMResourceFolderContext");
  static SCMResourceGroupContext = new MenuId("SCMResourceGroupContext");
  static SCMSourceControl = new MenuId("SCMSourceControl");
  static SCMSourceControlInline = new MenuId("SCMSourceControlInline");
  static SCMSourceControlTitle = new MenuId("SCMSourceControlTitle");
  static SCMHistoryTitle = new MenuId("SCMHistoryTitle");
  static SCMHistoryItemContext = new MenuId("SCMHistoryItemContext");
  static SCMHistoryItemHover = new MenuId("SCMHistoryItemHover");
  static SCMHistoryItemRefContext = new MenuId("SCMHistoryItemRefContext");
  static SCMTitle = new MenuId("SCMTitle");
  static SearchContext = new MenuId("SearchContext");
  static SearchActionMenu = new MenuId("SearchActionContext");
  static StatusBarWindowIndicatorMenu = new MenuId("StatusBarWindowIndicatorMenu");
  static StatusBarRemoteIndicatorMenu = new MenuId("StatusBarRemoteIndicatorMenu");
  static StickyScrollContext = new MenuId("StickyScrollContext");
  static TestItem = new MenuId("TestItem");
  static TestItemGutter = new MenuId("TestItemGutter");
  static TestProfilesContext = new MenuId("TestProfilesContext");
  static TestMessageContext = new MenuId("TestMessageContext");
  static TestMessageContent = new MenuId("TestMessageContent");
  static TestPeekElement = new MenuId("TestPeekElement");
  static TestPeekTitle = new MenuId("TestPeekTitle");
  static TestCallStack = new MenuId("TestCallStack");
  static TestCoverageFilterItem = new MenuId("TestCoverageFilterItem");
  static TouchBarContext = new MenuId("TouchBarContext");
  static TitleBar = new MenuId("TitleBar");
  static TitleBarContext = new MenuId("TitleBarContext");
  static TitleBarTitleContext = new MenuId("TitleBarTitleContext");
  static TunnelContext = new MenuId("TunnelContext");
  static TunnelPrivacy = new MenuId("TunnelPrivacy");
  static TunnelProtocol = new MenuId("TunnelProtocol");
  static TunnelPortInline = new MenuId("TunnelInline");
  static TunnelTitle = new MenuId("TunnelTitle");
  static TunnelLocalAddressInline = new MenuId("TunnelLocalAddressInline");
  static TunnelOriginInline = new MenuId("TunnelOriginInline");
  static ViewItemContext = new MenuId("ViewItemContext");
  static ViewContainerTitle = new MenuId("ViewContainerTitle");
  static ViewContainerTitleContext = new MenuId("ViewContainerTitleContext");
  static ViewTitle = new MenuId("ViewTitle");
  static ViewTitleContext = new MenuId("ViewTitleContext");
  static CommentEditorActions = new MenuId("CommentEditorActions");
  static CommentThreadTitle = new MenuId("CommentThreadTitle");
  static CommentThreadActions = new MenuId("CommentThreadActions");
  static CommentThreadAdditionalActions = new MenuId("CommentThreadAdditionalActions");
  static CommentThreadTitleContext = new MenuId("CommentThreadTitleContext");
  static CommentThreadCommentContext = new MenuId("CommentThreadCommentContext");
  static CommentTitle = new MenuId("CommentTitle");
  static CommentActions = new MenuId("CommentActions");
  static CommentsViewThreadActions = new MenuId("CommentsViewThreadActions");
  static InteractiveToolbar = new MenuId("InteractiveToolbar");
  static InteractiveCellTitle = new MenuId("InteractiveCellTitle");
  static InteractiveCellDelete = new MenuId("InteractiveCellDelete");
  static InteractiveCellExecute = new MenuId("InteractiveCellExecute");
  static InteractiveInputExecute = new MenuId("InteractiveInputExecute");
  static InteractiveInputConfig = new MenuId("InteractiveInputConfig");
  static ReplInputExecute = new MenuId("ReplInputExecute");
  static IssueReporter = new MenuId("IssueReporter");
  static NotebookToolbar = new MenuId("NotebookToolbar");
  static NotebookToolbarContext = new MenuId("NotebookToolbarContext");
  static NotebookStickyScrollContext = new MenuId("NotebookStickyScrollContext");
  static NotebookCellTitle = new MenuId("NotebookCellTitle");
  static NotebookCellDelete = new MenuId("NotebookCellDelete");
  static NotebookCellInsert = new MenuId("NotebookCellInsert");
  static NotebookCellBetween = new MenuId("NotebookCellBetween");
  static NotebookCellListTop = new MenuId("NotebookCellTop");
  static NotebookCellExecute = new MenuId("NotebookCellExecute");
  static NotebookCellExecuteGoTo = new MenuId("NotebookCellExecuteGoTo");
  static NotebookCellExecutePrimary = new MenuId("NotebookCellExecutePrimary");
  static NotebookDiffCellInputTitle = new MenuId("NotebookDiffCellInputTitle");
  static NotebookDiffDocumentMetadata = new MenuId("NotebookDiffDocumentMetadata");
  static NotebookDiffCellMetadataTitle = new MenuId("NotebookDiffCellMetadataTitle");
  static NotebookDiffCellOutputsTitle = new MenuId("NotebookDiffCellOutputsTitle");
  static NotebookOutputToolbar = new MenuId("NotebookOutputToolbar");
  static NotebookOutlineFilter = new MenuId("NotebookOutlineFilter");
  static NotebookOutlineActionMenu = new MenuId("NotebookOutlineActionMenu");
  static NotebookEditorLayoutConfigure = new MenuId("NotebookEditorLayoutConfigure");
  static NotebookKernelSource = new MenuId("NotebookKernelSource");
  static BulkEditTitle = new MenuId("BulkEditTitle");
  static BulkEditContext = new MenuId("BulkEditContext");
  static TimelineItemContext = new MenuId("TimelineItemContext");
  static TimelineTitle = new MenuId("TimelineTitle");
  static TimelineTitleContext = new MenuId("TimelineTitleContext");
  static TimelineFilterSubMenu = new MenuId("TimelineFilterSubMenu");
  static AccountsContext = new MenuId("AccountsContext");
  static SidebarTitle = new MenuId("SidebarTitle");
  static PanelTitle = new MenuId("PanelTitle");
  static AuxiliaryBarTitle = new MenuId("AuxiliaryBarTitle");
  static AuxiliaryBarHeader = new MenuId("AuxiliaryBarHeader");
  static TerminalInstanceContext = new MenuId("TerminalInstanceContext");
  static TerminalEditorInstanceContext = new MenuId("TerminalEditorInstanceContext");
  static TerminalNewDropdownContext = new MenuId("TerminalNewDropdownContext");
  static TerminalTabContext = new MenuId("TerminalTabContext");
  static TerminalTabEmptyAreaContext = new MenuId("TerminalTabEmptyAreaContext");
  static TerminalStickyScrollContext = new MenuId("TerminalStickyScrollContext");
  static WebviewContext = new MenuId("WebviewContext");
  static InlineCompletionsActions = new MenuId("InlineCompletionsActions");
  static InlineEditsActions = new MenuId("InlineEditsActions");
  static NewFile = new MenuId("NewFile");
  static MergeInput1Toolbar = new MenuId("MergeToolbar1Toolbar");
  static MergeInput2Toolbar = new MenuId("MergeToolbar2Toolbar");
  static MergeBaseToolbar = new MenuId("MergeBaseToolbar");
  static MergeInputResultToolbar = new MenuId("MergeToolbarResultToolbar");
  static InlineSuggestionToolbar = new MenuId("InlineSuggestionToolbar");
  static InlineEditToolbar = new MenuId("InlineEditToolbar");
  static ChatContext = new MenuId("ChatContext");
  static ChatCodeBlock = new MenuId("ChatCodeblock");
  static ChatCompareBlock = new MenuId("ChatCompareBlock");
  static ChatMessageTitle = new MenuId("ChatMessageTitle");
  static ChatMessageFooter = new MenuId("ChatMessageFooter");
  static ChatExecute = new MenuId("ChatExecute");
  static ChatExecuteSecondary = new MenuId("ChatExecuteSecondary");
  static ChatInput = new MenuId("ChatInput");
  static ChatInputSide = new MenuId("ChatInputSide");
  static ChatModelPicker = new MenuId("ChatModelPicker");
  static ChatEditingWidgetToolbar = new MenuId("ChatEditingWidgetToolbar");
  static ChatEditingEditorContent = new MenuId("ChatEditingEditorContent");
  static ChatEditingEditorHunk = new MenuId("ChatEditingEditorHunk");
  static ChatEditingDeletedNotebookCell = new MenuId("ChatEditingDeletedNotebookCell");
  static ChatInputAttachmentToolbar = new MenuId("ChatInputAttachmentToolbar");
  static ChatEditingWidgetModifiedFilesToolbar = new MenuId("ChatEditingWidgetModifiedFilesToolbar");
  static ChatInputResourceAttachmentContext = new MenuId("ChatInputResourceAttachmentContext");
  static ChatInputSymbolAttachmentContext = new MenuId("ChatInputSymbolAttachmentContext");
  static ChatInlineResourceAnchorContext = new MenuId("ChatInlineResourceAnchorContext");
  static ChatInlineSymbolAnchorContext = new MenuId("ChatInlineSymbolAnchorContext");
  static ChatEditingCodeBlockContext = new MenuId("ChatEditingCodeBlockContext");
  static ChatTitleBarMenu = new MenuId("ChatTitleBarMenu");
  static ChatAttachmentsContext = new MenuId("ChatAttachmentsContext");
  static AccessibleView = new MenuId("AccessibleView");
  static MultiDiffEditorFileToolbar = new MenuId("MultiDiffEditorFileToolbar");
  static DiffEditorHunkToolbar = new MenuId("DiffEditorHunkToolbar");
  static DiffEditorSelectionToolbar = new MenuId("DiffEditorSelectionToolbar");
  /**
   * Create or reuse a `MenuId` with the given identifier
   */
  static for(identifier) {
    return MenuId._instances.get(identifier) ?? new MenuId(identifier);
  }
  id;
  /**
   * Create a new `MenuId` with the unique identifier. Will throw if a menu
   * with the identifier already exists, use `MenuId.for(ident)` or a unique
   * identifier
   */
  constructor(identifier) {
    if (MenuId._instances.has(identifier)) {
      throw new TypeError(`MenuId with identifier '${identifier}' already exists. Use MenuId.for(ident) or a unique identifier`);
    }
    MenuId._instances.set(identifier, this);
    this.id = identifier;
  }
}
const IMenuService = createDecorator("menuService");
class MenuRegistryChangeEvent {
  constructor(id) {
    this.id = id;
    this.has = (candidate) => candidate === id;
  }
  static {
    __name(this, "MenuRegistryChangeEvent");
  }
  static _all = /* @__PURE__ */ new Map();
  static for(id) {
    let value = this._all.get(id);
    if (!value) {
      value = new MenuRegistryChangeEvent(id);
      this._all.set(id, value);
    }
    return value;
  }
  static merge(events) {
    const ids = /* @__PURE__ */ new Set();
    for (const item of events) {
      if (item instanceof MenuRegistryChangeEvent) {
        ids.add(item.id);
      }
    }
    return ids;
  }
  has;
}
const MenuRegistry = new class {
  _commands = /* @__PURE__ */ new Map();
  _menuItems = /* @__PURE__ */ new Map();
  _onDidChangeMenu = new MicrotaskEmitter({
    merge: MenuRegistryChangeEvent.merge
  });
  onDidChangeMenu = this._onDidChangeMenu.event;
  addCommand(command) {
    this._commands.set(command.id, command);
    this._onDidChangeMenu.fire(MenuRegistryChangeEvent.for(MenuId.CommandPalette));
    return markAsSingleton(toDisposable(() => {
      if (this._commands.delete(command.id)) {
        this._onDidChangeMenu.fire(MenuRegistryChangeEvent.for(MenuId.CommandPalette));
      }
    }));
  }
  getCommand(id) {
    return this._commands.get(id);
  }
  getCommands() {
    const map = /* @__PURE__ */ new Map();
    this._commands.forEach((value, key) => map.set(key, value));
    return map;
  }
  appendMenuItem(id, item) {
    let list = this._menuItems.get(id);
    if (!list) {
      list = new LinkedList();
      this._menuItems.set(id, list);
    }
    const rm = list.push(item);
    this._onDidChangeMenu.fire(MenuRegistryChangeEvent.for(id));
    return markAsSingleton(toDisposable(() => {
      rm();
      this._onDidChangeMenu.fire(MenuRegistryChangeEvent.for(id));
    }));
  }
  appendMenuItems(items) {
    const result = new DisposableStore();
    for (const { id, item } of items) {
      result.add(this.appendMenuItem(id, item));
    }
    return result;
  }
  getMenuItems(id) {
    let result;
    if (this._menuItems.has(id)) {
      result = [...this._menuItems.get(id)];
    } else {
      result = [];
    }
    if (id === MenuId.CommandPalette) {
      this._appendImplicitItems(result);
    }
    return result;
  }
  _appendImplicitItems(result) {
    const set = /* @__PURE__ */ new Set();
    for (const item of result) {
      if (isIMenuItem(item)) {
        set.add(item.command.id);
        if (item.alt) {
          set.add(item.alt.id);
        }
      }
    }
    this._commands.forEach((command, id) => {
      if (!set.has(id)) {
        result.push({ command });
      }
    });
  }
}();
class SubmenuItemAction extends SubmenuAction {
  constructor(item, hideActions, actions) {
    super(`submenuitem.${item.submenu.id}`, typeof item.title === "string" ? item.title : item.title.value, actions, "submenu");
    this.item = item;
    this.hideActions = hideActions;
  }
  static {
    __name(this, "SubmenuItemAction");
  }
}
let MenuItemAction = class {
  constructor(item, alt, options, hideActions, menuKeybinding, contextKeyService, _commandService) {
    this.hideActions = hideActions;
    this.menuKeybinding = menuKeybinding;
    this._commandService = _commandService;
    this.id = item.id;
    this.label = MenuItemAction.label(item, options);
    this.tooltip = (typeof item.tooltip === "string" ? item.tooltip : item.tooltip?.value) ?? "";
    this.enabled = !item.precondition || contextKeyService.contextMatchesRules(item.precondition);
    this.checked = void 0;
    let icon;
    if (item.toggled) {
      const toggled = item.toggled.condition ? item.toggled : { condition: item.toggled };
      this.checked = contextKeyService.contextMatchesRules(toggled.condition);
      if (this.checked && toggled.tooltip) {
        this.tooltip = typeof toggled.tooltip === "string" ? toggled.tooltip : toggled.tooltip.value;
      }
      if (this.checked && ThemeIcon.isThemeIcon(toggled.icon)) {
        icon = toggled.icon;
      }
      if (this.checked && toggled.title) {
        this.label = typeof toggled.title === "string" ? toggled.title : toggled.title.value;
      }
    }
    if (!icon) {
      icon = ThemeIcon.isThemeIcon(item.icon) ? item.icon : void 0;
    }
    this.item = item;
    this.alt = alt ? new MenuItemAction(alt, void 0, options, hideActions, void 0, contextKeyService, _commandService) : void 0;
    this._options = options;
    this.class = icon && ThemeIcon.asClassName(icon);
  }
  static {
    __name(this, "MenuItemAction");
  }
  static label(action, options) {
    return options?.renderShortTitle && action.shortTitle ? typeof action.shortTitle === "string" ? action.shortTitle : action.shortTitle.value : typeof action.title === "string" ? action.title : action.title.value;
  }
  item;
  alt;
  _options;
  id;
  label;
  tooltip;
  class;
  enabled;
  checked;
  run(...args) {
    let runArgs = [];
    if (this._options?.arg) {
      runArgs = [...runArgs, this._options.arg];
    }
    if (this._options?.shouldForwardArgs) {
      runArgs = [...runArgs, ...args];
    }
    return this._commandService.executeCommand(this.id, ...runArgs);
  }
};
MenuItemAction = __decorateClass([
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, ICommandService)
], MenuItemAction);
class Action2 {
  constructor(desc) {
    this.desc = desc;
  }
  static {
    __name(this, "Action2");
  }
}
function registerAction2(ctor) {
  const disposables = [];
  const action = new ctor();
  const { f1, menu, keybinding, ...command } = action.desc;
  if (CommandsRegistry.getCommand(command.id)) {
    throw new Error(`Cannot register two commands with the same id: ${command.id}`);
  }
  disposables.push(CommandsRegistry.registerCommand({
    id: command.id,
    handler: /* @__PURE__ */ __name((accessor, ...args) => action.run(accessor, ...args), "handler"),
    metadata: command.metadata ?? { description: action.desc.title }
  }));
  if (Array.isArray(menu)) {
    for (const item of menu) {
      disposables.push(MenuRegistry.appendMenuItem(item.id, { command: { ...command, precondition: item.precondition === null ? void 0 : command.precondition }, ...item }));
    }
  } else if (menu) {
    disposables.push(MenuRegistry.appendMenuItem(menu.id, { command: { ...command, precondition: menu.precondition === null ? void 0 : command.precondition }, ...menu }));
  }
  if (f1) {
    disposables.push(MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command, when: command.precondition }));
    disposables.push(MenuRegistry.addCommand(command));
  }
  if (Array.isArray(keybinding)) {
    for (const item of keybinding) {
      disposables.push(KeybindingsRegistry.registerKeybindingRule({
        ...item,
        id: command.id,
        when: command.precondition ? ContextKeyExpr.and(command.precondition, item.when) : item.when
      }));
    }
  } else if (keybinding) {
    disposables.push(KeybindingsRegistry.registerKeybindingRule({
      ...keybinding,
      id: command.id,
      when: command.precondition ? ContextKeyExpr.and(command.precondition, keybinding.when) : keybinding.when
    }));
  }
  return {
    dispose() {
      dispose(disposables);
    }
  };
}
__name(registerAction2, "registerAction2");
export {
  Action2,
  IMenuService,
  MenuId,
  MenuItemAction,
  MenuRegistry,
  SubmenuItemAction,
  isIMenuItem,
  isISubmenuItem,
  registerAction2
};
//# sourceMappingURL=actions.js.map
