import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IMarketplaceReference } from './marketplaceReference.js';
/**
 * Minimal representation of a marketplace entry from `extraKnownMarketplaces`.
 */
export interface IWorkspaceMarketplaceEntry {
    readonly name: string;
    readonly reference: IMarketplaceReference;
}
export declare const IWorkspacePluginSettingsService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkspacePluginSettingsService>;
export interface IWorkspacePluginSettingsService {
    readonly _serviceBrand: undefined;
    /**
     * Marketplace references parsed from `extraKnownMarketplaces` in workspace
     * settings files (`.claude/settings.json`, `.github/copilot/settings.json`).
     */
    readonly extraMarketplaces: IObservable<readonly IWorkspaceMarketplaceEntry[]>;
    /**
     * Plugin recommendation map parsed from `enabledPlugins` in workspace
     * settings files.
     * Keys are `"pluginName@marketplaceName"`, values indicate recommendation.
     */
    readonly enabledPlugins: IObservable<ReadonlyMap<string, boolean>>;
}
export declare class WorkspacePluginSettingsService extends Disposable implements IWorkspacePluginSettingsService {
    readonly _serviceBrand: undefined;
    readonly extraMarketplaces: IObservable<readonly IWorkspaceMarketplaceEntry[]>;
    readonly enabledPlugins: IObservable<ReadonlyMap<string, boolean>>;
    constructor(fileService: IFileService, workspaceContextService: IWorkspaceContextService, logService: ILogService);
}
