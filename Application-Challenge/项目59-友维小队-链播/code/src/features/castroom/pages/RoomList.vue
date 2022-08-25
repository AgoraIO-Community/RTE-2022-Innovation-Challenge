
<script lang="ts" setup>
import { useRouter } from "@/router";
import { IonInfiniteScroll, IonInfiniteScrollContent, IonGrid, IonRow, IonCol } from "@ionic/vue"
import { computed, ref } from "vue";
import RoomCard from "../views/RoomCard.vue"
const router = useRouter()
const go = () => {
    router.to('/castroom/1')
}
const disabled = ref(false)
const data = ref(10)

const list = computed(() => {
    const rows = [] as any[]
    let col = {
        items: [] as any[],
        id: "",
        single: false
    }
    for (let i = 0; i < data.value; i++) {
        const el = {
            _id: i.toString(),
            title: "欢乐放送-",
            type: i % 4,
            desc: "一个有趣的故事" + i,
            post: {
                hoz: "/images/post-sample/post1.jpg",
                ver: "/images/post-sample/post2.jpg"
            }
        }
        col.items.push(el)
        if (i % 5 === 0) {
            col.id = i.toString()
            col.single = true;
            rows.push(col)
            col = {
                items: [],
                id: "",
                single: false
            }
            continue
        }
        if (col.items.length === 2) {
            col.id = i.toString()
            rows.push(col)
            col = {
                items: [],
                id: "",
                single: false
            }
        }
    }
    console.log(rows)
    return rows
})

const loadData = (ev: any) => {
    if (disabled.value) {
        return
    }
    console.log(ev)
    setTimeout(() => {
        data.value += 10
        disabled.value = data.value > 35
        ev.target?.complete()
    }, 1000);
}
</script>

<template>
    <h-page page-name="导演生活和欢乐" :content="{ scrollY: true }">
        <ion-grid>
            <ion-row v-for="row in list" :key="row.id">
                <ion-col v-for="el in row.items" :key="el._id">
                    <RoomCard :single="row.single" :info="el">
                    </RoomCard>
                </ion-col>
            </ion-row>
        </ion-grid>
        <h-view class="pd nomore w100p" v-if="disabled">
            <h-txt>没有更多了</h-txt>
        </h-view>
        <ion-infinite-scroll @ionInfinite="loadData($event)" threshold="100px" id="infinite-scroll"
            :disabled="disabled">
            <ion-infinite-scroll-content loading-spinner="bubbles" loading-text="发现更多中">
            </ion-infinite-scroll-content>
        </ion-infinite-scroll>
    </h-page>
</template>

<style scoped lang="scss">
.nomore{
    font-size: 12px;
    text-align: center;
}
</style>