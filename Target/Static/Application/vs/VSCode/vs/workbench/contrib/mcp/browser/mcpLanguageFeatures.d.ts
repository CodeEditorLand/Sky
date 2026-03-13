import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { IMarkerService } from '../../../../platform/markers/common/markers.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IConfigurationResolverService } from '../../../services/configurationResolver/common/configurationResolver.js';
import { IMcpRegistry } from '../common/mcpRegistryTypes.js';
import { IMcpService, IMcpWorkbenchService } from '../common/mcpTypes.js';
export declare class McpLanguageFeatures extends Disposable implements IWorkbenchContribution {
    private readonly _mcpRegistry;
    private readonly _mcpWorkbenchService;
    private readonly _mcpService;
    private readonly _markerService;
    private readonly _configurationResolverService;
    private readonly _cachedMcpSection;
    constructor(languageFeaturesService: ILanguageFeaturesService, _mcpRegistry: IMcpRegistry, _mcpWorkbenchService: IMcpWorkbenchService, _mcpService: IMcpService, _markerService: IMarkerService, _configurationResolverService: IConfigurationResolverService);
    /** Simple mechanism to avoid extra json parsing for hints+lenses */
    private _parseModel;
    private _addDiagnostics;
    private _provideCodeLenses;
    private _provideInlayHints;
}
