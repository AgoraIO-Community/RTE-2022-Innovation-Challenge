<script lang="ts" setup>
import { useExecTree } from "@/common/ExecTree";
import { useMeteor } from "@/common/meteor";
import { combineLatest, map, debounceTime } from "rxjs";
import { reactive, ref } from "vue";
import { sendMessage, useChat } from "../service/easemob";
import { MessageType } from "../service/message.type";
const props = defineProps<{
    channel: string;
}>();
const m = useMeteor();
const im = useChat();
const user = m.userInfo$().refRef();
const s = useExecTree();
const joined = ref(false);
const messages = reactive([]) as Array<{
    name: string;
    text: string;
    id: string;
}>;
let joining = false;
s.add(
    combineLatest({
        im: im.status$.pipe(map((v) => v.connected)),
        u: m.currentUser$,
    })
        .pipe(debounceTime(50))
        .subscribe((v) => {
            console.warn(v);
            if (v.im && v.u && !joining) {
                joining = true;
                im.conn!.joinChatRoom({ roomId: props.channel })
                    .then((res) => {
                        console.log(`join channel successed`, res);
                        joined.value = true;
                        messages.push({
                            name: "通知",
                            text: "成功加入频道，赶紧跟大家打个招呼吧",
                            id: Date.now().toString(),
                        });
                        csess.add(() => {
                            im.conn!.leaveChatRoom({ roomId: props.channel });
                        });
                    })
                    .finally(() => {
                        joining = false;
                    });
            } else {
                joining = false;
            }
        })
);

m.wrapObservale$(im.message$)
    .filter((v) => v.chatType === "groupChat" && v.to === props.channel)
    .subscribe((v) => {
        try {
            const m = JSON.parse(v.msg);
            if (m.text) {
                messages.unshift({
                    id: v.id,
                    name: v.ext?.name ?? "匿名用户",
                    text: m.text,
                });
            }
        } catch (error) {}
        console.error(v);
    });

const csess = s.child("con");
const showInput = ref(false);
const inpSess = s.child("inp");
const inp = ref();
const text = ref("");
const showInp = () => {
    showInput.value = true;
    inpSess.add(() => (showInput.value = false));
};
const tryFocus = () => {
    if (showInput.value) {
        inp.value?.$el.querySelector("input").focus();
    }
};
const send = () => {
    if (!text.value || !Meteor.userId || !joined.value) {
        return;
    }
    const msg = {
        senderId: Meteor.user()?.profile!.id!,
        targetId: props.channel,
        _id: Date.now().toString(),
        data: {
            text: text.value,
        },
        createdAt: Date.now(),
        type: MessageType.Text,
        meta: {
            ...Meteor.user()?.profile,
        },
    };
    sendMessage(msg, "groupChat").then((res) => {
        console.log(res);
        messages.unshift({
            id: msg._id,
            name: "我",
            text: text.value,
        });
        text.value = "";
        showInput.value = false;
    });
};
const show = ref(false);
</script>

<template>
    <h-view class="chat-card fcol" v-if="user" :class="{ show }">
        <template v-if="joined">
            <h-view class="msg-list f1">
                <h-view class="msg-item" v-for="m in messages" :key="m.id">
                    <h-txt class="name">{{ m.name }}</h-txt> ：{{ m.text }}
                </h-view>
            </h-view>
            <h-view
                style="height: 24px; font-size: 12px"
                class="frow fcnt"
                @click="showInp"
            >
                点击输入
            </h-view>
        </template>
        <template v-else>
            <h-txt>消息服务器连接中</h-txt>
            <h-skeleton animated></h-skeleton>
        </template>
        <h-view
            :class="{ show: showInput }"
            @transitionend="tryFocus"
            class="fcol layer"
        >
            <h-view class="f1" @click="inpSess.run()"></h-view>
            <h-view class="input-box keyboard-slide frow cnty">
                <h-input v-model="text" ref="inp" class="inputer"></h-input>
                <h-btn size="small" @click="send">发送</h-btn>
            </h-view>
        </h-view>
    </h-view>
    <h-view v-else class="chat-locked">
        登陆后就可以和其它的小伙伴交流了哦
        <h-nav style="display: inline" url="/user/signin">
            <h-btn size="small" fill="outline">前往登录</h-btn>
        </h-nav>
    </h-view>
</template>

<style scoped lang="scss">
.layer {
    position: fixed;
    right: -100vw;
    width: 100vw;
    height: 100vh;
    bottom: 0;
    transition: all 0.25s ease;
    background-color: rgba($color: #483d3d, $alpha: 0.4);
    &.show {
        right: 0;
    }
}
.input-box {
    width: 100vw;
    bottom: 0;
    padding: 8px;
    padding-bottom: calc(var(--ion-safe-area-bottom, 0) + 12px);
    .inputer {
        border-bottom: 1px solid white;
        padding: 0 12px 8px;
        --padding-start: 12px;
        --padding-end: 12px;
        margin-right: 12px;
        color: rgb(192, 186, 186);
    }
}
.chat-card {
    height: 160px;
}
.chat-locked,
.chat-card {
    padding: 0px 8px 0px 12px;
    position: absolute;
    font-size: 13px;
    bottom: var(--ion-safe-area-bottom, 0);
    width: 60vw;
    background-color: rgba($color: #524848, $alpha: 0.3);
    color: rgb(223, 223, 223);
}
.chat-locked {
    padding: 12px;
}
.msg-list {
    width: 100%;
    overflow-y: auto;
    border-bottom: 1px solid grey;
    display: flex;
    flex-direction: column-reverse;
    .msg-item {
        margin: 3px 0;
        .name {
            font-weight: bolder;
        }
    }
}
</style>
