var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ILogMessage, isRecursiveWatchRequest, IUniversalWatcher, IUniversalWatchRequest } from "../../common/watcher.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { ParcelWatcher } from "./parcel/parcelWatcher.js";
import { NodeJSWatcher } from "./nodejs/nodejsWatcher.js";
import { Promises } from "../../../../base/common/async.js";
import { computeStats } from "./watcherStats.js";
class UniversalWatcher extends Disposable {
  static {
    __name(this, "UniversalWatcher");
  }
  recursiveWatcher = this._register(new ParcelWatcher());
  nonRecursiveWatcher = this._register(new NodeJSWatcher(this.recursiveWatcher));
  onDidChangeFile = Event.any(this.recursiveWatcher.onDidChangeFile, this.nonRecursiveWatcher.onDidChangeFile);
  onDidError = Event.any(this.recursiveWatcher.onDidError, this.nonRecursiveWatcher.onDidError);
  _onDidLogMessage = this._register(new Emitter());
  onDidLogMessage = Event.any(this._onDidLogMessage.event, this.recursiveWatcher.onDidLogMessage, this.nonRecursiveWatcher.onDidLogMessage);
  requests = [];
  failedRecursiveRequests = 0;
  constructor() {
    super();
    this._register(this.recursiveWatcher.onDidError((e) => {
      if (e.request) {
        this.failedRecursiveRequests++;
      }
    }));
  }
  async watch(requests) {
    this.requests = requests;
    this.failedRecursiveRequests = 0;
    let error;
    try {
      await this.recursiveWatcher.watch(requests.filter((request) => isRecursiveWatchRequest(request)));
    } catch (e) {
      error = e;
    }
    try {
      await this.nonRecursiveWatcher.watch(requests.filter((request) => !isRecursiveWatchRequest(request)));
    } catch (e) {
      if (!error) {
        error = e;
      }
    }
    if (error) {
      throw error;
    }
  }
  async setVerboseLogging(enabled) {
    if (enabled && this.requests.length > 0) {
      this._onDidLogMessage.fire({ type: "trace", message: computeStats(this.requests, this.failedRecursiveRequests, this.recursiveWatcher, this.nonRecursiveWatcher) });
    }
    await Promises.settled([
      this.recursiveWatcher.setVerboseLogging(enabled),
      this.nonRecursiveWatcher.setVerboseLogging(enabled)
    ]);
  }
  async stop() {
    await Promises.settled([
      this.recursiveWatcher.stop(),
      this.nonRecursiveWatcher.stop()
    ]);
  }
}
export {
  UniversalWatcher
};
//# sourceMappingURL=watcher.js.map
