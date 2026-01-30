import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfile } from '../../userDataProfile/common/userDataProfile.js';
import { AbstractJsonSynchronizer } from './abstractJsonSynchronizer.js';
import { IUserDataSyncLocalStoreService, IUserDataSynchroniser, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService } from './userDataSync.js';
interface IMcpSyncContent {
    mcp?: string;
}
export declare function getMcpContentFromSyncContent(syncContent: string, logService: ILogService): string | null;
export declare class McpSynchroniser extends AbstractJsonSynchronizer implements IUserDataSynchroniser {
    constructor(profile: IUserDataProfile, collection: string | undefined, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncLocalStoreService: IUserDataSyncLocalStoreService, logService: IUserDataSyncLogService, configurationService: IConfigurationService, userDataSyncEnablementService: IUserDataSyncEnablementService, fileService: IFileService, environmentService: IEnvironmentService, storageService: IStorageService, telemetryService: ITelemetryService, uriIdentityService: IUriIdentityService);
    protected getContentFromSyncContent(syncContent: string): string | null;
    protected toSyncContent(mcp: string | null): IMcpSyncContent;
}
export {};
