import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Downloading, IUpdateService } from '../../../../platform/update/common/update.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IStatusbarService } from '../../../services/statusbar/browser/statusbar.js';
import './media/updateStatusBarEntry.css';
/**
 * Displays update status and actions in the status bar.
 */
export declare class UpdateStatusBarEntryContribution extends Disposable implements IWorkbenchContribution {
    private readonly updateService;
    private readonly statusbarService;
    private readonly productService;
    private readonly commandService;
    private readonly hoverService;
    private readonly configurationService;
    private static readonly NAME;
    private readonly statusBarEntryAccessor;
    private lastStateType;
    constructor(updateService: IUpdateService, statusbarService: IStatusbarService, productService: IProductService, commandService: ICommandService, hoverService: IHoverService, configurationService: IConfigurationService);
    private onUpdateStateChange;
    private updateStatusBarEntry;
    private getCheckingTooltip;
    private getAvailableTooltip;
    private getDownloadingText;
    private getDownloadingTooltip;
    private getReadyToInstallTooltip;
    private getRestartToUpdateTooltip;
    private getUpdatingText;
    private getUpdatingTooltip;
    private getOverwritingTooltip;
    private createTooltipDisposableStore;
    private runCommandAndClose;
    private appendHeader;
    private appendProductInfo;
    private appendWhatsIncluded;
}
/**
 * Returns the progress percentage based on the current and maximum progress values.
 */
export declare function getProgressPercent(current: number | undefined, max: number | undefined): number | undefined;
/**
 * Tries to parse a date string and returns the timestamp or undefined if parsing fails.
 */
export declare function tryParseDate(date: string | undefined): number | undefined;
/**
 * Formats a timestamp as a localized date string.
 */
export declare function formatDate(timestamp: number): string;
/**
 * Computes an estimate of remaining download time in seconds.
 */
export declare function computeDownloadTimeRemaining(state: Downloading): number | undefined;
/**
 * Formats the time remaining as a human-readable string.
 */
export declare function formatTimeRemaining(seconds: number): string;
/**
 * Formats a byte count as a human-readable string.
 */
export declare function formatBytes(bytes: number): string;
/**
 * Computes the current download speed in bytes per second.
 */
export declare function computeDownloadSpeed(state: Downloading): number | undefined;
