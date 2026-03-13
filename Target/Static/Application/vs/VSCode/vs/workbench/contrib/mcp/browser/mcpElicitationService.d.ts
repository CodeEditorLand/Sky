import { CancellationToken } from '../../../../base/common/cancellation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IChatService } from '../../chat/common/chatService/chatService.js';
import { ElicitResult, IMcpElicitationService, IMcpServer, IMcpToolCallContext } from '../common/mcpTypes.js';
import { MCP } from '../common/modelContextProtocol.js';
export declare class McpElicitationService implements IMcpElicitationService {
    private readonly _notificationService;
    private readonly _quickInputService;
    private readonly _chatService;
    private readonly _openerService;
    readonly _serviceBrand: undefined;
    constructor(_notificationService: INotificationService, _quickInputService: IQuickInputService, _chatService: IChatService, _openerService: IOpenerService);
    elicit(server: IMcpServer, context: IMcpToolCallContext | undefined, elicitation: MCP.ElicitRequest['params'], token: CancellationToken): Promise<ElicitResult>;
    private _elicitForm;
    private _elicitUrl;
    private _doElicitUrl;
    private _doElicitForm;
    private _getFieldPlaceholder;
    private _handleEnumField;
    private _handleMultiEnumField;
    private _handleInputField;
    private _validateInput;
    private _validateString;
    private _validateStringFormat;
    private _validateNumber;
    /**
     * Converts an MCP elicitation schema into IChatQuestion[] for the carousel UI.
     * Returns the questions and a map from question ID to schema property name.
     */
    private _convertSchemaToQuestions;
    /**
     * Converts carousel answers (keyed by question ID) back into the
     * MCP ElicitResult content format (keyed by schema property names),
     * coercing types as needed.
     */
    private _convertCarouselAnswersToElicitResult;
}
