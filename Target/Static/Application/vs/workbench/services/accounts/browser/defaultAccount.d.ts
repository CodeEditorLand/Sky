import { Disposable } from '../../../../base/common/lifecycle.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IDefaultAccount, IDefaultAccountAuthenticationProvider, IPolicyData } from '../../../../base/common/defaultAccount.js';
import { IDefaultAccountProvider, IDefaultAccountService } from '../../../../platform/defaultAccount/common/defaultAccount.js';
export declare const DEFAULT_ACCOUNT_SIGN_IN_COMMAND = "workbench.actions.accounts.signIn";
export declare class DefaultAccountService extends Disposable implements IDefaultAccountService {
    _serviceBrand: undefined;
    private defaultAccount;
    get policyData(): IPolicyData | null;
    private readonly initBarrier;
    private readonly _onDidChangeDefaultAccount;
    readonly onDidChangeDefaultAccount: import("../../../../base/common/event.js").Event<IDefaultAccount | null>;
    private readonly _onDidChangePolicyData;
    readonly onDidChangePolicyData: import("../../../../base/common/event.js").Event<IPolicyData | null>;
    private readonly defaultAccountConfig;
    private defaultAccountProvider;
    constructor(productService: IProductService);
    getDefaultAccount(): Promise<IDefaultAccount | null>;
    getDefaultAccountAuthenticationProvider(): IDefaultAccountAuthenticationProvider;
    setDefaultAccountProvider(provider: IDefaultAccountProvider): void;
    refresh(): Promise<IDefaultAccount | null>;
    signIn(options?: {
        additionalScopes?: readonly string[];
        [key: string]: unknown;
    }): Promise<IDefaultAccount | null>;
    private setDefaultAccount;
}
