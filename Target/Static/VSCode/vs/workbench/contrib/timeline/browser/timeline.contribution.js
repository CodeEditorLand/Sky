var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../nls.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IViewsRegistry, IViewDescriptor, Extensions as ViewExtensions } from "../../../common/views.js";
import { VIEW_CONTAINER } from "../../files/browser/explorerViewlet.js";
import { ITimelineService, TimelinePaneId } from "../common/timeline.js";
import { TimelineHasProviderContext, TimelineService } from "../common/timelineService.js";
import { TimelinePane } from "./timelinePane.js";
import { IConfigurationRegistry, Extensions as ConfigurationExtensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { ISubmenuItem, MenuId, MenuRegistry } from "../../../../platform/actions/common/actions.js";
import { ICommandHandler, CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { ExplorerFolderContext } from "../../files/common/files.js";
import { ResourceContextKey } from "../../../common/contextkeys.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { ILocalizedString } from "../../../../platform/action/common/action.js";
const timelineViewIcon = registerIcon("timeline-view-icon", Codicon.history, localize("timelineViewIcon", "View icon of the timeline view."));
const timelineOpenIcon = registerIcon("timeline-open", Codicon.history, localize("timelineOpenIcon", "Icon for the open timeline action."));
class TimelinePaneDescriptor {
  static {
    __name(this, "TimelinePaneDescriptor");
  }
  id = TimelinePaneId;
  name = TimelinePane.TITLE;
  containerIcon = timelineViewIcon;
  ctorDescriptor = new SyncDescriptor(TimelinePane);
  order = 2;
  weight = 30;
  collapsed = true;
  canToggleVisibility = true;
  hideByDefault = false;
  canMoveView = true;
  when = TimelineHasProviderContext;
  focusCommand = { id: "timeline.focus" };
}
const configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
configurationRegistry.registerConfiguration({
  id: "timeline",
  order: 1001,
  title: localize("timelineConfigurationTitle", "Timeline"),
  type: "object",
  properties: {
    "timeline.pageSize": {
      type: ["number", "null"],
      default: 50,
      markdownDescription: localize("timeline.pageSize", "The number of items to show in the Timeline view by default and when loading more items. Setting to `null` will automatically choose a page size based on the visible area of the Timeline view.")
    },
    "timeline.pageOnScroll": {
      type: "boolean",
      default: true,
      description: localize("timeline.pageOnScroll", "Controls whether the Timeline view will load the next page of items when you scroll to the end of the list.")
    }
  }
});
Registry.as(ViewExtensions.ViewsRegistry).registerViews([new TimelinePaneDescriptor()], VIEW_CONTAINER);
var OpenTimelineAction;
((OpenTimelineAction2) => {
  OpenTimelineAction2.ID = "files.openTimeline";
  OpenTimelineAction2.LABEL = localize("files.openTimeline", "Open Timeline");
  function handler() {
    return (accessor, arg) => {
      const service = accessor.get(ITimelineService);
      return service.setUri(arg);
    };
  }
  OpenTimelineAction2.handler = handler;
  __name(handler, "handler");
})(OpenTimelineAction || (OpenTimelineAction = {}));
CommandsRegistry.registerCommand(OpenTimelineAction.ID, OpenTimelineAction.handler());
MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
  group: "4_timeline",
  order: 1,
  command: {
    id: OpenTimelineAction.ID,
    title: OpenTimelineAction.LABEL,
    icon: timelineOpenIcon
  },
  when: ContextKeyExpr.and(ExplorerFolderContext.toNegated(), ResourceContextKey.HasResource, TimelineHasProviderContext)
});
const timelineFilter = registerIcon("timeline-filter", Codicon.filter, localize("timelineFilter", "Icon for the filter timeline action."));
MenuRegistry.appendMenuItem(MenuId.TimelineTitle, {
  submenu: MenuId.TimelineFilterSubMenu,
  title: localize("filterTimeline", "Filter Timeline"),
  group: "navigation",
  order: 100,
  icon: timelineFilter
});
registerSingleton(ITimelineService, TimelineService, InstantiationType.Delayed);
export {
  TimelinePaneDescriptor
};
//# sourceMappingURL=timeline.contribution.js.map
