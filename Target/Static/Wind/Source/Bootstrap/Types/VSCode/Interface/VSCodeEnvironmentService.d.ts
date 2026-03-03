/**
 * @module Bootstrap/Types/VSCode/Interface/VSCodeEnvironmentService
 * @description
 * VSCode Environment Service Interface.
 * Provides system-wide environment information.
 * @category Interface
 */
/**
 * VSCode Environment Service interface
 */
export interface IVSCodeEnvironmentService {
    _serviceBrand: undefined;
    machineId: string;
    sessionId: string;
    remoteAuthority?: string;
    isExtensionDevelopment: boolean;
    execPath: string;
    userHome: string;
    userDataPath: string;
    logPath: string;
    extHostLogsPath: string;
    extensionsPath: string;
    logsPath: string;
    argvResource: string;
    workspaceStorageHome: string;
    userRoamingDataHome: string;
    crashReporterDirectory?: string;
    disableExtensions: boolean;
    windowId: number;
    window: {
        configuration: any;
    };
}
//# sourceMappingURL=VSCodeEnvironmentService.d.ts.map