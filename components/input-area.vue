<script lang="ts" setup>
defineOptions({ name: "InputArea" });

const emit = defineEmits<{
  (
    event: "send",
    content: string
  ): void;
}>();

const chatTextareaValue = ref("");
const messageTextareaRef = ref();

const userInputKeydownHandle = (e: any) => {
  // 检查 Shift 和 Enter 是否同时按下
  if (e.shiftKey && e.key === "Enter") {
    e.preventDefault();

    const textarea = messageTextareaRef.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // 在光标位置插入换行符
    chatTextareaValue.value =
      chatTextareaValue.value.slice(0, start) +
      "\n" +
      chatTextareaValue.value.slice(end);

    // 重置光标的位置
    setTimeout(() => {
      textarea.setSelectionRange(start + 1, start + 1);
    }, 0);
  } else if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
};

const sendMessage = async () => {
  if (chatTextareaValue.value.trim() === "") return;
  emit("send", chatTextareaValue.value.trim());
  chatTextareaValue.value = "";
};

</script>

<template>
  <div class="input-area">
    <textarea class="chat-textarea" type="text" v-model="chatTextareaValue" placeholder="发送消息"
      @keydown="userInputKeydownHandle" ref="messageTextareaRef" />
    <div class="line-break-tip">Shift + Enter键换行</div>
  </div>
</template>

<style scoped lang="scss">
.input-area {
  padding: 10px;
  height: auto;
  min-height: 200px;
  display: flex;
  flex-flow: column nowrap;
  position: relative;

  .chat-textarea {
    min-height: 220px;
    flex: 1;
    background-color: var(--input-background-color);
    resize: none;
    border-radius: 13px;
    padding: 10px;
    outline: none;
    border: 1px solid var(--border-color);
    outline: 1px solid transparent;
    transition: all 0.2s;
    font-size: 14px;

    &:focus {
      border: 1px solid var(--primary-color-5);
      outline: 1px solid var(--primary-color-5);
    }
  }

  .line-break-tip {
    color: var(--text-color-1);
    font-size: 12px;
    margin-top: 9px;
    text-align: end;
    transform: scale(0.9);
    transform-origin: 100% 100%;
    user-select: none;
  }
}
</style>
