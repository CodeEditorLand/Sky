var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Option } from "../../effect";
import { localize } from "vs/nls";
const CreateShowOpenDialogEffect = /* @__PURE__ */ __name((ConfigService, Options) => {
  const shouldUseSimplified = DecideUseSimplified(
    ConfigService,
    Options.defaultUri
  );
  if (shouldUseSimplified) {
    return Effect.dieMessage(
      "Simplified 'showOpenDialog' is not implemented."
    );
  }
  return Orchestrate.PerformShowOpen(Options).pipe(
    Effect.map(Option.getOrElse(() => [])),
    Effect.map((Uris) => Uris.length > 0 ? Uris : void 0)
    // Return undefined if no files were selected
  );
}, "CreateShowOpenDialogEffect");
const CreateShowSaveDialogEffect = /* @__PURE__ */ __name((ConfigService, Options) => {
  const shouldUseSimplified = DecideUseSimplified(
    ConfigService,
    Options.defaultUri
  );
  if (shouldUseSimplified) {
    return Effect.dieMessage(
      "Simplified 'showSaveDialog' is not implemented."
    );
  }
  return Orchestrate.PerformShowSave(Options).pipe(
    Effect.map(Option.getOrUndefined)
  );
}, "CreateShowSaveDialogEffect");
const Definition = Effect.gen(function* (_) {
  const ConfigurationService = yield* _(Configuration.Tag);
  const Service = {
    _serviceBrand: void 0,
    // Each method builds and runs the corresponding Effect workflow.
    showOpenDialog: /* @__PURE__ */ __name((options) => Effect.runPromise(
      CreateShowOpenDialogEffect(ConfigurationService, options)
    ), "showOpenDialog"),
    showSaveDialog: /* @__PURE__ */ __name((options) => Effect.runPromise(
      CreateShowSaveDialogEffect(ConfigurationService, options)
    ), "showSaveDialog"),
    pickFileToSave: /* @__PURE__ */ __name((defaultUri, availableFileSystems) => Effect.runPromise(
      CreateShowSaveDialogEffect(ConfigurationService, {
        defaultUri,
        title: localize("saveAsFile", "Save File"),
        availableFileSystems
      })
    ), "pickFileToSave"),
    showSaveConfirm: /* @__PURE__ */ __name((files) => Effect.runPromise(Orchestrate.PerformSaveConfirm(files)), "showSaveConfirm"),
    // Stubs for other complex methods that require more orchestration.
    pickFileAndOpen: /* @__PURE__ */ __name(() => Promise.resolve(void 0), "pickFileAndOpen"),
    pickFolderAndOpen: /* @__PURE__ */ __name(() => Promise.resolve(void 0), "pickFolderAndOpen"),
    pickWorkspaceAndOpen: /* @__PURE__ */ __name(() => Promise.resolve(void 0), "pickWorkspaceAndOpen"),
    pickFileFolderAndOpen: /* @__PURE__ */ __name(() => Promise.resolve(void 0), "pickFileFolderAndOpen"),
    defaultFilePath: /* @__PURE__ */ __name(() => Promise.resolve(void 0), "defaultFilePath"),
    defaultFolderPath: /* @__PURE__ */ __name(() => Promise.resolve(void 0), "defaultFolderPath"),
    defaultWorkspacePath: /* @__PURE__ */ __name(() => Promise.resolve(void 0), "defaultWorkspacePath"),
    preferredHome: /* @__PURE__ */ __name(() => Promise.resolve(void 0), "preferredHome")
  };
  return Service;
});
var Definition_default = Definition;
export {
  Definition_default as default
};
//# sourceMappingURL=Definition.js.map
