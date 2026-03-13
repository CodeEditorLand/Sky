type ReleaseInfo = {
    id: string;
    id_like?: string;
    version_id?: string;
};
export declare function getOSReleaseInfo(errorLogger: (error: string | Error) => void): Promise<ReleaseInfo | undefined>;
export {};
