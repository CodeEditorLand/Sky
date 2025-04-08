import { InstallExtensionSummary } from "../../extensionManagement/common/extensionManagement.js";
import { IExtensionDescription } from "../../extensions/common/extensions.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
const IRemoteExtensionsScannerService = createDecorator("IRemoteExtensionsScannerService");
const RemoteExtensionsScannerChannelName = "remoteExtensionsScanner";
export {
  IRemoteExtensionsScannerService,
  RemoteExtensionsScannerChannelName
};
//# sourceMappingURL=remoteExtensionsScanner.js.map
