export interface IOutputAnalyzerOptions {
    readonly exitCode: number | undefined;
    readonly exitResult: string;
    readonly commandLine: string;
}
export interface IOutputAnalyzer {
    analyze(options: IOutputAnalyzerOptions): Promise<string | undefined>;
}
