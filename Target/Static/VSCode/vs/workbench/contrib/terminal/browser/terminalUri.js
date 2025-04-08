var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { ITerminalInstance, TerminalDataTransfers } from "./terminal.js";
function parseTerminalUri(resource) {
  const [, workspaceId, instanceId] = resource.path.split("/");
  if (!workspaceId || !Number.parseInt(instanceId)) {
    throw new Error(`Could not parse terminal uri for resource ${resource}`);
  }
  return { workspaceId, instanceId: Number.parseInt(instanceId) };
}
__name(parseTerminalUri, "parseTerminalUri");
function getTerminalUri(workspaceId, instanceId, title) {
  return URI.from({
    scheme: Schemas.vscodeTerminal,
    path: `/${workspaceId}/${instanceId}`,
    fragment: title || void 0
  });
}
__name(getTerminalUri, "getTerminalUri");
function getTerminalResourcesFromDragEvent(event) {
  const resources = event.dataTransfer?.getData(TerminalDataTransfers.Terminals);
  if (resources) {
    const json = JSON.parse(resources);
    const result = [];
    for (const entry of json) {
      result.push(URI.parse(entry));
    }
    return result.length === 0 ? void 0 : result;
  }
  return void 0;
}
__name(getTerminalResourcesFromDragEvent, "getTerminalResourcesFromDragEvent");
function getInstanceFromResource(instances, resource) {
  if (resource) {
    for (const instance of instances) {
      if (instance.resource.path === resource.path) {
        return instance;
      }
    }
  }
  return void 0;
}
__name(getInstanceFromResource, "getInstanceFromResource");
export {
  getInstanceFromResource,
  getTerminalResourcesFromDragEvent,
  getTerminalUri,
  parseTerminalUri
};
//# sourceMappingURL=terminalUri.js.map
