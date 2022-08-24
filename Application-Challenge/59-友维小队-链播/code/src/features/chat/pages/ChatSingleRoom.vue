<script lang="ts" setup>
import { useMeteor } from "@/common/meteor";
import { useRouter } from "@/router";
import ChatMessageItem from "../views/ChatMessageItemP2p.vue";
import { useApi } from "../deps";
import { setupSingleChat } from "../service/chatSingle";
import { useRoute } from "vue-router";
import { ref } from "vue";
import { MessageType } from "../service/message.type";
const route = useRoute();
const router = useRouter();
const serv = setupSingleChat(route.params.id as string);
const m = useMeteor();
const api = useApi();
m.subscribe$("user.info.id", route.params.id).refRef();
const user = m
    .wrapCursor$(Meteor.users.find({ "profile.id": route.params.id }))
    .map((v) => v[0]?.profile)
    .refRef({ shallow: true });
const list = m.wrapObservale$(serv.messages$).refArr({ shallow: true });
const text = ref();
const sendText = () => {
    if (!text.value) {
        return;
    }
    serv.sendMessage(text.value, MessageType.Text).then(() => {
        text.value = "";
    });
};
</script>
<template>
    <h-page :page-name="user?.name || '加载中'">
        <h-list>
            <ChatMessageItem v-for="m in list" :key="m._id" :data="m">
            </ChatMessageItem>
        </h-list>
        <template #foot>
            <h-view class="w100p frow cnty bg-white">
                <h-input class="f1 bd1b" v-model="text"></h-input>
                <h-btn size="small" @click="sendText">发送</h-btn>
            </h-view>
        </template>
    </h-page>
</template>

<style scoped>
.bg-white{
    color:#333;
    padding: 8px 12px;
}
.bd1b{
    border-color: azure;
}
</style>
