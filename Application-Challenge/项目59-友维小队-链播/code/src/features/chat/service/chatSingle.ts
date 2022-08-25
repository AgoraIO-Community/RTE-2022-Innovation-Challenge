import { RestApiUtil } from "@/common/api";
import { ExecTree } from "@/common/ExecTree";
import { MeteorApi, useMeteor } from "@/common/meteor";
import { Observable, tap } from "rxjs";
import { provide } from "vue";
import { useApi } from "../deps";
import {
    addLocalMessage,
    messageTransfer,
    sendMessage,
    useChat,
} from "./easemob";
import {
    IMessagenProcessed,
    Message,
    MessageData,
    MessageType,
} from "./message.type";
import { getTypeHandler } from "./type-manager";

const logger = (...args: any[]) => console.log.apply(console, args);
class ChatSingle {
    private tree: ExecTree;
    userId: string;
    messages$: Observable<IMessagenProcessed[]>;
    meteor: MeteorApi;
    api: RestApiUtil;
    constructor(public readonly targetId: string) {
        this.tree = new ExecTree(`chat-with-${targetId}`);
        this.meteor = useMeteor();
        this.api = useApi();
        this.userId = Meteor.user()?.profile!.id as string;
        const { getTargetMessages$ } = useChat();
        this.messages$ = getTargetMessages$(targetId, messageTransfer);
    }

    async sendMessage(data: MessageData, type: MessageType) {
        const handler = getTypeHandler(type);
        handler.validate?.(data);
        logger(`start normal message ${type}`);
        const normData = (await handler.normalize?.(data)) ?? data;
        logger(`end normal message`);
        if (!normData) throw Error("空消息");
        const message: Message = {
            data: normData,
            type,
            targetId: this.targetId,
            createdAt: Date.now(),
            senderId: this.userId,
        } as any;
        try {
            let file: any;
            if (handler.beforeSend) {
                logger(`start before send`);
                message.data = await handler.beforeSend(
                    message.data,
                    data,
                    file?._id
                );
                logger(`end before send`);
            }
            // Object.assign(message, {
            //     meta: this.meta,
            // });
            logger(`start  send`, message);
            const r = await sendMessage(message as any);
            message._id = r.serverMsgId;
            addLocalMessage(message);
            logger(`end  send`, r);
            handler.onSuccess?.(message);
            return true;
        } catch (error) {
            logger(`error send`, error);
            handler.onFail?.(message);
            // this.updateDummyMessage(temp, { state: MessageState.FAIL });
        }
    }
}

export const setupSingleChat = (targetId: string) => {
    const serv = new ChatSingle(targetId);
    provide("c-serv", serv);
    return serv;
};
