import { IProcessEnvironment } from '../../../base/common/platform.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { NativeParsedArgs } from '../../environment/common/argv.js';
import { ILogService } from '../../log/common/log.js';
import { IURLService } from '../../url/common/url.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
import { IProductService } from '../../product/common/productService.js';
export declare const ID = "launchMainService";
export declare const ILaunchMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ILaunchMainService>;
export interface IStartArguments {
    readonly args: NativeParsedArgs;
    readonly userEnv: IProcessEnvironment;
}
export interface ILaunchMainService {
    readonly _serviceBrand: undefined;
    start(args: NativeParsedArgs, userEnv: IProcessEnvironment): Promise<void>;
    getMainProcessId(): Promise<number>;
}
export declare class LaunchMainService implements ILaunchMainService {
    private readonly logService;
    private readonly windowsMainService;
    private readonly urlService;
    private readonly configurationService;
    private readonly productService;
    readonly _serviceBrand: undefined;
    constructor(logService: ILogService, windowsMainService: IWindowsMainService, urlService: IURLService, configurationService: IConfigurationService, productService: IProductService);
    start(args: NativeParsedArgs, userEnv: IProcessEnvironment): Promise<void>;
    private parseOpenUrl;
    private startOpenWindow;
    getMainProcessId(): Promise<number>;
}
