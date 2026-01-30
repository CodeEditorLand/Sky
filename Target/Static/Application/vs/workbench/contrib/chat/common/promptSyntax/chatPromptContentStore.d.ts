import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
export declare const IChatPromptContentStore: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatPromptContentStore>;
/**
 * Service for managing virtual chat prompt content.
 *
 * This store maintains an in-memory map of content indexed by URI.
 * URIs use the vscode-chat-prompt scheme with just the ID in the path,
 * avoiding the need to encode large content in the URI query string.
 */
export interface IChatPromptContentStore {
    readonly _serviceBrand: undefined;
    /**
     * Registers content for a given URI.
     * @param uri The URI to associate with the content.
     * @param content The content to store.
     * @returns A disposable that removes the content when disposed.
     */
    registerContent(uri: URI, content: string): {
        dispose: () => void;
    };
    /**
     * Retrieves content by URI.
     * @param uri The URI to look up.
     * @returns The content if found, or undefined.
     */
    getContent(uri: URI): string | undefined;
}
export declare class ChatPromptContentStore extends Disposable implements IChatPromptContentStore {
    readonly _serviceBrand: undefined;
    private readonly _contentMap;
    constructor();
    registerContent(uri: URI, content: string): {
        dispose: () => void;
    };
    getContent(uri: URI): string | undefined;
    dispose(): void;
}
