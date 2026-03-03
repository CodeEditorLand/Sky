export interface ISessionData {
    startTime: number;
    typedCharacters: number;
    aiCharacters: number;
    acceptedInlineSuggestions: number | undefined;
    chatEditCount: number | undefined;
}
export interface IDailyAggregate {
    date: string;
    displayDate: string;
    aiRate: number;
    totalAiChars: number;
    totalTypedChars: number;
    inlineSuggestions: number;
    chatEdits: number;
    sessionCount: number;
}
export type ChartViewMode = 'days' | 'sessions';
export declare function aggregateSessionsByDay(sessions: readonly ISessionData[]): IDailyAggregate[];
export interface IAiStatsChartOptions {
    sessions: readonly ISessionData[];
    viewMode: ChartViewMode;
}
export declare function createAiStatsChart(options: IAiStatsChartOptions): HTMLElement;
