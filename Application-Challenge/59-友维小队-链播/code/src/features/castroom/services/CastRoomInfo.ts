import { useMeteor } from "@/common/meteor";
import { updateMongoItem } from "@/common/meteor/meteor-mongo";
import { wrapObservale } from "@/common/meteor/rxjs-vue";
import { Observable, shareReplay } from "rxjs";
import { inject, provide } from "vue";
import { CastRoom, CastRoomRecord, CastRoomRecords, CastRooms } from "../deps";

export class CastRoomInfoService {
    public readonly info$: Observable<CastRoom>;
    record$: Observable<CastRoomRecord>;
    public get infoRef() {
        return wrapObservale(this.info$).refRef();
    }
    public get room() {
        let v: CastRoom | undefined;
        const s = this.info$.subscribe((e) => {
            v = e;
        });
        s.unsubscribe();
        return v;
    }
    constructor(public readonly id: string) {
        const m = useMeteor();
        this.info$ = m
            .wrapCursor$(CastRooms.find({ _id: id }))
            .map((v) => v[0])
            .unwrap();
        this.record$ = new Observable<CastRoomRecord>((suber) => {
            return m
                .subscribe$("castroom.rec.lastest", { roomId: id })
                .unwrap()
                .subscribe(() => {
                    suber.add(
                        m
                            .wrapCursor$(
                                CastRoomRecords.find(
                                    { roomId: id },
                                    { sort: { startAt: -1 } }
                                )
                            )
                            .first()
                            .subscribe((v) => {
                                suber.next(v);
                            })
                    );
                });
        });
    }
}

export const setupCastRoomInfo = (id: string, asCaster = false) => {
    const serv = asCaster
        ? new CastRoomInfoAdminService(id)
        : new CastRoomInfoService(id);
    provide("room-info", serv);
    return serv;
};

export const useCastRoomInfo = () => {
    return inject("room-info") as
        | CastRoomInfoService
        | CastRoomInfoAdminService;
};

export class CastRoomInfoAdminService extends CastRoomInfoService {
    public updateRoom(fields: Partial<CastRoom>) {
        console.log({
            id: this.id,
            $set: fields,
        });
        return updateMongoItem(
            CastRooms,
            this.id,
            { $set: fields },
            { notice: "", loading: "" }
        );
    }
}
