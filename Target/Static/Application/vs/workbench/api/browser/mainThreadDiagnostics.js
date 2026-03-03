var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var MainThreadDiagnostics_1;
import { IMarkerService } from "../../../platform/markers/common/markers.js";
import { URI } from "../../../base/common/uri.js";
import { MainContext, ExtHostContext } from "../common/extHost.protocol.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { IUriIdentityService } from "../../../platform/uriIdentity/common/uriIdentity.js";
import { ResourceMap } from "../../../base/common/map.js";
let MainThreadDiagnostics = class MainThreadDiagnostics2 {
  static {
    __name(this, "MainThreadDiagnostics");
  }
  static {
    MainThreadDiagnostics_1 = this;
  }
  static {
    this.ExtHostCounter = 1;
  }
  constructor(extHostContext, _markerService, _uriIdentService) {
    this._markerService = _markerService;
    this._uriIdentService = _uriIdentService;
    this._activeOwners = /* @__PURE__ */ new Set();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostDiagnostics);
    this._markerListener = this._markerService.onMarkerChanged(this._forwardMarkers, this);
    this.extHostId = `extHost${MainThreadDiagnostics_1.ExtHostCounter++}`;
  }
  dispose() {
    this._markerListener.dispose();
    for (const owner of this._activeOwners) {
      const markersData = new ResourceMap();
      for (const marker of this._markerService.read({ owner })) {
        let data = markersData.get(marker.resource);
        if (data === void 0) {
          data = [];
          markersData.set(marker.resource, data);
        }
        if (marker.origin !== this.extHostId) {
          data.push(marker);
        }
      }
      for (const [resource, local] of markersData.entries()) {
        this._markerService.changeOne(owner, resource, local);
      }
    }
    this._activeOwners.clear();
  }
  _forwardMarkers(resources) {
    const data = [];
    for (const resource of resources) {
      const allMarkerData = this._markerService.read({ resource, ignoreResourceFilters: true });
      if (allMarkerData.length === 0) {
        data.push([resource, []]);
      } else {
        const foreignMarkerData = allMarkerData.filter((marker) => marker?.origin !== this.extHostId);
        if (foreignMarkerData.length > 0) {
          data.push([resource, foreignMarkerData]);
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
          if (marker.origin === void 0) {
            marker.origin = this.extHostId;
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
MainThreadDiagnostics = MainThreadDiagnostics_1 = __decorate([
  extHostNamedCustomer(MainContext.MainThreadDiagnostics),
  __param(1, IMarkerService),
  __param(2, IUriIdentityService)
], MainThreadDiagnostics);
export {
  MainThreadDiagnostics
};
//# sourceMappingURL=mainThreadDiagnostics.js.map
