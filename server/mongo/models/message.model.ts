import { Schema, model } from "mongoose";

const ChatMessageSchema = new Schema({
  // 对话ID
  chatId: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "assistant", "system", "tool"],
    required: true,
  },
  content: { type: String, required: true },
  createAt: { type: Date, default: Date.now },
});

export const ChatMessage = model("chatMessage", ChatMessageSchema);
