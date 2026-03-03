var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { disposableTimeout, timeout } from "../../../../base/common/async.js";
import { CancellationError } from "../../../../base/common/errors.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { autorun, autorunSelfDisposable } from "../../../../base/common/observable.js";
function startServerByFilter(mcpService, filter, timeout2 = 5e3) {
  return new Promise((resolve, reject) => {
    const store = new DisposableStore();
    store.add(autorun((reader) => {
      const servers = mcpService.servers.read(reader);
      const server = servers.find(filter);
      if (server) {
        server.start({ promptType: "all-untrusted" }).then((state) => {
          if (state.state === 3) {
            server.showOutput();
          }
        });
        resolve();
        store.dispose();
      }
    }));
    store.add(disposableTimeout(() => {
      store.dispose();
      reject(new CancellationError());
    }, timeout2));
  });
}
__name(startServerByFilter, "startServerByFilter");
async function startServerAndWaitForLiveTools(server, opts, token) {
  const r = await server.start(opts);
  const store = new DisposableStore();
  const ok = await new Promise((resolve) => {
    if (token?.isCancellationRequested || r.state === 3 || r.state === 0) {
      return resolve(false);
    }
    if (token) {
      store.add(token.onCancellationRequested(() => {
        resolve(false);
      }));
    }
    store.add(autorun((reader) => {
      const connState = server.connectionState.read(reader).state;
      if (connState === 3 || connState === 0) {
        resolve(false);
      }
      const toolState = server.cacheState.read(reader);
      if (toolState === 5) {
        resolve(true);
      }
    }));
  });
  store.dispose();
  if (ok) {
    await timeout(0);
  }
  return ok;
}
__name(startServerAndWaitForLiveTools, "startServerAndWaitForLiveTools");
function mcpServerToSourceData(server, reader) {
  const metadata = server.serverMetadata.read(reader);
  return {
    type: "mcp",
    serverLabel: metadata?.serverName,
    instructions: metadata?.serverInstructions,
    label: server.definition.label,
    collectionId: server.collection.id,
    definitionId: server.definition.id
  };
}
__name(mcpServerToSourceData, "mcpServerToSourceData");
function canLoadMcpNetworkResourceDirectly(resource, server) {
  let isResourceRequestValid = false;
  if (resource.protocol === "http:") {
    const launch = server?.connection.get()?.launchDefinition;
    if (launch && launch.type === 2 && launch.uri.authority.toLowerCase() === resource.host.toLowerCase()) {
      isResourceRequestValid = true;
    }
  } else if (resource.protocol === "https:") {
    isResourceRequestValid = true;
  }
  return isResourceRequestValid;
}
__name(canLoadMcpNetworkResourceDirectly, "canLoadMcpNetworkResourceDirectly");
function isTaskResult(obj) {
  return obj.task !== void 0;
}
__name(isTaskResult, "isTaskResult");
function findMcpServer(mcpService, filter, token) {
  return new Promise((resolve) => {
    autorunSelfDisposable((reader) => {
      if (token) {
        if (token.isCancellationRequested) {
          reader.dispose();
          resolve(void 0);
          return;
        }
        reader.store.add(token.onCancellationRequested(() => {
          reader.dispose();
          resolve(void 0);
        }));
      }
      const servers = mcpService.servers.read(reader);
      const server = servers.find(filter);
      if (server) {
        resolve(server);
        reader.dispose();
      }
    });
  });
}
__name(findMcpServer, "findMcpServer");
function translateMcpLogMessage(logger, params, prefix = "") {
  let contents = typeof params.data === "string" ? params.data : JSON.stringify(params.data);
  if (params.logger) {
    contents = `${params.logger}: ${contents}`;
  }
  if (prefix) {
    contents = `${prefix} ${contents}`;
  }
  switch (params?.level) {
    case "debug":
      logger.debug(contents);
      break;
    case "info":
    case "notice":
      logger.info(contents);
      break;
    case "warning":
      logger.warn(contents);
      break;
    case "error":
    case "critical":
    case "alert":
    case "emergency":
      logger.error(contents);
      break;
    default:
      logger.info(contents);
      break;
  }
}
__name(translateMcpLogMessage, "translateMcpLogMessage");
export {
  canLoadMcpNetworkResourceDirectly,
  findMcpServer,
  isTaskResult,
  mcpServerToSourceData,
  startServerAndWaitForLiveTools,
  startServerByFilter,
  translateMcpLogMessage
};
//# sourceMappingURL=mcpTypesUtils.js.map
