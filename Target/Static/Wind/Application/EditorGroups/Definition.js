var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import { Emitter } from "vs/base/common/event.js";
import {
  StorageScope,
  StorageTarget
} from "vs/platform/storage/common/storage.js";
import {
  EditorGroupModel
} from "vs/workbench/common/editor/editorGroupModel.js";
import {
  GroupsOrder
} from "vs/workbench/services/editor/common/editorGroupsService.js";
const EDITOR_PART_UI_STATE_STORAGE_KEY = "editorpart.state";
class EditorGroupsServiceImpl {
  constructor(InstantiationService, StorageService) {
    this.InstantiationService = InstantiationService;
    this.StorageService = StorageService;
  }
  static {
    __name(this, "EditorGroupsServiceImpl");
  }
  _serviceBrand;
  // --- Event Emitters ---
  _onDidAddGroup = new Emitter();
  onDidAddGroup = this._onDidAddGroup.event;
  // ... other event emitters (onDidChangeGroupIndex, etc.)
  // --- Internal State ---
  Groups = /* @__PURE__ */ new Map();
  Mru = [];
  ActiveGroupId = 0;
  Initialize = Effect.gen(this, function* (_) {
    const RawState = this.StorageService.get(
      EDITOR_PART_UI_STATE_STORAGE_KEY,
      StorageScope.WORKSPACE
    );
    if (RawState) {
      const StoredState = JSON.parse(RawState);
      const SerializedGroups = StoredState.serializedGrid?.root?.data ?? [];
      for (const SerializedGroup of SerializedGroups) {
        const Group = this.InstantiationService.createInstance(
          EditorGroupModel,
          SerializedGroup
        );
        this.Groups.set(Group.id, Group);
      }
      this.Mru = StoredState.mostRecentActiveGroups;
      this.ActiveGroupId = StoredState.activeGroup;
    }
    if (this.Groups.size === 0) {
      const FirstGroup = this.InstantiationService.createInstance(
        EditorGroupModel,
        void 0
      );
      this.Groups.set(FirstGroup.id, FirstGroup);
      this.Mru.unshift(FirstGroup.id);
      this.ActiveGroupId = FirstGroup.id;
    }
    yield* _(this.SaveState());
  });
  SaveState = /* @__PURE__ */ __name(() => Effect.sync(() => {
    const SerializedGrid = {
      root: {
        data: Array.from(this.Groups.values()).map(
          (g) => g.serialize()
        )
      }
    };
    const State = {
      serializedGrid: SerializedGrid,
      activeGroup: this.ActiveGroupId,
      mostRecentActiveGroups: this.Mru
    };
    this.StorageService.store(
      EDITOR_PART_UI_STATE_STORAGE_KEY,
      JSON.stringify(State),
      StorageScope.WORKSPACE,
      StorageTarget.MACHINE
    );
  }), "SaveState");
  // --- Public API Getters ---
  get activeGroup() {
    return this.Groups.get(this.ActiveGroupId);
  }
  get groups() {
    return Array.from(this.Groups.values());
  }
  get count() {
    return this.Groups.size;
  }
  // --- Public API Methods ---
  getGroup(identifier) {
    return this.Groups.get(identifier);
  }
  getGroups(order) {
    const groups = this.groups;
    if (order === GroupsOrder.MOST_RECENTLY_ACTIVE) {
      return [...this.Mru.map((id) => this.getGroup(id))];
    }
    return groups;
  }
  addGroup(location, direction) {
    const NewGroup = this.InstantiationService.createInstance(
      EditorGroupModel,
      void 0
    );
    this.Groups.set(NewGroup.id, NewGroup);
    this.Mru.unshift(NewGroup.id);
    this._onDidAddGroup.fire(NewGroup);
    Effect.runFork(this.SaveState());
    return NewGroup;
  }
  removeGroup(group) {
    const Id = typeof group === "number" ? group : group.id;
    if (this.Groups.size === 1) return false;
    this.Groups.delete(Id);
    this.Mru = this.Mru.filter((gId) => gId !== Id);
    if (this.ActiveGroupId === Id) {
      this.ActiveGroupId = this.Mru[0];
    }
    Effect.runFork(this.SaveState());
    return true;
  }
  // ... Full implementation of other methods like moveGroup, mergeGroup, etc.
  // would follow this pattern of mutating state and then calling SaveState.
}
const Definition = Effect.gen(function* (_) {
  const InstantiationService = yield* _(Instantiation.Tag);
  const StorageService = yield* _(Storage.Tag);
  const ServiceInstance = new EditorGroupsServiceImpl(
    InstantiationService,
    StorageService
  );
  yield* _(ServiceInstance.Initialize);
  return ServiceInstance;
});
var Definition_default = Definition;
export {
  Definition_default as default
};
//# sourceMappingURL=Definition.js.map
