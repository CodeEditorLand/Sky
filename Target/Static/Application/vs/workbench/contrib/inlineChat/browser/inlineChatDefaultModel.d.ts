import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILanguageModelsService } from '../../chat/common/languageModels.js';
import { InlineChatConfigKeys } from '../common/inlineChat.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export declare class InlineChatDefaultModel extends Disposable {
    private readonly languageModelsService;
    private readonly logService;
    static readonly ID = "workbench.contrib.inlineChatDefaultModel";
    static readonly configName = InlineChatConfigKeys.DefaultModel;
    static modelIds: string[];
    static modelLabels: string[];
    static modelDescriptions: string[];
    constructor(languageModelsService: ILanguageModelsService, logService: ILogService);
    private _updateModelValues;
}
