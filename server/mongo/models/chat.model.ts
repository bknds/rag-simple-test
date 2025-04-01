import { Schema, model } from "mongoose";

const ChatSchema = new Schema({
  chatId: { type: String, required: true },
  createAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now },
});

export const Chat = model("chat", ChatSchema);
