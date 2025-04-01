<script lang="ts" setup>
import Message from "~/components/message.vue";
import MessageList from "~/components/message-list.vue";
import InputArea from "~/components/input-area.vue";
import useAPI from "~/plugins/request/api";

const API = useAPI();

const page = ref(1);

const noMoreHistory = ref(false);

const messageHistory = ref<IChatMessage[]>([]);

const messageListRef = ref();

const loadMoreMessagesHandle = async (done: () => void) => {
  if (noMoreHistory.value) return;
  const res = await API.history({
    page: page.value,
  });

  if (res?.length > 0) {
    messageHistory.value = [...messageHistory.value, ...res];
    page.value = page.value + 1;
  } else {
    noMoreHistory.value = true;
  }

  done();
}

const sendMessageHandle = async (content: string) => {
  const userMessage = {
    id: Date.now(),
    role: 'user',
    content,
  }
  messageHistory.value.push(userMessage);
  const aiMessage = {
    id: Date.now() + 1,
    role: 'assistant',
    content: '',
  }
  messageHistory.value.push(aiMessage);
  await nextTick();
  messageListRef.value.scrollToBottom();
  const res = await API.chat({ question: content });
  await processStream(res.body.getReader())
}

const uploadQaConfirmHandle = async (qaDataList: IQAData[], done: () => void) => {
  await API.addQAData({ qaDataList });
  done()
}

const processStream = async (reader: any) => {
  const decoder = new TextDecoder('utf-8');
  const currentMsg = messageHistory.value[messageHistory.value.length - 1]; // 当前消息对象

  try {
    // 流式读取
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // 解码并更新消息
      const chunk = decoder.decode(value);
      currentMsg.content += chunk;
      // 更新 UI
      await nextTick();
      messageListRef.value.scrollToBottom();
    }

  } catch (error) {
    console.error('流处理错误:', error);
  }
};

const init = async () => { };

init();
</script>

<template>
  <div class="container">
    <div class="chat-main-box">
      <div class="message-list-box">
        <message-list @load-more-messages="loadMoreMessagesHandle" :hasMore="!noMoreHistory" ref="messageListRef">
          <template v-for="(message) in messageHistory">
            <message :message="message" />
          </template>
        </message-list>
      </div>
      <input-area @send="sendMessageHandle" />
    </div>
    <div class="upload-qa-box">
      <upload-qa @confirm="uploadQaConfirmHandle" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-flow: column nowrap;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: var(--background-color);
  display: flex;
  flex-flow: row nowrap;

  .no-user-placeholder {
    flex: 1;
    width: 100%;
    height: 100%;
  }

  .chat-main-box {
    flex: 2;
    background-color: var(--background-color);
    padding: 0 0 10px;
    display: flex;
    flex-flow: column nowrap;
    border-right: 1px solid var(--border-color);

    .message-list-box {
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      background-color: var(--input-background-color);
      flex: 1;
      flex-shrink: 0;
      overflow-x: hidden;
      overflow-y: auto;
    }
  }

  .upload-qa-box {
    flex: 1;
    padding: 10px;
  }
}
</style>