import { userMedia } from "@/services/localstream";
import { Observable, } from "rxjs";
import { StreamService } from "../../types";

export class StreamServiceSingle implements StreamService {
    captureLocalStream$(
        conf$: Observable<{
            video: {
                width: number;
                height: number;
            };
            audio: any;
        }>
    ) {
        return new Observable<{ stream?: MediaStream, error?: any }>((suber) => {
            return userMedia
                .getLocalStream$(conf$)
                .subscribe((v) => suber.next(v));
        });
    }
    captureStream$(c: Observable<{ video: { width: number; height: number; }; audio: any; }>) {
        return this.captureLocalStream$(c)
    }
}
