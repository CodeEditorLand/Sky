var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class ProxyIdentifier {
  static {
    __name(this, "ProxyIdentifier");
  }
  static {
    this.count = 0;
  }
  constructor(sid) {
    this._proxyIdentifierBrand = void 0;
    this.sid = sid;
    this.nid = ++ProxyIdentifier.count;
  }
}
const identifiers = [];
function createProxyIdentifier(identifier) {
  const result = new ProxyIdentifier(identifier);
  identifiers[result.nid] = result;
  return result;
}
__name(createProxyIdentifier, "createProxyIdentifier");
function getStringIdentifierForProxy(nid) {
  return identifiers[nid].sid;
}
__name(getStringIdentifierForProxy, "getStringIdentifierForProxy");
class SerializableObjectWithBuffers {
  static {
    __name(this, "SerializableObjectWithBuffers");
  }
  constructor(value) {
    this.value = value;
  }
}
export {
  ProxyIdentifier,
  SerializableObjectWithBuffers,
  createProxyIdentifier,
  getStringIdentifierForProxy
};
//# sourceMappingURL=proxyIdentifier.js.map
