import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.js';
import { IFileService } from '../../../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IChatCollapsibleIODataPart } from './chatToolInputOutputContentPart.js';
export interface IChatToolOutputResourceToolbarContext {
    parts: IChatCollapsibleIODataPart[];
}
/**
 * A reusable widget for rendering a group of resource data parts (files, images)
 * with attachment pills and a toolbar with save actions.
 *
 * Used by ChatToolOutputContentSubPart and ChatMcpAppSubPart (for download resources).
 */
export declare class ChatResourceGroupWidget extends Disposable {
    private readonly _instantiationService;
    private readonly _contextMenuService;
    private readonly _fileService;
    readonly domNode: HTMLElement;
    constructor(parts: IChatCollapsibleIODataPart[], _instantiationService: IInstantiationService, _contextMenuService: IContextMenuService, _fileService: IFileService);
    private _fillInResourceGroup;
}
