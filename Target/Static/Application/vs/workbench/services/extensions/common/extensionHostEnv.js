var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var ExtHostConnectionType;
(function(ExtHostConnectionType2) {
  ExtHostConnectionType2[ExtHostConnectionType2["IPC"] = 1] = "IPC";
  ExtHostConnectionType2[ExtHostConnectionType2["Socket"] = 2] = "Socket";
  ExtHostConnectionType2[ExtHostConnectionType2["MessagePort"] = 3] = "MessagePort";
})(ExtHostConnectionType || (ExtHostConnectionType = {}));
class IPCExtHostConnection {
  static {
    __name(this, "IPCExtHostConnection");
  }
  static {
    this.ENV_KEY = "VSCODE_EXTHOST_IPC_HOOK";
  }
  constructor(pipeName) {
    this.pipeName = pipeName;
    this.type = 1;
  }
  serialize(env) {
    env[IPCExtHostConnection.ENV_KEY] = this.pipeName;
  }
}
class SocketExtHostConnection {
  static {
    __name(this, "SocketExtHostConnection");
  }
  constructor() {
    this.type = 2;
  }
  static {
    this.ENV_KEY = "VSCODE_EXTHOST_WILL_SEND_SOCKET";
  }
  serialize(env) {
    env[SocketExtHostConnection.ENV_KEY] = "1";
  }
}
class MessagePortExtHostConnection {
  static {
    __name(this, "MessagePortExtHostConnection");
  }
  constructor() {
    this.type = 3;
  }
  static {
    this.ENV_KEY = "VSCODE_WILL_SEND_MESSAGE_PORT";
  }
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
