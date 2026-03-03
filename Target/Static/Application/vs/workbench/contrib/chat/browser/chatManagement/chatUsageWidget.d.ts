import './media/chatUsageWidget.css';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IChatEntitlementService } from '../../../../services/chat/common/chatEntitlementService.js';
export declare class ChatUsageWidget extends Disposable {
    private readonly chatEntitlementService;
    private readonly _onDidChangeContentHeight;
    readonly onDidChangeContentHeight: import("../../../../../base/common/event.js").Event<number>;
    readonly element: HTMLElement;
    private usageSection;
    private readonly dateFormatter;
    private readonly dateTimeFormatter;
    constructor(chatEntitlementService: IChatEntitlementService);
    private create;
    private render;
    private renderQuotaItem;
    private getQuotaPercentageUsed;
    private renderLimitedQuotaItem;
}
