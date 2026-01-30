import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfile, IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { AbstractJsonSynchronizer } from './abstractJsonSynchronizer.js';
import { AbstractInitializer } from './abstractSynchronizer.js';
import { IRemoteUserData, IUserDataSyncLocalStoreService, IUserDataSynchroniser, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService } from './userDataSync.js';
interface ITasksSyncContent {
    tasks?: string;
}
export declare function getTasksContentFromSyncContent(syncContent: string, logService: ILogService): string | null;
export declare class TasksSynchroniser extends AbstractJsonSynchronizer implements IUserDataSynchroniser {
    constructor(profile: IUserDataProfile, collection: string | undefined, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncLocalStoreService: IUserDataSyncLocalStoreService, logService: IUserDataSyncLogService, configurationService: IConfigurationService, userDataSyncEnablementService: IUserDataSyncEnablementService, fileService: IFileService, environmentService: IEnvironmentService, storageService: IStorageService, telemetryService: ITelemetryService, uriIdentityService: IUriIdentityService);
    protected getContentFromSyncContent(syncContent: string): string | null;
    protected toSyncContent(tasks: string | null): ITasksSyncContent;
}
export declare class TasksInitializer extends AbstractInitializer {
    private tasksResource;
    constructor(fileService: IFileService, userDataProfilesService: IUserDataProfilesService, environmentService: IEnvironmentService, logService: IUserDataSyncLogService, storageService: IStorageService, uriIdentityService: IUriIdentityService);
    protected doInitialize(remoteUserData: IRemoteUserData): Promise<void>;
    private isEmpty;
}
export {};
