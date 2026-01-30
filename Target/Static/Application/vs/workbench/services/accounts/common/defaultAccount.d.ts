import { Disposable } from '../../../../base/common/lifecycle.js';
import { IDefaultAccount } from '../../../../base/common/defaultAccount.js';
import { IDefaultAccountService } from '../../../../platform/defaultAccount/common/defaultAccount.js';
export declare const DEFAULT_ACCOUNT_SIGN_IN_COMMAND = "workbench.actions.accounts.signIn";
export declare class DefaultAccountService extends Disposable implements IDefaultAccountService {
    _serviceBrand: undefined;
    private _defaultAccount;
    get defaultAccount(): IDefaultAccount | null;
    private readonly initBarrier;
    private readonly _onDidChangeDefaultAccount;
    readonly onDidChangeDefaultAccount: import("../../../../base/common/event.js").Event<IDefaultAccount | null>;
    getDefaultAccount(): Promise<IDefaultAccount | null>;
    setDefaultAccount(account: IDefaultAccount | null): void;
}
