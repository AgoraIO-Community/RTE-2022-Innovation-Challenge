import { BehaviorSubject, map, Observable } from "rxjs";
import { ConfigServiceShared, StateService } from "../../types";

export class StateServiceGuideShow implements StateService {
    ready$$ = new BehaviorSubject(true);
    constructor(public readonly shared: ConfigServiceShared) {}
    get localStreamConf$(): Observable<any> {
        return this.captureConfig$;
    }
    get captureConfig$() {
        return this.shared.videoSize$.pipe(
            map((v) => ({
                video: { width: v.width, height: v.height },
                audio: true,
            }))
        );
    }
}
