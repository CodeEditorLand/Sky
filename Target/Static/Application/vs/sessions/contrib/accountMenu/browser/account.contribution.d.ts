import '../../../browser/media/sidebarActionButton.css';
import './media/accountWidget.css';
import { ActionViewItem, IBaseActionViewItemOptions } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IAction } from '../../../../base/common/actions.js';
import { IUpdateService } from '../../../../platform/update/common/update.js';
export declare class UpdateWidget extends ActionViewItem {
    private readonly updateService;
    private updateButton;
    private readonly viewItemDisposables;
    constructor(action: IAction, options: IBaseActionViewItemOptions, updateService: IUpdateService);
    protected getTooltip(): string | undefined;
    render(container: HTMLElement): void;
    private isUpdateReady;
    private isUpdatePending;
    private updateUpdateButton;
    private updateDownloadProgress;
    private clearDownloadProgress;
    private getUpdateProgressMessage;
    private update;
    onClick(): void;
}
