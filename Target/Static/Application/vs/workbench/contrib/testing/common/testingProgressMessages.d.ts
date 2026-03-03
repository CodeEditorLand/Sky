import { ITestResult } from './testResult.js';
export type CountSummary = ReturnType<typeof collectTestStateCounts>;
export declare const collectTestStateCounts: (isRunning: boolean, results: ReadonlyArray<ITestResult>) => {
    isRunning: boolean;
    passed: number;
    failed: number;
    runSoFar: number;
    totalWillBeRun: number;
    skipped: number;
};
export declare const getTestProgressText: ({ isRunning, passed, runSoFar, totalWillBeRun, skipped, failed }: CountSummary) => string;
