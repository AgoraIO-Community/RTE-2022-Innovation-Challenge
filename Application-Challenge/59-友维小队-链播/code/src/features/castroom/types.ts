import { BehaviorSubject, Observable } from "rxjs";
import { Component } from "vue";
import { CastRoomShowType } from "./deps";
export interface MediaSourceData {
    dom?: HTMLVideoElement;
    src?: string;
    srcObject?: MediaStream;
    type: "video" | "stream" | "image";
    id: string;
    user?: {
        _id: string;
        id: number;
        avatar: string;
        name: string;
    };
}
type Constructor<T> = new () => T;
type Constructor1<T, D> = new (a: D) => T;

export interface StreamService {
    captureStream$(
        c: Observable<{
            video: {
                width: number;
                height: number;
            };
            audio: any;
        }>
    ): Observable<{ stream?: MediaStream; error?: any }>;
    captureLocalStream$(
        c: Observable<{
            video: {
                width: number;
                height: number;
            };
            audio: any;
        }>
    ): Observable<{ stream?: MediaStream; error?: any }>;
}

export interface CastService {
    start(stream: MediaStream): Observable<{ state: 0 | 1 | 2 }>;
}

export interface ConfigServiceShared {
    videoSize$: Observable<{ width: number; height: number }>;
}

export interface StateService {
    shared: ConfigServiceShared;
    ready$$: BehaviorSubject<boolean>;
    get captureConfig$(): Observable<any>;
    get localStreamConf$(): Observable<any>;
}

export interface WatchSourceProvider {
    roomId: string;
    getStream$(): Observable<MediaStream>;
}

export interface ModeConfig {
    mode: string;
    state: Constructor1<StateService, ConfigServiceShared>;
    stream: Constructor<StreamService>;
    footer?: Component;
    body?: Component;
    watcher: {
        source: Constructor1<WatchSourceProvider, string>;
    };
}
export interface StageLayoutConfig {
    videos: string[];
    mode: number;
    fillMode: 0 | 1;
}
export interface Rect {
    width: number;
    height: number;
}
export interface RectReal extends Rect {
    x: number;
    y: number;
}
export interface ImageItemConf extends RectReal {
    image: HTMLVideoElement;
}
export interface RectWithClip extends RectReal {
    clip?: RectReal;
    clipFunc?: any;
}
export interface VideoItemConf {
    groupConf: RectWithClip;
    itemConf: ImageItemConf;
    id: string;
    source: MediaSourceData;
    index: number;
}

export interface ModeContainer<T = ModeConfig> {
    getModeConfig(mode: CastRoomShowType | ""): T;
}
