var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { IServerChannel } from "../../../base/parts/ipc/common/ipc.js";
import { TelemetryLevel } from "./telemetry.js";
import { ITelemetryAppender } from "./telemetryUtils.js";
import { IServerTelemetryService } from "./serverTelemetryService.js";
class ServerTelemetryChannel extends Disposable {
  constructor(telemetryService, telemetryAppender) {
    super();
    this.telemetryService = telemetryService;
    this.telemetryAppender = telemetryAppender;
  }
  static {
    __name(this, "ServerTelemetryChannel");
  }
  async call(_, command, arg) {
    switch (command) {
      case "updateTelemetryLevel": {
        const { telemetryLevel } = arg;
        return this.telemetryService.updateInjectedTelemetryLevel(telemetryLevel);
      }
      case "logTelemetry": {
        const { eventName, data } = arg;
        if (this.telemetryAppender) {
          return this.telemetryAppender.log(eventName, data);
        }
        return Promise.resolve();
      }
      case "flushTelemetry": {
        if (this.telemetryAppender) {
          return this.telemetryAppender.flush();
        }
        return Promise.resolve();
      }
      case "ping": {
        return;
      }
    }
    throw new Error(`IPC Command ${command} not found`);
  }
  listen(_, event, arg) {
    throw new Error("Not supported");
  }
  /**
   * Disposing the channel also disables the telemetryService as there is
   * no longer a way to control it
   */
  dispose() {
    this.telemetryService.updateInjectedTelemetryLevel(TelemetryLevel.NONE);
    super.dispose();
  }
}
export {
  ServerTelemetryChannel
};
//# sourceMappingURL=remoteTelemetryChannel.js.map
