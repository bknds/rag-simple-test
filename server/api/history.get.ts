import { defineEventHandler, getQuery } from "h3";
import { ChatMessage } from "~/server/mongo/models/message.model";

export default defineEventHandler(async (event) => {
  const { page } = getQuery(event);
  const chatId = "testuser1";
  const pageSize = 10;
  const pageNumber = parseInt(page as string, 10) || 1;
  
  const history = await ChatMessage.find({ chatId })
    .sort({
      createAt: 1,
    })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .lean();

  return history;
});
