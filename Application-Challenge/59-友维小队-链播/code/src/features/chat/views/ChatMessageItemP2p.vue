<template>
    <div class="message-item" :class="{ mine: msg.isMe }">
        <div class="message-comp" v-if="wrapAsUser">
            <div class="name-content">
                <component
                    v-if="comp"
                    :is="comp"
                    :data="msg"
                ></component>
                <template v-else>
                    <div class="error-message">未知消息类型:{{ msg }}</div>
                </template>
            </div>
        </div>
        <template v-else-if="comp">
            <component :is="comp" :data="msg"></component>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { IMessagenProcessed } from "../service/message.type";
import { getTypeHandler } from "../service/type-manager";

const props = defineProps(["data"]);
const msg = computed(() => props.data as IMessagenProcessed);
const handler = getTypeHandler(props.data.type);
const wrapAsUser = !handler.config?.noUser;
console.log(msg);
const comp = handler.component;
</script>

<style scoped lang="scss">
$normal-fontsize: 0.8125rem;
$fontsize-mini: 0.75rem;
.message-comp {
    max-width: 100%;
    position: relative;
}
.message-item {
    position: relative;
    margin: 8px 0;
    display: flex;
    width: 100%;
    padding:0 12px;
    margin-top: 1rem;
    box-sizing: border-box;
    // 子元素可以用bg来增加动态背景
    .bg {
        background-color: white;
        color: rgba(0, 0, 0, 0.8);
        position: relative;
        &::after {
            content: "";
            background-image: url("../assets/image/anchorw.svg");
            position: absolute;
            left: -3px;
            top: 0;
            width: 7.5px;
            height: 13px;
        }
    }
    &.mine {
        .bg {
            background: #3478f6;
            color: #ffffffcc;
            &::after {
                background-image: url("../assets/image/anchor.svg");
                right: -3px;
                left: auto;
            }
        }
    }

    .name-content {
        width: calc(100vw - 104px);
        min-height: 2.25rem;
        align-items: flex-start;
        display: flex;
        flex-direction: column;
    }
    &.mine {
        .name-content {
            align-items: flex-end;
            flex-direction: row;
            justify-content: flex-end;
        }
    }

    &.mine {
        flex-direction: row-reverse;
    }
    .message-content {
        background-color: #bdb2b2;
        border-radius: 5px;
        overflow: auto;
    }
    .card {
        padding: 12px;
        border-radius: 12px;
    }
}
</style>
