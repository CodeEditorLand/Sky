import { Disposable } from '../../../../../base/common/lifecycle.js';
import { type INotification, type INotificationHandle } from '../../../../../platform/notification/common/notification.js';
export interface IOsc99NotificationHost {
    isEnabled(): boolean;
    isWindowFocused(): boolean;
    isTerminalVisible(): boolean;
    focusTerminal(): void;
    notify(notification: INotification): INotificationHandle;
    updateEnableNotifications(value: boolean): Promise<void>;
    logWarn(message: string): void;
    writeToProcess(data: string): void;
}
export declare class TerminalNotificationHandler extends Disposable {
    private readonly _host;
    private readonly _osc99PendingNotifications;
    private _osc99PendingAnonymous;
    private readonly _osc99ActiveNotifications;
    constructor(_host: IOsc99NotificationHost);
    handleSequence(data: string): boolean;
    private _splitOsc99Data;
    private _parseOsc99Metadata;
    private _decodeOsc99Payload;
    private _sanitizeOsc99Id;
    private _sanitizeOsc99MessageText;
    private _getOrCreateOsc99State;
    private _createOsc99State;
    private _clearOsc99PendingState;
    private _updateOsc99StateFromMetadata;
    private _parseOsc99Actions;
    private _shouldHonorOsc99Occasion;
    private _showOsc99Notification;
    private _getOsc99NotificationMessage;
    private _getOsc99NotificationPriority;
    private _scheduleOsc99AutoClose;
    private _closeOsc99Notification;
    private _sendOsc99QueryResponse;
    private _sendOsc99AliveResponse;
    private _sendOsc99ActivationReport;
    private _sendOsc99CloseReport;
    private _sendOsc99Response;
}
