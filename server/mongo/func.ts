import { ChatMessage } from "./models/message.model";
import { Chat } from "./models/chat.model";
import { throwError } from "../core/global";

export const insertChatMessage = async (chatId: string, message: any) => {
  try {
    const chat = await Chat.findOne({ chatId });

    if (!chat) {
      // 没有该chatId对话组则创建新的
      const now = Date.now();
      await Chat.create({ chatId, createAt: now, updateAt: now });
    }

    const _msg = await ChatMessage.create({ chatId, ...message });
    // 更新该chatId对话组时间
    await Chat.findOneAndUpdate({ chatId }, { $set: { updateAt: Date.now() } });
    return _msg;
  } catch (error: any) {
    throwError(error.statusCode, error.message);
  }
};
