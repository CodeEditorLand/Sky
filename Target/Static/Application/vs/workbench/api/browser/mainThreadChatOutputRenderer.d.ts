import { Disposable } from '../../../base/common/lifecycle.js';
import { UriComponents } from '../../../base/common/uri.js';
import { ExtensionIdentifier } from '../../../platform/extensions/common/extensions.js';
import { IChatOutputRendererService } from '../../contrib/chat/browser/chatOutputItemRenderer.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { MainThreadChatOutputRendererShape } from '../common/extHost.protocol.js';
import { MainThreadWebviews } from './mainThreadWebviews.js';
export declare class MainThreadChatOutputRenderer extends Disposable implements MainThreadChatOutputRendererShape {
    private readonly _mainThreadWebview;
    private readonly _rendererService;
    private readonly _proxy;
    private _webviewHandlePool;
    private readonly registeredRenderers;
    constructor(extHostContext: IExtHostContext, _mainThreadWebview: MainThreadWebviews, _rendererService: IChatOutputRendererService);
    dispose(): void;
    $registerChatOutputRenderer(viewType: string, extensionId: ExtensionIdentifier, extensionLocation: UriComponents): void;
    $unregisterChatOutputRenderer(viewType: string): void;
}
