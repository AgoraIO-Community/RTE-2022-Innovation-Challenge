<script lang="ts" setup>
import { ref } from "vue";
import { useApi } from "../deps";
import { useEaseMob } from "../service/easemob";

const key = ref("");
const api = useApi();
const link = api.extractLink();

const signal = api.buildStreamSignil();
const d = api
    .streamQueryLink(signal)
    .map((v) => ({
        list: (v.data?.json()?.list ?? []) as Meteor.User[],
        error: v.error,
    }))
    .tap(console.error)
    .ref();
const search = () => {
    if (!key.value) {
        return;
    }
    signal.next({
        query: {
            key: key.value,
        },
    });
};
const { requestRelation } = useEaseMob();
const addContact = (u: { profile?: { id: string } }) => {
    u.profile?.id && requestRelation(u.profile.id);
};
</script>
<template>
    <h-page page-name="用户搜索">
        <h-el>
            <h-txt label>关键字</h-txt>
            <h-input placeholder="请输入关键字" v-model="key"></h-input>
        </h-el>
        <h-error v-if="d.error"></h-error>
        <h-view class="pdv"></h-view>
        <h-list>
            <h-list-header>
                <h4>搜索结果</h4>
            </h-list-header>
            <h-el v-for="u in d.list" :key="u._id">
                {{ u.profile.name }}
                <h-btn size="small" slot="end" @click="addContact(u)"
                    >加为好友</h-btn
                >
            </h-el>
        </h-list>
        <template #foot>
            <h-btn expand="block" @click="search">搜索</h-btn>
        </template>
    </h-page>
</template>

<style scoped></style>
