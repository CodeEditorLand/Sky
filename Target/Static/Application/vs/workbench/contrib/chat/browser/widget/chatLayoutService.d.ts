import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IChatLayoutService } from '../../common/widget/chatLayoutService.js';
export declare class ChatLayoutService extends Disposable implements IChatLayoutService {
    readonly _serviceBrand: undefined;
    readonly fontFamily: IObservable<string | null>;
    readonly fontSize: IObservable<number>;
    constructor(configurationService: IConfigurationService);
}
