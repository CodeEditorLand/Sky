var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class TreeViewsDnDService {
  static {
    __name(this, "TreeViewsDnDService");
  }
  _serviceBrand;
  _dragOperations = /* @__PURE__ */ new Map();
  removeDragOperationTransfer(uuid) {
    if (uuid && this._dragOperations.has(uuid)) {
      const operation = this._dragOperations.get(uuid);
      this._dragOperations.delete(uuid);
      return operation;
    }
    return void 0;
  }
  addDragOperationTransfer(uuid, transferPromise) {
    this._dragOperations.set(uuid, transferPromise);
  }
}
class DraggedTreeItemsIdentifier {
  constructor(identifier) {
    this.identifier = identifier;
  }
  static {
    __name(this, "DraggedTreeItemsIdentifier");
  }
}
export {
  DraggedTreeItemsIdentifier,
  TreeViewsDnDService
};
//# sourceMappingURL=treeViewsDnd.js.map
