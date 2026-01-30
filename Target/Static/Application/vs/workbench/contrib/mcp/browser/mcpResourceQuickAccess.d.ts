import { CancellationToken } from '../../../../base/common/cancellation.js';
import { DisposableStore, IDisposable, Disposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { DefaultQuickAccessFilterValue, IQuickAccessProvider, IQuickAccessProviderRunOptions } from '../../../../platform/quickinput/common/quickAccess.js';
import { IQuickInputService, IQuickPick, IQuickPickItem, IQuickPickSeparator } from '../../../../platform/quickinput/common/quickInput.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { IChatWidgetService } from '../../chat/browser/chat.js';
import { IChatAttachmentResolveService } from '../../chat/browser/attachments/chatAttachmentResolveService.js';
import { IMcpResource, IMcpResourceTemplate, IMcpServer, IMcpService } from '../common/mcpTypes.js';
import { ChatContextPickAttachment } from '../../chat/browser/attachments/chatContextPickService.js';
export declare class McpResourcePickHelper extends Disposable {
    private readonly _mcpService;
    private readonly _fileService;
    private readonly _quickInputService;
    private readonly _notificationService;
    private readonly _chatAttachmentResolveService;
    private _resources;
    private _pickItemsStack;
    private _inDirectory;
    static sep(server: IMcpServer): IQuickPickSeparator;
    addCurrentMCPQuickPickItemLevel(server: IMcpServer, resources: (IMcpResource | IMcpResourceTemplate)[]): void;
    navigateBack(): boolean;
    static item(resource: IMcpResource | IMcpResourceTemplate): IQuickPickItem;
    hasServersWithResources: import("../../../../base/common/observable.js").IObservableWithChange<boolean, void>;
    explicitServers?: IMcpServer[];
    constructor(_mcpService: IMcpService, _fileService: IFileService, _quickInputService: IQuickInputService, _notificationService: INotificationService, _chatAttachmentResolveService: IChatAttachmentResolveService);
    /**
     * Navigate to a resource if it's a directory.
     * Returns true if the resource is a directory with children (navigation succeeded).
     * Returns false if the resource is a leaf file (no navigation).
     * When returning true, statefully updates the picker state to display directory contents.
     */
    navigate(resource: IMcpResource | IMcpResourceTemplate, server: IMcpServer): Promise<boolean>;
    toAttachment(resource: IMcpResource | IMcpResourceTemplate, server: IMcpServer): Promise<ChatContextPickAttachment> | 'noop';
    checkIfDirectoryAndPopulate(resource: IMcpResource | IMcpResourceTemplate, server: IMcpServer): Promise<boolean>;
    toURI(resource: IMcpResource | IMcpResourceTemplate): Promise<URI | undefined>;
    checkIfNestedResources: () => boolean;
    private _resourceToAttachment;
    private _resourceTemplateToAttachment;
    private _verifyUriIfNeeded;
    private _resourceTemplateToURI;
    private _promptForTemplateValue;
    private _isDirectoryResource;
    getPicks(token?: CancellationToken): IObservable<{
        picks: Map<IMcpServer, (IMcpResourceTemplate | IMcpResource)[]>;
        isBusy: boolean;
    }>;
}
export declare abstract class AbstractMcpResourceAccessPick {
    private readonly _scopeTo;
    private readonly _instantiationService;
    private readonly _editorService;
    protected readonly _chatWidgetService: IChatWidgetService;
    private readonly _viewsService;
    constructor(_scopeTo: IMcpServer | undefined, _instantiationService: IInstantiationService, _editorService: IEditorService, _chatWidgetService: IChatWidgetService, _viewsService: IViewsService);
    protected applyToPick(picker: IQuickPick<IQuickPickItem, {
        useSeparators: true;
    }>, token: CancellationToken, runOptions?: IQuickAccessProviderRunOptions): DisposableStore;
}
export declare class McpResourceQuickPick extends AbstractMcpResourceAccessPick {
    private readonly _quickInputService;
    constructor(scopeTo: IMcpServer | undefined, instantiationService: IInstantiationService, editorService: IEditorService, chatWidgetService: IChatWidgetService, viewsService: IViewsService, _quickInputService: IQuickInputService);
    pick(token?: Readonly<CancellationToken>): Promise<void>;
}
export declare class McpResourceQuickAccess extends AbstractMcpResourceAccessPick implements IQuickAccessProvider {
    static readonly PREFIX = "mcpr ";
    defaultFilterValue: DefaultQuickAccessFilterValue;
    constructor(instantiationService: IInstantiationService, editorService: IEditorService, chatWidgetService: IChatWidgetService, viewsService: IViewsService);
    provide(picker: IQuickPick<IQuickPickItem, {
        useSeparators: true;
    }>, token: CancellationToken, runOptions?: IQuickAccessProviderRunOptions): IDisposable;
}
