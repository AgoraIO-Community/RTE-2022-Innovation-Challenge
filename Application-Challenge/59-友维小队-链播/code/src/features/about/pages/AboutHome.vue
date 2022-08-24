<template>
    <h-page pageName="关于" :content="{ class: 'cont', scrollY: false }">
        <h-view class="fcol h100p">
            <h-view class="bg-white simp-show fcol fcnt">
                <h-h1> 链播 </h-h1>
                <h-view class="mgt"> 不仅仅是直播，更是生活的此幕和彼幕 </h-view>
            </h-view>
            <h-view>
                <h-list>
                    <h-el detail @click="nav(l)" v-for="l in links" :key="l.id">
                        <h-txt label>{{ l.name }} </h-txt>
                    </h-el>
                </h-list>
            </h-view>
            <h-view class="f1" style="background-color: #ccc">
                <h-view class="pd">
                    <h-txt v-if="verNum"> 当前版本号：{{ verNum }} </h-txt>
                </h-view></h-view
            >
        </h-view>
    </h-page>
</template>

<script lang="ts" setup>
import { useRouter } from "@/router";
import { Capacitor } from "@capacitor/core";
import { ref } from "vue";

const verNum = ref("");

const links = [
    {
        id: 1,
        name: "关于链播",
        url: "/about/app",
    },
    {
        id: 2,
        name: "关于我们",
        url: "/about/us",
    },
];
const router = useRouter();
const nav = (e: { url: string }) => {
    e.url && router.to(e.url);
};

if (Capacitor.isNativePlatform()) {
    import("@capacitor/app").then((m) => {
        m.App.getInfo().then((e) => {
            verNum.value = e.version;
        });
    });
}
</script>

<style scoped lang="scss">
.simp-show {
    padding: 16px;
    color: #333;
    background-color: #ccc;
    height: 200px;
}
</style>
