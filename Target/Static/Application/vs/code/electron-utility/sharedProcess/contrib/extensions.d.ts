import { Disposable } from '../../../../base/common/lifecycle.js';
import { IExtensionGalleryService, IGlobalExtensionEnablementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IExtensionStorageService } from '../../../../platform/extensionManagement/common/extensionStorage.js';
import { INativeServerExtensionManagementService } from '../../../../platform/extensionManagement/node/extensionManagementService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
export declare class ExtensionsContributions extends Disposable {
    private readonly extensionManagementService;
    private readonly extensionGalleryService;
    private readonly extensionStorageService;
    private readonly extensionEnablementService;
    private readonly userDataProfilesService;
    private readonly logService;
    constructor(extensionManagementService: INativeServerExtensionManagementService, extensionGalleryService: IExtensionGalleryService, extensionStorageService: IExtensionStorageService, extensionEnablementService: IGlobalExtensionEnablementService, userDataProfilesService: IUserDataProfilesService, storageService: IStorageService, logService: ILogService);
    private migrateUnsupportedExtensions;
}
