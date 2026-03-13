import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IMeteredConnectionService } from '../../../../platform/meteredConnection/common/meteredConnection.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IUpdateService } from '../../../../platform/update/common/update.js';
import './media/updateTooltip.css';
/**
 * A stateful tooltip control for the update status.
 */
export declare class UpdateTooltip extends Disposable {
    private readonly commandService;
    private readonly configurationService;
    private readonly hoverService;
    private readonly meteredConnectionService;
    private readonly productService;
    readonly domNode: HTMLElement;
    private readonly titleNode;
    private readonly productNameNode;
    private readonly currentVersionNode;
    private readonly latestVersionNode;
    private readonly releaseDateNode;
    private readonly releaseNotesLink;
    private readonly progressContainer;
    private readonly progressFill;
    private readonly progressPercentNode;
    private readonly progressSizeNode;
    private readonly downloadStatsContainer;
    private readonly timeRemainingNode;
    private readonly speedInfoNode;
    private readonly messageNode;
    private releaseNotesVersion;
    constructor(commandService: ICommandService, configurationService: IConfigurationService, hoverService: IHoverService, meteredConnectionService: IMeteredConnectionService, productService: IProductService, updateService: IUpdateService);
    private updateCurrentVersion;
    private onStateChange;
    private renderUninitialized;
    private renderDisabled;
    private renderIdle;
    private renderCheckingForUpdates;
    private renderAvailableForDownload;
    private renderDownloading;
    private renderDownloaded;
    private renderUpdating;
    private renderReady;
    private renderOverwriting;
    private renderTitleAndInfo;
    private showMessage;
    private runCommandAndClose;
}
