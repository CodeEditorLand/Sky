var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { FileAccess } from "../../../../base/common/network.js";
import { getNextTickChannel, ProxyChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { Client } from "../../../../base/parts/ipc/node/ipc.cp.js";
import { IFileChange } from "../../common/files.js";
import { AbstractUniversalWatcherClient, ILogMessage, IUniversalWatcher } from "../../common/watcher.js";
class UniversalWatcherClient extends AbstractUniversalWatcherClient {
  static {
    __name(this, "UniversalWatcherClient");
  }
  constructor(onFileChanges, onLogMessage, verboseLogging) {
    super(onFileChanges, onLogMessage, verboseLogging);
    this.init();
  }
  createWatcher(disposables) {
    const client = disposables.add(new Client(
      FileAccess.asFileUri("bootstrap-fork").fsPath,
      {
        serverName: "File Watcher",
        args: ["--type=fileWatcher"],
        env: {
          VSCODE_ESM_ENTRYPOINT: "vs/platform/files/node/watcher/watcherMain",
          VSCODE_PIPE_LOGGING: "true",
          VSCODE_VERBOSE_LOGGING: "true"
          // transmit console logs from server to client
        }
      }
    ));
    disposables.add(client.onDidProcessExit(({ code, signal }) => this.onError(`terminated by itself with code ${code}, signal: ${signal} (ETERM)`)));
    return ProxyChannel.toService(getNextTickChannel(client.getChannel("watcher")));
  }
}
export {
  UniversalWatcherClient
};
//# sourceMappingURL=watcherClient.js.map
