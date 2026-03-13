import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../../base/common/uri.js';
import { ContextKeyExpression } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IAgentSkill } from '../service/promptsService.js';
/**
 * A built-in skill backed by the internal readonly virtual filesystem.
 *
 * To add a new internal skill, create an instance documenting the skill
 * name, description and SKILL.md content, then add it to the
 * {@link internalSkills} array in {@link internalCustomizations.ts}.
 */
export declare class InternalSkill extends Disposable {
    readonly name: string;
    readonly description: string;
    readonly content: string;
    /** Virtual filesystem URI for the SKILL.md file. */
    readonly uri: URI;
    /** The skill metadata exposed to the skills list and system prompt. */
    readonly skill: IAgentSkill;
    /**
     * Optional context key expression. When set, the skill is only included
     * in the system prompt when this expression evaluates to true.
     */
    readonly when: ContextKeyExpression | undefined;
    constructor(name: string, description: string, content: string, options?: {
        disableModelInvocation?: boolean;
        userInvocable?: boolean;
        when?: ContextKeyExpression;
    });
}
