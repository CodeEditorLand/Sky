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
import { IMarkerService, IMarkerData } from "../../../platform/markers/common/markers.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { MainThreadDiagnosticsShape, MainContext, ExtHostDiagnosticsShape, ExtHostContext } from "../common/extHost.protocol.js";
import { extHostNamedCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { IUriIdentityService } from "../../../platform/uriIdentity/common/uriIdentity.js";
let MainThreadDiagnostics = class {
  constructor(extHostContext, _markerService, _uriIdentService) {
    this._markerService = _markerService;
    this._uriIdentService = _uriIdentService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostDiagnostics);
    this._markerListener = this._markerService.onMarkerChanged(this._forwardMarkers, this);
  }
  _activeOwners = /* @__PURE__ */ new Set();
  _proxy;
  _markerListener;
  dispose() {
    this._markerListener.dispose();
    this._activeOwners.forEach((owner) => this._markerService.changeAll(owner, []));
    this._activeOwners.clear();
  }
  _forwardMarkers(resources) {
    const data = [];
    for (const resource of resources) {
      const allMarkerData = this._markerService.read({ resource });
      if (allMarkerData.length === 0) {
        data.push([resource, []]);
      } else {
        const forgeinMarkerData = allMarkerData.filter((marker) => !this._activeOwners.has(marker.owner));
        if (forgeinMarkerData.length > 0) {
          data.push([resource, forgeinMarkerData]);
        }
      }
    }
    if (data.length > 0) {
      this._proxy.$acceptMarkersChange(data);
    }
  }
  $changeMany(owner, entries) {
    for (const entry of entries) {
      const [uri, markers] = entry;
      if (markers) {
        for (const marker of markers) {
          if (marker.relatedInformation) {
            for (const relatedInformation of marker.relatedInformation) {
              relatedInformation.resource = URI.revive(relatedInformation.resource);
            }
          }
          if (marker.code && typeof marker.code !== "string") {
            marker.code.target = URI.revive(marker.code.target);
          }
        }
      }
      this._markerService.changeOne(owner, this._uriIdentService.asCanonicalUri(URI.revive(uri)), markers);
    }
    this._activeOwners.add(owner);
  }
  $clear(owner) {
    this._markerService.changeAll(owner, []);
    this._activeOwners.delete(owner);
  }
};
__name(MainThreadDiagnostics, "MainThreadDiagnostics");
MainThreadDiagnostics = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadDiagnostics),
  __decorateParam(1, IMarkerService),
  __decorateParam(2, IUriIdentityService)
], MainThreadDiagnostics);
export {
  MainThreadDiagnostics
};
//# sourceMappingURL=mainThreadDiagnostics.js.map
