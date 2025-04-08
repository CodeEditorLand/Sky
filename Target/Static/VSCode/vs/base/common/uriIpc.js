var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "./buffer.js";
import { MarshalledObject } from "./marshalling.js";
import { MarshalledId } from "./marshallingIds.js";
import { URI, UriComponents } from "./uri.js";
function toJSON(uri) {
  return uri.toJSON();
}
__name(toJSON, "toJSON");
class URITransformer {
  static {
    __name(this, "URITransformer");
  }
  _uriTransformer;
  constructor(uriTransformer) {
    this._uriTransformer = uriTransformer;
  }
  transformIncoming(uri) {
    const result = this._uriTransformer.transformIncoming(uri);
    return result === uri ? uri : toJSON(URI.from(result));
  }
  transformOutgoing(uri) {
    const result = this._uriTransformer.transformOutgoing(uri);
    return result === uri ? uri : toJSON(URI.from(result));
  }
  transformOutgoingURI(uri) {
    const result = this._uriTransformer.transformOutgoing(uri);
    return result === uri ? uri : URI.from(result);
  }
  transformOutgoingScheme(scheme) {
    return this._uriTransformer.transformOutgoingScheme(scheme);
  }
}
const DefaultURITransformer = new class {
  transformIncoming(uri) {
    return uri;
  }
  transformOutgoing(uri) {
    return uri;
  }
  transformOutgoingURI(uri) {
    return uri;
  }
  transformOutgoingScheme(scheme) {
    return scheme;
  }
}();
function _transformOutgoingURIs(obj, transformer, depth) {
  if (!obj || depth > 200) {
    return null;
  }
  if (typeof obj === "object") {
    if (obj instanceof URI) {
      return transformer.transformOutgoing(obj);
    }
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const r = _transformOutgoingURIs(obj[key], transformer, depth + 1);
        if (r !== null) {
          obj[key] = r;
        }
      }
    }
  }
  return null;
}
__name(_transformOutgoingURIs, "_transformOutgoingURIs");
function transformOutgoingURIs(obj, transformer) {
  const result = _transformOutgoingURIs(obj, transformer, 0);
  if (result === null) {
    return obj;
  }
  return result;
}
__name(transformOutgoingURIs, "transformOutgoingURIs");
function _transformIncomingURIs(obj, transformer, revive, depth) {
  if (!obj || depth > 200) {
    return null;
  }
  if (typeof obj === "object") {
    if (obj.$mid === MarshalledId.Uri) {
      return revive ? URI.revive(transformer.transformIncoming(obj)) : transformer.transformIncoming(obj);
    }
    if (obj instanceof VSBuffer) {
      return null;
    }
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const r = _transformIncomingURIs(obj[key], transformer, revive, depth + 1);
        if (r !== null) {
          obj[key] = r;
        }
      }
    }
  }
  return null;
}
__name(_transformIncomingURIs, "_transformIncomingURIs");
function transformIncomingURIs(obj, transformer) {
  const result = _transformIncomingURIs(obj, transformer, false, 0);
  if (result === null) {
    return obj;
  }
  return result;
}
__name(transformIncomingURIs, "transformIncomingURIs");
function transformAndReviveIncomingURIs(obj, transformer) {
  const result = _transformIncomingURIs(obj, transformer, true, 0);
  if (result === null) {
    return obj;
  }
  return result;
}
__name(transformAndReviveIncomingURIs, "transformAndReviveIncomingURIs");
export {
  DefaultURITransformer,
  URITransformer,
  transformAndReviveIncomingURIs,
  transformIncomingURIs,
  transformOutgoingURIs
};
//# sourceMappingURL=uriIpc.js.map
