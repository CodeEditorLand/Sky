var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class TelemetryAppenderChannel {
  static {
    __name(this, "TelemetryAppenderChannel");
  }
  constructor(appenders) {
    this.appenders = appenders;
  }
  listen(_, event) {
    throw new Error(`Event not found: ${event}`);
  }
  call(_, command, { eventName, data }) {
    this.appenders.forEach((a) => a.log(eventName, data ?? {}));
    return Promise.resolve(null);
  }
}
class TelemetryAppenderClient {
  static {
    __name(this, "TelemetryAppenderClient");
  }
  constructor(channel) {
    this.channel = channel;
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
