var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { Memento } from "../../../../common/memento.js";
import { chatSessionResourceToId } from "../model/chatUri.js";
const IChatTodoListService = createDecorator("chatTodoListService");
let ChatTodoListStorage = class ChatTodoListStorage2 {
  static {
    __name(this, "ChatTodoListStorage");
  }
  constructor(storageService) {
    this.memento = new Memento("chat-todo-list", storageService);
  }
  getSessionData(sessionResource) {
    const storage = this.memento.getMemento(
      1,
      1
      /* StorageTarget.MACHINE */
    );
    return storage[this.toKey(sessionResource)] || [];
  }
  setSessionData(sessionResource, todoList) {
    const storage = this.memento.getMemento(
      1,
      1
      /* StorageTarget.MACHINE */
    );
    storage[this.toKey(sessionResource)] = todoList;
    this.memento.saveMemento();
  }
  getTodoList(sessionResource) {
    return this.getSessionData(sessionResource);
  }
  setTodoList(sessionResource, todoList) {
    this.setSessionData(sessionResource, todoList);
  }
  toKey(sessionResource) {
    return chatSessionResourceToId(sessionResource);
  }
};
ChatTodoListStorage = __decorate([
  __param(0, IStorageService)
], ChatTodoListStorage);
let ChatTodoListService = class ChatTodoListService2 extends Disposable {
  static {
    __name(this, "ChatTodoListService");
  }
  constructor(storageService) {
    super();
    this._onDidUpdateTodos = this._register(new Emitter());
    this.onDidUpdateTodos = this._onDidUpdateTodos.event;
    this.todoListStorage = new ChatTodoListStorage(storageService);
  }
  getTodos(sessionResource) {
    return this.todoListStorage.getTodoList(sessionResource);
  }
  setTodos(sessionResource, todos) {
    this.todoListStorage.setTodoList(sessionResource, todos);
    this._onDidUpdateTodos.fire(sessionResource);
  }
};
ChatTodoListService = __decorate([
  __param(0, IStorageService)
], ChatTodoListService);
export {
  ChatTodoListService,
  ChatTodoListStorage,
  IChatTodoListService
};
//# sourceMappingURL=chatTodoListService.js.map
