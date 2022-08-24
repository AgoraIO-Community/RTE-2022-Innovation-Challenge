import { CastRoomShowType } from "./deps";
import {
    ConfigServiceShared,
    ModeConfig,
    ModeContainer,
    WatchSourceProvider,
    StateService,
    StreamService,
} from "./types";
import { personShow } from "./modes/personShow";
import { BehaviorSubject, map, Observable } from "rxjs";
import { guideShow } from "./modes/guideShow";

export class StateServiceNonce implements StateService {
    ready$$ = new BehaviorSubject(true);
    constructor(public readonly shared: ConfigServiceShared) {}
    get captureConfig$() {
        console.log(this.shared);
        return this.shared.videoSize$;
    }
    get localStreamConf$() {
        console.log(this.shared);
        return this.shared.videoSize$.pipe(
            map((el) => {
                return {
                    video: el,
                    audio: true,
                };
            })
        );
    }
}

class StreamServiceNonce implements StreamService {
    captureStream$(
        _conf$: Observable<{
            video: {
                width: number;
                height: number;
            };
            audio: any;
        }>
    ) {
        return new Observable<{ stream: MediaStream }>((suber) => {
            //
        });
    }
    captureLocalStream$(
        _conf$: Observable<{
            video: {
                width: number;
                height: number;
            };
            audio: any;
        }>
    ) {
        return new Observable<{ stream: MediaStream }>((suber) => {
            //
        });
    }
}

class WatchStreamProvider implements WatchSourceProvider {
    constructor(public readonly roomId: string) {}
    getStream$(): Observable<MediaStream> {
        return new Observable((suber) => {
            suber.next(undefined);
        });
    }
}

export class ModeManager implements ModeContainer {
    getModeConfig(mode: CastRoomShowType | ""): ModeConfig {
        if (mode === CastRoomShowType.Single) {
            return personShow;
        }
        if (mode === CastRoomShowType.Guide) {
            return guideShow;
        }
        return {
            mode,
            state: StateServiceNonce,
            stream: StreamServiceNonce,
            watcher: {
                source: WatchStreamProvider,
            },
        };
    }
}
