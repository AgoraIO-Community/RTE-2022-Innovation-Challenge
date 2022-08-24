<template>
    <h-page page-name="房间信息">
        <div class="fcol h100p">
            <h-list v-if="info">
                <h-el>
                    <h-txt label>名称&emsp;&emsp;</h-txt>
                    <h-input v-model="d.name" maxlength="8"> </h-input>
                    <h-txt color="danger" v-if="errs.name"
                        >名称需要在2-8字之间</h-txt
                    >
                </h-el>
                <h-el>
                    <h-txt label>描述公告</h-txt>
                    <h-textarea class="bd1" v-model="d.desc" maxlength="48">
                    </h-textarea>
                </h-el>
            </h-list>
            <h-list>
                <h-list-header>
                    <h-h5
                        >类型设置 <h-note>（建议默认设置，可随时修改）</h-note>
                    </h-h5>
                </h-list-header>
                <h-note color="warning" class="pd" v-if="isCasting">
                    * 直播时不能调整类型
                </h-note>
                <h-el v-if="showTypes" class="mgb">
                    <h-txt label>直播类型</h-txt>
                    <h-select
                        :disabled="isCasting"
                        v-model="d.showType"
                        title="直播类型"
                        :options="showTypes"
                    ></h-select>
                    <h-view slot="helper">
                        <ShowTypeHelp> </ShowTypeHelp>
                    </h-view>
                </h-el>
                <h-el v-if="watchTypes" class="mgb">
                    <h-txt label>观看类型 </h-txt>
                    <h-select
                        v-model="d.watchType"
                        title="观看类型"
                        :disabled="isCasting"
                        :options="watchTypes"
                    ></h-select>
                    <h-view slot="helper">
                        <WatchTypeHelp> </WatchTypeHelp>
                    </h-view>
                </h-el>
                <h-el v-show="d.watchType === 'pwd'" class="mgb">
                    <h-txt label>密码 </h-txt>
                    <h-input v-model="d.password"></h-input>
                </h-el>
                <h-el v-if="shareTypes" class="mgb">
                    <h-txt label>分享类型</h-txt>
                    <h-select
                        v-model="d.shareType"
                        title="分享类型"
                        :disabled="isCasting"
                        :options="shareTypes"
                    ></h-select>
                    <h-view slot="helper">
                        <ShareTypeHelp> </ShareTypeHelp>
                    </h-view>
                </h-el>
            </h-list>
        </div>
        <template #foot>
            <h-btn expand="block" @click="change" :disabled="noChange"
                >提交修改</h-btn
            >
        </template>
    </h-page>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watchEffect } from "vue";
import {
    CastRoomShareType,
    CastRoomShowType,
    CastRoomWatchType,
    useExecTree,
} from "../deps";
import { useMeteor } from "@/common/meteor";
import { getCastRoomTypes } from "../services/rest";
import { useOverlay } from "@/common/overlay";
import { calcChange } from "@/common/utils";
import WatchTypeHelp from "../views/helps/WatchTypeHelp.vue";
import ShowTypeHelp from "../views/helps/ShowTypeHelp.vue";
import ShareTypeHelp from "../views/helps/ShareTypeHelp.vue";
import {
    CastRoomInfoAdminService,
    setupCastRoomInfo,
} from "../services/CastRoomInfo";
import { useRoute } from "vue-router";
const m = useMeteor();
const overlay = useOverlay();
const route = useRoute();
const roomId = route.params.id as string;
// const log = console.log;
const infoServ = setupCastRoomInfo(roomId, true) as CastRoomInfoAdminService;

const isCasting = ref(false);
const watchTypes = ref([] as any[]);
const shareTypes = ref([] as any[]);
const showTypes = ref([] as any[]);
const d = reactive({
    name: "",
    desc: "",
    watchType: CastRoomWatchType.Public,
    shareType: CastRoomShareType.Free,
    showType: CastRoomShowType.Single,
    password: "",
});
const errs = reactive({
    name: false,
    desc: false,
});
getCastRoomTypes().then((res) => {
    const d = res.json();
    watchTypes.value = d.watchTypes;
    shareTypes.value = d.shareTypes;
    showTypes.value = d.showTypes;
});

const hasErr = () => {
    if (d.name!.length < 2 || d.name.length > 12) {
        errs.name = true;
        return true;
    } else {
        errs.name = false;
    }

    return false;
};

const info = m
    .wrapObservale$(infoServ.info$)
    .tap((i) => {
        d.watchType = i.watchType!;
        d.shareType = i.shareType!;
        d.showType = i.showType!;
        d.name = i.name;
        d.desc = i.desc;
        d.password = i.password ?? "";
        isCasting.value = !!i.session;
    })
    .refRef({ shallow: true });
const changes = computed(() => calcChange(info.value ?? {}, d, Object.keys(d)));
const noChange = computed(() => {
    return !changes.value;
});

console.log(`preview component setup 000000 `);

const change = () => {
    if (noChange.value || !changes.value) {
        return overlay.showToast("没有修改");
    }
    const hasE = hasErr();
    !hasE &&
        infoServ?.updateRoom(changes.value).then(() => {
            overlay.showSuccess("修改成功");
        });
};
</script>

<style lang="scss" scoped>
.bd1 {
    border: 1px solid lightgrey;
    margin: 12px 8px 0;
    padding: 8px;
}
</style>
