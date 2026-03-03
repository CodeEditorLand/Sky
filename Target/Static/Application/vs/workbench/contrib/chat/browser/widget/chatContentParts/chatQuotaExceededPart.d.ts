import { Disposable, IDisposable } from '../../../../../../base/common/lifecycle.js';
import { IMarkdownRenderer } from '../../../../../../platform/markdown/browser/markdownRenderer.js';
import { ICommandService } from '../../../../../../platform/commands/common/commands.js';
import { ITelemetryService } from '../../../../../../platform/telemetry/common/telemetry.js';
import { IChatEntitlementService } from '../../../../../services/chat/common/chatEntitlementService.js';
import { IChatErrorDetailsPart, IChatRendererContent, IChatResponseViewModel } from '../../../common/model/chatViewModel.js';
import { IChatWidgetService } from '../../chat.js';
import { IChatContentPart } from './chatContentParts.js';
export declare class ChatQuotaExceededPart extends Disposable implements IChatContentPart {
    private readonly content;
    readonly domNode: HTMLElement;
    constructor(element: IChatResponseViewModel, content: IChatErrorDetailsPart, renderer: IMarkdownRenderer, chatWidgetService: IChatWidgetService, commandService: ICommandService, telemetryService: ITelemetryService, chatEntitlementService: IChatEntitlementService);
    hasSameContent(other: IChatRendererContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
