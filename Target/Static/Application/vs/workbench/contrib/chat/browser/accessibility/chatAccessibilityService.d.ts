import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { IAccessibilitySignalService } from '../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IHostService } from '../../../../services/host/browser/host.js';
import { IChatElicitationRequest, IChatService } from '../../common/chatService/chatService.js';
import { IChatResponseViewModel } from '../../common/model/chatViewModel.js';
import { IChatAccessibilityService, IChatWidgetService } from '../chat.js';
import { ChatWidget } from '../widget/chatWidget.js';
export declare class ChatAccessibilityService extends Disposable implements IChatAccessibilityService {
    private readonly _accessibilitySignalService;
    private readonly _instantiationService;
    private readonly _configurationService;
    private readonly _hostService;
    private readonly _widgetService;
    private readonly _chatService;
    readonly _serviceBrand: undefined;
    private _pendingSignalMap;
    private readonly toasts;
    constructor(_accessibilitySignalService: IAccessibilitySignalService, _instantiationService: IInstantiationService, _configurationService: IConfigurationService, _hostService: IHostService, _widgetService: IChatWidgetService, _chatService: IChatService);
    acceptRequest(uri: URI, skipRequestSignal?: boolean): void;
    disposeRequest(requestId: URI): void;
    acceptResponse(widget: ChatWidget, container: HTMLElement, response: IChatResponseViewModel | string | undefined, requestId: URI, isVoiceInput?: boolean): void;
    acceptElicitation(elicitation: IChatElicitationRequest): void;
    private _showOSNotification;
}
