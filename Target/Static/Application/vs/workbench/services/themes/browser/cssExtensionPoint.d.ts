import { IFileService } from '../../../../platform/files/common/files.js';
import { IBrowserWorkbenchEnvironmentService } from '../../environment/browser/environmentService.js';
import { IWorkbenchThemeService } from '../common/workbenchThemeService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export declare class CSSExtensionPoint {
    private readonly themeService;
    private readonly storageService;
    private readonly disposables;
    private readonly stylesheetsByExtension;
    private readonly pendingExtensions;
    private readonly watcher;
    constructor(fileService: IFileService, environmentService: IBrowserWorkbenchEnvironmentService, themeService: IWorkbenchThemeService, storageService: IStorageService);
    private isExtensionThemeActive;
    private onThemeChange;
    private activateExtensionCSS;
    private removeStylesheets;
    private applyCachedCSS;
    private getCachedCSS;
    private cacheExtensionCSS;
    private clearCacheForExtension;
    private createCSSLinkElement;
    private reloadStylesheet;
    dispose(): void;
}
