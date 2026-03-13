import './media/chatContextUsageDetails.css';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IMenuService } from '../../../../../../platform/actions/common/actions.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
export interface IChatContextUsagePromptTokenDetail {
    category: string;
    label: string;
    percentageOfPrompt: number;
}
export interface IChatContextUsageData {
    usedTokens: number;
    completionTokens: number;
    totalContextWindow: number;
    percentage: number;
    outputBufferPercentage?: number;
    promptTokenDetails?: readonly IChatContextUsagePromptTokenDetail[];
}
/**
 * Detailed widget that shows context usage breakdown.
 * Displayed when the user clicks on the ChatContextUsageIcon.
 */
export declare class ChatContextUsageDetails extends Disposable {
    private readonly instantiationService;
    private readonly menuService;
    private readonly contextKeyService;
    readonly domNode: HTMLElement;
    private readonly quotaItem;
    private readonly percentageLabel;
    private readonly tokenCountLabel;
    private readonly progressFill;
    private readonly outputBufferFill;
    private readonly outputBufferLegend;
    private readonly tokenDetailsContainer;
    private readonly warningMessage;
    private readonly actionsSection;
    constructor(instantiationService: IInstantiationService, menuService: IMenuService, contextKeyService: IContextKeyService);
    update(data: IChatContextUsageData): void;
    private formatTokenCount;
    private renderTokenDetails;
    focus(): void;
}
