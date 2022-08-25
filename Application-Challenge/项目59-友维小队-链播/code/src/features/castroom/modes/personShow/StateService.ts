import { BehaviorSubject, map, Observable } from "rxjs";
import { ConfigServiceShared, StateService } from "../../types";

export class StateServiceSingle implements StateService {
    ready$$ = new BehaviorSubject(false);
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
