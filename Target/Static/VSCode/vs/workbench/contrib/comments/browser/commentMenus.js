var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { Comment } from "../../../../editor/common/languages.js";
import { IMenu, IMenuActionOptions, IMenuCreateOptions, IMenuService, MenuId, MenuItemAction, SubmenuItemAction } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
let CommentMenus = class {
  constructor(menuService) {
    this.menuService = menuService;
  }
  static {
    __name(this, "CommentMenus");
  }
  getCommentThreadTitleActions(contextKeyService) {
    return this.getMenu(MenuId.CommentThreadTitle, contextKeyService);
  }
  getCommentThreadActions(contextKeyService) {
    return this.getMenu(MenuId.CommentThreadActions, contextKeyService);
  }
  getCommentEditorActions(contextKeyService) {
    return this.getMenu(MenuId.CommentEditorActions, contextKeyService);
  }
  getCommentThreadAdditionalActions(contextKeyService) {
    return this.getMenu(MenuId.CommentThreadAdditionalActions, contextKeyService, { emitEventsForSubmenuChanges: true });
  }
  getCommentTitleActions(comment, contextKeyService) {
    return this.getMenu(MenuId.CommentTitle, contextKeyService);
  }
  getCommentActions(comment, contextKeyService) {
    return this.getMenu(MenuId.CommentActions, contextKeyService);
  }
  getCommentThreadTitleContextActions(contextKeyService) {
    return this.getActions(MenuId.CommentThreadTitleContext, contextKeyService, { shouldForwardArgs: true });
  }
  getMenu(menuId, contextKeyService, options) {
    return this.menuService.createMenu(menuId, contextKeyService, options);
  }
  getActions(menuId, contextKeyService, options) {
    return this.menuService.getMenuActions(menuId, contextKeyService, options).map((value) => value[1]).flat();
  }
  dispose() {
  }
};
CommentMenus = __decorateClass([
  __decorateParam(0, IMenuService)
], CommentMenus);
export {
  CommentMenus
};
//# sourceMappingURL=commentMenus.js.map
