import { inject, provide } from "vue";
import { useRoute } from "vue-router";
import { useExecTree } from "../deps";
import { CastRoomService } from "./CastRoomService";
import { FrameReport } from "./FrameReport";

export * from "./utils";
let scr = null as any as CastRoomService;
export const setupCastRoomService = () => {
    if (scr) {
        console.warn(`wrong use setup a cast service duplicate`);
        return scr;
    }
    const route = useRoute();
    const id = route.params.id as string;
    const sess = useExecTree();
    sess.add(() => (scr = null as any));
    const serv = new CastRoomService(id, sess);
    new FrameReport(serv);
    scr = serv;
    provide("room-serv", serv);
    return serv;
};

export const useCastRoomService = () => {
    return inject("room-serv") as CastRoomService;
};
