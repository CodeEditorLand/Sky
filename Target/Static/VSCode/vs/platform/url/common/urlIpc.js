var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
import { Client, IChannel, IClientRouter, IConnectionHub, IServerChannel } from "../../../base/parts/ipc/common/ipc.js";
import { ILogService } from "../../log/common/log.js";
import { IOpenURLOptions, IURLHandler } from "./url.js";
class URLHandlerChannel {
  constructor(handler) {
    this.handler = handler;
  }
  static {
    __name(this, "URLHandlerChannel");
  }
  listen(_, event) {
    throw new Error(`Event not found: ${event}`);
  }
  call(_, command, arg) {
    switch (command) {
      case "handleURL":
        return this.handler.handleURL(URI.revive(arg[0]), arg[1]);
    }
    throw new Error(`Call not found: ${command}`);
  }
}
class URLHandlerChannelClient {
  constructor(channel) {
    this.channel = channel;
  }
  static {
    __name(this, "URLHandlerChannelClient");
  }
  handleURL(uri, options) {
    return this.channel.call("handleURL", [uri.toJSON(), options]);
  }
}
class URLHandlerRouter {
  constructor(next, logService) {
    this.next = next;
    this.logService = logService;
  }
  static {
    __name(this, "URLHandlerRouter");
  }
  async routeCall(hub, command, arg, cancellationToken) {
    if (command !== "handleURL") {
      throw new Error(`Call not found: ${command}`);
    }
    if (Array.isArray(arg) && arg.length > 0) {
      const uri = URI.revive(arg[0]);
      this.logService.trace("URLHandlerRouter#routeCall() with URI argument", uri.toString(true));
      if (uri.query) {
        const match = /\bwindowId=(\d+)/.exec(uri.query);
        if (match) {
          const windowId = match[1];
          this.logService.trace(`URLHandlerRouter#routeCall(): found windowId query parameter with value "${windowId}"`, uri.toString(true));
          const regex = new RegExp(`window:${windowId}`);
          const connection = hub.connections.find((c) => {
            this.logService.trace("URLHandlerRouter#routeCall(): testing connection", c.ctx);
            return regex.test(c.ctx);
          });
          if (connection) {
            this.logService.trace("URLHandlerRouter#routeCall(): found a connection to route", uri.toString(true));
            return connection;
          } else {
            this.logService.trace("URLHandlerRouter#routeCall(): did not find a connection to route", uri.toString(true));
          }
        } else {
          this.logService.trace("URLHandlerRouter#routeCall(): did not find windowId query parameter", uri.toString(true));
        }
      }
    } else {
      this.logService.trace("URLHandlerRouter#routeCall() without URI argument");
    }
    return this.next.routeCall(hub, command, arg, cancellationToken);
  }
  routeEvent(_, event) {
    throw new Error(`Event not found: ${event}`);
  }
}
export {
  URLHandlerChannel,
  URLHandlerChannelClient,
  URLHandlerRouter
};
//# sourceMappingURL=urlIpc.js.map
