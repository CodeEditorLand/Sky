import { Effect, Layer, Runtime } from "../effect";
import { domContentLoaded } from "vs/base/browser/dom.js";
import { mainWindow } from "vs/base/browser/window.js";
import { onUnexpectedError } from "vs/base/common/errors.js";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IProductService } from "vs/platform/product/common/product.js";
import { Workbench } from "../../workbench/browser/workbench.js";
import { NativeHostServiceTag } from "./Host/NativeTag.js";
import { AppLayer } from "./Instantiation/Layer.js";
const MainEffect = Effect.gen(function* (_) {
  yield* _(Effect.promise(() => domContentLoaded(mainWindow)));
  yield* _(Effect.logInfo("DOM content loaded. Initializing workbench..."));
  const AppRuntime = yield* _(Layer.toRuntime(AppLayer));
  const AppContext = Runtime.context(AppRuntime);
  const InstantiationService = AppContext.get(InstantiationServiceTag);
  const LogService = AppContext.get(ILogService);
  const NativeHostService = AppContext.get(NativeHostServiceTag);
  const ProductService = AppContext.get(IProductService);
  const ServiceCollectionBridge = new ServiceCollection(
    [IProductService, ProductService],
    [ILogService, LogService]
  );
  try {
    const WorkbenchInstance = new Workbench(
      mainWindow.document.body,
      {},
      ServiceCollectionBridge,
      LogService
    );
    WorkbenchInstance.startup();
    yield* _(Effect.promise(() => NativeHostService.notifyReady()));
    yield* _(
      Effect.logInfo(
        "Wind Workbench successfully launched and is operational."
      )
    );
  } catch (error) {
    onUnexpectedError(error);
    yield* _(Effect.die(error));
  }
});
Effect.runFork(MainEffect);
//# sourceMappingURL=DesktopMain.js.map
