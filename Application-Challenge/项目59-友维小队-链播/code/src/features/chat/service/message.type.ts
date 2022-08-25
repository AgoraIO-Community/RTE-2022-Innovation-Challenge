import { Component } from "vue";

export enum MessageType {
    Text = "text",
    Image = "image",
    Video = "video",
    Voice = "voice",
    Show = "show",
    Timestamp = "timestamp",
    Notice = "notice",
}

export interface Message<T = any> {
    _id: string;
    senderId: string;
    targetId: string;
    data: T;
    ext?: any;
    createdAt: number;
    type: MessageType;
    meta?: any;
}

export interface IMessagenProcessed extends Message {
    isMe: boolean;
    cached?: boolean;
    state?: number;
    progress?: number;
}

export enum MessageState {
    SENDING = 1,
    FAIL = 2,
    UPLODADING = 3,
}

export interface MessageTypeHandler<T = any> {
    name: string;
    type: MessageType;
    normalize?(rawData: MessageData): T | Promise<T>;
    validate?(rawData: MessageData): boolean;
    beforeSend?(
        normalized: T,
        rawData: MessageData,
        fileId?: string
    ): T | Promise<T>;
    onFail?(msg: any): void;
    onSuccess?(msg: any): void;
    onReceive?(msg: Message<T>, temp?: Message<T>): void;
    summary?(msg: Message): string;
    component: Component;
    config?: {
        noUser?: boolean;
        noCache?: boolean;
        actions?: Array<"del" | "copy">;
    };
    onTap?(msg: Message<T>): void;
    onLongpress?(msg: Message<T>): void;
    onRecover?(msg: Message<T>): void;
    actionHandlers?: Array<{
        text: string;
        handler: (doc: Message<T>) => void;
    }>;
}

export type MessageData = string | File;

export interface MessagePlugin {
    onComming?: (msg: Message) => any;
    beforeShow?: (msg: IMessagenProcessed[]) => any;
}
