import { Disposable } from '../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ILanguageModelToolsService } from '../../chat/common/tools/languageModelToolsService.js';
export declare class TestingChatAgentToolContribution extends Disposable implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.testing.chatAgentTool";
    constructor(instantiationService: IInstantiationService, toolsService: ILanguageModelToolsService, contextKeyService: IContextKeyService);
}
