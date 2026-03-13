import { Disposable, IDisposable } from '../../../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../../../platform/theme/common/themeService.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
import { IChatMultiDiffData, IChatMultiDiffDataSerialized } from '../../../common/chatService/chatService.js';
import { IChatRendererContent } from '../../../common/model/chatViewModel.js';
import { ChatTreeItem } from '../../chat.js';
import { IChatContentPart } from './chatContentParts.js';
export declare class ChatMultiDiffContentPart extends Disposable implements IChatContentPart {
    private readonly content;
    private readonly _element;
    private readonly instantiationService;
    private readonly editorService;
    private readonly themeService;
    private readonly contextKeyService;
    readonly domNode: HTMLElement;
    private list;
    private isCollapsed;
    private readonly readOnly;
    private readonly diffData;
    constructor(content: IChatMultiDiffData | IChatMultiDiffDataSerialized, _element: ChatTreeItem, instantiationService: IInstantiationService, editorService: IEditorService, themeService: IThemeService, contextKeyService: IContextKeyService);
    private renderHeader;
    private renderViewAllFileChangesButton;
    private renderContributedButtons;
    private renderFilesList;
    hasSameContent(other: IChatRendererContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
