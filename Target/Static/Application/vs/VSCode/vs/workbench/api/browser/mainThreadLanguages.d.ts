import { UriComponents } from '../../../base/common/uri.js';
import { ILanguageService } from '../../../editor/common/languages/language.js';
import { IModelService } from '../../../editor/common/services/model.js';
import { MainThreadLanguagesShape } from '../common/extHost.protocol.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { IPosition } from '../../../editor/common/core/position.js';
import { IRange } from '../../../editor/common/core/range.js';
import { StandardTokenType } from '../../../editor/common/encodedTokenAttributes.js';
import { ITextModelService } from '../../../editor/common/services/resolverService.js';
import { ILanguageStatus, ILanguageStatusService } from '../../services/languageStatus/common/languageStatusService.js';
import { Disposable } from '../../../base/common/lifecycle.js';
export declare class MainThreadLanguages extends Disposable implements MainThreadLanguagesShape {
    private readonly _languageService;
    private readonly _modelService;
    private _resolverService;
    private readonly _languageStatusService;
    private readonly _proxy;
    private readonly _status;
    constructor(_extHostContext: IExtHostContext, _languageService: ILanguageService, _modelService: IModelService, _resolverService: ITextModelService, _languageStatusService: ILanguageStatusService);
    $changeLanguage(resource: UriComponents, languageId: string): Promise<void>;
    $tokensAtPosition(resource: UriComponents, position: IPosition): Promise<undefined | {
        type: StandardTokenType;
        range: IRange;
    }>;
    $setLanguageStatus(handle: number, status: ILanguageStatus): void;
    $removeLanguageStatus(handle: number): void;
}
