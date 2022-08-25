<script lang="ts" setup>
import { useMeteor } from "@/common/meteor";
import { useRouter } from "@/router";
import { combineLatest, debounceTime } from "rxjs";
import { CastRooms } from "../deps";
const m = useMeteor();
const user = m.userId$;
const ready = m.isReady$().refRef();
const list = m.cursorToObservable$(CastRooms.find({}));
console.log(CastRooms);
const rooms = m
    .wrapObservale$(
        combineLatest({
            user,
            list,
        })
    )
    .debounce(10)
    .map((v) => v.list.filter((e) => e.createdBy === v.user))
    .refArr();
const jrooms = m
    .wrapObservale$(
        combineLatest({
            user,
            list,
        })
    )
    .debounce(10)
    .map((v) =>
        v.list.filter(
            (e) =>
                v.user && e.members?.includes(v.user) && e.createdBy !== v.user
        )
    )
    .refArr();
</script>

<template>
    <h-view>
        <h-list>
            <h-list-header>我创建的</h-list-header>
            <h-card v-for="r in rooms" :key="r._id">
                <h-view class="frow cnty">
                    <h-txt>{{ r.name }}</h-txt>
                    <h-view class="f1"></h-view>
                    <h-nav class="mgl" :url="'/castroom/mana/info/' + r._id">
                        <h-btn fill="outline" size="small">编辑</h-btn></h-nav
                    >
                    <h-nav btn size="small" :url="'/castroom/dir/' + r._id"
                        >开播</h-nav
                    >
                </h-view>
            </h-card>
        </h-list>
        <h-empty v-if="!rooms.length && ready">
            暂未创建房间，点击加入吧
            <slot></slot>
        </h-empty>
        <h-list>
            <h-list-header>我加入的</h-list-header>
            <h-card v-for="r in jrooms" :key="r._id">
                {{ r.name }}
            </h-card>
        </h-list>
        <h-empty v-if="!jrooms.length && ready"> 暂未加入其它的房间 </h-empty>
    </h-view>
</template>

<style scoped lang="scss">
.nomore {
    font-size: 12px;
    text-align: center;
}
</style>
