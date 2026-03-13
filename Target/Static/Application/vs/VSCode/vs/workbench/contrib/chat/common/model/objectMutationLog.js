var __defProp = Object.defineProperty;
var __name = (target, value2) => __defProp(target, "name", { value: value2, configurable: true });
import { assertNever } from "../../../../../base/common/assert.js";
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { isUndefinedOrNull } from "../../../../../base/common/types.js";
function prefixError(e, prefix) {
  e.message = prefix + e.message;
  if (e.stack) {
    const nlIdx = e.stack.indexOf("\n");
    e.stack = nlIdx !== -1 ? `${e.name}: ${e.message}${e.stack.slice(nlIdx)}` : `${e.name}: ${e.message}`;
  }
}
__name(prefixError, "prefixError");
function rethrowWithPathSegment(e, segment) {
  if (e instanceof Error) {
    const part = typeof segment === "number" ? `[${segment}]` : `.${segment}`;
    const needsSep = !e.message.startsWith("[") && !e.message.startsWith(".");
    prefixError(e, part + (needsSep ? ": " : ""));
  }
  throw e;
}
__name(rethrowWithPathSegment, "rethrowWithPathSegment");
var TransformKind;
(function(TransformKind2) {
  TransformKind2[TransformKind2["Key"] = 0] = "Key";
  TransformKind2[TransformKind2["Primitive"] = 1] = "Primitive";
  TransformKind2[TransformKind2["Array"] = 2] = "Array";
  TransformKind2[TransformKind2["Object"] = 3] = "Object";
})(TransformKind || (TransformKind = {}));
function key(comparator) {
  return {
    kind: 0,
    extract: /* @__PURE__ */ __name((from) => from, "extract"),
    equals: comparator ?? ((a, b) => a === b)
  };
}
__name(key, "key");
function value(comparator) {
  return {
    kind: 1,
    extract: /* @__PURE__ */ __name((from) => {
      let value2 = from;
      if (!!value2 && typeof value2 === "object") {
        value2 = JSON.parse(JSON.stringify(value2));
      }
      return value2;
    }, "extract"),
    equals: comparator ?? ((a, b) => a === b)
  };
}
__name(value, "value");
function array(schema) {
  return {
    kind: 2,
    itemSchema: schema,
    extract: /* @__PURE__ */ __name((from) => from?.map((item, i) => {
      try {
        return schema.extract(item);
      } catch (e) {
        rethrowWithPathSegment(e, i);
      }
    }), "extract")
  };
}
__name(array, "array");
function object(schema, options) {
  const entries = Object.entries(schema).sort(([, a], [, b]) => a.kind - b.kind);
  return {
    kind: 3,
    children: entries,
    sealed: options?.sealed,
    extract: /* @__PURE__ */ __name((from) => {
      if (isUndefinedOrNull(from)) {
        return from;
      }
      const result = /* @__PURE__ */ Object.create(null);
      for (const [key2, transform] of entries) {
        try {
          result[key2] = transform.extract(from);
        } catch (e) {
          rethrowWithPathSegment(e, key2);
        }
      }
      return result;
    }, "extract")
  };
}
__name(object, "object");
function t(getter, schema) {
  return {
    ...schema,
    extract: /* @__PURE__ */ __name((from) => schema.extract(getter(from)), "extract")
  };
}
__name(t, "t");
function v(getter, comparator) {
  const inner = value(comparator);
  return {
    ...inner,
    extract: /* @__PURE__ */ __name((from) => inner.extract(getter(from)), "extract")
  };
}
__name(v, "v");
var EntryKind;
(function(EntryKind2) {
  EntryKind2[EntryKind2["Initial"] = 0] = "Initial";
  EntryKind2[EntryKind2["Set"] = 1] = "Set";
  EntryKind2[EntryKind2["Push"] = 2] = "Push";
  EntryKind2[EntryKind2["Delete"] = 3] = "Delete";
})(EntryKind || (EntryKind = {}));
const LF = VSBuffer.fromString("\n");
class ObjectMutationLog {
  static {
    __name(this, "ObjectMutationLog");
  }
  constructor(_transform, _compactAfterEntries = 512) {
    this._transform = _transform;
    this._compactAfterEntries = _compactAfterEntries;
    this._entryCount = 0;
  }
  /**
   * Creates an initial log file from the given object.
   */
  createInitial(current) {
    return this.createInitialFromSerialized(this._transform.extract(current));
  }
  /**
   * Creates an initial log file from the serialized object.
   */
  createInitialFromSerialized(value2) {
    this._previous = value2;
    this._entryCount = 1;
    const entry = { kind: 0, v: value2 };
    return VSBuffer.fromString(JSON.stringify(entry) + "\n");
  }
  /**
   * Reads and reconstructs the state from a log file.
   */
  read(content) {
    let state;
    let lineCount = 0;
    let start = 0;
    const len = content.byteLength;
    while (start < len) {
      let end = content.indexOf(LF, start);
      if (end === -1) {
        end = len;
      }
      if (end > start) {
        const line = content.slice(start, end);
        if (line.byteLength > 0) {
          lineCount++;
          const entry = JSON.parse(line.toString());
          switch (entry.kind) {
            case 0:
              state = entry.v;
              break;
            case 1:
              this._applySet(state, entry.k, entry.v);
              break;
            case 2:
              this._applyPush(state, entry.k, entry.v, entry.i);
              break;
            case 3:
              this._applySet(state, entry.k, void 0);
              break;
            default:
              assertNever(entry);
          }
        }
      }
      start = end + 1;
    }
    if (lineCount === 0) {
      throw new Error("Empty log file");
    }
    this._previous = state;
    this._entryCount = lineCount;
    return state;
  }
  /**
   * Writes updates to the log. Returns the operation type and data to write.
   */
  write(current) {
    const currentValue = this._transform.extract(current);
    if (!this._previous || this._entryCount > this._compactAfterEntries) {
      this._previous = currentValue;
      this._entryCount = 1;
      const entry = { kind: 0, v: currentValue };
      return { op: "replace", data: VSBuffer.fromString(JSON.stringify(entry) + "\n") };
    }
    const entries = [];
    const path = [];
    try {
      this._diff(this._transform, path, this._previous, currentValue, entries);
    } catch (e) {
      if (e instanceof Error) {
        const pathStr = path.map((s) => typeof s === "number" ? `[${s}]` : `.${s}`).join("") || "<root>";
        prefixError(e, `error diffing at ${pathStr}: `);
      }
      throw e;
    }
    if (entries.length === 0) {
      return { op: "append", data: VSBuffer.fromString("") };
    }
    this._entryCount += entries.length;
    this._previous = currentValue;
    let data = "";
    for (const e of entries) {
      data += JSON.stringify(e) + "\n";
    }
    return { op: "append", data: VSBuffer.fromString(data) };
  }
  _applySet(state, path, value2) {
    if (path.length === 0) {
      return;
    }
    let current = state;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value2;
  }
  _applyPush(state, path, values, startIndex) {
    let current = state;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    const arrayKey = path[path.length - 1];
    const arr = current[arrayKey] || [];
    if (startIndex !== void 0) {
      arr.length = startIndex;
    }
    if (values && values.length > 0) {
      arr.push(...values);
    }
    current[arrayKey] = arr;
  }
  _diff(transform, path, prev, curr, entries) {
    if (transform.kind === 0 || transform.kind === 1) {
      if (!transform.equals(prev, curr)) {
        entries.push({ kind: 1, k: path.slice(), v: curr });
      }
    } else if (isUndefinedOrNull(prev) || isUndefinedOrNull(curr)) {
      if (prev !== curr) {
        if (curr === void 0) {
          entries.push({ kind: 3, k: path.slice() });
        } else if (curr === null) {
          entries.push({ kind: 1, k: path.slice(), v: null });
        } else {
          entries.push({ kind: 1, k: path.slice(), v: curr });
        }
      }
    } else if (transform.kind === 2) {
      this._diffArray(transform, path, prev, curr, entries);
    } else if (transform.kind === 3) {
      this._diffObject(transform.children, path, prev, curr, entries, transform.sealed);
    } else {
      throw new Error(`Unknown transform kind ${JSON.stringify(transform)}`);
    }
  }
  _diffObject(children, path, prev, curr, entries, sealed) {
    const prevObj = prev;
    const currObj = curr;
    let i = 0;
    for (; i < children.length; i++) {
      const [key2, transform] = children[i];
      if (transform.kind !== 0) {
        break;
      }
      if (!transform.equals(prevObj?.[key2], currObj[key2])) {
        entries.push({ kind: 1, k: path.slice(), v: curr });
        return;
      }
    }
    if (sealed && sealed(prev, true) && sealed(curr, false)) {
      return;
    }
    for (; i < children.length; i++) {
      const [key2, transform] = children[i];
      path.push(key2);
      this._diff(transform, path, prevObj?.[key2], currObj[key2], entries);
      path.pop();
    }
  }
  _diffArray(transform, path, prev, curr, entries) {
    const prevArr = prev || [];
    const currArr = curr || [];
    const itemSchema = transform.itemSchema;
    const minLen = Math.min(prevArr.length, currArr.length);
    if (itemSchema.kind === 3) {
      const childEntries = itemSchema.children;
      for (let i = 0; i < minLen; i++) {
        const prevItem = prevArr[i];
        const currItem = currArr[i];
        if (this._hasKeyMismatch(childEntries, prevItem, currItem)) {
          const newItems = currArr.slice(i);
          entries.push({ kind: 2, k: path.slice(), v: newItems.length > 0 ? newItems : void 0, i });
          return;
        }
        path.push(i);
        this._diffObject(childEntries, path, prevItem, currItem, entries, itemSchema.sealed);
        path.pop();
      }
      if (currArr.length > prevArr.length) {
        entries.push({ kind: 2, k: path.slice(), v: currArr.slice(prevArr.length) });
      } else if (currArr.length < prevArr.length) {
        entries.push({ kind: 2, k: path.slice(), i: currArr.length });
      }
    } else {
      let firstMismatch = -1;
      for (let i = 0; i < minLen; i++) {
        if (!itemSchema.equals(prevArr[i], currArr[i])) {
          firstMismatch = i;
          break;
        }
      }
      if (firstMismatch === -1) {
        if (currArr.length > prevArr.length) {
          entries.push({ kind: 2, k: path.slice(), v: currArr.slice(prevArr.length) });
        } else if (currArr.length < prevArr.length) {
          entries.push({ kind: 2, k: path.slice(), i: currArr.length });
        }
      } else {
        const newItems = currArr.slice(firstMismatch);
        entries.push({ kind: 2, k: path.slice(), v: newItems.length > 0 ? newItems : void 0, i: firstMismatch });
      }
    }
  }
  _hasKeyMismatch(children, prev, curr) {
    const prevObj = prev;
    const currObj = curr;
    for (const [key2, transform] of children) {
      if (transform.kind !== 0) {
        break;
      }
      if (!transform.equals(prevObj?.[key2], currObj[key2])) {
        return true;
      }
    }
    return false;
  }
}
export {
  ObjectMutationLog,
  array,
  key,
  object,
  t,
  v,
  value
};
//# sourceMappingURL=objectMutationLog.js.map
