var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IProcessEnvironment } from "../../../../base/common/platform.js";
var ExtHostConnectionType = /* @__PURE__ */ ((ExtHostConnectionType2) => {
  ExtHostConnectionType2[ExtHostConnectionType2["IPC"] = 1] = "IPC";
  ExtHostConnectionType2[ExtHostConnectionType2["Socket"] = 2] = "Socket";
  ExtHostConnectionType2[ExtHostConnectionType2["MessagePort"] = 3] = "MessagePort";
  return ExtHostConnectionType2;
})(ExtHostConnectionType || {});
class IPCExtHostConnection {
  constructor(pipeName) {
    this.pipeName = pipeName;
  }
  static {
    __name(this, "IPCExtHostConnection");
  }
  static ENV_KEY = "VSCODE_EXTHOST_IPC_HOOK";
  type = 1 /* IPC */;
  serialize(env) {
    env[IPCExtHostConnection.ENV_KEY] = this.pipeName;
  }
}
class SocketExtHostConnection {
  static {
    __name(this, "SocketExtHostConnection");
  }
  static ENV_KEY = "VSCODE_EXTHOST_WILL_SEND_SOCKET";
  type = 2 /* Socket */;
  serialize(env) {
    env[SocketExtHostConnection.ENV_KEY] = "1";
  }
}
class MessagePortExtHostConnection {
  static {
    __name(this, "MessagePortExtHostConnection");
  }
  static ENV_KEY = "VSCODE_WILL_SEND_MESSAGE_PORT";
  type = 3 /* MessagePort */;
  serialize(env) {
    env[MessagePortExtHostConnection.ENV_KEY] = "1";
  }
}
function clean(env) {
  delete env[IPCExtHostConnection.ENV_KEY];
  delete env[SocketExtHostConnection.ENV_KEY];
  delete env[MessagePortExtHostConnection.ENV_KEY];
}
__name(clean, "clean");
function writeExtHostConnection(connection, env) {
  clean(env);
  connection.serialize(env);
}
__name(writeExtHostConnection, "writeExtHostConnection");
function readExtHostConnection(env) {
  if (env[IPCExtHostConnection.ENV_KEY]) {
    return cleanAndReturn(env, new IPCExtHostConnection(env[IPCExtHostConnection.ENV_KEY]));
  }
  if (env[SocketExtHostConnection.ENV_KEY]) {
    return cleanAndReturn(env, new SocketExtHostConnection());
  }
  if (env[MessagePortExtHostConnection.ENV_KEY]) {
    return cleanAndReturn(env, new MessagePortExtHostConnection());
  }
  throw new Error(`No connection information defined in environment!`);
}
__name(readExtHostConnection, "readExtHostConnection");
function cleanAndReturn(env, result) {
  clean(env);
  return result;
}
__name(cleanAndReturn, "cleanAndReturn");
export {
  ExtHostConnectionType,
  IPCExtHostConnection,
  MessagePortExtHostConnection,
  SocketExtHostConnection,
  readExtHostConnection,
  writeExtHostConnection
};
//# sourceMappingURL=extensionHostEnv.js.map
