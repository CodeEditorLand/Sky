var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../base/common/event.js";
import { IChannel, IServerChannel } from "../../../base/parts/ipc/common/ipc.js";
import { ITelemetryAppender } from "./telemetryUtils.js";
class TelemetryAppenderChannel {
  constructor(appenders) {
    this.appenders = appenders;
  }
  static {
    __name(this, "TelemetryAppenderChannel");
  }
  listen(_, event) {
    throw new Error(`Event not found: ${event}`);
  }
  call(_, command, { eventName, data }) {
    this.appenders.forEach((a) => a.log(eventName, data));
    return Promise.resolve(null);
  }
}
class TelemetryAppenderClient {
  constructor(channel) {
    this.channel = channel;
  }
  static {
    __name(this, "TelemetryAppenderClient");
  }
  log(eventName, data) {
    this.channel.call("log", { eventName, data }).then(void 0, (err) => `Failed to log telemetry: ${console.warn(err)}`);
    return Promise.resolve(null);
  }
  flush() {
    return Promise.resolve();
  }
}
export {
  TelemetryAppenderChannel,
  TelemetryAppenderClient
};
//# sourceMappingURL=telemetryIpc.js.map
