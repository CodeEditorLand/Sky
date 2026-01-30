import { IChatVariablesService, IDynamicVariable } from '../../common/attachments/chatVariables.js';
import { IToolAndToolSetEnablementMap } from '../../common/tools/languageModelToolsService.js';
import { IChatWidgetService } from '../chat.js';
import { URI } from '../../../../../base/common/uri.js';
export declare class ChatVariablesService implements IChatVariablesService {
    private readonly chatWidgetService;
    _serviceBrand: undefined;
    constructor(chatWidgetService: IChatWidgetService);
    getDynamicVariables(sessionResource: URI): ReadonlyArray<IDynamicVariable>;
    getSelectedToolAndToolSets(sessionResource: URI): IToolAndToolSetEnablementMap;
}
