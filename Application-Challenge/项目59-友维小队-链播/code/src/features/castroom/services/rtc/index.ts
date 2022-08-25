import { rest } from "@/common/api";
import { clearStream, replaySubject } from "@/common/utils/stream";
import { sharedStorage } from "@/services/storage";
import AgoraRTC, { IAgoraRTCClient, ILocalTrack } from "agora-rtc-sdk-ng";
import {
    BehaviorSubject,
    filter,
    firstValueFrom,
    map,
    Observable,
    Subscriber,
} from "rxjs";

export class RTCClientMine {
    private client!: IAgoraRTCClient;
    userId: string;
    state$$ = new BehaviorSubject({
        status: "idle" as
            | "idle"
            | "joining"
            | "joined"
            | "publishing"
            | "published"
            | "leaving",
    });
    public uid: any;
    get conn() {
        return (this.client as any)._p2pChannel?.connection
            ?.peerConnection as RTCPeerConnection;
    }
    isJoined() {
        return ["joined", "publishing", "published"].includes(
            this.state$$.value.status
        );
    }
    constructor(
        public readonly channel: string,
        public readonly mode: "live" | "rtc" = "live"
    ) {
        this.userId = Meteor.userId()!;
    }
    private async prepare() {
        try {
            if (!this.client) {
                this.client = AgoraRTC.createClient({
                    mode: this.mode,
                    codec: "vp8",
                });
            }
            if (this.state$$.value.status === "joining") {
                await firstValueFrom(
                    this.state$$.pipe(
                        map((v) => v.status !== "joining"),
                        filter((v) => !!v)
                    )
                );
            }
            if (this.isJoined()) {
                return;
            }
            this.state$$.next({ status: "joining" });
            const channel = this.channel;
            const cacheKey = `agora-rtc-pub-${channel}`;
            const cached = await sharedStorage.get(cacheKey);
            let token = "";
            let appId = "";
            let uid = 0;
            if (cached?.token && cached.expires > Date.now() + 300000) {
                token = cached.token;
                appId = cached.appId;
                uid = cached.uid;
                console.info(`reuse token`);
            } else {
                console.warn(`request new token`, { cached });
                const res = await rest.sequence("auth", "agora", "pub", {
                    query: { channel },
                });
                console.error(res.json());
                token = res.get("token");
                appId = res.get("appId");
                uid = res.get("uid");
                await sharedStorage.set(cacheKey, {
                    token,
                    expires: res.get("expireBefore"),
                    appId,
                    uid,
                });
            }
            const user = await this.client.join(appId, channel, token, uid);
            if (this.mode === "live") {
                await this.client.setClientRole("host");
            }
            this.uid = user;
            this.state$$.next({ status: "joined" });
            console.log({ uid, cached, token, appId });
        } catch (error) {
            this.state$$.next({ status: "idle" });
        }
    }
    private tracks = [] as ILocalTrack[];
    async publishStream(stream: MediaStream, conf?: { bitrateMin: number }) {
        await this.prepare();
        this.state$$.next({ status: "publishing" });
        const at = stream.getAudioTracks()[0];
        const tracks = [] as ILocalTrack[];
        if (at) {
            const audio = AgoraRTC.createCustomAudioTrack({
                mediaStreamTrack: at,
            });
            tracks.push(audio);
        }
        const vt = stream.getVideoTracks()[0];
        if (vt && !this.tracks.some((el) => el.trackMediaType === "video")) {
            const video = AgoraRTC.createCustomVideoTrack({
                mediaStreamTrack: vt,
                bitrateMin: conf?.bitrateMin ?? 1,
            });
            tracks.push(video);
        }
        if (tracks.length) {
            await this.client.publish(tracks as any);
            tracks.forEach((t) => this.tracks.push(t));
            this.state$$.next({ status: "published" });
        }
        return tracks;
    }
    async unpublish(tracks?: ILocalTrack[]) {
        await this.client.unpublish(tracks);
        await this.client.leave();
        this.tracks.splice(0);
        this.state$$.next({ status: "idle" });
        return;
    }
    async replaceTracks(tracks: MediaStreamTrack[]) {
        const videoTrack = tracks.find((el) => el.kind === "video");
        const audioTacks = tracks.filter((el) => el.kind === "audio");
        let vidHandle = false;
        if (this.conn) {
            const senders = this.conn.getSenders();
            if (videoTrack) {
                for (const sender of senders) {
                    if (sender.track?.kind === "video") {
                        sender.replaceTrack(videoTrack);
                        vidHandle = true;
                        console.info(`use native replace`);
                    }
                }
            }
        }
        const nr = this.tracks.filter((el) =>
            !this.conn ? true : el.trackMediaType === "audio"
        );
        const np = [] as MediaStreamTrack[];
        const stays = [] as ILocalTrack[];
        tracks
            .filter((el) => (!this.conn ? true : el.kind === "audio"))
            .forEach((t) => {
                const ei = nr.findIndex((e) => e.getMediaStreamTrack() === t);
                if (ei > -1) {
                    stays.push(nr[ei]);
                    nr.splice(ei, 1);
                } else {
                    np.push(t);
                }
            });
        if (nr.length) {
            await this.client.unpublish(nr);
        }
        console.log({ nr, np, o: this.tracks });
        const pp = [] as ILocalTrack[];
        for (const track of np) {
            if (
                track.kind === "video" &&
                !stays.some((e) => e.trackMediaType === "video")
            ) {
                const video = AgoraRTC.createCustomVideoTrack({
                    mediaStreamTrack: track,
                });
                pp.push(video);
            }
            if (track.kind === "audio") {
                const audio = AgoraRTC.createCustomAudioTrack({
                    mediaStreamTrack: track,
                });
                pp.push(audio);
            }
        }
        pp.length && (await this.client.publish(pp));
        this.tracks = this.tracks.filter((e) => !nr.includes(e)).concat(pp);
        return;
    }
}

