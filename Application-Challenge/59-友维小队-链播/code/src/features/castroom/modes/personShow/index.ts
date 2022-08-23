import { CastRoomShowType } from "../../deps";
import { ModeConfig } from "../../types";
import { StateServiceSingle } from "./StateService";
import { StreamServiceSingle } from "./StreamService";
import { defineAsyncComponent } from "vue";
import { LivingRoomSourceProvider } from "../../services/RoomSourceProvider";
export const personShow: ModeConfig = {
    mode: CastRoomShowType.Single,
    state: StateServiceSingle,
    stream: StreamServiceSingle,
    body: defineAsyncComponent(() => import("./StageView.vue")),
    watcher: {
        source: LivingRoomSourceProvider,
    },
};
