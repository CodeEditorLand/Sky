export declare const virtualMachineHint: {
    value(): number;
};
export declare function getMachineId(errorLogger: (error: Error) => void): Promise<string>;
export declare function getSqmMachineId(errorLogger: (error: Error) => void): Promise<string>;
export declare function getDevDeviceId(errorLogger: (error: Error) => void): Promise<string>;
