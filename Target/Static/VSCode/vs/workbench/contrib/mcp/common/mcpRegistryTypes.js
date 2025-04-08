import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IObservable } from "../../../../base/common/observable.js";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogger, LogLevel } from "../../../../platform/log/common/log.js";
import { StorageScope } from "../../../../platform/storage/common/storage.js";
import { IWorkspaceFolderData } from "../../../../platform/workspace/common/workspace.js";
import { IResolvedValue } from "../../../services/configurationResolver/common/configurationResolverExpression.js";
import { IMcpServerConnection, LazyCollectionState, McpCollectionDefinition, McpCollectionReference, McpConnectionState, McpDefinitionReference, McpServerDefinition, McpServerLaunch } from "./mcpTypes.js";
import { MCP } from "./modelContextProtocol.js";
const IMcpRegistry = createDecorator("mcpRegistry");
export {
  IMcpRegistry
};
//# sourceMappingURL=mcpRegistryTypes.js.map
