import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Mutable } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ITextEditorService } from '../../../services/textfile/common/textEditorService.js';
import { IUserDataProfileService } from '../../../services/userDataProfile/common/userDataProfile.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { ConfigureLanguageModelsOptions, ILanguageModelsConfigurationService, ILanguageModelsProviderGroup } from '../common/languageModelsConfiguration.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ILanguageModelsService } from '../common/languageModels.js';
type LanguageModelsProviderGroups = Mutable<ILanguageModelsProviderGroup>[];
export declare class LanguageModelsConfigurationService extends Disposable implements ILanguageModelsConfigurationService {
    private readonly fileService;
    private readonly textFileService;
    private readonly textModelService;
    private readonly editorService;
    private readonly textEditorService;
    _serviceBrand: undefined;
    private readonly modelsConfigurationFile;
    get configurationFile(): URI;
    private readonly _onDidChangeLanguageModelGroups;
    readonly onDidChangeLanguageModelGroups: Event<readonly ILanguageModelsProviderGroup[]>;
    private languageModelsProviderGroups;
    constructor(fileService: IFileService, textFileService: ITextFileService, textModelService: ITextModelService, editorService: IEditorService, textEditorService: ITextEditorService, userDataProfileService: IUserDataProfileService, uriIdentityService: IUriIdentityService);
    private setLanguageModelsConfiguration;
    private updateLanguageModelsConfiguration;
    getLanguageModelsProviderGroups(): readonly ILanguageModelsProviderGroup[];
    addLanguageModelsProviderGroup(toAdd: ILanguageModelsProviderGroup): Promise<ILanguageModelsProviderGroup>;
    updateLanguageModelsProviderGroup(from: ILanguageModelsProviderGroup, to: ILanguageModelsProviderGroup): Promise<ILanguageModelsProviderGroup>;
    removeLanguageModelsProviderGroup(toRemove: ILanguageModelsProviderGroup): Promise<void>;
    configureLanguageModels(options?: ConfigureLanguageModelsOptions): Promise<void>;
    private withLanguageModelsProviderGroups;
}
export declare function parseLanguageModelsProviderGroups(model: ITextModel): LanguageModelsProviderGroups;
export declare class ChatLanguageModelsDataContribution extends Disposable implements IWorkbenchContribution {
    private readonly languageModelsService;
    static readonly ID = "workbench.contrib.chatLanguageModelsData";
    constructor(languageModelsService: ILanguageModelsService, languageModelsConfigurationService: ILanguageModelsConfigurationService);
    private updateSchema;
}
export {};
