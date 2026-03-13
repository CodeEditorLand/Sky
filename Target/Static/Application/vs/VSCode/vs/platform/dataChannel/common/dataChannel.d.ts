import { Event } from '../../../base/common/event.js';
export declare const IDataChannelService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IDataChannelService>;
export interface IDataChannelService {
    readonly _serviceBrand: undefined;
    readonly onDidSendData: Event<IDataChannelEvent>;
    getDataChannel<T>(channelId: string): CoreDataChannel<T>;
}
export interface CoreDataChannel<T = unknown> {
    sendData(data: T): void;
}
export interface IDataChannelEvent<T = unknown> {
    channelId: string;
    data: T;
}
export declare class NullDataChannelService implements IDataChannelService {
    _serviceBrand: undefined;
    get onDidSendData(): Event<IDataChannelEvent<unknown>>;
    getDataChannel<T>(_channelId: string): CoreDataChannel<T>;
}
