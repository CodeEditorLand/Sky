import { IChatEntitlementService } from '../../../../services/chat/common/chatEntitlementService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
export declare function isNewUser(chatEntitlementService: IChatEntitlementService): boolean;
export declare function isCompletionsEnabled(configurationService: IConfigurationService, modeId?: string): boolean;
