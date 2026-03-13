import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export declare const submitFeedbackActionId = "agentFeedbackEditor.action.submit";
export declare const navigatePreviousFeedbackActionId = "agentFeedbackEditor.action.navigatePrevious";
export declare const navigateNextFeedbackActionId = "agentFeedbackEditor.action.navigateNext";
export declare const clearAllFeedbackActionId = "agentFeedbackEditor.action.clearAll";
export declare const navigationBearingFakeActionId = "agentFeedbackEditor.navigation.bearings";
export declare const hasSessionEditorComments: RawContextKey<boolean>;
export declare const hasSessionAgentFeedback: RawContextKey<boolean>;
export declare function registerAgentFeedbackEditorActions(): void;
