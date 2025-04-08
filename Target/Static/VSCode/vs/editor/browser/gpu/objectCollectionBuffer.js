var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable, dispose, toDisposable } from "../../../base/common/lifecycle.js";
import { LinkedList } from "../../../base/common/linkedList.js";
import { BufferDirtyTracker } from "./bufferDirtyTracker.js";
function createObjectCollectionBuffer(propertySpecs, capacity) {
  return new ObjectCollectionBuffer(propertySpecs, capacity);
}
__name(createObjectCollectionBuffer, "createObjectCollectionBuffer");
class ObjectCollectionBuffer extends Disposable {
  constructor(propertySpecs, capacity) {
    super();
    this.propertySpecs = propertySpecs;
    this.capacity = capacity;
    this.view = new Float32Array(capacity * propertySpecs.length);
    this.buffer = this.view.buffer;
    this._entrySize = propertySpecs.length;
    for (let i = 0; i < propertySpecs.length; i++) {
      const spec = {
        offset: i,
        ...propertySpecs[i]
      };
      this._propertySpecsMap.set(spec.name, spec);
    }
    this._register(toDisposable(() => dispose(this._entries)));
  }
  static {
    __name(this, "ObjectCollectionBuffer");
  }
  buffer;
  view;
  get bufferUsedSize() {
    return this.viewUsedSize * Float32Array.BYTES_PER_ELEMENT;
  }
  get viewUsedSize() {
    return this._entries.size * this._entrySize;
  }
  get entryCount() {
    return this._entries.size;
  }
  _dirtyTracker = new BufferDirtyTracker();
  get dirtyTracker() {
    return this._dirtyTracker;
  }
  _propertySpecsMap = /* @__PURE__ */ new Map();
  _entrySize;
  _entries = new LinkedList();
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  _onDidChangeBuffer = this._register(new Emitter());
  onDidChangeBuffer = this._onDidChangeBuffer.event;
  createEntry(data) {
    if (this._entries.size === this.capacity) {
      this._expandBuffer();
      this._onDidChangeBuffer.fire();
    }
    const value = new ObjectCollectionBufferEntry(this.view, this._propertySpecsMap, this._dirtyTracker, this._entries.size, data);
    const removeFromEntries = this._entries.push(value);
    const listeners = [];
    listeners.push(Event.forward(value.onDidChange, this._onDidChange));
    listeners.push(value.onWillDispose(() => {
      const deletedEntryIndex = value.i;
      removeFromEntries();
      this.view.set(this.view.subarray(deletedEntryIndex * this._entrySize + 2, this._entries.size * this._entrySize + 2), deletedEntryIndex * this._entrySize);
      for (const entry of this._entries) {
        if (entry.i > deletedEntryIndex) {
          entry.i--;
        }
      }
      this._dirtyTracker.flag(deletedEntryIndex, (this._entries.size - deletedEntryIndex) * this._entrySize);
      dispose(listeners);
    }));
    return value;
  }
  _expandBuffer() {
    this.capacity *= 2;
    const newView = new Float32Array(this.capacity * this._entrySize);
    newView.set(this.view);
    this.view = newView;
    this.buffer = this.view.buffer;
  }
}
class ObjectCollectionBufferEntry extends Disposable {
  constructor(_view, _propertySpecsMap, _dirtyTracker, i, data) {
    super();
    this._view = _view;
    this._propertySpecsMap = _propertySpecsMap;
    this._dirtyTracker = _dirtyTracker;
    this.i = i;
    for (const propertySpec of this._propertySpecsMap.values()) {
      this._view[this.i * this._propertySpecsMap.size + propertySpec.offset] = data[propertySpec.name];
    }
    this._dirtyTracker.flag(this.i * this._propertySpecsMap.size, this._propertySpecsMap.size);
  }
  static {
    __name(this, "ObjectCollectionBufferEntry");
  }
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  _onWillDispose = this._register(new Emitter());
  onWillDispose = this._onWillDispose.event;
  dispose() {
    this._onWillDispose.fire();
    super.dispose();
  }
  set(propertyName, value) {
    const i = this.i * this._propertySpecsMap.size + this._propertySpecsMap.get(propertyName).offset;
    this._view[this._dirtyTracker.flag(i)] = value;
    this._onDidChange.fire();
  }
  get(propertyName) {
    return this._view[this.i * this._propertySpecsMap.size + this._propertySpecsMap.get(propertyName).offset];
  }
  setRaw(data) {
    if (data.length !== this._propertySpecsMap.size) {
      throw new Error(`Data length ${data.length} does not match the number of properties in the collection (${this._propertySpecsMap.size})`);
    }
    this._view.set(data, this.i * this._propertySpecsMap.size);
    this._dirtyTracker.flag(this.i * this._propertySpecsMap.size, this._propertySpecsMap.size);
  }
}
export {
  createObjectCollectionBuffer
};
//# sourceMappingURL=objectCollectionBuffer.js.map
