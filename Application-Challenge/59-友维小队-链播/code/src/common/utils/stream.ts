import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { getLogger } from ".";

export interface deviceMap {
    audio: MediaDeviceInfo[];
    video: MediaDeviceInfo[];
    outputs: MediaDeviceInfo[];
    target?: MediaDeviceInfo;
}
const logger = getLogger("stream-util");
export const constrainSupports = (): any =>
    navigator.mediaDevices.getSupportedConstraints();

export async function getDeviceList(audio = true, video = true, check = false) {
    const md = navigator.mediaDevices;
    if (audio && check) {
        try {
            const stream = await md.getUserMedia({ audio: true });
            stream.getTracks().forEach((e) => e.stop());
        } catch (error) {
            console.error(error);
        }
    }
    if (video && check) {
        try {
            const stream = await md.getUserMedia({ video: true });
            stream.getTracks().forEach((e) => e.stop());
        } catch (error) {
            console.error(error);
        }
    }
    const list = await md.enumerateDevices();
    const result = {
        audio: [],
        video: [],
        outputs: [],
    } as deviceMap;
    result.audio = list.filter((el) => el.kind === "audioinput");
    result.video = list.filter((el) => el.kind === "videoinput");
    result.outputs = list.filter((el) => el.kind === "audiooutput");
    return result;
}
logger(constrainSupports);
export async function getLocalTrack(
    type: "audio" | "video" | "screen",
    config?: any
): Promise<{
    track?: MediaStreamTrack;
    stream?: MediaStream;
    devices?: deviceMap;
    device?: MediaDeviceInfo;
}> {
    if (type === "screen") {
        const stream = await (navigator.mediaDevices as any)?.getDisplayMedia();
        return {
            stream,
            track: stream.getVideoTracks()[0],
        };
    }

    const conf: MediaTrackConstraints = { ...config };
    const stream = await navigator.mediaDevices.getUserMedia(
        type === "audio" ? { audio: conf } : { video: conf }
    );
    const track =
        !!stream &&
        (type === "audio"
            ? stream.getAudioTracks()[0]
            : stream.getVideoTracks()[0]);
    return {
        stream,
        track,
    };
}
export function clearDummyStreams(streams: Set<MediaStream>) {
    Array.from(streams).forEach((stream) => {
        const tracks = stream.getTracks();
        tracks.forEach(
            (track) => track.readyState === "ended" && stream.removeTrack(track)
        );
        if (stream.getTracks().length === 0) streams.delete(stream);
    });
}
export function clearStream(stream: MediaStream) {
    stream.getTracks().forEach((el) => {
        stream.removeTrack(el);
        el.stop();
    });
}
export function clearStreamDummy(stream: MediaStream) {
    stream.getTracks().forEach((el) => {
        if (el.readyState !== "live") {
            stream.removeTrack(el);
            el.stop();
        }
    });
}
export function replaySubject(e: BehaviorSubject<any>) {
    e.next(e.value);
}
export const stopStream = (stream?: MediaStream) => {
    stream?.getTracks().forEach((track) => track.stop());
};

export function filterActiveTracks(tracks: MediaStreamTrack[]) {
    return tracks.filter((el) => el.readyState === "live");
}

export function replaceStreamTracks(
    stream: MediaStream,
    tracks: MediaStreamTrack[] = []
) {
    const otracks = stream.getTracks();
    const needRem = otracks.slice();
    const needAdd = [] as MediaStreamTrack[];
    logger({ otracks, tracks });
    tracks
        .filter((el) => el.readyState === "live")
        .forEach((track) => {
            const oindex = needRem.findIndex((e) => track === e);
            if (oindex > -1) {
                needRem.splice(oindex, 1);
            } else {
                needAdd.push(track);
                logger("add a track to stream--------------------------", 1);
            }
        });
    needAdd.forEach((e) => stream.addTrack(e));
    needRem.forEach((e) => stream.removeTrack(e));
    return needRem.length > 0 || needAdd.length > 0;
}
