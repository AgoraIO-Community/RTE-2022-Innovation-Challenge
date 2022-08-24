<script lang="ts" setup>
import { useMeteor } from "@/common/meteor";
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import { computed, ref } from "vue";
import { CastRooms } from "../deps";
import RoomCard from "../views/RoomCard.vue";

const m = useMeteor();
m.subscribe$("castrooms.random").refRef();
const raw = m.wrapCursor$(CastRooms.find({})).refArr();
const list = computed(() => {
    const rows = [] as any[];
    let col = {
        items: [] as any[],
        id: "",
        single: false,
    };
    for (let i = 0; i < raw.length; i++) {
        const el = {
            _id: raw[i]._id,
            title: raw[i].name,
            type: raw[i].showType,
            desc: raw[i].desc,
            post: {
                hoz: "/images/post-sample/post1.jpg",
                ver: "/images/post-sample/post2.jpg",
            },
            online: !!raw[i].session,
        };
        col.items.push(el);
        if (col.items.length === 2) {
            col.id = i.toString();
            rows.push(col);
            col = {
                items: [],
                id: "",
                single: false,
            };
        }
    }
    if (col.items.length < 2) {
        col.items.push({});
        rows.push(col);
    }
    return rows;
});
</script>

<template>
    <ion-grid v-if="list.length">
        <ion-row v-for="row in list" :key="row.id">
            <ion-col v-for="el in row.items" :key="el._id">
                <RoomCard v-if="el._id" :single="row.single" :info="el">
                </RoomCard>
            </ion-col>
        </ion-row>
    </ion-grid>
    <h-empty v-else style="height: 300px">
        <h-txt class="pd">
            现在没有直播间哦，赶紧创建一个，导演自己的故事吧~
        </h-txt>
    </h-empty>
</template>

<style scoped lang="scss">
.nomore {
    font-size: 12px;
    text-align: center;
}
</style>
