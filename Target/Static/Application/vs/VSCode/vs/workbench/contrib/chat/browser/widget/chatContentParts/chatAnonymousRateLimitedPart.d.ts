import { Disposable, IDisposable } from '../../../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../../../platform/commands/common/commands.js';
import { ITelemetryService } from '../../../../../../platform/telemetry/common/telemetry.js';
import { IChatEntitlementService } from '../../../../../services/chat/common/chatEntitlementService.js';
import { IChatErrorDetailsPart, IChatRendererContent } from '../../../common/model/chatViewModel.js';
import { IChatContentPart } from './chatContentParts.js';
export declare class ChatAnonymousRateLimitedPart extends Disposable implements IChatContentPart {
    private readonly content;
    readonly domNode: HTMLElement;
    constructor(content: IChatErrorDetailsPart, commandService: ICommandService, telemetryService: ITelemetryService, chatEntitlementService: IChatEntitlementService);
    hasSameContent(other: IChatRendererContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
