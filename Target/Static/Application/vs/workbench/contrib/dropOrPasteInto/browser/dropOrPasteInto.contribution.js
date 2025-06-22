import { Extensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { DropOrPasteIntoCommands } from "./commands.js";
import { DropOrPasteSchemaContribution, editorConfiguration } from "./configurationSchema.js";
registerWorkbenchContribution2(
  DropOrPasteIntoCommands.ID,
  DropOrPasteIntoCommands,
  4
  /* WorkbenchPhase.Eventually */
);
registerWorkbenchContribution2(
  DropOrPasteSchemaContribution.ID,
  DropOrPasteSchemaContribution,
  4
  /* WorkbenchPhase.Eventually */
);
Registry.as(Extensions.Configuration).registerConfiguration(editorConfiguration);
//# sourceMappingURL=dropOrPasteInto.contribution.js.map
