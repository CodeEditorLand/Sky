var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class ProxyIdentifier {
  static {
    __name(this, "ProxyIdentifier");
  }
  static count = 0;
  _proxyIdentifierBrand = void 0;
  sid;
  nid;
  constructor(sid) {
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
  constructor(value) {
    this.value = value;
  }
  static {
    __name(this, "SerializableObjectWithBuffers");
  }
}
export {
  ProxyIdentifier,
  SerializableObjectWithBuffers,
  createProxyIdentifier,
  getStringIdentifierForProxy
};
//# sourceMappingURL=proxyIdentifier.js.map
