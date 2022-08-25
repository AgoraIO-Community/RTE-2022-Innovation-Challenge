import { defineAsyncComponent } from "vue";
import { MessageType, MessageTypeHandler } from "../../service/message.type";
import { TextMessage } from "./type";

export const TextHandler: MessageTypeHandler<TextMessage> = {
    type: MessageType.Text,
    name: "文本消息",
    validate(data) {
        return !!data || typeof data === "string";
    },
    normalize(data: string) {
        return {
            text: data,
        };
    },
    component: defineAsyncComponent(() => import("./NoticeMessageView.vue")),
    summary(msg) {
        return typeof msg.data === "string" ? msg.data : msg.data?.text ?? "";
    },
    config: {
        actions: ["del"],
    },
};
