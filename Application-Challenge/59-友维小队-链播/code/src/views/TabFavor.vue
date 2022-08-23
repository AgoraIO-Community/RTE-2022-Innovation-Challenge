<script lang="ts" setup>
import { useMeteor } from "@/common/meteor";
import { CastRoomFavors, CastRooms } from "@/features/castroom/deps";
import RoomCard from "@/features/castroom/views/RoomCard.vue";
import { combineLatest } from "rxjs";
const m = useMeteor();

const ready = m.subscribe$("castroom.favors").refRef();

const list = m
    .wrapObservale$(
        combineLatest({
            favors: m.wrapCursor$(CastRoomFavors.find({})).unwrap(),
            rooms: m.wrapCursor$(CastRooms.find()).unwrap(),
        })
    )
    .debounce(20)
    .map((v) => {
        const fList = [] as Array<typeof info>;
        v.favors.forEach((el) => {
            const r = v.rooms.find((e) => e._id === el.roomId);
            if (r) {
                fList.push({
                    _id: r._id,
                    title: r.name,
                    type: r.showType!,
                    desc: r.desc,
                    post: {
                        hoz: "/images/post-sample/post1.jpg",
                        ver: "/images/post-sample/post2.jpg",
                    },
                    online: !!r.session,
                });
            }
        });
        return fList;
    })
    .refArr({ shallow: true });

const info = {
    _id: String(Math.random()),
    title: "欢乐放送-",
    type: 3 as any,
    desc: "一个有趣的故事" + String(Math.random()),
    post: {
        hoz: "/images/post-sample/post1.jpg",
        ver: "/images/post-sample/post2.jpg",
    },
    online: false,
};
</script>

<template>
    <h-page :content="{ scrollY: true }" page-name="我的收藏">
        <h-view class="pdh h100p" logined="">
            <template v-if="ready">
                <h-view class="fcol h100p" v-if="list.length">
                    <RoomCard
                        class="card"
                        v-for="el in list"
                        :single="true"
                        :info="el"
                        :key="el._id"
                    ></RoomCard>
                </h-view>
                <h-empty v-else>赶紧去收藏几个有趣的直播间吧</h-empty>
            </template>
            <h-skeleton :animated="true" v-else></h-skeleton>
        </h-view>
    </h-page>
</template>

<style scoped lang="scss">
.card {
    margin: 12px 0;
}
</style>
