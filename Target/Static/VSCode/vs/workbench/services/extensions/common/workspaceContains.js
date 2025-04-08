var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as resources from "../../../../base/common/resources.js";
import { URI, UriComponents } from "../../../../base/common/uri.js";
import { CancellationTokenSource, CancellationToken } from "../../../../base/common/cancellation.js";
import * as errors from "../../../../base/common/errors.js";
import { ExtensionIdentifier, IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import { IInstantiationService, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { QueryBuilder } from "../../search/common/queryBuilder.js";
import { ISearchService } from "../../search/common/search.js";
import { toWorkspaceFolder } from "../../../../platform/workspace/common/workspace.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { promiseWithResolvers } from "../../../../base/common/async.js";
const WORKSPACE_CONTAINS_TIMEOUT = 7e3;
function checkActivateWorkspaceContainsExtension(host, desc) {
  const activationEvents = desc.activationEvents;
  if (!activationEvents) {
    return Promise.resolve(void 0);
  }
  const fileNames = [];
  const globPatterns = [];
  for (const activationEvent of activationEvents) {
    if (/^workspaceContains:/.test(activationEvent)) {
      const fileNameOrGlob = activationEvent.substr("workspaceContains:".length);
      if (fileNameOrGlob.indexOf("*") >= 0 || fileNameOrGlob.indexOf("?") >= 0 || host.forceUsingSearch) {
        globPatterns.push(fileNameOrGlob);
      } else {
        fileNames.push(fileNameOrGlob);
      }
    }
  }
  if (fileNames.length === 0 && globPatterns.length === 0) {
    return Promise.resolve(void 0);
  }
  const { promise, resolve } = promiseWithResolvers();
  const activate = /* @__PURE__ */ __name((activationEvent) => resolve({ activationEvent }), "activate");
  const fileNamePromise = Promise.all(fileNames.map((fileName) => _activateIfFileName(host, fileName, activate))).then(() => {
  });
  const globPatternPromise = _activateIfGlobPatterns(host, desc.identifier, globPatterns, activate);
  Promise.all([fileNamePromise, globPatternPromise]).then(() => {
    resolve(void 0);
  });
  return promise;
}
__name(checkActivateWorkspaceContainsExtension, "checkActivateWorkspaceContainsExtension");
async function _activateIfFileName(host, fileName, activate) {
  for (const uri of host.folders) {
    if (await host.exists(resources.joinPath(URI.revive(uri), fileName))) {
      activate(`workspaceContains:${fileName}`);
      return;
    }
  }
}
__name(_activateIfFileName, "_activateIfFileName");
async function _activateIfGlobPatterns(host, extensionId, globPatterns, activate) {
  if (globPatterns.length === 0) {
    return Promise.resolve(void 0);
  }
  const tokenSource = new CancellationTokenSource();
  const searchP = host.checkExists(host.folders, globPatterns, tokenSource.token);
  const timer = setTimeout(async () => {
    tokenSource.cancel();
    host.logService.info(`Not activating extension '${extensionId.value}': Timed out while searching for 'workspaceContains' pattern ${globPatterns.join(",")}`);
  }, WORKSPACE_CONTAINS_TIMEOUT);
  let exists = false;
  try {
    exists = await searchP;
  } catch (err) {
    if (!errors.isCancellationError(err)) {
      errors.onUnexpectedError(err);
    }
  }
  tokenSource.dispose();
  clearTimeout(timer);
  if (exists) {
    activate(`workspaceContains:${globPatterns.join(",")}`);
  }
}
__name(_activateIfGlobPatterns, "_activateIfGlobPatterns");
function checkGlobFileExists(accessor, folders, includes, token) {
  const instantiationService = accessor.get(IInstantiationService);
  const searchService = accessor.get(ISearchService);
  const queryBuilder = instantiationService.createInstance(QueryBuilder);
  const query = queryBuilder.file(folders.map((folder) => toWorkspaceFolder(URI.revive(folder))), {
    _reason: "checkExists",
    includePattern: includes,
    exists: true
  });
  return searchService.fileSearch(query, token).then(
    (result) => {
      return !!result.limitHit;
    },
    (err) => {
      if (!errors.isCancellationError(err)) {
        return Promise.reject(err);
      }
      return false;
    }
  );
}
__name(checkGlobFileExists, "checkGlobFileExists");
export {
  checkActivateWorkspaceContainsExtension,
  checkGlobFileExists
};
//# sourceMappingURL=workspaceContains.js.map
