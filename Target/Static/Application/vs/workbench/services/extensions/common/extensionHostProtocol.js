var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../../base/common/buffer.js";
var UIKind;
(function(UIKind2) {
  UIKind2[UIKind2["Desktop"] = 1] = "Desktop";
  UIKind2[UIKind2["Web"] = 2] = "Web";
})(UIKind || (UIKind = {}));
var ExtensionHostExitCode;
(function(ExtensionHostExitCode2) {
  ExtensionHostExitCode2[ExtensionHostExitCode2["VersionMismatch"] = 55] = "VersionMismatch";
  ExtensionHostExitCode2[ExtensionHostExitCode2["UnexpectedError"] = 81] = "UnexpectedError";
})(ExtensionHostExitCode || (ExtensionHostExitCode = {}));
var MessageType;
(function(MessageType2) {
  MessageType2[MessageType2["Initialized"] = 0] = "Initialized";
  MessageType2[MessageType2["Ready"] = 1] = "Ready";
  MessageType2[MessageType2["Terminate"] = 2] = "Terminate";
})(MessageType || (MessageType = {}));
function createMessageOfType(type) {
  const result = VSBuffer.alloc(1);
  switch (type) {
    case 0:
      result.writeUInt8(1, 0);
      break;
    case 1:
      result.writeUInt8(2, 0);
      break;
    case 2:
      result.writeUInt8(3, 0);
      break;
  }
  return result;
}
__name(createMessageOfType, "createMessageOfType");
function isMessageOfType(message, type) {
  if (message.byteLength !== 1) {
    return false;
  }
  switch (message.readUInt8(0)) {
    case 1:
      return type === 0;
    case 2:
      return type === 1;
    case 3:
      return type === 2;
    default:
      return false;
  }
}
__name(isMessageOfType, "isMessageOfType");
var NativeLogMarkers;
(function(NativeLogMarkers2) {
  NativeLogMarkers2["Start"] = "START_NATIVE_LOG";
  NativeLogMarkers2["End"] = "END_NATIVE_LOG";
})(NativeLogMarkers || (NativeLogMarkers = {}));
export {
  ExtensionHostExitCode,
  MessageType,
  NativeLogMarkers,
  UIKind,
  createMessageOfType,
  isMessageOfType
};
//# sourceMappingURL=extensionHostProtocol.js.map
