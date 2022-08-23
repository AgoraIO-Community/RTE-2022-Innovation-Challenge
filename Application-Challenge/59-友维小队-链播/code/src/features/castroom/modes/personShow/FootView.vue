<template>
    <h-view class="bottom-zone fcol cnty">
        <h-btn
            v-if="!isCast"
            class="btn-start"
            :disabled="isCasting || !canCast"
            @click="toggleCast"
            fill="outline"
        >
            <span class="btn-txt">开始直播</span>
        </h-btn>
    </h-view>
</template>

<script lang="ts" setup>
import { useMeteor } from "@/common/meteor";
import { useCastRoomService } from "../../services";
const serv = useCastRoomService();
const sess = serv.sess.child("person-show-cast");
const m = useMeteor();
const isCast = serv.cast.isCasting$.refRef<boolean>();

const isCasting = m
    .wrapObservale$(serv.cast.state$)
    .map((v) => v.status === 2)
    .refRef();

const canCast = m.wrapObservale$(serv.ready$).refRef();

const castsess = sess.child("case");
let started = false;
const toggleCast = () => {
    if (started) {
        console.log(`uncast `);
        return castsess.run();
    }
    started = true;
    castsess.add(() => (started = false));
    castsess.add(
        serv.cast.castStream$().subscribe((v) => {
            console.error(`cast state change`, v);
        })
    );
};
</script>

<style lang="scss" scoped>
.cast-btn {
    position: absolute;
    bottom: 40px;
    width: 200px;
    margin: 0 auto;
    left: calc(50% - 100px);
}
.close-btn {
    position: absolute;
    bottom: 40px;
    left: 20px;
}
.bottom-zone {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding-bottom: 200px;
    .tip {
        margin-bottom: 36px;
        text-align: center;
        font-size: 12px;
        color: #ffffff;
        text-align: center;
        line-height: 14px;
    }
}
</style>