export class RTCClientWatcher {
    private client!: IAgoraRTCClient;
    userId: string;
    channel?: string;
    state$$ = new BehaviorSubject({
        status: "idle" as "idle" | "joining" | "joined" | "leaving",
    });
    public uid: any;
    isJoined() {
        return ["joined"].includes(this.state$$.value.status);
    }
    constructor() {
        this.userId = Meteor.userId()!;
    }
    public readonly stream$ = new BehaviorSubject<MediaStream>(
        new MediaStream()
    );
    private async prepare(
        channel: string,
        suber: Subscriber<{ stream?: MediaStream }>
    ) {
        try {
            if (!this.client) {
                this.client = AgoraRTC.createClient({
                    mode: "live",
                    codec: "vp8",
                });
                this.client.setClientRole("audience");
                this.client.on("user-published", async (user, mediaType) => {
                    await this.client.subscribe(user, mediaType);
                    const stream = this.stream$.value;
                    if (mediaType === "video" && user.videoTrack) {
                        stream.addTrack(user.videoTrack.getMediaStreamTrack());
                    }
                    if (mediaType === "audio" && user.audioTrack) {
                        stream.addTrack(user.audioTrack.getMediaStreamTrack());
                    }
                    replaySubject(this.stream$);
                });
                this.client.on("user-unpublished", async (user, mediaType) => {
                    const stream = this.stream$.value;
                    if (mediaType === "video" && user.videoTrack) {
                        stream.getVideoTracks().forEach((e) => {
                            stream.removeTrack(e);
                        });
                    }
                    if (mediaType === "audio" && user.audioTrack) {
                        stream.getAudioTracks().forEach((e) => {
                            stream.removeTrack(e);
                        });
                    }
                    await this.client.unsubscribe(user, mediaType);
                    replaySubject(this.stream$);
                });
            }
            if (this.state$$.value.status === "joining") {
                await firstValueFrom(
                    this.state$$.pipe(
                        map((v) => v.status !== "joining"),
                        filter((v) => !!v)
                    )
                );
            }
            if (this.isJoined()) {
                return;
            }
            this.state$$.next({ status: "joining" });
            const cacheKey = `agora-rtc-watch-${channel}`;
            const cached = await sharedStorage.get(cacheKey);
            let token = "";
            let appId = "";
            let uid = 0;
            if (cached?.token && (cached?.expires ?? 0) > Date.now() + 300000) {
                token = cached.token;
                appId = cached.appId;
                uid = cached.uid;
                console.log("reuse token - sub");
            } else {
                console.log("request new  token - sub");
                const res = await rest.sequence("auth", "agora", "watch", {
                    query: { channel },
                });
                console.error(res.json());
                token = res.get("token");
                appId = res.get("appId");
                uid = res.get("uid");
                await sharedStorage.set(cacheKey, {
                    token,
                    expires: res.get("expireBefore"),
                    appId,
                    uid,
                });
            }
            if (suber.closed) {
                return;
            }
            const user = await this.client.join(appId, channel, token, uid);
            if (suber.closed) {
                this.client.leave();
                return;
            }
            this.uid = user;
            this.state$$.next({ status: "joined" });
            console.log({ uid, cached, token, appId });
            return true;
        } catch (error) {
            console.error(error);
            this.state$$.next({ status: "idle" });
        }
    }
    join(roomId: string) {
        return new Observable((suber) => {
            let link: any;
            console.log(`start join watchingggg`);
            this.prepare(roomId, suber).then((v) => {
                if (v) {
                    rest.sequence("castroom", "watch", {
                        query: { roomId },
                    }).then((r) => {
                        link = r.getLink();
                        if (suber.closed) {
                            rest.useLink(link);
                        }
                    });
                }
            });
            return () => {
                this.state$$.next({ status: "idle" });
                this.client.leave();
                link && rest.useLink(link);
                clearStream(this.stream$.value);
                replaySubject(this.stream$);
            };
        });
    }
}
