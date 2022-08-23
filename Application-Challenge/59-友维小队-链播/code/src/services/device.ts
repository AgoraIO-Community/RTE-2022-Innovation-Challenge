import {
    BehaviorSubject,
    debounceTime,
    distinctUntilChanged,
    filter,
} from "rxjs";
export interface deviceMap {
    audio: MediaDeviceInfo[];
    video: MediaDeviceInfo[];
    outputs: MediaDeviceInfo[];
    target?: MediaDeviceInfo;
}
class DeviceService {
    private device$$ = new BehaviorSubject<deviceMap>(null as any);
    private inited = false;
    constructor() {
        try {
            navigator.mediaDevices.ondevicechange = () => {
                this.updateList();
            };
        } catch (error) {
            console.error(error);
        }
    }
    public get devices$() {
        if (!this.inited) {
            this.updateList();
            this.inited = true;
        }
        return this.device$$.pipe(
            filter((e) => !!e),
            distinctUntilChanged(
                (p, c) => JSON.stringify(p) === JSON.stringify(c)
            ),
            debounceTime(20)
        );
    }
    async updateList(checkStream = false) {
        const md = navigator.mediaDevices;
        const list = await md.enumerateDevices();
        const result = {
            audio: [],
            video: [],
            outputs: [],
        } as deviceMap;
        if (checkStream) {
            try {
                const stream = await md.getUserMedia({ audio: true });
                stream.getTracks().forEach((e) => e.stop());
            } catch (error) {
                console.error(error);
            }
        }
        result.audio = list.filter((el) => el.kind === "audioinput");
        if (checkStream) {
            try {
                const stream = await md.getUserMedia({ video: true });
                stream.getTracks().forEach((e) => e.stop());
            } catch (error) {
                console.error(error);
            }
        }
        result.video = list.filter((el) => el.kind === "videoinput");
        result.outputs = list.filter((el) => el.kind === "audiooutput");
        this.device$$.next(result);
    }
}
export const device = new DeviceService();
