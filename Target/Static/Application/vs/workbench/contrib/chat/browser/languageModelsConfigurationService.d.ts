import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Mutable } from '../../../../base/common/types.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { ITextEditorService } from '../../../services/textfile/common/textEditorService.js';
import { IUserDataProfileService } from '../../../services/userDataProfile/common/userDataProfile.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { ILanguageModelsConfigurationService, ILanguageModelsProviderGroup } from '../common/languageModelsConfiguration.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ILanguageModelsService } from '../common/languageModels.js';
type LanguageModelsProviderGroups = Mutable<ILanguageModelsProviderGroup>[];
export declare class LanguageModelsConfigurationService extends Disposable implements ILanguageModelsConfigurationService {
    private readonly fileService;
    private readonly textFileService;
    private readonly textModelService;
    private readonly editorGroupsService;
    private readonly textEditorService;
    _serviceBrand: undefined;
    private readonly modelsConfigurationFile;
    private readonly _onDidChangeLanguageModelGroups;
    readonly onDidChangeLanguageModelGroups: Event<void>;
    private languageModelsProviderGroups;
    constructor(fileService: IFileService, textFileService: ITextFileService, textModelService: ITextModelService, editorGroupsService: IEditorGroupsService, textEditorService: ITextEditorService, userDataProfileService: IUserDataProfileService, uriIdentityService: IUriIdentityService);
    private setLanguageModelsConfiguration;
    private updateLanguageModelsConfiguration;
    getLanguageModelsProviderGroups(): readonly ILanguageModelsProviderGroup[];
    addLanguageModelsProviderGroup(toAdd: ILanguageModelsProviderGroup): Promise<ILanguageModelsProviderGroup>;
    updateLanguageModelsProviderGroup(from: ILanguageModelsProviderGroup, to: ILanguageModelsProviderGroup): Promise<ILanguageModelsProviderGroup>;
    removeLanguageModelsProviderGroup(toRemove: ILanguageModelsProviderGroup): Promise<void>;
    configureLanguageModels(range?: IRange): Promise<void>;
    private withLanguageModelsProviderGroups;
}
export declare function parseLanguageModelsProviderGroups(model: ITextModel): LanguageModelsProviderGroups;
export declare class ChatLanguageModelsDataContribution extends Disposable implements IWorkbenchContribution {
    private readonly languageModelsService;
    static readonly ID = "workbench.contrib.chatLanguageModelsData";
    constructor(languageModelsService: ILanguageModelsService, userDataProfileService: IUserDataProfileService, uriIdentityService: IUriIdentityService);
    private updateSchema;
}
export {};
