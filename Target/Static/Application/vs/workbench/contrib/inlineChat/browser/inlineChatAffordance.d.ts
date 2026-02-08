import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IChatEntitlementService } from '../../../services/chat/common/chatEntitlementService.js';
import { InlineChatInputWidget } from './inlineChatOverlayWidget.js';
import { IInlineChatSessionService } from './inlineChatSessionService.js';
export declare class InlineChatAffordance extends Disposable {
    private readonly _editor;
    private readonly _inputWidget;
    private readonly _instantiationService;
    private _menuData;
    constructor(_editor: ICodeEditor, _inputWidget: InlineChatInputWidget, _instantiationService: IInstantiationService, configurationService: IConfigurationService, chatEntiteldService: IChatEntitlementService, inlineChatSessionService: IInlineChatSessionService);
    showMenuAtSelection(): Promise<void>;
}
