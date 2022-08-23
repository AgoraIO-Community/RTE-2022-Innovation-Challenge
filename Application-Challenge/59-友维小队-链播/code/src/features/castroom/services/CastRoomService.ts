import {
    BehaviorSubject,
    combineLatest,
    debounceTime,
    map,
    distinctUntilChanged,
    Subject,
} from "rxjs";
import { StateService, StreamService } from "../types";
import { ModeManager } from "../ModeManager";
import { ConfigService } from "./ConfigService";
import { ExecTree } from "@/common/ExecTree";
import { CastRoomShowType } from "../deps";
import { LiveCast } from "./LiveCast";
import {
    CastRoomInfoAdminService,
    CastRoomInfoService,
    setupCastRoomInfo,
} from "./CastRoomInfo";

export class CastRoomBaseService {
    public get ready$() {
        return this.info.info$.pipe(
            debounceTime(20),
            map((v) => !!v),
            distinctUntilChanged()
        );
    }
    public info: CastRoomInfoService;
    constructor(public roomId: string, public readonly sess: ExecTree) {
        this.info = new CastRoomInfoService(roomId);
    }
}

export class CastRoomService extends CastRoomBaseService {
    private stream!: StreamService;
    public readonly config = new ConfigService();
    public readonly modeSess: ExecTree;
    public get ready$() {
        return combineLatest({
            sub: this.state.ready$$,
            inf: this.info.info$,
        }).pipe(
            debounceTime(20),
            map((v) => !!v.sub && !!v.inf),
            distinctUntilChanged()
        );
    }
    public event$$ = new Subject<{
        name: string;
        data?: any;
        sender?: string;
    }>();
    public state!: StateService;
    public roomType$ = new BehaviorSubject<CastRoomShowType | "">("");
    public readonly modeMana = new ModeManager();
    public readonly cast = new LiveCast(this);
    public info: CastRoomInfoAdminService;
    constructor(public roomId: string, public readonly sess: ExecTree) {
        super(roomId, sess);
        this.info = setupCastRoomInfo(roomId, true) as CastRoomInfoAdminService;
        this.modeSess = sess.child(`mode-spec`);
        sess.add(
            this.info.info$.subscribe((v) => {
                console.log(v);
                this.setType(v.showType);
            })
        );
        // this.setType(type);
    }
    markModeReady(r: boolean) {
        this.state.ready$$.next(r);
    }
    setType(type: any) {
        if (type === this.roomType$.value) {
            return;
        }
        console.log(`change type to ${type}`);
        this.modeSess.run({ prev: this.roomType$.value, next: type });
        this.roomType$.next(type);
        const conf = this.modeMana.getModeConfig(type);
        this.stream = new conf.stream();
        this.state = new conf.state(this.config);
    }
    captureStream$() {
        console.info(`start capture pub stream`);
        return this.stream.captureStream$(this.state.captureConfig$);
    }
    captureLocalStream$() {
        console.info(`start capture local stream`);
        return this.stream.captureLocalStream$(this.state.localStreamConf$);
    }
}
