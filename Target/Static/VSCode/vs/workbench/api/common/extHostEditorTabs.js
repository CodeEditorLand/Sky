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
import { diffSets } from "../../../base/common/collections.js";
import { Emitter } from "../../../base/common/event.js";
import { assertIsDefined } from "../../../base/common/types.js";
import { URI } from "../../../base/common/uri.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { IEditorTabDto, IEditorTabGroupDto, IExtHostEditorTabsShape, MainContext, MainThreadEditorTabsShape, TabInputKind, TabModelOperationKind, TabOperation } from "./extHost.protocol.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import * as typeConverters from "./extHostTypeConverters.js";
import { ChatEditorTabInput, CustomEditorTabInput, InteractiveWindowInput, NotebookDiffEditorTabInput, NotebookEditorTabInput, TerminalEditorTabInput, TextDiffTabInput, TextMergeTabInput, TextTabInput, WebviewEditorTabInput, TextMultiDiffTabInput } from "./extHostTypes.js";
const IExtHostEditorTabs = createDecorator("IExtHostEditorTabs");
class ExtHostEditorTab {
  static {
    __name(this, "ExtHostEditorTab");
  }
  _apiObject;
  _dto;
  _input;
  _parentGroup;
  _activeTabIdGetter;
  constructor(dto, parentGroup, activeTabIdGetter) {
    this._activeTabIdGetter = activeTabIdGetter;
    this._parentGroup = parentGroup;
    this.acceptDtoUpdate(dto);
  }
  get apiObject() {
    if (!this._apiObject) {
      const that = this;
      const obj = {
        get isActive() {
          return that._dto.id === that._activeTabIdGetter();
        },
        get label() {
          return that._dto.label;
        },
        get input() {
          return that._input;
        },
        get isDirty() {
          return that._dto.isDirty;
        },
        get isPinned() {
          return that._dto.isPinned;
        },
        get isPreview() {
          return that._dto.isPreview;
        },
        get group() {
          return that._parentGroup.apiObject;
        }
      };
      this._apiObject = Object.freeze(obj);
    }
    return this._apiObject;
  }
  get tabId() {
    return this._dto.id;
  }
  acceptDtoUpdate(dto) {
    this._dto = dto;
    this._input = this._initInput();
  }
  _initInput() {
    switch (this._dto.input.kind) {
      case TabInputKind.TextInput:
        return new TextTabInput(URI.revive(this._dto.input.uri));
      case TabInputKind.TextDiffInput:
        return new TextDiffTabInput(URI.revive(this._dto.input.original), URI.revive(this._dto.input.modified));
      case TabInputKind.TextMergeInput:
        return new TextMergeTabInput(URI.revive(this._dto.input.base), URI.revive(this._dto.input.input1), URI.revive(this._dto.input.input2), URI.revive(this._dto.input.result));
      case TabInputKind.CustomEditorInput:
        return new CustomEditorTabInput(URI.revive(this._dto.input.uri), this._dto.input.viewType);
      case TabInputKind.WebviewEditorInput:
        return new WebviewEditorTabInput(this._dto.input.viewType);
      case TabInputKind.NotebookInput:
        return new NotebookEditorTabInput(URI.revive(this._dto.input.uri), this._dto.input.notebookType);
      case TabInputKind.NotebookDiffInput:
        return new NotebookDiffEditorTabInput(URI.revive(this._dto.input.original), URI.revive(this._dto.input.modified), this._dto.input.notebookType);
      case TabInputKind.TerminalEditorInput:
        return new TerminalEditorTabInput();
      case TabInputKind.InteractiveEditorInput:
        return new InteractiveWindowInput(URI.revive(this._dto.input.uri), URI.revive(this._dto.input.inputBoxUri));
      case TabInputKind.ChatEditorInput:
        return new ChatEditorTabInput();
      case TabInputKind.MultiDiffEditorInput:
        return new TextMultiDiffTabInput(this._dto.input.diffEditors.map((diff) => new TextDiffTabInput(URI.revive(diff.original), URI.revive(diff.modified))));
      default:
        return void 0;
    }
  }
}
class ExtHostEditorTabGroup {
  static {
    __name(this, "ExtHostEditorTabGroup");
  }
  _apiObject;
  _dto;
  _tabs = [];
  _activeTabId = "";
  _activeGroupIdGetter;
  constructor(dto, activeGroupIdGetter) {
    this._dto = dto;
    this._activeGroupIdGetter = activeGroupIdGetter;
    for (const tabDto of dto.tabs) {
      if (tabDto.isActive) {
        this._activeTabId = tabDto.id;
      }
      this._tabs.push(new ExtHostEditorTab(tabDto, this, () => this.activeTabId()));
    }
  }
  get apiObject() {
    if (!this._apiObject) {
      const that = this;
      const obj = {
        get isActive() {
          return that._dto.groupId === that._activeGroupIdGetter();
        },
        get viewColumn() {
          return typeConverters.ViewColumn.to(that._dto.viewColumn);
        },
        get activeTab() {
          return that._tabs.find((tab) => tab.tabId === that._activeTabId)?.apiObject;
        },
        get tabs() {
          return Object.freeze(that._tabs.map((tab) => tab.apiObject));
        }
      };
      this._apiObject = Object.freeze(obj);
    }
    return this._apiObject;
  }
  get groupId() {
    return this._dto.groupId;
  }
  get tabs() {
    return this._tabs;
  }
  acceptGroupDtoUpdate(dto) {
    this._dto = dto;
  }
  acceptTabOperation(operation) {
    if (operation.kind === TabModelOperationKind.TAB_OPEN) {
      const tab2 = new ExtHostEditorTab(operation.tabDto, this, () => this.activeTabId());
      this._tabs.splice(operation.index, 0, tab2);
      if (operation.tabDto.isActive) {
        this._activeTabId = tab2.tabId;
      }
      return tab2;
    } else if (operation.kind === TabModelOperationKind.TAB_CLOSE) {
      const tab2 = this._tabs.splice(operation.index, 1)[0];
      if (!tab2) {
        throw new Error(`Tab close updated received for index ${operation.index} which does not exist`);
      }
      if (tab2.tabId === this._activeTabId) {
        this._activeTabId = "";
      }
      return tab2;
    } else if (operation.kind === TabModelOperationKind.TAB_MOVE) {
      if (operation.oldIndex === void 0) {
        throw new Error("Invalid old index on move IPC");
      }
      const tab2 = this._tabs.splice(operation.oldIndex, 1)[0];
      if (!tab2) {
        throw new Error(`Tab move updated received for index ${operation.oldIndex} which does not exist`);
      }
      this._tabs.splice(operation.index, 0, tab2);
      return tab2;
    }
    const tab = this._tabs.find((extHostTab) => extHostTab.tabId === operation.tabDto.id);
    if (!tab) {
      throw new Error("INVALID tab");
    }
    if (operation.tabDto.isActive) {
      this._activeTabId = operation.tabDto.id;
    } else if (this._activeTabId === operation.tabDto.id && !operation.tabDto.isActive) {
      this._activeTabId = "";
    }
    tab.acceptDtoUpdate(operation.tabDto);
    return tab;
  }
  // Not a getter since it must be a function to be used as a callback for the tabs
  activeTabId() {
    return this._activeTabId;
  }
}
let ExtHostEditorTabs = class {
  static {
    __name(this, "ExtHostEditorTabs");
  }
  _serviceBrand;
  _proxy;
  _onDidChangeTabs = new Emitter();
  _onDidChangeTabGroups = new Emitter();
  // Have to use ! because this gets initialized via an RPC proxy
  _activeGroupId;
  _extHostTabGroups = [];
  _apiObject;
  constructor(extHostRpc) {
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadEditorTabs);
  }
  get tabGroups() {
    if (!this._apiObject) {
      const that = this;
      const obj = {
        // never changes -> simple value
        onDidChangeTabGroups: that._onDidChangeTabGroups.event,
        onDidChangeTabs: that._onDidChangeTabs.event,
        // dynamic -> getters
        get all() {
          return Object.freeze(that._extHostTabGroups.map((group) => group.apiObject));
        },
        get activeTabGroup() {
          const activeTabGroupId = that._activeGroupId;
          const activeTabGroup = assertIsDefined(that._extHostTabGroups.find((candidate) => candidate.groupId === activeTabGroupId)?.apiObject);
          return activeTabGroup;
        },
        close: /* @__PURE__ */ __name(async (tabOrTabGroup, preserveFocus) => {
          const tabsOrTabGroups = Array.isArray(tabOrTabGroup) ? tabOrTabGroup : [tabOrTabGroup];
          if (!tabsOrTabGroups.length) {
            return true;
          }
          if (isTabGroup(tabsOrTabGroups[0])) {
            return this._closeGroups(tabsOrTabGroups, preserveFocus);
          } else {
            return this._closeTabs(tabsOrTabGroups, preserveFocus);
          }
        }, "close")
        // move: async (tab: vscode.Tab, viewColumn: ViewColumn, index: number, preserveFocus?: boolean) => {
        // 	const extHostTab = this._findExtHostTabFromApi(tab);
        // 	if (!extHostTab) {
        // 		throw new Error('Invalid tab');
        // 	}
        // 	this._proxy.$moveTab(extHostTab.tabId, index, typeConverters.ViewColumn.from(viewColumn), preserveFocus);
        // 	return;
        // }
      };
      this._apiObject = Object.freeze(obj);
    }
    return this._apiObject;
  }
  $acceptEditorTabModel(tabGroups) {
    const groupIdsBefore = new Set(this._extHostTabGroups.map((group) => group.groupId));
    const groupIdsAfter = new Set(tabGroups.map((dto) => dto.groupId));
    const diff = diffSets(groupIdsBefore, groupIdsAfter);
    const closed = this._extHostTabGroups.filter((group) => diff.removed.includes(group.groupId)).map((group) => group.apiObject);
    const opened = [];
    const changed = [];
    this._extHostTabGroups = tabGroups.map((tabGroup) => {
      const group = new ExtHostEditorTabGroup(tabGroup, () => this._activeGroupId);
      if (diff.added.includes(group.groupId)) {
        opened.push(group.apiObject);
      } else {
        changed.push(group.apiObject);
      }
      return group;
    });
    const activeTabGroupId = assertIsDefined(tabGroups.find((group) => group.isActive === true)?.groupId);
    if (activeTabGroupId !== void 0 && this._activeGroupId !== activeTabGroupId) {
      this._activeGroupId = activeTabGroupId;
    }
    this._onDidChangeTabGroups.fire(Object.freeze({ opened, closed, changed }));
  }
  $acceptTabGroupUpdate(groupDto) {
    const group = this._extHostTabGroups.find((group2) => group2.groupId === groupDto.groupId);
    if (!group) {
      throw new Error("Update Group IPC call received before group creation.");
    }
    group.acceptGroupDtoUpdate(groupDto);
    if (groupDto.isActive) {
      this._activeGroupId = groupDto.groupId;
    }
    this._onDidChangeTabGroups.fire(Object.freeze({ changed: [group.apiObject], opened: [], closed: [] }));
  }
  $acceptTabOperation(operation) {
    const group = this._extHostTabGroups.find((group2) => group2.groupId === operation.groupId);
    if (!group) {
      throw new Error("Update Tabs IPC call received before group creation.");
    }
    const tab = group.acceptTabOperation(operation);
    switch (operation.kind) {
      case TabModelOperationKind.TAB_OPEN:
        this._onDidChangeTabs.fire(Object.freeze({
          opened: [tab.apiObject],
          closed: [],
          changed: []
        }));
        return;
      case TabModelOperationKind.TAB_CLOSE:
        this._onDidChangeTabs.fire(Object.freeze({
          opened: [],
          closed: [tab.apiObject],
          changed: []
        }));
        return;
      case TabModelOperationKind.TAB_MOVE:
      case TabModelOperationKind.TAB_UPDATE:
        this._onDidChangeTabs.fire(Object.freeze({
          opened: [],
          closed: [],
          changed: [tab.apiObject]
        }));
        return;
    }
  }
  _findExtHostTabFromApi(apiTab) {
    for (const group of this._extHostTabGroups) {
      for (const tab of group.tabs) {
        if (tab.apiObject === apiTab) {
          return tab;
        }
      }
    }
    return;
  }
  _findExtHostTabGroupFromApi(apiTabGroup) {
    return this._extHostTabGroups.find((candidate) => candidate.apiObject === apiTabGroup);
  }
  async _closeTabs(tabs, preserveFocus) {
    const extHostTabIds = [];
    for (const tab of tabs) {
      const extHostTab = this._findExtHostTabFromApi(tab);
      if (!extHostTab) {
        throw new Error("Tab close: Invalid tab not found!");
      }
      extHostTabIds.push(extHostTab.tabId);
    }
    return this._proxy.$closeTab(extHostTabIds, preserveFocus);
  }
  async _closeGroups(groups, preserverFoucs) {
    const extHostGroupIds = [];
    for (const group of groups) {
      const extHostGroup = this._findExtHostTabGroupFromApi(group);
      if (!extHostGroup) {
        throw new Error("Group close: Invalid group not found!");
      }
      extHostGroupIds.push(extHostGroup.groupId);
    }
    return this._proxy.$closeGroup(extHostGroupIds, preserverFoucs);
  }
};
ExtHostEditorTabs = __decorateClass([
  __decorateParam(0, IExtHostRpcService)
], ExtHostEditorTabs);
function isTabGroup(obj) {
  const tabGroup = obj;
  if (tabGroup.tabs !== void 0) {
    return true;
  }
  return false;
}
__name(isTabGroup, "isTabGroup");
export {
  ExtHostEditorTabs,
  IExtHostEditorTabs
};
//# sourceMappingURL=extHostEditorTabs.js.map
