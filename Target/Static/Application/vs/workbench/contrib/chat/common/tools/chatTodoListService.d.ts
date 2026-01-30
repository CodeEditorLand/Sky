import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
export interface IChatTodo {
    id: number;
    title: string;
    description?: string;
    status: 'not-started' | 'in-progress' | 'completed';
}
export interface IChatTodoListStorage {
    getTodoList(sessionResource: URI): IChatTodo[];
    setTodoList(sessionResource: URI, todoList: IChatTodo[]): void;
}
export declare const IChatTodoListService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatTodoListService>;
export interface IChatTodoListService {
    readonly _serviceBrand: undefined;
    readonly onDidUpdateTodos: Event<URI>;
    getTodos(sessionResource: URI): IChatTodo[];
    setTodos(sessionResource: URI, todos: IChatTodo[]): void;
}
export declare class ChatTodoListStorage implements IChatTodoListStorage {
    private memento;
    constructor(storageService: IStorageService);
    private getSessionData;
    private setSessionData;
    getTodoList(sessionResource: URI): IChatTodo[];
    setTodoList(sessionResource: URI, todoList: IChatTodo[]): void;
    private toKey;
}
export declare class ChatTodoListService extends Disposable implements IChatTodoListService {
    readonly _serviceBrand: undefined;
    private readonly _onDidUpdateTodos;
    readonly onDidUpdateTodos: Event<URI>;
    private todoListStorage;
    constructor(storageService: IStorageService);
    getTodos(sessionResource: URI): IChatTodo[];
    setTodos(sessionResource: URI, todos: IChatTodo[]): void;
}
