var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isNonEmptyArray } from "../../../../base/common/arrays.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { IMatch } from "../../../../base/common/filters.js";
import { hash } from "../../../../base/common/hash.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { basename, extUri } from "../../../../base/common/resources.js";
import { splitLines } from "../../../../base/common/strings.js";
import { URI } from "../../../../base/common/uri.js";
import { IRange, Range } from "../../../../editor/common/core/range.js";
import { IMarker, IMarkerData, IRelatedInformation, MarkerSeverity } from "../../../../platform/markers/common/markers.js";
import { unsupportedSchemas } from "../../../../platform/markers/common/markerService.js";
function compareMarkersByUri(a, b) {
  return extUri.compare(a.resource, b.resource);
}
__name(compareMarkersByUri, "compareMarkersByUri");
function compareResourceMarkers(a, b) {
  const [firstMarkerOfA] = a.markers;
  const [firstMarkerOfB] = b.markers;
  let res = 0;
  if (firstMarkerOfA && firstMarkerOfB) {
    res = MarkerSeverity.compare(firstMarkerOfA.marker.severity, firstMarkerOfB.marker.severity);
  }
  if (res === 0) {
    res = a.path.localeCompare(b.path) || a.name.localeCompare(b.name);
  }
  return res;
}
__name(compareResourceMarkers, "compareResourceMarkers");
class ResourceMarkers {
  constructor(id, resource) {
    this.id = id;
    this.resource = resource;
    this.path = this.resource.fsPath;
    this.name = basename(this.resource);
  }
  static {
    __name(this, "ResourceMarkers");
  }
  path;
  name;
  _markersMap = new ResourceMap();
  _cachedMarkers;
  _total = 0;
  get markers() {
    if (!this._cachedMarkers) {
      this._cachedMarkers = [...this._markersMap.values()].flat().sort(ResourceMarkers._compareMarkers);
    }
    return this._cachedMarkers;
  }
  has(uri) {
    return this._markersMap.has(uri);
  }
  set(uri, marker) {
    this.delete(uri);
    if (isNonEmptyArray(marker)) {
      this._markersMap.set(uri, marker);
      this._total += marker.length;
      this._cachedMarkers = void 0;
    }
  }
  delete(uri) {
    const array = this._markersMap.get(uri);
    if (array) {
      this._total -= array.length;
      this._cachedMarkers = void 0;
      this._markersMap.delete(uri);
    }
  }
  get total() {
    return this._total;
  }
  static _compareMarkers(a, b) {
    return MarkerSeverity.compare(a.marker.severity, b.marker.severity) || extUri.compare(a.resource, b.resource) || Range.compareRangesUsingStarts(a.marker, b.marker);
  }
}
class Marker {
  constructor(id, marker, relatedInformation = []) {
    this.id = id;
    this.marker = marker;
    this.relatedInformation = relatedInformation;
  }
  static {
    __name(this, "Marker");
  }
  get resource() {
    return this.marker.resource;
  }
  get range() {
    return this.marker;
  }
  _lines;
  get lines() {
    if (!this._lines) {
      this._lines = splitLines(this.marker.message);
    }
    return this._lines;
  }
  toString() {
    return JSON.stringify({
      ...this.marker,
      resource: this.marker.resource.path,
      relatedInformation: this.relatedInformation.length ? this.relatedInformation.map((r) => ({ ...r.raw, resource: r.raw.resource.path })) : void 0
    }, null, "	");
  }
}
class MarkerTableItem extends Marker {
  constructor(marker, sourceMatches, codeMatches, messageMatches, fileMatches) {
    super(marker.id, marker.marker, marker.relatedInformation);
    this.sourceMatches = sourceMatches;
    this.codeMatches = codeMatches;
    this.messageMatches = messageMatches;
    this.fileMatches = fileMatches;
  }
  static {
    __name(this, "MarkerTableItem");
  }
}
class RelatedInformation {
  constructor(id, marker, raw) {
    this.id = id;
    this.marker = marker;
    this.raw = raw;
  }
  static {
    __name(this, "RelatedInformation");
  }
}
class MarkersModel {
  static {
    __name(this, "MarkersModel");
  }
  cachedSortedResources = void 0;
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  get resourceMarkers() {
    if (!this.cachedSortedResources) {
      this.cachedSortedResources = [...this.resourcesByUri.values()].sort(compareResourceMarkers);
    }
    return this.cachedSortedResources;
  }
  resourcesByUri;
  constructor() {
    this.resourcesByUri = /* @__PURE__ */ new Map();
  }
  reset() {
    const removed = /* @__PURE__ */ new Set();
    for (const resourceMarker of this.resourcesByUri.values()) {
      removed.add(resourceMarker);
    }
    this.resourcesByUri.clear();
    this._total = 0;
    this._onDidChange.fire({ removed, added: /* @__PURE__ */ new Set(), updated: /* @__PURE__ */ new Set() });
  }
  _total = 0;
  get total() {
    return this._total;
  }
  getResourceMarkers(resource) {
    return this.resourcesByUri.get(extUri.getComparisonKey(resource, true)) ?? null;
  }
  setResourceMarkers(resourcesMarkers) {
    const change = { added: /* @__PURE__ */ new Set(), removed: /* @__PURE__ */ new Set(), updated: /* @__PURE__ */ new Set() };
    for (const [resource, rawMarkers] of resourcesMarkers) {
      if (unsupportedSchemas.has(resource.scheme)) {
        continue;
      }
      const key = extUri.getComparisonKey(resource, true);
      let resourceMarkers = this.resourcesByUri.get(key);
      if (isNonEmptyArray(rawMarkers)) {
        if (!resourceMarkers) {
          const resourceMarkersId = this.id(resource.toString());
          resourceMarkers = new ResourceMarkers(resourceMarkersId, resource.with({ fragment: null }));
          this.resourcesByUri.set(key, resourceMarkers);
          change.added.add(resourceMarkers);
        } else {
          change.updated.add(resourceMarkers);
        }
        const markersCountByKey = /* @__PURE__ */ new Map();
        const markers = rawMarkers.map((rawMarker) => {
          const key2 = IMarkerData.makeKey(rawMarker);
          const index = markersCountByKey.get(key2) || 0;
          markersCountByKey.set(key2, index + 1);
          const markerId = this.id(resourceMarkers.id, key2, index, rawMarker.resource.toString());
          let relatedInformation = void 0;
          if (rawMarker.relatedInformation) {
            relatedInformation = rawMarker.relatedInformation.map((r, index2) => new RelatedInformation(this.id(markerId, r.resource.toString(), r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn, index2), rawMarker, r));
          }
          return new Marker(markerId, rawMarker, relatedInformation);
        });
        this._total -= resourceMarkers.total;
        resourceMarkers.set(resource, markers);
        this._total += resourceMarkers.total;
      } else if (resourceMarkers) {
        this._total -= resourceMarkers.total;
        resourceMarkers.delete(resource);
        this._total += resourceMarkers.total;
        if (resourceMarkers.total === 0) {
          this.resourcesByUri.delete(key);
          change.removed.add(resourceMarkers);
        } else {
          change.updated.add(resourceMarkers);
        }
      }
    }
    this.cachedSortedResources = void 0;
    if (change.added.size || change.removed.size || change.updated.size) {
      this._onDidChange.fire(change);
    }
  }
  id(...values) {
    return `${hash(values)}`;
  }
  dispose() {
    this._onDidChange.dispose();
    this.resourcesByUri.clear();
  }
}
export {
  Marker,
  MarkerTableItem,
  MarkersModel,
  RelatedInformation,
  ResourceMarkers,
  compareMarkersByUri
};
//# sourceMappingURL=markersModel.js.map
