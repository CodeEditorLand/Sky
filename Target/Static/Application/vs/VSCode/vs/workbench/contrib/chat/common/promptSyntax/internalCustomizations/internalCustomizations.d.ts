import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../../base/common/uri.js';
import { IFileService } from '../../../../../../platform/files/common/files.js';
import { IAgentSkill, IInternalPromptPath } from '../service/promptsService.js';
import { PromptsType } from '../promptTypes.js';
import { InternalSkill } from './internalSkill.js';
export { InternalSkill } from './internalSkill.js';
/**
 * Manages built-in internal customizations (skills, instructions, agents, etc.)
 * backed by a readonly virtual filesystem.
 *
 * To add a new internal skill, create an {@link InternalSkill} instance and
 * register it in the constructor.
 */
export declare class ChatInternalCustomizations extends Disposable {
    private readonly skills;
    private readonly skillsByUri;
    constructor(fileService: IFileService);
    /**
     * Returns the {@link IAgentSkill} metadata for all internal skills,
     * for injection into the skills list.
     */
    getSkills(): readonly IAgentSkill[];
    /**
     * Looks up the {@link InternalSkill} instance for a given URI,
     * e.g. to check its {@link InternalSkill.when} clause.
     */
    getInternalSkillByUri(uri: URI): InternalSkill | undefined;
    /**
     * Returns internal prompt file paths for a given customization type.
     */
    getPromptPaths(type: PromptsType): readonly IInternalPromptPath[];
}
