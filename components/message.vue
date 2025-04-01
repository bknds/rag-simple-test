<script lang="ts" setup>
defineOptions({ name: "Message" });

interface PropsModel {
  message: IChatMessage;
}

const props = defineProps<PropsModel>();

const formatMessage = (message: string) => {
  try {
    const jsonObj = JSON.parse(message);
    return jsonObj.type ? jsonObj : message;
  } catch (error) {
    return message;
  }
};

const content = computed(() => {
  return formatMessage(props.message.content);
});
</script>

<template>
  <div class="message-item" :class="{
    'message-user': message.role === 'user',
    'message-assistant': message.role === 'assistant'
  }">
    <div class="message-wrap">
      <div class="message" v-if="typeof content === 'string' && content === ''">
        <div class="loading">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <div class="message" v-if="typeof content === 'string' && content !== ''"
        v-html="content.split('\n').join('<br />')"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.message-item {
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  margin-bottom: 20px;
  position: relative;

  .message-wrap {
    display: inline-flex;
    flex-flow: column nowrap;
  }

  .message {
    padding: 8px 15px;
    max-width: 500px;
    background-color: var(--background-color);
    font-size: 13px;
    border: 1px solid var(--border-color);
    word-break: break-all;

    think {
      color: var(--text-color);
      font-size: 12px;
    }
  }

  &.message-user {
    align-items: flex-end;
    padding-right: 8px;

    .message {
      border-radius: 20px 0 20px 20px;
    }
  }

  &.message-assistant {
    padding-left: 8px;
    align-items: flex-start;

    .message {
      background-color: var(--primary-color-2);
      border-radius: 0 15px 15px 15px;
    }
  }
}


.loading,
.loading>div {
  position: relative;
  box-sizing: border-box;
}

.loading {
  display: block;
  font-size: 0;
  color: var(--primary-color);
}

.loading.la-dark {
  color: var(--primary-color-1);
}

.loading>div {
  display: inline-block;
  float: none;
  background-color: currentColor;
  border: 0 solid currentColor;
}

.loading {
  width: 8px;
  height: 8px;
  margin: 5px 11px;
}

.loading>div {
  position: absolute;
  top: 0;
  left: -150%;
  display: block;
  width: 8px;
  width: 100%;
  height: 8px;
  height: 100%;
  border-radius: 100%;
  opacity: 0.5;
  animation: ball-circus-position 2.5s infinite cubic-bezier(0.25, 0, 0.75, 1),
    ball-circus-size 2.5s infinite cubic-bezier(0.25, 0, 0.75, 1);
}

.loading>div:nth-child(1) {
  animation-delay: 0s, -0.5s;
}

.loading>div:nth-child(2) {
  animation-delay: -0.5s, -1s;
}

.loading>div:nth-child(3) {
  animation-delay: -1s, -1.5s;
}

.loading>div:nth-child(4) {
  animation-delay: -1.5s, -2s;
}

.loading>div:nth-child(5) {
  animation-delay: -2s, -2.5s;
}

@keyframes ball-circus-position {
  50% {
    left: 150%;
  }
}

@keyframes ball-circus-size {
  50% {
    transform: scale(0.4, 0.4);
  }
}
</style>
