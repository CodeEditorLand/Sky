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
import { onUnexpectedError } from "../../../base/common/errors.js";
import { Event } from "../../../base/common/event.js";
import { Disposable, DisposableMap } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { IStorageService } from "../../../platform/storage/common/storage.js";
import { DiffEditorInput } from "../../common/editor/diffEditorInput.js";
import { ExtensionKeyedWebviewOriginStore } from "../../contrib/webview/browser/webview.js";
import { WebviewInput } from "../../contrib/webviewPanel/browser/webviewEditorInput.js";
import { IWebviewWorkbenchService } from "../../contrib/webviewPanel/browser/webviewWorkbenchService.js";
import { editorGroupToColumn } from "../../services/editor/common/editorGroupColumn.js";
import { IEditorGroupsService, preferredSideBySideGroupDirection } from "../../services/editor/common/editorGroupsService.js";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "../../services/editor/common/editorService.js";
import { IExtensionService } from "../../services/extensions/common/extensions.js";
import * as extHostProtocol from "../common/extHost.protocol.js";
import { reviveWebviewContentOptions, reviveWebviewExtension } from "./mainThreadWebviews.js";
import { ThemeIcon } from "../../../base/common/themables.js";
class WebviewInputStore {
  static {
    __name(this, "WebviewInputStore");
  }
  constructor() {
    this._handlesToInputs = /* @__PURE__ */ new Map();
    this._inputsToHandles = /* @__PURE__ */ new Map();
  }
  add(handle, input) {
    this._handlesToInputs.set(handle, input);
    this._inputsToHandles.set(input, handle);
  }
  getHandleForInput(input) {
    return this._inputsToHandles.get(input);
  }
  getInputForHandle(handle) {
    return this._handlesToInputs.get(handle);
  }
  delete(handle) {
    const input = this.getInputForHandle(handle);
    this._handlesToInputs.delete(handle);
    if (input) {
      this._inputsToHandles.delete(input);
    }
  }
  get size() {
    return this._handlesToInputs.size;
  }
  [Symbol.iterator]() {
    return this._handlesToInputs.values();
  }
}
class WebviewViewTypeTransformer {
  static {
    __name(this, "WebviewViewTypeTransformer");
  }
  constructor(prefix) {
    this.prefix = prefix;
  }
  fromExternal(viewType) {
    return this.prefix + viewType;
  }
  toExternal(viewType) {
    return viewType.startsWith(this.prefix) ? viewType.substr(this.prefix.length) : void 0;
  }
}
let MainThreadWebviewPanels = class MainThreadWebviewPanels2 extends Disposable {
  static {
    __name(this, "MainThreadWebviewPanels");
  }
  constructor(context, _mainThreadWebviews, _configurationService, _editorGroupService, _editorService, extensionService, storageService, _webviewWorkbenchService) {
    super();
    this._mainThreadWebviews = _mainThreadWebviews;
    this._configurationService = _configurationService;
    this._editorGroupService = _editorGroupService;
    this._editorService = _editorService;
    this._webviewWorkbenchService = _webviewWorkbenchService;
    this.webviewPanelViewType = new WebviewViewTypeTransformer("mainThreadWebview-");
    this._webviewInputs = new WebviewInputStore();
    this._revivers = this._register(new DisposableMap());
    this.webviewOriginStore = new ExtensionKeyedWebviewOriginStore("mainThreadWebviewPanel.origins", storageService);
    this._proxy = context.getProxy(extHostProtocol.ExtHostContext.ExtHostWebviewPanels);
    this._register(Event.any(_editorService.onDidActiveEditorChange, _editorService.onDidVisibleEditorsChange, _editorGroupService.onDidAddGroup, _editorGroupService.onDidRemoveGroup, _editorGroupService.onDidMoveGroup)(() => {
      this.updateWebviewViewStates(this._editorService.activeEditor);
    }));
    this._register(_webviewWorkbenchService.onDidChangeActiveWebviewEditor((input) => {
      this.updateWebviewViewStates(input);
    }));
    this._register(_webviewWorkbenchService.registerResolver({
      canResolve: /* @__PURE__ */ __name((webview) => {
        const viewType = this.webviewPanelViewType.toExternal(webview.viewType);
        if (typeof viewType === "string") {
          extensionService.activateByEvent(`onWebviewPanel:${viewType}`);
        }
        return false;
      }, "canResolve"),
      resolveWebview: /* @__PURE__ */ __name(() => {
        throw new Error("not implemented");
      }, "resolveWebview")
    }));
  }
  get webviewInputs() {
    return this._webviewInputs;
  }
  addWebviewInput(handle, input, options) {
    this._webviewInputs.add(handle, input);
    this._mainThreadWebviews.addWebview(handle, input.webview, options);
    const disposeSub = input.webview.onDidDispose(() => {
      disposeSub.dispose();
      this._proxy.$onDidDisposeWebviewPanel(handle).finally(() => {
        this._webviewInputs.delete(handle);
      });
    });
  }
  $createWebviewPanel(extensionData, handle, viewType, initData, showOptions) {
    const targetGroup = this.getTargetGroupFromShowOptions(showOptions);
    const mainThreadShowOptions = showOptions ? {
      preserveFocus: !!showOptions.preserveFocus,
      group: targetGroup
    } : {};
    const extension = reviveWebviewExtension(extensionData);
    const origin = this.webviewOriginStore.getOrigin(viewType, extension.id);
    const webview = this._webviewWorkbenchService.openWebview({
      origin,
      providedViewType: viewType,
      title: initData.title,
      options: reviveWebviewOptions(initData.panelOptions),
      contentOptions: reviveWebviewContentOptions(initData.webviewOptions),
      extension
    }, this.webviewPanelViewType.fromExternal(viewType), initData.title, void 0, mainThreadShowOptions);
    this.addWebviewInput(handle, webview, { serializeBuffersForPostMessage: initData.serializeBuffersForPostMessage });
  }
  $disposeWebview(handle) {
    const webview = this.tryGetWebviewInput(handle);
    if (!webview) {
      return;
    }
    webview.dispose();
  }
  $setTitle(handle, value) {
    this.tryGetWebviewInput(handle)?.setWebviewTitle(value);
  }
  $setIconPath(handle, value) {
    const webview = this.tryGetWebviewInput(handle);
    if (webview) {
      webview.iconPath = reviveWebviewIcon(value);
    }
  }
  $reveal(handle, showOptions) {
    const webview = this.tryGetWebviewInput(handle);
    if (!webview || webview.isDisposed()) {
      return;
    }
    const targetGroup = this.getTargetGroupFromShowOptions(showOptions);
    this._webviewWorkbenchService.revealWebview(webview, targetGroup, !!showOptions.preserveFocus);
  }
  getTargetGroupFromShowOptions(showOptions) {
    if (typeof showOptions.viewColumn === "undefined" || showOptions.viewColumn === ACTIVE_GROUP || this._editorGroupService.count === 1 && this._editorGroupService.activeGroup.isEmpty) {
      return ACTIVE_GROUP;
    }
    if (showOptions.viewColumn === SIDE_GROUP) {
      return SIDE_GROUP;
    }
    if (showOptions.viewColumn >= 0) {
      const groupInColumn = this._editorGroupService.getGroups(
        2
        /* GroupsOrder.GRID_APPEARANCE */
      )[showOptions.viewColumn];
      if (groupInColumn) {
        return groupInColumn.id;
      }
      const newGroup = this._editorGroupService.findGroup({
        location: 1
        /* GroupLocation.LAST */
      });
      if (newGroup) {
        const direction = preferredSideBySideGroupDirection(this._configurationService);
        return this._editorGroupService.addGroup(newGroup, direction);
      }
    }
    return ACTIVE_GROUP;
  }
  $registerSerializer(viewType, options) {
    if (this._revivers.has(viewType)) {
      throw new Error(`Reviver for ${viewType} already registered`);
    }
    this._revivers.set(viewType, this._webviewWorkbenchService.registerResolver({
      canResolve: /* @__PURE__ */ __name((webviewInput) => {
        return webviewInput.viewType === this.webviewPanelViewType.fromExternal(viewType);
      }, "canResolve"),
      resolveWebview: /* @__PURE__ */ __name(async (webviewInput) => {
        const viewType2 = this.webviewPanelViewType.toExternal(webviewInput.viewType);
        if (!viewType2) {
          webviewInput.webview.setHtml(this._mainThreadWebviews.getWebviewResolvedFailedContent(webviewInput.viewType));
          return;
        }
        const handle = generateUuid();
        this.addWebviewInput(handle, webviewInput, options);
        let state = void 0;
        if (webviewInput.webview.state) {
          try {
            state = JSON.parse(webviewInput.webview.state);
          } catch (e) {
            console.error("Could not load webview state", e, webviewInput.webview.state);
          }
        }
        try {
          await this._proxy.$deserializeWebviewPanel(handle, viewType2, {
            title: webviewInput.getTitle(),
            state,
            panelOptions: webviewInput.webview.options,
            webviewOptions: webviewInput.webview.contentOptions,
            active: webviewInput === this._editorService.activeEditor
          }, editorGroupToColumn(this._editorGroupService, webviewInput.group || 0));
        } catch (error) {
          onUnexpectedError(error);
          webviewInput.webview.setHtml(this._mainThreadWebviews.getWebviewResolvedFailedContent(viewType2));
        }
      }, "resolveWebview")
    }));
  }
  $unregisterSerializer(viewType) {
    if (!this._revivers.has(viewType)) {
      throw new Error(`No reviver for ${viewType} registered`);
    }
    this._revivers.deleteAndDispose(viewType);
  }
  updateWebviewViewStates(activeEditorInput) {
    if (!this._webviewInputs.size) {
      return;
    }
    const viewStates = {};
    const updateViewStatesForInput = /* @__PURE__ */ __name((group, topLevelInput, editorInput) => {
      if (!(editorInput instanceof WebviewInput)) {
        return;
      }
      editorInput.updateGroup(group.id);
      const handle = this._webviewInputs.getHandleForInput(editorInput);
      if (handle) {
        viewStates[handle] = {
          visible: topLevelInput === group.activeEditor,
          active: editorInput === activeEditorInput,
          position: editorGroupToColumn(this._editorGroupService, group.id)
        };
      }
    }, "updateViewStatesForInput");
    for (const group of this._editorGroupService.groups) {
      for (const input of group.editors) {
        if (input instanceof DiffEditorInput) {
          updateViewStatesForInput(group, input, input.primary);
          updateViewStatesForInput(group, input, input.secondary);
        } else {
          updateViewStatesForInput(group, input, input);
        }
      }
    }
    if (Object.keys(viewStates).length) {
      this._proxy.$onDidChangeWebviewPanelViewStates(viewStates);
    }
  }
  tryGetWebviewInput(handle) {
    return this._webviewInputs.getInputForHandle(handle);
  }
};
MainThreadWebviewPanels = __decorate([
  __param(2, IConfigurationService),
  __param(3, IEditorGroupsService),
  __param(4, IEditorService),
  __param(5, IExtensionService),
  __param(6, IStorageService),
  __param(7, IWebviewWorkbenchService)
], MainThreadWebviewPanels);
function reviveWebviewIcon(value) {
  if (!value) {
    return void 0;
  }
  if (ThemeIcon.isThemeIcon(value)) {
    return value;
  }
  return {
    light: URI.revive(value.light),
    dark: URI.revive(value.dark)
  };
}
__name(reviveWebviewIcon, "reviveWebviewIcon");
function reviveWebviewOptions(panelOptions) {
  return {
    enableFindWidget: panelOptions.enableFindWidget,
    retainContextWhenHidden: panelOptions.retainContextWhenHidden
  };
}
__name(reviveWebviewOptions, "reviveWebviewOptions");
export {
  MainThreadWebviewPanels
};
//# sourceMappingURL=mainThreadWebviewPanels.js.map
