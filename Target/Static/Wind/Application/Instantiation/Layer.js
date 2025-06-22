import { Effect, Layer } from "../../effect";
const DynamicLiveLayerEffect = Effect.gen(function* (_) {
  const ConfigurationService = yield* _(Configuration.Tag);
  const Feature = {
    Scm: ConfigurationService.getValue("feature.scm.enable", true),
    Test: ConfigurationService.getValue(
      "feature.test.enable",
      true
    )
  };
  const CoreLayer = [
    LiveClipboardService,
    LiveDialogService,
    LiveEditorService,
    LiveEditorGroupService,
    LiveEnvironmentService,
    LiveFileService,
    LiveHostService,
    LiveLifecycleService,
    LiveLogService,
    LiveNotificationService,
    LivePaneCompositeService,
    LiveQuickInputService,
    LiveStorageService,
    LiveTextEditorService,
    LiveViewService,
    LiveWorkspaceService,
    LiveWorkspaceTrustService
  ];
  if (Feature.Scm) {
  }
  if (Feature.Test) {
  }
  return Layer.mergeAll(...CoreLayer);
});
const Live = Layer.unwrapEffect(
  // The `DynamicLiveLayerEffect` itself needs the `ConfigurationService`,
  // so we provide its live layer to the effect.
  Effect.provide(DynamicLiveLayerEffect, LiveConfigurationService)
);
export {
  Live
};
//# sourceMappingURL=Layer.js.map
