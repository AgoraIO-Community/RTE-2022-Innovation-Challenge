import { Observable } from "rxjs";
import { WatchSourceProvider } from "../types";
import { RTCClientWatcher } from "./rtc";

export class LivingRoomSourceProvider implements WatchSourceProvider {
    constructor(public readonly roomId: string) {
        //
    }
    getStream$(): Observable<MediaStream> {
        return new Observable((suber) => {
            const rtc = new RTCClientWatcher();
            suber.add(
                rtc.join(this.roomId).subscribe((v) => {
                    console.log(v);
                })
            );
            suber.add(
                rtc.stream$.subscribe((v) => {
                    suber.next(v);
                })
            );
        });
    }
}
