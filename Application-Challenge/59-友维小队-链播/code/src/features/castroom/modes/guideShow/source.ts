import { CastRooms } from "./../../../../../server/mcore/imports/castroom/shared";

import { useMeteor } from "@/common/meteor";
import { BehaviorSubject, Observable } from "rxjs";
import { CastRoom } from "../../deps";

export class SourceManager {
    static instance: SourceManager;
    public sources$ = new BehaviorSubject(["local", "", "", "", ""]);
    public current$ = new BehaviorSubject("");
    public picked$ = new BehaviorSubject("");
    public localStream$ = new BehaviorSubject(new MediaStream());
    static get(roomId: string) {
        if (SourceManager.instance) {
            return SourceManager.instance;
        }
        return (SourceManager.instance = new SourceManager(roomId));
    }
    private constructor(public readonly roomId: string) {
        //
    }
    public addSources(id: string[]) {
        const nlist = this.sources$.value;
        const list = id.slice();
        let changed = false;
        for (let i = 0; i < 5; i++) {
            if (!nlist[i]) {
                const el = list.shift();
                if (el && !nlist.some((e) => e === el)) {
                    nlist[i] = el;
                    changed = true;
                }
            }
        }
        changed && this.sources$.next(nlist);
    }
    public addSourceAt(id: string, index: number) {
        const nlist = this.sources$.value;
        if (nlist.some((e) => e === id || index > 4)) {
            return;
        }
        nlist[index] = id;
        this.sources$.next(nlist);
    }
    public pickOne(i: number) {
        const nlist = this.sources$.value;
        const id = nlist[i];
        if (id !== this.picked$.value) {
            this.picked$.next(id);
            console.log(`set picked ${id}`);
        }
    }
    public execPicked() {
        const id = this.picked$.value;
        if (id && id !== this.current$.value) {
            this.current$.next(id);
            console.log(`set current ${id}`);
        }
    }
}

export const roomUtils = {
    roomPrevInfo$(roomId: string) {
        return new Observable<CastRoom>((suber) => {
            const m = useMeteor();
            const t = m
                .subscribe$("castroom.preview", { roomId })
                .subscribe((v) => {
                    suber.add(
                        m
                            .wrapCursor$(CastRooms.find({ _id: roomId }))
                            .first()
                            .unwrap()
                            .subscribe((v) => {
                                suber.next(v);
                            })
                    );
                });
            return () => t();
        });
    },
};
