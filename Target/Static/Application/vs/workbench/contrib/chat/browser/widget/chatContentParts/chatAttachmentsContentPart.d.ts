import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IChatRequestVariableEntry } from '../../../common/attachments/chatVariableEntries.js';
import { IChatContentReference } from '../../../common/chatService/chatService.js';
export interface IChatAttachmentsContentPartOptions {
    readonly variables: readonly IChatRequestVariableEntry[];
    readonly contentReferences?: ReadonlyArray<IChatContentReference>;
    readonly domNode?: HTMLElement;
    readonly limit?: number;
}
export declare class ChatAttachmentsContentPart extends Disposable {
    private readonly instantiationService;
    private readonly attachedContextDisposables;
    private readonly _onDidChangeVisibility;
    private readonly _contextResourceLabels;
    private _showingAll;
    private readonly variables;
    private readonly contentReferences;
    private readonly limit?;
    readonly domNode: HTMLElement | undefined;
    contextMenuHandler?: (attachment: IChatRequestVariableEntry, event: MouseEvent) => void;
    constructor(options: IChatAttachmentsContentPartOptions, instantiationService: IInstantiationService);
    private initAttachedContext;
    private getVisibleAttachments;
    private renderShowMoreButton;
    private renderAttachment;
}
