import { CastRoomShowType } from "../../deps";
import { ModeConfig } from "../../types";
import { StateServiceGuideShow } from "./StateService";
import { StreamServiceSingle } from "./StreamService";
import { defineAsyncComponent } from "vue";
import { LivingRoomSourceProvider } from "../../services/RoomSourceProvider";

export const guideShow: ModeConfig = {
    mode: CastRoomShowType.Guide,
    state: StateServiceGuideShow,
    stream: StreamServiceSingle,
    footer: defineAsyncComponent(() => import("./FootView.vue")),
    body: defineAsyncComponent(() => import("./StageView.vue")),
    watcher: {
        source: LivingRoomSourceProvider,
    },
};
