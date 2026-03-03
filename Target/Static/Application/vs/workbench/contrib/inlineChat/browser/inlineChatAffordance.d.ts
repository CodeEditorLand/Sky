import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IChatEntitlementService } from '../../../services/chat/common/chatEntitlementService.js';
import { InlineChatInputWidget } from './inlineChatOverlayWidget.js';
import { IInlineChatSessionService } from './inlineChatSessionService.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
export declare class InlineChatAffordance extends Disposable {
    #private;
    constructor(editor: ICodeEditor, inputWidget: InlineChatInputWidget, instantiationService: IInstantiationService, configurationService: IConfigurationService, chatEntiteldService: IChatEntitlementService, inlineChatSessionService: IInlineChatSessionService, telemetryService: ITelemetryService);
    showMenuAtSelection(placeholder: string): Promise<void>;
}
