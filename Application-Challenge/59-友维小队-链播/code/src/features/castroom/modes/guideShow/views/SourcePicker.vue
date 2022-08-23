<template>
    <h-modal
        :is-open="show"
        title="选择视频源"
        @close="close"
        style="z-index: 101"
    >
        <h-el>
            <h-input
                placeholder="输入关键字"
                :disabled="isSearching"
                v-model="d.key"
            ></h-input>
            <h-btn slot="end" @click="search" size="small" fill="outline"
                >查询</h-btn
            >
        </h-el>
        <h-view class="pdh frow cnty">
            <h-h5>我的选择</h-h5>
            <h-view class="f1"></h-view>
            <h-txt> {{ pickList.length }}/{{ max }} </h-txt>
        </h-view>
        <h-view class="pdh" v-if="!pickList.length" style="height: 40px">
            目前还没有选择
        </h-view>
        <h-list v-else>
            <h-el v-for="(item, i) in pickList" :key="item._id">
                {{ item.name }}
                <h-btns slot="end">
                    <h-btn @click="unpick(i)">取消</h-btn>
                    <h-btn @click="prev(item)">预览</h-btn>
                </h-btns>
            </h-el>
        </h-list>
        <h-view class="bd1b mg"></h-view>
        <h-view class="pdh">
            <h-h5
                >搜索结果 -
                <h-txt style="font-size: 14px"
                    >仅能搜索到正在直播的直播间</h-txt
                >
            </h-h5>
        </h-view>
        <h-empty v-if="isEmpty" style="height: 200px">
            抱歉，没有搜索到结果，换一个关键字试试？
        </h-empty>
        <h-list v-else>
            <h-el v-for="(item, i) in resultShowList" :key="item._id">
                {{ item.name }}
                <h-btns slot="end">
                    <h-btn @click="pick(item)" :disabled="cantSelect"
                        >选择</h-btn
                    >
                    <h-btn @click="prev(item)">预览</h-btn>
                </h-btns>
            </h-el>
        </h-list>
        <template #foot>
            <h-btn expand="block" @click="confirm">确定</h-btn>
        </template>
    </h-modal>
</template>

<script lang="ts" setup>
import { useApi } from "@/common/api";
import { useMeteor } from "@/common/meteor";
import { useOverlay } from "@/common/overlay";
import { CastRoom } from "@/features/castroom/deps";
import { useCastRoomService } from "@/features/castroom/services";
import { useRouter } from "@/router";
import { computed, reactive, ref } from "vue";
const router = useRouter();
const vid = ref<HTMLVideoElement>();
const serv = useCastRoomService();
const sess = serv.sess.child("sourc-pick");
const openSess = sess.child("open");
const close = () => {
    openSess.run();
};
const pickList = reactive<CastRoom[]>([]);
const show = ref(false);
const overlay = useOverlay();
const d = reactive({
    results: [] as CastRoom[],
    key: "",
});
const cantSelect = computed(() => pickList.length === max.value);
const m = useMeteor();
const max = ref(1);
const prev = (room: CastRoom) => {
    prevSess.run();
    prevSess.add(
        m
            .subscribe$("castroom.rec.lastest", { roomId: room._id })
            .subscribe((v) => {
                console.info(v);
                const url = `/castroom/` + room._id + "?f=caster";
                router.to(`/castroom/` + room._id + "?f=caster");
                show.value = false;
                m.wrapObservale$(router.change$)
                    .filter((v) => v.from?.fullPath === url)
                    .one()
                    .subscribe(() => {
                        show.value = true;
                        prevSess.run();
                    });
            })
    );
};
const isEmpty = ref(false);

const resultShowList = computed(() =>
    d.results.filter((e) => !pickList.some((el) => el._id === e._id))
);
let lastSearchKey = "";
let isSearching = ref(false);
let searchSess = openSess.child("search");
const prevSess = openSess.child("prev");
const api = useApi();

const search = () => {
    if (d.key === lastSearchKey || !d.key || isSearching.value) {
        return;
    }
    isSearching.value = true;
    searchSess.add(() => {
        isSearching.value = false;
        lastSearchKey = d.key;
    });
    api.sequence("castrooms", "sources", {
        query: {
            key: d.key,
        },
    })
        .then((r) => {
            const l = r.get("results", []);
            d.results = l;
            isEmpty.value = !l.length;
        })
        .finally(() => {
            searchSess.run();
        });
};
const pick = (el: CastRoom) => {
    pickList.push(el);
};
const unpick = (i: number) => {
    pickList.splice(i, 1);
};
const tryPlay = () => {
    vid.value
        ?.play()
        .then(() => {
            serv.markModeReady(true);
        })
        .catch(() => {
            overlay.showWarn("需要同意才能播放", "注意").then(() => {
                vid.value?.play();
                serv.markModeReady(true);
            });
        });
};

defineExpose({
    open(excludes: string[], op?: { max: number }) {
        show.value = true;
        max.value = op?.max ?? 1;
        return new Promise<string[]>((resolve) => {
            openSess.add(() => {
                show.value = false;
                resolve(pickList.splice(0).map((v) => v._id));
            });
        });
    },
});

const confirm = () => {
    openSess.run();
};
</script>

<style lang="scss" scoped>
.prev {
    width: 64px;
    height: 64px;
    background-color: red;
}
</style>
