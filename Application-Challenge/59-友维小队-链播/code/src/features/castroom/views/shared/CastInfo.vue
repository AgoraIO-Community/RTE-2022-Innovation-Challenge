<template>
    <div class="frow">
        <h-avatar class="avatar" :uid="room?.createdBy"></h-avatar>
        <div class="fcol">
            <h-uname class="u-name" :uid="room?.createdBy"></h-uname>
            <span class="u-count" v-if="pushTime"> {{ pushTime }} </span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useMeteor } from "@/common/meteor";
import { formatSeconds } from "@/common/utils";
import { useAppService } from "@/services/app";
import { ref } from "vue";
import { CastRoom, CastRoomRecords, CastRooms, useExecTree } from "../../deps";
import { useCastRoomInfo } from "../../services/CastRoomInfo";
// const props = defineProps<{ roomId: string }>();
const m = useMeteor();
const sess = useExecTree();
const pushTime = ref("...");

const countSess = sess.child("count");
const app = useAppService();
const startCount = (start: Date) => {
    pushTime.value = "计时中";
    const startAt = new Date(start).getTime();
    countSess.add(
        app.secChange$.subscribe(() => {
            pushTime.value =
                "直播中:" + formatSeconds((Date.now() - startAt) / 1000);
        })
    );
};
const inf = useCastRoomInfo();
sess.add(
    m
        .wrapObservale$(inf.record$)
        .ifChanged((p, c) => p?.status === c.status)
        .subscribe((v) => {
            console.error(v, "cast info");
            if (v?.status === 1) {
                startCount(v.createdAt!);
                countSess.add(() => (pushTime.value = "直播还未开始"));
            } else {
                countSess.run();
                pushTime.value = "直播还未开始";
            }
        })
);
const room = inf.infoRef;
</script>

<style scoped lang="scss">
.avatar {
    --size: 32px;
    width: var(--size);
    height: var(--size);
    margin-right: 6px;
}
.u-name {
    font-size: 14px;
    color: #ffffff;
    line-height: 16px;
    margin-bottom: 4px;
}
.u-count {
    opacity: 0.7;
    font-size: 12px;
    color: #ffffff;
    line-height: 12px;
}
</style>
