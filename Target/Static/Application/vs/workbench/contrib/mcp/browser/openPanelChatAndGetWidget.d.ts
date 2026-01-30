import { IViewsService } from '../../../services/views/common/viewsService.js';
import { IChatWidget, IChatWidgetService } from '../../chat/browser/chat.js';
export declare function openPanelChatAndGetWidget(viewsService: IViewsService, chatService: IChatWidgetService): Promise<IChatWidget | undefined>;
