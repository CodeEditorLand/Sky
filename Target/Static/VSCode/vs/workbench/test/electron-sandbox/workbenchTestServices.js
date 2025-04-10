/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Event } from '../../../base/common/event.js';
import { workbenchInstantiationService as browserWorkbenchInstantiationService, TestEncodingOracle, TestEnvironmentService, TestLifecycleService } from '../browser/workbenchTestServices.js';
import { INativeHostService } from '../../../platform/native/common/native.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { IFileDialogService } from '../../../platform/dialogs/common/dialogs.js';
import { INativeEnvironmentService } from '../../../platform/environment/common/environment.js';
import { IFileService } from '../../../platform/files/common/files.js';
import { IEditorService } from '../../services/editor/common/editorService.js';
import { ITextFileService } from '../../services/textfile/common/textfiles.js';
import { AbstractNativeExtensionTipsService } from '../../../platform/extensionManagement/common/extensionTipsService.js';
import { IExtensionManagementService } from '../../../platform/extensionManagement/common/extensionManagement.js';
import { IExtensionRecommendationNotificationService } from '../../../platform/extensionRecommendations/common/extensionRecommendations.js';
import { IProductService } from '../../../platform/product/common/productService.js';
import { IStorageService } from '../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../platform/telemetry/common/telemetry.js';
import { IModelService } from '../../../editor/common/services/model.js';
import { IWorkspaceContextService } from '../../../platform/workspace/common/workspace.js';
import { IFilesConfigurationService } from '../../services/filesConfiguration/common/filesConfigurationService.js';
import { ILifecycleService } from '../../services/lifecycle/common/lifecycle.js';
import { IWorkingCopyBackupService } from '../../services/workingCopy/common/workingCopyBackup.js';
import { IWorkingCopyService } from '../../services/workingCopy/common/workingCopyService.js';
import { NativeTextFileService } from '../../services/textfile/electron-sandbox/nativeTextFileService.js';
import { insert } from '../../../base/common/arrays.js';
import { Schemas } from '../../../base/common/network.js';
import { FileService } from '../../../platform/files/common/fileService.js';
import { InMemoryFileSystemProvider } from '../../../platform/files/common/inMemoryFilesystemProvider.js';
import { NullLogService } from '../../../platform/log/common/log.js';
import { FileUserDataProvider } from '../../../platform/userData/common/fileUserDataProvider.js';
import { NativeWorkingCopyBackupService } from '../../services/workingCopy/electron-sandbox/workingCopyBackupService.js';
import { UriIdentityService } from '../../../platform/uriIdentity/common/uriIdentityService.js';
import { UserDataProfilesService } from '../../../platform/userDataProfile/common/userDataProfile.js';
export class TestSharedProcessService {
    createRawConnection() { throw new Error('Not Implemented'); }
    getChannel(channelName) { return undefined; }
    registerChannel(channelName, channel) { }
    notifyRestored() { }
}
export class TestNativeHostService {
    constructor() {
        this.windowId = -1;
        this.onDidOpenMainWindow = Event.None;
        this.onDidMaximizeWindow = Event.None;
        this.onDidUnmaximizeWindow = Event.None;
        this.onDidFocusMainWindow = Event.None;
        this.onDidBlurMainWindow = Event.None;
        this.onDidFocusMainOrAuxiliaryWindow = Event.None;
        this.onDidBlurMainOrAuxiliaryWindow = Event.None;
        this.onDidResumeOS = Event.None;
        this.onDidChangeColorScheme = Event.None;
        this.onDidChangePassword = Event.None;
        this.onDidTriggerWindowSystemContextMenu = Event.None;
        this.onDidChangeWindowFullScreen = Event.None;
        this.onDidChangeDisplay = Event.None;
        this.windowCount = Promise.resolve(1);
    }
    getWindowCount() { return this.windowCount; }
    async getWindows() { return []; }
    async getActiveWindowId() { return undefined; }
    async getActiveWindowPosition() { return undefined; }
    async getNativeWindowHandle(windowId) { return undefined; }
    openWindow(arg1, arg2) {
        throw new Error('Method not implemented.');
    }
    async toggleFullScreen() { }
    async isMaximized() { return true; }
    async isFullScreen() { return true; }
    async maximizeWindow() { }
    async unmaximizeWindow() { }
    async minimizeWindow() { }
    async moveWindowTop(options) { }
    getCursorScreenPoint() { throw new Error('Method not implemented.'); }
    async positionWindow(position, options) { }
    async updateWindowControls(options) { }
    async setMinimumSize(width, height) { }
    async saveWindowSplash(value) { }
    async focusWindow(options) { }
    async showMessageBox(options) { throw new Error('Method not implemented.'); }
    async showSaveDialog(options) { throw new Error('Method not implemented.'); }
    async showOpenDialog(options) { throw new Error('Method not implemented.'); }
    async pickFileFolderAndOpen(options) { }
    async pickFileAndOpen(options) { }
    async pickFolderAndOpen(options) { }
    async pickWorkspaceAndOpen(options) { }
    async showItemInFolder(path) { }
    async setRepresentedFilename(path) { }
    async isAdmin() { return false; }
    async writeElevated(source, target) { }
    async isRunningUnderARM64Translation() { return false; }
    async getOSProperties() { return Object.create(null); }
    async getOSStatistics() { return Object.create(null); }
    async getOSVirtualMachineHint() { return 0; }
    async getOSColorScheme() { return { dark: true, highContrast: false }; }
    async hasWSLFeatureInstalled() { return false; }
    async getProcessId() { throw new Error('Method not implemented.'); }
    async killProcess() { }
    async setDocumentEdited(edited) { }
    async openExternal(url, defaultApplication) { return false; }
    async updateTouchBar() { }
    async moveItemToTrash() { }
    async newWindowTab() { }
    async showPreviousWindowTab() { }
    async showNextWindowTab() { }
    async moveWindowTabToNewWindow() { }
    async mergeAllWindowTabs() { }
    async toggleWindowTabsBar() { }
    async installShellCommand() { }
    async uninstallShellCommand() { }
    async notifyReady() { }
    async relaunch(options) { }
    async reload() { }
    async closeWindow() { }
    async quit() { }
    async exit(code) { }
    async openDevTools(options) { }
    async toggleDevTools() { }
    async openGPUInfoWindow() { }
    async resolveProxy(url) { return undefined; }
    async lookupAuthorization(authInfo) { return undefined; }
    async lookupKerberosAuthorization(url) { return undefined; }
    async loadCertificates() { return []; }
    async findFreePort(startPort, giveUpAfter, timeout, stride) { return -1; }
    async readClipboardText(type) { return ''; }
    async writeClipboardText(text, type) { }
    async readClipboardFindText() { return ''; }
    async writeClipboardFindText(text) { }
    async writeClipboardBuffer(format, buffer, type) { }
    async triggerPaste() { }
    async readImage() { return Uint8Array.from([]); }
    async readClipboardBuffer(format) { return VSBuffer.wrap(Uint8Array.from([])); }
    async hasClipboard(format, type) { return false; }
    async windowsGetStringRegKey(hive, path, name) { return undefined; }
    async profileRenderer() { throw new Error(); }
    async getScreenshot() { return undefined; }
}
let TestExtensionTipsService = class TestExtensionTipsService extends AbstractNativeExtensionTipsService {
    constructor(environmentService, telemetryService, extensionManagementService, storageService, nativeHostService, extensionRecommendationNotificationService, fileService, productService) {
        super(environmentService.userHome, nativeHostService, telemetryService, extensionManagementService, storageService, extensionRecommendationNotificationService, fileService, productService);
    }
};
TestExtensionTipsService = __decorate([
    __param(0, INativeEnvironmentService),
    __param(1, ITelemetryService),
    __param(2, IExtensionManagementService),
    __param(3, IStorageService),
    __param(4, INativeHostService),
    __param(5, IExtensionRecommendationNotificationService),
    __param(6, IFileService),
    __param(7, IProductService)
], TestExtensionTipsService);
export { TestExtensionTipsService };
export function workbenchInstantiationService(overrides, disposables = new DisposableStore()) {
    const instantiationService = browserWorkbenchInstantiationService({
        workingCopyBackupService: () => disposables.add(new TestNativeWorkingCopyBackupService()),
        ...overrides
    }, disposables);
    instantiationService.stub(INativeHostService, new TestNativeHostService());
    return instantiationService;
}
let TestServiceAccessor = class TestServiceAccessor {
    constructor(lifecycleService, textFileService, filesConfigurationService, contextService, modelService, fileService, nativeHostService, fileDialogService, workingCopyBackupService, workingCopyService, editorService) {
        this.lifecycleService = lifecycleService;
        this.textFileService = textFileService;
        this.filesConfigurationService = filesConfigurationService;
        this.contextService = contextService;
        this.modelService = modelService;
        this.fileService = fileService;
        this.nativeHostService = nativeHostService;
        this.fileDialogService = fileDialogService;
        this.workingCopyBackupService = workingCopyBackupService;
        this.workingCopyService = workingCopyService;
        this.editorService = editorService;
    }
};
TestServiceAccessor = __decorate([
    __param(0, ILifecycleService),
    __param(1, ITextFileService),
    __param(2, IFilesConfigurationService),
    __param(3, IWorkspaceContextService),
    __param(4, IModelService),
    __param(5, IFileService),
    __param(6, INativeHostService),
    __param(7, IFileDialogService),
    __param(8, IWorkingCopyBackupService),
    __param(9, IWorkingCopyService),
    __param(10, IEditorService)
], TestServiceAccessor);
export { TestServiceAccessor };
export class TestNativeTextFileServiceWithEncodingOverrides extends NativeTextFileService {
    get encoding() {
        if (!this._testEncoding) {
            this._testEncoding = this._register(this.instantiationService.createInstance(TestEncodingOracle));
        }
        return this._testEncoding;
    }
}
export class TestNativeWorkingCopyBackupService extends NativeWorkingCopyBackupService {
    constructor() {
        const environmentService = TestEnvironmentService;
        const logService = new NullLogService();
        const fileService = new FileService(logService);
        const lifecycleService = new TestLifecycleService();
        super(environmentService, fileService, logService, lifecycleService);
        const inMemoryFileSystemProvider = this._register(new InMemoryFileSystemProvider());
        this._register(fileService.registerProvider(Schemas.inMemory, inMemoryFileSystemProvider));
        const uriIdentityService = this._register(new UriIdentityService(fileService));
        const userDataProfilesService = this._register(new UserDataProfilesService(environmentService, fileService, uriIdentityService, logService));
        this._register(fileService.registerProvider(Schemas.vscodeUserData, this._register(new FileUserDataProvider(Schemas.file, inMemoryFileSystemProvider, Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService))));
        this.backupResourceJoiners = [];
        this.discardBackupJoiners = [];
        this.discardedBackups = [];
        this.pendingBackupsArr = [];
        this.discardedAllBackups = false;
        this._register(fileService);
        this._register(lifecycleService);
    }
    testGetFileService() {
        return this.fileService;
    }
    async waitForAllBackups() {
        await Promise.all(this.pendingBackupsArr);
    }
    joinBackupResource() {
        return new Promise(resolve => this.backupResourceJoiners.push(resolve));
    }
    async backup(identifier, content, versionId, meta, token) {
        const p = super.backup(identifier, content, versionId, meta, token);
        const removeFromPendingBackups = insert(this.pendingBackupsArr, p.then(undefined, undefined));
        try {
            await p;
        }
        finally {
            removeFromPendingBackups();
        }
        while (this.backupResourceJoiners.length) {
            this.backupResourceJoiners.pop()();
        }
    }
    joinDiscardBackup() {
        return new Promise(resolve => this.discardBackupJoiners.push(resolve));
    }
    async discardBackup(identifier) {
        await super.discardBackup(identifier);
        this.discardedBackups.push(identifier);
        while (this.discardBackupJoiners.length) {
            this.discardBackupJoiners.pop()();
        }
    }
    async discardBackups(filter) {
        this.discardedAllBackups = true;
        return super.discardBackups(filter);
    }
    async getBackupContents(identifier) {
        const backupResource = this.toBackupResource(identifier);
        const fileContents = await this.fileService.readFile(backupResource);
        return fileContents.value.toString();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoVGVzdFNlcnZpY2VzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vRDovRGV2ZWxvcGVyL0FwcGxpY2F0aW9uL0NvZGVFZGl0b3JMYW5kL0xhbmQvRGVwZW5kZW5jeS9NaWNyb3NvZnQvRGVwZW5kZW5jeS9FZGl0b3Ivc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3Rlc3QvZWxlY3Ryb24tc2FuZGJveC93b3JrYmVuY2hUZXN0U2VydmljZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFFaEcsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ3RELE9BQU8sRUFBRSw2QkFBNkIsSUFBSSxvQ0FBb0MsRUFBNkIsa0JBQWtCLEVBQUUsc0JBQXNCLEVBQXlFLG9CQUFvQixFQUF1QixNQUFNLHFDQUFxQyxDQUFDO0FBRXJULE9BQU8sRUFBRSxrQkFBa0IsRUFBb0QsTUFBTSwyQ0FBMkMsQ0FBQztBQUNqSSxPQUFPLEVBQUUsUUFBUSxFQUE0QyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3BHLE9BQU8sRUFBRSxlQUFlLEVBQWUsTUFBTSxtQ0FBbUMsQ0FBQztBQUVqRixPQUFPLEVBQUUsa0JBQWtCLEVBQTRCLE1BQU0sNkNBQTZDLENBQUM7QUFLM0csT0FBTyxFQUF1Qix5QkFBeUIsRUFBRSxNQUFNLHFEQUFxRCxDQUFDO0FBQ3JILE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUV2RSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFHL0UsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDL0UsT0FBTyxFQUFFLGtDQUFrQyxFQUFFLE1BQU0sc0VBQXNFLENBQUM7QUFDMUgsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0scUVBQXFFLENBQUM7QUFDbEgsT0FBTyxFQUFFLDJDQUEyQyxFQUFFLE1BQU0sK0VB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