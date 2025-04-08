var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
import { IURITransformer } from "../../../base/common/uriIpc.js";
import { IChannel, IServerChannel } from "../../../base/parts/ipc/common/ipc.js";
import { IDownloadService } from "./download.js";
class DownloadServiceChannel {
  constructor(service) {
    this.service = service;
  }
  static {
    __name(this, "DownloadServiceChannel");
  }
  listen(_, event, arg) {
    throw new Error("Invalid listen");
  }
  call(context, command, args) {
    switch (command) {
      case "download":
        return this.service.download(URI.revive(args[0]), URI.revive(args[1]));
    }
    throw new Error("Invalid call");
  }
}
class DownloadServiceChannelClient {
  constructor(channel, getUriTransformer) {
    this.channel = channel;
    this.getUriTransformer = getUriTransformer;
  }
  static {
    __name(this, "DownloadServiceChannelClient");
  }
  async download(from, to) {
    const uriTransformer = this.getUriTransformer();
    if (uriTransformer) {
      from = uriTransformer.transformOutgoingURI(from);
      to = uriTransformer.transformOutgoingURI(to);
    }
    await this.channel.call("download", [from, to]);
  }
}
export {
  DownloadServiceChannel,
  DownloadServiceChannelClient
};
//# sourceMappingURL=downloadIpc.js.map
