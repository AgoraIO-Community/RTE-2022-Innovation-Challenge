import { MessageType, MessageTypeHandler, MessagePlugin } from "./message.type";
import { TextHandler } from "../messages/text";

const messageTypeHandlers = new Map<MessageType, MessageTypeHandler>();
const messagePlugins = [] as MessagePlugin[];

registMessageTypeHandler(TextHandler);

function registMessageTypeHandler(handler: MessageTypeHandler) {
  if (messageTypeHandlers.get(handler.type)) {
    throw new Error("重复的处理器" + handler.type);
  }

  messageTypeHandlers.set(handler.type, handler);
}

export function getTypeHandler(type: MessageType) {
  const handler = messageTypeHandlers.get(type);
  if (!handler) {
    throw new Error(`未知的类型处理器${type}`);
  }
  return handler;
}

export function getPlugins(hook: "onComming" | "beforeShow") {
  return messagePlugins.filter((el) => !!el[hook]);
}
