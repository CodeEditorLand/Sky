import type { Terminal as RawXtermTerminal } from '@xterm/xterm';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { ITerminalLogService } from '../../../../../platform/terminal/common/terminal.js';
import type { ITerminalContribution, ITerminalInstance, IXtermTerminal } from '../../../terminal/browser/terminal.js';
import { type ITerminalContributionContext } from '../../../terminal/browser/terminalExtensions.js';
declare class TerminalOscNotificationsContribution extends Disposable implements ITerminalContribution {
    private readonly _ctx;
    private readonly _configurationService;
    private readonly _notificationService;
    private readonly _logService;
    static readonly ID = "terminal.oscNotifications";
    private readonly _handler;
    constructor(_ctx: ITerminalContributionContext, _configurationService: IConfigurationService, _notificationService: INotificationService, _logService: ITerminalLogService);
    xtermReady(xterm: IXtermTerminal & {
        raw: RawXtermTerminal;
    }): void;
}
export declare function getTerminalOscNotifications(instance: ITerminalInstance): TerminalOscNotificationsContribution | null;
export {};
