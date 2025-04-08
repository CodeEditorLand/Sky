var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as net from "net";
import { ISocket } from "../../../base/parts/ipc/common/ipc.net.js";
import { NodeSocket } from "../../../base/parts/ipc/node/ipc.net.js";
import { makeRawSocketHeaders } from "../common/managedSocket.js";
import { RemoteConnectionType, WebSocketRemoteConnection } from "../common/remoteAuthorityResolver.js";
import { ISocketFactory } from "../common/remoteSocketFactoryService.js";
const nodeSocketFactory = new class {
  supports(connectTo) {
    return true;
  }
  connect({ host, port }, path, query, debugLabel) {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ host, port }, () => {
        socket.removeListener("error", reject);
        socket.write(makeRawSocketHeaders(path, query, debugLabel));
        const onData = /* @__PURE__ */ __name((data) => {
          const strData = data.toString();
          if (strData.indexOf("\r\n\r\n") >= 0) {
            socket.off("data", onData);
            resolve(new NodeSocket(socket, debugLabel));
          }
        }, "onData");
        socket.on("data", onData);
      });
      socket.setNoDelay(true);
      socket.once("error", reject);
    });
  }
}();
export {
  nodeSocketFactory
};
//# sourceMappingURL=nodeSocketFactory.js.map
