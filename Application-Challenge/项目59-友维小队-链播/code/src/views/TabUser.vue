<script lang="ts" setup>
import { useRouter } from "@/router";
import UserProfileCard from "@/features/user/views/UserProfileCard.vue";
import { person, settingsOutline,apertureOutline } from "ionicons/icons";
import { useMeteor } from "@/common/meteor";
const router = useRouter();
const m = useMeteor()
const user = m.wrapObservale$(m.currentUser$).map(v => v?._id).refRef()
const navs1 = [
    {
        id: "profile",
        name: "个人资料",
        url: "/mine/profile",
        icon: person,
    },
];
const navs2 = [
    {
        id: "setting",
        name: "关于",
        url: "/about",
        icon: apertureOutline,
    },
];
</script>

<template>
    <h-page>
        <h-view class="pdh">
            <UserProfileCard v-if="user" :uid="user"></UserProfileCard>
            <h-card v-else style="margin-left: 0;margin-right:0;">
                <h-nav url="/user/signin">
                    点击登录
                </h-nav>
            </h-card>
            <h-list class="mgv">
                <h-nav-el v-for="n in navs1" :key="n.id" :nav="n"></h-nav-el>
            </h-list>
            <h-list class="mgv">
                <h-nav-el v-for="n in navs2" :key="n.id" :nav="n"></h-nav-el>
            </h-list>
        </h-view>
    </h-page>
</template>

<style scoped lang="scss">
.nomore {
    font-size: 12px;
    text-align: center;
}
</style>
