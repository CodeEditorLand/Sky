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
import { TernarySearchTree } from "../../../../base/common/ternarySearchTree.js";
import { IExtensionHostProfile, IExtensionService, ProfileSegmentId, ProfileSession } from "../common/extensions.js";
import { IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { IV8InspectProfilingService, IV8Profile, IV8ProfileNode } from "../../../../platform/profiling/common/profiling.js";
import { createSingleCallFunction } from "../../../../base/common/functional.js";
let ExtensionHostProfiler = class {
  constructor(_host, _port, _extensionService, _profilingService) {
    this._host = _host;
    this._port = _port;
    this._extensionService = _extensionService;
    this._profilingService = _profilingService;
  }
  static {
    __name(this, "ExtensionHostProfiler");
  }
  async start() {
    const id = await this._profilingService.startProfiling({ host: this._host, port: this._port });
    return {
      stop: createSingleCallFunction(async () => {
        const profile = await this._profilingService.stopProfiling(id);
        await this._extensionService.whenInstalledExtensionsRegistered();
        const extensions = this._extensionService.extensions;
        return this._distill(profile, extensions);
      })
    };
  }
  _distill(profile, extensions) {
    const searchTree = TernarySearchTree.forUris();
    for (const extension of extensions) {
      if (extension.extensionLocation.scheme === Schemas.file) {
        searchTree.set(URI.file(extension.extensionLocation.fsPath), extension);
      }
    }
    const nodes = profile.nodes;
    const idsToNodes = /* @__PURE__ */ new Map();
    const idsToSegmentId = /* @__PURE__ */ new Map();
    for (const node of nodes) {
      idsToNodes.set(node.id, node);
    }
    function visit(node, segmentId) {
      if (!segmentId) {
        switch (node.callFrame.functionName) {
          case "(root)":
            break;
          case "(program)":
            segmentId = "program";
            break;
          case "(garbage collector)":
            segmentId = "gc";
            break;
          default:
            segmentId = "self";
            break;
        }
      } else if (segmentId === "self" && node.callFrame.url) {
        let extension;
        try {
          extension = searchTree.findSubstr(URI.parse(node.callFrame.url));
        } catch {
        }
        if (extension) {
          segmentId = extension.identifier.value;
        }
      }
      idsToSegmentId.set(node.id, segmentId);
      if (node.children) {
        for (const child of node.children) {
          const childNode = idsToNodes.get(child);
          if (childNode) {
            visit(childNode, segmentId);
          }
        }
      }
    }
    __name(visit, "visit");
    visit(nodes[0], null);
    const samples = profile.samples || [];
    const timeDeltas = profile.timeDeltas || [];
    const distilledDeltas = [];
    const distilledIds = [];
    let currSegmentTime = 0;
    let currSegmentId;
    for (let i = 0; i < samples.length; i++) {
      const id = samples[i];
      const segmentId = idsToSegmentId.get(id);
      if (segmentId !== currSegmentId) {
        if (currSegmentId) {
          distilledIds.push(currSegmentId);
          distilledDeltas.push(currSegmentTime);
        }
        currSegmentId = segmentId ?? void 0;
        currSegmentTime = 0;
      }
      currSegmentTime += timeDeltas[i];
    }
    if (currSegmentId) {
      distilledIds.push(currSegmentId);
      distilledDeltas.push(currSegmentTime);
    }
    return {
      startTime: profile.startTime,
      endTime: profile.endTime,
      deltas: distilledDeltas,
      ids: distilledIds,
      data: profile,
      getAggregatedTimes: /* @__PURE__ */ __name(() => {
        const segmentsToTime = /* @__PURE__ */ new Map();
        for (let i = 0; i < distilledIds.length; i++) {
          const id = distilledIds[i];
          segmentsToTime.set(id, (segmentsToTime.get(id) || 0) + distilledDeltas[i]);
        }
        return segmentsToTime;
      }, "getAggregatedTimes")
    };
  }
};
ExtensionHostProfiler = __decorateClass([
  __decorateParam(2, IExtensionService),
  __decorateParam(3, IV8InspectProfilingService)
], ExtensionHostProfiler);
export {
  ExtensionHostProfiler
};
//# sourceMappingURL=extensionHostProfiler.js.map
