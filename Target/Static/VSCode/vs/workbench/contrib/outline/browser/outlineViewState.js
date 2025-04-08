var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { IOutlineViewState, OutlineSortOrder } from "./outline.js";
class OutlineViewState {
  static {
    __name(this, "OutlineViewState");
  }
  _followCursor = false;
  _filterOnType = true;
  _sortBy = OutlineSortOrder.ByPosition;
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  dispose() {
    this._onDidChange.dispose();
  }
  set followCursor(value) {
    if (value !== this._followCursor) {
      this._followCursor = value;
      this._onDidChange.fire({ followCursor: true });
    }
  }
  get followCursor() {
    return this._followCursor;
  }
  get filterOnType() {
    return this._filterOnType;
  }
  set filterOnType(value) {
    if (value !== this._filterOnType) {
      this._filterOnType = value;
      this._onDidChange.fire({ filterOnType: true });
    }
  }
  set sortBy(value) {
    if (value !== this._sortBy) {
      this._sortBy = value;
      this._onDidChange.fire({ sortBy: true });
    }
  }
  get sortBy() {
    return this._sortBy;
  }
  persist(storageService) {
    storageService.store("outline/state", JSON.stringify({
      followCursor: this.followCursor,
      sortBy: this.sortBy,
      filterOnType: this.filterOnType
    }), StorageScope.WORKSPACE, StorageTarget.MACHINE);
  }
  restore(storageService) {
    const raw = storageService.get("outline/state", StorageScope.WORKSPACE);
    if (!raw) {
      return;
    }
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return;
    }
    this.followCursor = data.followCursor;
    this.sortBy = data.sortBy ?? OutlineSortOrder.ByPosition;
    if (typeof data.filterOnType === "boolean") {
      this.filterOnType = data.filterOnType;
    }
  }
}
export {
  OutlineViewState
};
//# sourceMappingURL=outlineViewState.js.map
