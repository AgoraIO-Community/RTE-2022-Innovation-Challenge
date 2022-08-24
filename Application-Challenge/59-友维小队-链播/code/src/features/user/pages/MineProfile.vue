<template>
    <h-page pageName="个人信息" :content="{ class: 'cont' }">
        <h-view>
            <h-list>
                <h-el>
                    <h-view class="mgv">头像</h-view>
                    <h-view slot="end" class="mgv">
                        <h-avatar :uid="ud.uid" class="avatar"> </h-avatar>
                    </h-view>
                </h-el>
                <h-el>
                    <h-txt label>UUID</h-txt>
                    <h-txt> {{ profile?.id }}</h-txt>
                </h-el>
                <h-el>
                    <h-txt label>昵称</h-txt>
                    <h-uname class="mgr" :uid="ud.uid"></h-uname>
                </h-el>
            </h-list>
        </h-view>
        <template #foot>
            <h-btn color="danger" expand="block" @click="logout">退出</h-btn>
        </template>
    </h-page>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { useRouter } from "@/router";
import { useMeteor } from "@/common/meteor";
const router = useRouter();
const ud = reactive({
    id: "",
    name: "",
    uid: Meteor.userId(),
});
const m = useMeteor();
const profile = m.userInfo$().refRef();

const logout = () => {
    Accounts.logout();
    router.back();
};
</script>

<style scoped lang="scss"></style>
