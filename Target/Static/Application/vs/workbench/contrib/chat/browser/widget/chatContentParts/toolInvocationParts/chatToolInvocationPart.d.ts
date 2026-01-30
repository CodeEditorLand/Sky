import { Disposable, IDisposable } from '../../../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../../../platform/instantiation/common/instantiation.js';
import { IMarkdownRenderer } from '../../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IChatToolInvocation, IChatToolInvocationSerialized } from '../../../../common/chatService/chatService.js';
import { IChatRendererContent } from '../../../../common/model/chatViewModel.js';
import { CodeBlockModelCollection } from '../../../../common/widget/codeBlockModelCollection.js';
import { ChatTreeItem, IChatCodeBlockInfo } from '../../../chat.js';
import { EditorPool } from '../chatContentCodePools.js';
import { IChatContentPart, IChatContentPartRenderContext } from '../chatContentParts.js';
import { CollapsibleListPool } from '../chatReferencesContentPart.js';
export declare class ChatToolInvocationPart extends Disposable implements IChatContentPart {
    private readonly toolInvocation;
    private readonly context;
    private readonly renderer;
    private readonly listPool;
    private readonly editorPool;
    private readonly currentWidthDelegate;
    private readonly codeBlockModelCollection;
    private readonly announcedToolProgressKeys;
    private readonly codeBlockStartIndex;
    private readonly instantiationService;
    readonly domNode: HTMLElement;
    private _onDidChangeHeight;
    readonly onDidChangeHeight: import("../../../../../../../base/common/event.js").Event<void>;
    get codeblocks(): IChatCodeBlockInfo[];
    get codeblocksPartId(): string | undefined;
    private subPart;
    private mcpAppPart;
    private readonly _onDidRemount;
    constructor(toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized, context: IChatContentPartRenderContext, renderer: IMarkdownRenderer, listPool: CollapsibleListPool, editorPool: EditorPool, currentWidthDelegate: () => number, codeBlockModelCollection: CodeBlockModelCollection, announcedToolProgressKeys: Set<string> | undefined, codeBlockStartIndex: number, instantiationService: IInstantiationService);
    private createToolInvocationSubPart;
    /**
     * Gets MCP App render data if this tool invocation has MCP App UI.
     * Returns data from either:
     * - toolSpecificData.mcpAppData (for in-progress tools)
     * - result details mcpOutput (for completed tools)
     */
    private getMcpAppRenderData;
    onDidRemount(): void;
    hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean;
    addDisposable(disposable: IDisposable): void;
}
