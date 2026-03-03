import { IWorkbenchContribution } from '../../../common/contributions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchConfigurationService } from '../../../services/configuration/common/configuration.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { INativeEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IFileService } from '../../../../platform/files/common/files.js';
export declare class PolicyExportContribution extends Disposable implements IWorkbenchContribution {
    private readonly nativeEnvironmentService;
    private readonly extensionService;
    private readonly fileService;
    private readonly configurationService;
    private readonly nativeHostService;
    private readonly progressService;
    private readonly logService;
    static readonly ID = "workbench.contrib.policyExport";
    static readonly DEFAULT_POLICY_EXPORT_PATH = "build/lib/policies/policyData.jsonc";
    constructor(nativeEnvironmentService: INativeEnvironmentService, extensionService: IExtensionService, fileService: IFileService, configurationService: IWorkbenchConfigurationService, nativeHostService: INativeHostService, progressService: IProgressService, logService: ILogService);
    private log;
    private exportPolicyDataAndQuit;
}
