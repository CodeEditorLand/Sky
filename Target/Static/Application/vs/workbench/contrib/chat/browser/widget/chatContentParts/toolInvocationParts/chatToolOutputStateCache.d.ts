import { IStorageService } from '../../../../../../../platform/storage/common/storage.js';
export interface IOutputState {
    webviewOrigin: string;
    height: number;
    webviewState?: string;
}
export declare const IChatToolOutputStateCache: import("../../../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatToolOutputStateCache>;
export interface IChatToolOutputStateCache {
    readonly _serviceBrand: undefined;
    get(toolCallId: string): IOutputState | undefined;
    set(toolCallId: string, state: IOutputState): void;
}
export declare class ChatToolOutputStateCache implements IChatToolOutputStateCache {
    readonly _serviceBrand: undefined;
    private readonly _cache;
    constructor(storageService: IStorageService);
    get(toolCallId: string): IOutputState | undefined;
    set(toolCallId: string, state: IOutputState): void;
    private _serialize;
    private _deserialize;
}
