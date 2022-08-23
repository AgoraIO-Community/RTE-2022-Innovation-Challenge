<script lang="ts" setup>
import { useMeteor } from "@/common/meteor";
import { formatDateTime } from "@/common/utils";
import EasemobChat from "easemob-websdk";
import { map } from "rxjs";
import { useRouter } from "@/router";
import { messageTransfer, useChat } from "../service/easemob";
import { getTypeHandler } from "../service/type-manager";
const im = useChat();
const m = useMeteor();
const offline = m
    .wrapObservale$(im.status$)
    .map((v) => !v.connected)
    .ifChanged()
    .refRef();
const summary$ = im.messages$.pipe(
    map((list) => {
        const items = {} as any;
        for (const el of list) {
            if (!el.from) {
                continue;
            }
            items[el.from] = el;
        }
        return Object.values(items).map((el) => {
            const lm = messageTransfer(el as any);
            const h = getTypeHandler(lm.type);
            if (h) {
                return {
                    targetId: lm.isMe ? lm.targetId : lm.senderId,
                    summary: h.summary?.(lm) ?? '新消息',
                    time: formatDateTime(new Date(lm.createdAt))
                }
            }
            return {
                targetId: lm.isMe ? lm.targetId : lm.senderId,
                summary: '未知消息',
                time: formatDateTime(new Date(lm.createdAt))
            }
        });
    })
);
const summarys = m
    .wrapObservale$(summary$)
    .tap(console.log)
    .refRef({ shallow: true });
const router = useRouter()
const goRoom = (id: string) => {
    router.to("/chat/p2p/" + id, {
        query: { f: "list" },
    });
}
</script>

<template>
    <h-page :content="{ scrollY: true }">
        <template #head>
            <h-header page-name="消息列表">
                <h-logined hide="1">
                    <h-nav btn url="/chat/contacts">通讯录</h-nav>
                </h-logined>
            </h-header>
        </template>
        <h-logined>
            <h-loading v-if="offline" :loader="{ name: 'dots' }">连接消息服务器中...</h-loading>
            <h-list v-else-if="summarys?.length">
                <h-el v-for="(sum, ) in summarys" :key="sum.targetId" @click="goRoom(sum.targetId)">
                    {{ sum.summary }}

                    <h-txt slot="end"> {{ sum.time }} </h-txt>
                </h-el>
            </h-list>
            <h-empty v-else> 暂无消息 </h-empty>
        </h-logined>
    </h-page>
</template>

<style scoped lang="scss">
.nomore {
    font-size: 12px;
    text-align: center;
}
</style>
