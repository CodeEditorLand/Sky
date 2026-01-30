import { Event } from '../../../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../../../base/common/lifecycle.js';
import { ContextKeyExpression, IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { BrandedService, IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
/**
 * A widget that can be rendered on top of the chat input part.
 */
export interface IChatInputPartWidget extends IDisposable {
    /**
     * The DOM node of the widget.
     */
    readonly domNode: HTMLElement;
    /**
     * Fired when the height of the widget changes.
     */
    readonly onDidChangeHeight: Event<void>;
    /**
     * The current height of the widget in pixels.
     */
    readonly height: number;
}
export interface IChatInputPartWidgetDescriptor<Services extends BrandedService[] = BrandedService[]> {
    readonly id: string;
    readonly when?: ContextKeyExpression;
    readonly ctor: new (...services: Services) => IChatInputPartWidget;
}
/**
 * Registry for chat input part widgets.
 * Widgets register themselves and are instantiated by the controller based on context key conditions.
 */
export declare const ChatInputPartWidgetsRegistry: {
    readonly widgets: IChatInputPartWidgetDescriptor[];
    register<Services extends BrandedService[]>(id: string, ctor: new (...services: Services) => IChatInputPartWidget, when?: ContextKeyExpression): void;
    getWidgets(): readonly IChatInputPartWidgetDescriptor[];
};
/**
 * Controller that manages the rendering of widgets in the chat input part.
 * Widgets are shown/hidden based on context key conditions.
 */
export declare class ChatInputPartWidgetController extends Disposable {
    private readonly container;
    private readonly contextKeyService;
    private readonly instantiationService;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: Event<void>;
    private readonly renderedWidgets;
    constructor(container: HTMLElement, contextKeyService: IContextKeyService, instantiationService: IInstantiationService);
    private update;
    get height(): number;
    dispose(): void;
}
