var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "./buffer.js";
import { URI, UriComponents } from "./uri.js";
import { MarshalledId } from "./marshallingIds.js";
function stringify(obj) {
  return JSON.stringify(obj, replacer);
}
__name(stringify, "stringify");
function parse(text) {
  let data = JSON.parse(text);
  data = revive(data);
  return data;
}
__name(parse, "parse");
function replacer(key, value) {
  if (value instanceof RegExp) {
    return {
      $mid: MarshalledId.Regexp,
      source: value.source,
      flags: value.flags
    };
  }
  return value;
}
__name(replacer, "replacer");
function revive(obj, depth = 0) {
  if (!obj || depth > 200) {
    return obj;
  }
  if (typeof obj === "object") {
    switch (obj.$mid) {
      case MarshalledId.Uri:
        return URI.revive(obj);
      case MarshalledId.Regexp:
        return new RegExp(obj.source, obj.flags);
      case MarshalledId.Date:
        return new Date(obj.source);
    }
    if (obj instanceof VSBuffer || obj instanceof Uint8Array) {
      return obj;
    }
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; ++i) {
        obj[i] = revive(obj[i], depth + 1);
      }
    } else {
      for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
          obj[key] = revive(obj[key], depth + 1);
        }
      }
    }
  }
  return obj;
}
__name(revive, "revive");
export {
  parse,
  revive,
  stringify
};
//# sourceMappingURL=marshalling.js.map
