import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { ITelemetryService } from '../../../../../../platform/telemetry/common/telemetry.js';
import { IChatEntitlementService } from '../../../../../services/chat/common/chatEntitlementService.js';
import { IChatInputPartWidget } from './chatInputPartWidgets.js';
import './media/chatStatusWidget.css';
/**
 * Widget that displays a status message with an optional action button.
 * Only shown for free tier users when the setting is enabled (experiment controlled via onExP tag).
 */
export declare class ChatStatusWidget extends Disposable implements IChatInputPartWidget {
    private readonly chatEntitlementService;
    private readonly commandService;
    private readonly configurationService;
    private readonly telemetryService;
    static readonly ID = "chatStatusWidget";
    readonly domNode: HTMLElement;
    private messageElement;
    private actionButton;
    constructor(chatEntitlementService: IChatEntitlementService, commandService: ICommandService, configurationService: IConfigurationService, telemetryService: ITelemetryService);
    private initializeIfEnabled;
    get height(): number;
    private createWidgetContent;
}
