<template>
    <h-view
        class="frow w100p cnty"
        style="background: white; padding: 8px 16px"
    >
        <h-view
            class="frow sources fcnt"
            :class="{ show: showSourcePicker }"
            style="gap: 8px"
        >
            <h-view
                class="item"
                @click="tapItem(ind)"
                v-for="(i, ind) in sourceList"
                :key="i"
            >
                <LocalItem v-if="i === 'local'"></LocalItem>
                <VideoItem @replace="goSearch(ind)" v-else-if="i" :room-id="i">
                    {{ i }}
                </VideoItem>
                <div class="holder" v-else>
                    <h-icon :icon="addOutline"></h-icon>
                </div>
            </h-view>
        </h-view>
        <h-view> </h-view>
        <h-btn class="f1 mgh" @click="publish" size="small">
            {{ isCast ? "终止" : "开播" }}
        </h-btn>
        <SourcePicker ref="sourceSearch"></SourcePicker>
    </h-view>
</template>

<script lang="ts" setup>
import { useMeteor } from "@/common/meteor";
import { addOutline } from "ionicons/icons";
import SourcePicker from "./views/SourcePicker.vue";
import { ref } from "vue";
import { useCastRoomService } from "../../services";
import VideoItem from "./views/SourcePrevItem.vue";
import LocalItem from "./views/SourcePrevItemLocal.vue";
import { SourceManager } from "./source";
import { useOverlay } from "@/common/overlay";
import { useRouter } from "@/router";
import { RTCClientWatcher } from "../../services/rtc";
import { interval } from "rxjs";
const serv = useCastRoomService();
const sess = serv.modeSess.child(`guide-show-foot`);
const sourceSearch = ref<InstanceType<typeof SourcePicker>>();
const m = useMeteor();
const showSourcePicker = ref(true);
const isCast = m
    .wrapObservale$(serv.cast.state$)
    .map((v) => v.status === 1)
    .refRef();

const source = SourceManager.get(serv.roomId);
const current = m.wrapObservale$(source.current$).refRef();
const sourceList = m.wrapObservale$(source.sources$).refArr();

const prevSess = sess.child("prev");
const goSearch = (index: number) => {
    sourceSearch.value
        ?.open([serv.roomId, ...sourceList.filter((el) => !!el)])
        .then((res) => {
            res[0] && source.addSourceAt(res[0], index);
        });
};
const tapItem = async (i: number) => {
    const id = sourceList[i];
    if (id) {
        source.pickOne(i);
        return prev(id, i);
    }
    if (i === 1) {
        source.addSourceAt("mock" + Date.now(), i);
        return;
    }
    goSearch(i);
};
let cli: RTCClientWatcher;
const getClient = () => {
    return cli ? cli : (cli = new RTCClientWatcher());
};
const prev = (roomId: string, index: number) => {
    prevSess.run();
    console.log(`preview ${roomId}`);
    if (roomId === "local") {
        prevSess.add(
            serv.captureLocalStream$().subscribe((v) => {
                console.error(v);
                v.stream && source.localStream$.next(v.stream);
            })
        );
        return;
    }
    if (roomId.startsWith("mock")) {
        const cvs = document.createElement("canvas");
        const ctx = cvs.getContext("2d");
        const w = (cvs.width = serv.config.value.width);
        const h = (cvs.height = serv.config.value.height);
        let si = index;
        const colors = ["red", "blue", "green", "orange"];
        prevSess.add(
            interval(20).subscribe(() => {
                if (ctx) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.clearRect(0, 0, w, h);
                    ctx.stroke();
                    const sx = Math.round(Math.random() * (w - 100));
                    const sy = Math.round(Math.random() * (h - 100));
                    ctx?.rect(sx, sy, 100, 100);
                    ctx!.fillStyle = colors[si++ % 4];
                    ctx?.fill();
                    ctx.restore();
                }
            })
        );
        source.localStream$.next(cvs.captureStream());
        return;
    }
    const client = getClient();

    prevSess.add(
        client.join(roomId).subscribe((v) => {
            console.error(v);
        })
    );
    prevSess.add(
        client.stream$.subscribe((v) => {
            v.getTracks().length && source.localStream$.next(v);
        })
    );
};
const pubSess = sess.child("pub");
const overlay = useOverlay();
const publish = () => {
    if (isCast.value) {
        overlay
            .showConfirm(`确认终止直播吗`, "注意", { cancelText: "点错了" })
            .then((v) => {
                if (v) {
                    pubSess.run();
                }
            });
        return;
    }
    pubSess.add(
        serv.cast.castStream$().subscribe((v) => {
            console.log(v);
        })
    );
};
</script>

<style lang="scss" scoped>
.cast-btn {
    position: absolute;
    bottom: var(--ion-safe-area-bottom);
    background-color: rgba(255, 255, 255, 0.4);
    color: aliceblue;
    margin: 0 auto;
}
.sources {
    position: absolute;
    bottom: 100%;
    width: 100%;
    height: 80px;
    left: 100%;
    background-color: rgba(255, 255, 255, 0.6);
    transition: left 0.3s ease-in-out;
    justify-content: space-evenly;
    &.show {
        left: 0;
    }
}
.item {
    width: 54px;
    height: 54px;
    position: relative;
    background-color: rgb(206, 206, 206);
    .holder {
        width: 54px;
        height: 54px;
        ion-icon {
            font-size: 54px;
        }
    }
}
</style>
