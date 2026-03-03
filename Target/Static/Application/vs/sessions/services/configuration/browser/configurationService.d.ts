import { Event } from '../../../../base/common/event.js';
import { ConfigurationService as BaseConfigurationService } from '../../../../platform/configuration/common/configurationService.js';
import { IWorkbenchConfigurationService, RestrictedSettings } from '../../../../workbench/services/configuration/common/configuration.js';
import '../../../../workbench/services/configuration/browser/configurationService.js';
export declare class ConfigurationService extends BaseConfigurationService implements IWorkbenchConfigurationService {
    readonly restrictedSettings: RestrictedSettings;
    readonly onDidChangeRestrictedSettings: Event<any>;
    whenRemoteConfigurationLoaded(): Promise<void>;
    isSettingAppliedForAllProfiles(key: string): boolean;
}
