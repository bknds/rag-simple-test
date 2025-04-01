import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { ChatMessage } from "../../mongo/models/message.model";
import { throwError } from "~/server/core/global";
import { Readable } from "stream";
import { queryDatasets } from "../dataset/query-datasets";

export const mainServiceWorkflowBuilder = async (
  userId: string,
  question: string
) => {
  try {
    const chatId = userId;

    if (!chatId) throwError(400, "缺少 chatId 参数");

    const datasetsQueryResult = await queryDatasets(question);

    const client = new OpenAI({
      baseURL: process.env.OLLMA_BASE_URL,
      apiKey: "ollma",
    });

    const messagesHistory = (await ChatMessage.find({ chatId }).sort({
      createAt: 1,
    })) as ChatCompletionMessageParam[];

    const prompt = `## 角色定位
- 作为「租号平台」专属客服，仅处理平台相关咨询
- 提供售前/售后服务指导，传递品牌价值与用户关怀

## 交互要求
### 语气规范
- 友好礼貌，使用口语化表达（如"在的呢~"/"稍等哈"）
- 主动引导用户描述问题细节

### 身份维护
- 拒绝回答平台外话题（包括公司架构/团队信息）
- 遇到身份质疑时统一回复："我是租号平台客服，请问有什么可以帮您？"

## 服务流程
根据‘客服话术问答对知识库查询结果’和用户对话上下文回复用户需求

## 限制规则
1. 信息规范：
   - 仅引用平台规定，禁止透露内部政策（含退款细则）
   - 禁止提供非官方联系方式/链接

2. 交互限制：
   - 保持第一人称，禁用Markdown格式
   - 不渲染JSON卡片内容，需重新调用工具
   - 仅支持安卓手游租赁，不涉及iOS/PC端

3. 内容边界：
   - 不讨论政治/法律/医学等无关领域
   - 所有回复中替换"知识库"为"平台规定"
   - 第三方表述统一为"我们平台"

## 客服话术问答对知识库查询结果：
${JSON.stringify(datasetsQueryResult)}`;

    const systemMessage: ChatCompletionMessageParam = {
      role: "system",
      content: prompt,
    };

    const messages: ChatCompletionMessageParam[] = [
      systemMessage,
      ...messagesHistory,
    ];

    // 创建可读流
    const readableStream = new Readable({
      read() {},
    });

    // 立即执行异步操作
    (async () => {
      try {
        const stream = await client.chat.completions.create({
          model: "llama3.2",
          messages,
          temperature: 0,
          stream: true, // 启用流式输出
        });

        let fullContent = "";
        // 处理流数据
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullContent += content;
            // 将数据推送到流中
            readableStream.push(content);
          }
        }

        // 结束流
        readableStream.push(null);
      } catch (error) {
        // 推送错误信息到流
        readableStream.emit("error", error);
      }
    })();

    return readableStream;
  } catch (error) {
    throw error;
  }
};
