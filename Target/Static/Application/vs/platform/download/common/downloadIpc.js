var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../base/common/uri.js";
class DownloadServiceChannel {
  static {
    __name(this, "DownloadServiceChannel");
  }
  constructor(service) {
    this.service = service;
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
  static {
    __name(this, "DownloadServiceChannelClient");
  }
  constructor(channel, getUriTransformer) {
    this.channel = channel;
    this.getUriTransformer = getUriTransformer;
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
