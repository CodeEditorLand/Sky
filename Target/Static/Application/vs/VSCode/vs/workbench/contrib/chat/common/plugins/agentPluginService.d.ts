import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { SyncDescriptor0 } from '../../../../../platform/instantiation/common/descriptors.js';
import { IMcpServerConfiguration } from '../../../../../platform/mcp/common/mcpPlatformTypes.js';
import { ContributionEnablementState, IEnablementModel } from '../enablement.js';
import { IHookCommand } from '../promptSyntax/hookSchema.js';
import { HookType } from '../promptSyntax/hookTypes.js';
import { IMarketplacePlugin } from './pluginMarketplaceService.js';
export declare const IAgentPluginService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAgentPluginService>;
export interface IAgentPluginHook {
    readonly type: HookType;
    readonly hooks: readonly IHookCommand[];
    readonly originalId: string;
}
export interface IAgentPluginCommand {
    readonly uri: URI;
    readonly name: string;
}
export interface IAgentPluginSkill {
    readonly uri: URI;
    readonly name: string;
}
export interface IAgentPluginAgent {
    readonly uri: URI;
    readonly name: string;
}
export interface IAgentPluginInstruction {
    readonly uri: URI;
    readonly name: string;
}
export interface IAgentPluginMcpServerDefinition {
    readonly name: string;
    readonly configuration: IMcpServerConfiguration;
}
export interface IAgentPlugin {
    readonly uri: URI;
    /** Human-readable display name for the plugin. */
    readonly label: string;
    readonly enablement: IObservable<ContributionEnablementState>;
    /** Removes this plugin from its discovery source (config or installed storage). */
    remove(): void;
    readonly hooks: IObservable<readonly IAgentPluginHook[]>;
    readonly commands: IObservable<readonly IAgentPluginCommand[]>;
    readonly skills: IObservable<readonly IAgentPluginSkill[]>;
    readonly agents: IObservable<readonly IAgentPluginAgent[]>;
    readonly instructions: IObservable<readonly IAgentPluginInstruction[]>;
    readonly mcpServerDefinitions: IObservable<readonly IAgentPluginMcpServerDefinition[]>;
    /** Set when the plugin was installed from a marketplace repository. */
    readonly fromMarketplace?: IMarketplacePlugin;
}
export interface IAgentPluginService {
    readonly _serviceBrand: undefined;
    readonly plugins: IObservable<readonly IAgentPlugin[]>;
    readonly enablementModel: IEnablementModel;
}
export interface IAgentPluginDiscovery extends IDisposable {
    readonly plugins: IObservable<readonly IAgentPlugin[]>;
    start(enablementModel: IEnablementModel): void;
}
export declare function getCanonicalPluginCommandId(plugin: IAgentPlugin, commandName: string): string;
declare class AgentPluginDiscoveryRegistry {
    private readonly _discovery;
    register(descriptor: SyncDescriptor0<IAgentPluginDiscovery>): void;
    getAll(): readonly SyncDescriptor0<IAgentPluginDiscovery>[];
}
export declare const agentPluginDiscoveryRegistry: AgentPluginDiscoveryRegistry;
export {};
