import { Chat } from "~/server/mongo/models/chat.model";
import { mainServiceWorkflowBuilder } from "~/server/agent/workflows/main-service";
import { insertChatMessage } from "~/server/mongo/func";
import { throwError } from "~/server/core/global";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const { question } = JSON.parse(body);
    if (!question) throwError(400, "缺少用户问题");

    const chatId = "testuser1";
    const nodeRes = event.node.res;

    // 处理聊天记录初始化
    const chat = await Chat.findOne({ chatId });
    if (!chat) {
      await Chat.create({
        chatId,
        createAt: Date.now(),
        updateAt: Date.now(),
      });
    }

    // 插入用户消息
    await insertChatMessage(chatId, {
      role: "user",
      chatId,
      content: question,
      createAt: Date.now(),
    });

    // 获取流式响应
    const stream = await mainServiceWorkflowBuilder(chatId, question);
    
    // 设置响应头
    nodeRes.setHeader("Content-Type", "text/event-stream");
    nodeRes.setHeader("Cache-Control", "no-cache");
    nodeRes.setHeader("Connection", "keep-alive");

    let fullContent = '';

    // 返回Promise保持连接开放
    return new Promise((resolve, reject) => {
      // 处理流数据
      stream.on('data', (chunk) => {
        fullContent += chunk.toString();
        nodeRes.write(chunk);
      });

      // 处理流结束
      stream.on('end', async () => {
        try {
          // 插入助理消息
          const responseMessage = await insertChatMessage(chatId, {
            role: "assistant",
            chatId,
            content: fullContent,
            createAt: Date.now(),
          });
          
          nodeRes.end();
          resolve(responseMessage);
        } catch (error) {
          reject(error);
        }
      });

      // 处理错误
      stream.on('error', (error) => {
        nodeRes.statusCode = 500;
        nodeRes.end(JSON.stringify({
          error: error.message
        }));
        reject(error);
      });
    });

  } catch (error: any) {
    event.node.res.statusCode = error.statusCode || 500;
    event.node.res.end(JSON.stringify({
      error: error.message
    }));
  }
});