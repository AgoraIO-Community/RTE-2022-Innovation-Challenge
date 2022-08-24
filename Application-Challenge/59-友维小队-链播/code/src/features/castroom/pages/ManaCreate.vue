<template>
    <h-page page-name="创建直播间">
        <h-list>
            <h-list-header>
                <h-h5>基础信息</h-h5>
            </h-list-header>
            <h-el>
                <h-txt label>名称</h-txt>
                <h-input
                    v-model="d.name"
                    maxlength="12"
                    placeholder="好的名字更能吸引人"
                ></h-input>
            </h-el>
            <h-el>
                <h-txt label>公告</h-txt>
                <h-textarea
                    rows="4"
                    maxlength="100"
                    placeholder="可以写下内容简介或者节目预告"
                    v-model="d.desc"
                >
                </h-textarea>
            </h-el>
        </h-list>
        <h-list>
            <h-list-header>
                <h-h5
                    >类型设置 <h-note>（建议默认设置，可随时修改）</h-note>
                </h-h5>
            </h-list-header>
            <h-el>
                <h-txt label>观看类型 </h-txt>
                <h-select
                    v-if="watchTypes"
                    v-model="d.watchType"
                    title="观看类型"
                    :options="watchTypes"
                ></h-select>
                <h-view slot="helper">
                    <WatchTypeHelp> </WatchTypeHelp>
                </h-view>
            </h-el>
            <h-el v-show="d.watchType === 'pwd'">
                <h-txt label>密码 </h-txt>
                <h-input v-model="d.password"></h-input>
            </h-el>
            <h-el>
                <h-txt label>分享类型</h-txt>
                <h-select
                    v-if="shareTypes"
                    v-model="d.shareType"
                    title="分享类型"
                    :options="shareTypes"
                ></h-select>
                <h-view slot="helper">
                    <ShareTypeHelp> </ShareTypeHelp>
                </h-view>
            </h-el>
            <h-el>
                <h-txt label>直播类型</h-txt>
                <h-select
                    v-if="showTypes"
                    v-model="d.showType"
                    title="直播类型"
                    :options="showTypes"
                ></h-select>
                <h-view slot="helper">
                    <ShowTypeHelp> </ShowTypeHelp>
                </h-view>
            </h-el>
        </h-list>
        <template #foot>
            <h-btn :disabled="!crtApi" @click="tryCrt" expand="block"
                >创建</h-btn
            >
        </template>
    </h-page>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import {
    CastRoom,
    CastRoomWatchType,
    CastRoomShowType,
    CastRoomShareType,
} from "../deps";

import { useOverlay } from "@/common/overlay";
import { useApi } from "@/common/api";
import { ApiLink } from "@/common/shared";
import { getCastRoomTypes } from "../services/rest";
import WatchTypeHelp from "../views/helps/WatchTypeHelp.vue";
import ShowTypeHelp from "../views/helps/ShowTypeHelp.vue";
import ShareTypeHelp from "../views/helps/ShareTypeHelp.vue";
import { useRouter } from "@/router";
const router = useRouter();
const d = reactive<Partial<CastRoom>>({
    name: "",
    desc: "",
    watchType: CastRoomWatchType.Public,
    shareType: CastRoomShareType.Free,
    showType: CastRoomShowType.Single,
});
const watchTypes = ref(null) as any;
const shareTypes = ref(null) as any;
const showTypes = ref(null) as any;
const hasErr = ref(false);
const api = useApi();
const crtApi = ref<ApiLink>();
const load = () => {
    getCastRoomTypes().then((res) => {
        console.error(res.json());
        const d = res?.json();
        hasErr.value = !d;
        if (res && d.watchTypes) {
            watchTypes.value = d.watchTypes;
            shareTypes.value = d.shareTypes;
            showTypes.value = d.showTypes;
        }
    });
    crtApi.value = api.extractLink();
};
load();
const overlay = useOverlay();
const tryCrt = () => {
    api.useLink(crtApi.value, { data: d })
        .then(() => {
            overlay.showToast(`操作成功`);
            router.back();
        })
        .catch(
            api.mapErrorCode({
                400: (err) => {
                    router.back();
                },
            })
        );
};
</script>

<style lang="scss" scoped></style>
