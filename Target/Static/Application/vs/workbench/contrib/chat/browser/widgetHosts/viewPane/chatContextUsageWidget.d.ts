import './media/chatContextUsageWidget.css';
import { Event } from '../../../../../../base/common/event.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../../base/common/observable.js';
import { IHoverService } from '../../../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IChatRequestModel } from '../../../common/model/chatModel.js';
import { ILanguageModelsService } from '../../../common/languageModels.js';
/**
 * A reusable circular progress indicator that displays a pie chart.
 * The pie fills clockwise from the top based on the percentage value.
 */
export declare class CircularProgressIndicator {
    readonly domNode: SVGSVGElement;
    private readonly progressPie;
    private static readonly CENTER_X;
    private static readonly CENTER_Y;
    private static readonly RADIUS;
    constructor();
    /**
     * Updates the pie chart to display the given percentage (0-100).
     * @param percentage The percentage of the pie to fill (clamped to 0-100)
     */
    setProgress(percentage: number): void;
}
/**
 * Widget that displays the context/token usage for the current chat session.
 * Shows a circular progress icon that expands on hover/focus to show token counts,
 * and on click shows the detailed context usage widget.
 */
export declare class ChatContextUsageWidget extends Disposable {
    private readonly hoverService;
    private readonly instantiationService;
    private readonly languageModelsService;
    private readonly _onDidChangeVisibility;
    readonly onDidChangeVisibility: Event<void>;
    readonly domNode: HTMLElement;
    private readonly progressIndicator;
    private readonly _isVisible;
    get isVisible(): IObservable<boolean>;
    private readonly _lastRequestDisposable;
    private readonly _hoverDisposable;
    private readonly _contextUsageDetails;
    private currentData;
    constructor(hoverService: IHoverService, instantiationService: IInstantiationService, languageModelsService: ILanguageModelsService);
    private setupHover;
    /**
     * Updates the widget with the latest request/response data.
     * The model is retrieved from the request's modelId.
     * @param lastRequest The last request in the session
     */
    update(lastRequest: IChatRequestModel | undefined): void;
    private updateFromResponse;
    private render;
    private show;
    private hide;
}
