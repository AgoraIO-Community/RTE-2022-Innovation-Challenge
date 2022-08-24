import { useMeteor } from "@/common/meteor";
import { userMedia } from "@/services/localstream";
import { BehaviorSubject, map } from "rxjs";
import { ConfigServiceShared, StateService } from "../types";

export class ConfigService implements ConfigServiceShared {
    private videoSize$$ = new BehaviorSubject({
        width: 480,
        height: 640,
        pixelRatio: 1,
    });
    videoSize$ = this.videoSize$$.asObservable();
    useVideoSize() {
        const m = useMeteor();
        return m.wrapObservale$(this.videoSize$).ref();
    }
    get value() {
        return this.videoSize$$.value;
    }
    getLocalStream$() {
        return userMedia.getLocalStream$(
            this.videoSize$.pipe(
                map((v) => ({
                    video: { width: v.width, height: v.height },
                    audio: true,
                }))
            )
        );
    }
}
