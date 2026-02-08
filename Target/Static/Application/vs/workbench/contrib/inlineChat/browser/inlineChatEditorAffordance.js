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
var InlineChatEditorAffordance_1;
import "./media/inlineChatEditorAffordance.css";
import * as dom from "../../../../base/browser/dom.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { MenuId, MenuItemAction } from "../../../../platform/actions/common/actions.js";
import { MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { quickFixCommandId } from "../../../../editor/contrib/codeAction/browser/codeAction.js";
import { CodeActionController } from "../../../../editor/contrib/codeAction/browser/codeActionController.js";
import { MenuEntryActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { Codicon } from "../../../../base/common/codicons.js";
let QuickFixActionViewItem = class QuickFixActionViewItem2 extends MenuEntryActionViewItem {
  static {
    __name(this, "QuickFixActionViewItem");
  }
  constructor(action, _editor, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, accessibilityService) {
    super(action, { draggable: false }, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, accessibilityService);
    this._editor = _editor;
    this._lightBulbStore = this._store.add(new MutableDisposable());
  }
  render(container) {
    super.render(container);
    this._updateFromLightBulb();
  }
  getTooltip() {
    return this._currentTitle ?? super.getTooltip();
  }
  _updateFromLightBulb() {
    const controller = CodeActionController.get(this._editor);
    if (!controller) {
      return;
    }
    const store = new DisposableStore();
    this._lightBulbStore.value = store;
    store.add(autorun((reader) => {
      const info = controller.lightBulbState.read(reader);
      if (this.label) {
        const icon = info?.icon ?? Codicon.lightBulb;
        const iconClasses = ThemeIcon.asClassNameArray(icon);
        this.label.className = "";
        this.label.classList.add("codicon", ...iconClasses);
      }
      this._currentTitle = info?.title;
      this.updateTooltip();
    }));
  }
};
QuickFixActionViewItem = __decorate([
  __param(2, IKeybindingService),
  __param(3, INotificationService),
  __param(4, IContextKeyService),
  __param(5, IThemeService),
  __param(6, IContextMenuService),
  __param(7, IAccessibilityService)
], QuickFixActionViewItem);
let InlineChatEditorAffordance = class InlineChatEditorAffordance2 extends Disposable {
  static {
    __name(this, "InlineChatEditorAffordance");
  }
  static {
    InlineChatEditorAffordance_1 = this;
  }
  static {
    this._idPool = 0;
  }
  constructor(_editor, selection, instantiationService) {
    super();
    this._editor = _editor;
    this._id = `inline-chat-content-widget-${InlineChatEditorAffordance_1._idPool++}`;
    this._position = null;
    this._isVisible = false;
    this.allowEditorOverflow = true;
    this.suppressMouseDown = false;
    this._domNode = dom.$(".inline-chat-content-widget");
    this._store.add(instantiationService.createInstance(MenuWorkbenchToolBar, this._domNode, MenuId.InlineChatEditorAffordance, {
      telemetrySource: "inlineChatEditorAffordance",
      hiddenItemStrategy: 0,
      menuOptions: { renderShortTitle: true },
      toolbarOptions: { primaryGroup: /* @__PURE__ */ __name(() => true, "primaryGroup") },
      actionViewItemProvider: /* @__PURE__ */ __name((action) => {
        if (action instanceof MenuItemAction && action.id === quickFixCommandId) {
          return instantiationService.createInstance(QuickFixActionViewItem, action, this._editor);
        }
        return void 0;
      }, "actionViewItemProvider")
    }));
    this._store.add(autorun((r) => {
      const sel = selection.read(r);
      if (sel) {
        this._show(sel);
      } else {
        this._hide();
      }
    }));
  }
  _show(selection) {
    const cursorPosition = selection.getPosition();
    const direction = selection.getDirection();
    const preference = direction === 1 ? 1 : 2;
    this._position = {
      position: cursorPosition,
      preference: [preference]
    };
    if (this._isVisible) {
      this._editor.layoutContentWidget(this);
    } else {
      this._editor.addContentWidget(this);
      this._isVisible = true;
    }
  }
  _hide() {
    if (this._isVisible) {
      this._isVisible = false;
      this._editor.removeContentWidget(this);
    }
  }
  getId() {
    return this._id;
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    return this._position;
  }
  beforeRender() {
    const position = this._editor.getPosition();
    const lineHeight = position ? this._editor.getLineHeightForPosition(position) : this._editor.getOption(
      75
      /* EditorOption.lineHeight */
    );
    this._domNode.style.setProperty("--vscode-inline-chat-affordance-height", `${lineHeight}px`);
    return null;
  }
  dispose() {
    if (this._isVisible) {
      this._editor.removeContentWidget(this);
    }
    super.dispose();
  }
};
InlineChatEditorAffordance = InlineChatEditorAffordance_1 = __decorate([
  __param(2, IInstantiationService)
], InlineChatEditorAffordance);
export {
  InlineChatEditorAffordance
};
//# sourceMappingURL=inlineChatEditorAffordance.js.map
