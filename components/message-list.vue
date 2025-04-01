<script lang="ts" setup>
defineOptions({ name: "MessageList" });
interface PropsModel {
  hasMore: boolean;
}

const props = defineProps<PropsModel>();

const emit = defineEmits<{
  (event: "loadMoreMessages", done: () => void): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const loading = ref<boolean>(false);
let isAtBottom = ref(true);

const loadMoreMessagesHandle = async () => {
  if (loading.value) return;
  if (!props.hasMore) return;

  loading.value = true;

  const scrollHeightBeforeLoad = containerRef.value?.scrollHeight || 0;

  emit("loadMoreMessages", () => {
    nextTick(async () => {
      if (containerRef.value) {
        containerRef.value.scrollTop =
          containerRef.value.scrollHeight - scrollHeightBeforeLoad;
      }

      loading.value = false;
    });
  });
};

const handleScroll = () => {
  const el = containerRef.value;
  if (el) {
    isAtBottom.value = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
    if (el.scrollTop === 0 && !loading.value) {
      loadMoreMessagesHandle();
    }
  }
};

onMounted(() => {
  loadMoreMessagesHandle();
});

const scrollToBottom = () => {
  if (containerRef.value) {
    containerRef.value.scrollTop = containerRef.value.scrollHeight;
  }
};

defineExpose({
  scrollToBottom
})
</script>

<template>
  <div class="message-container-wrap">
    <div ref="containerRef" class="message-container" @scroll="handleScroll">
      <div v-if="loading" class="loading-tip">
        <t-loading size="small" />
      </div>
      <div class="no-more-tip" v-if="!hasMore">- 没有更多消息 -</div>
      <slot></slot>
    </div>
    <div v-if="!isAtBottom" class="bottom-tip" @click.stop="scrollToBottom">
      <div class="icon iconfont-down"></div>
      回到底部
    </div>
  </div>
</template>

<style lang="scss" scoped>
.message-container-wrap {
  width: 100%;
  height: 100%;
  position: relative;
}

.message-container {
  width: 100%;
  height: 100%;
  padding: 10px;
  overflow-y: auto;
  box-sizing: border-box;
  position: relative;

  .loading-tip {
    text-align: center;
    padding: 7px 8px;
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--background-color);
    z-index: 1;
    border-radius: 50px;
    font-size: 12px;
    box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.05);
  }

  .no-more-tip {
    padding: 15px 0;
    text-align: center;
    font-size: 12px;
    color: var(--text-color-2);
  }
}

.bottom-tip {
  position: absolute;
  top: auto;
  left: auto;
  bottom: 20px;
  right: 10px;
  display: inline-flex;
  z-index: 10;
  background-color: var(--background-color);
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 20px;
  color: var(--text-color-1);
  cursor: pointer;

  .icon {
    margin-right: 4px;
  }

  &:hover {
    color: var(--text-color);
  }
}
</style>
