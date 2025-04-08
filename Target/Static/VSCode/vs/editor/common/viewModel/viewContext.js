var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IEditorConfiguration } from "../config/editorConfiguration.js";
import { ViewEventHandler } from "../viewEventHandler.js";
import { IViewLayout, IViewModel } from "../viewModel.js";
import { IColorTheme } from "../../../platform/theme/common/themeService.js";
import { EditorTheme } from "../editorTheme.js";
class ViewContext {
  static {
    __name(this, "ViewContext");
  }
  configuration;
  viewModel;
  viewLayout;
  theme;
  constructor(configuration, theme, model) {
    this.configuration = configuration;
    this.theme = new EditorTheme(theme);
    this.viewModel = model;
    this.viewLayout = model.viewLayout;
  }
  addEventHandler(eventHandler) {
    this.viewModel.addViewEventHandler(eventHandler);
  }
  removeEventHandler(eventHandler) {
    this.viewModel.removeViewEventHandler(eventHandler);
  }
}
export {
  ViewContext
};
//# sourceMappingURL=viewContext.js.map
