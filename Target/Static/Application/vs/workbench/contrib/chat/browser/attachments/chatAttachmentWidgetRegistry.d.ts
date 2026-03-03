import * as event from '../../../../../base/common/event.js';
import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { IChatRequestVariableEntry } from '../../common/attachments/chatVariableEntries.js';
/**
 * Interface for a contributed attachment widget instance.
 */
export interface IChatAttachmentWidgetInstance extends IDisposable {
    readonly element: HTMLElement;
    readonly onDidDelete: event.Event<Event>;
    readonly onDidOpen: event.Event<void>;
    /** Optional label element, used for applying warning styles on omitted attachments. */
    readonly label?: {
        readonly element: HTMLElement;
    };
}
/**
 * Factory function type for creating attachment widgets.
 */
export type ChatAttachmentWidgetFactory = (attachment: IChatRequestVariableEntry, options: {
    shouldFocusClearButton: boolean;
    supportsDeletion: boolean;
}, container: HTMLElement) => IChatAttachmentWidgetInstance;
export declare const IChatAttachmentWidgetRegistry: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatAttachmentWidgetRegistry>;
export interface IChatAttachmentWidgetRegistry {
    readonly _serviceBrand: undefined;
    /**
     * Register a widget factory for a specific attachment kind.
     */
    registerFactory(kind: string, factory: ChatAttachmentWidgetFactory): IDisposable;
    /**
     * Try to create a widget for the given attachment using a registered factory.
     * Returns undefined if no factory is registered for the attachment's kind.
     */
    createWidget(attachment: IChatRequestVariableEntry, options: {
        shouldFocusClearButton: boolean;
        supportsDeletion: boolean;
    }, container: HTMLElement): IChatAttachmentWidgetInstance | undefined;
}
export declare class ChatAttachmentWidgetRegistry implements IChatAttachmentWidgetRegistry {
    readonly _serviceBrand: undefined;
    private readonly _factories;
    registerFactory(kind: string, factory: ChatAttachmentWidgetFactory): IDisposable;
    createWidget(attachment: IChatRequestVariableEntry, options: {
        shouldFocusClearButton: boolean;
        supportsDeletion: boolean;
    }, container: HTMLElement): IChatAttachmentWidgetInstance | undefined;
}
