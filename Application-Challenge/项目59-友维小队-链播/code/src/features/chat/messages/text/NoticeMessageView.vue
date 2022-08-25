<template>
  <div class="bg text-zone card" data-tap="content" :data-id="props.data._id">
    <div class="text-message">{{ text }}</div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { Message } from "../../service/message.type";
import { TextMessage } from "./type";

const props = defineProps<{ data: Message<TextMessage> }>();
const text = computed(() =>
  typeof props.data?.data === "string"
    ? props.data?.data
    : props.data?.data?.text ?? "空消息"
);
</script>

<style scoped lang="scss">
.text-zone {
  font-size: 16px;
  line-height: 16px;
  min-height: 2rem;
  max-width: 100%;
  box-sizing: border-box;
}
</style>
