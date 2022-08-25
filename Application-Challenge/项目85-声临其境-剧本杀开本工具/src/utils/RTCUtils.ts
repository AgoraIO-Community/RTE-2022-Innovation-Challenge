import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser, IMicrophoneAudioTrack, UID } from "agora-rtc-sdk-ng";
import axios from 'axios';

/*
 * 使用姿势
 */
/*

const client = getRtcClient();
    const option: Options = {
        appid: "16cca950aca74708a9c3f1e2b7f2e655",
        channel: "rte2022",
        uid: "0",
    }
    join(client, option).then((info) => {
        console.log(`===client ===${JSON.stringify(info)}`);
    });

*/

// 一年有效期，起始时间：20220814 14:30
// export const RTC_TOKEN = "00616cca950aca74708a9c3f1e2b7f2e655IACiT5BFZ5x40VfaOuPY/QfsIrz8exoggXVcj9DO9cto2t15FHwAAAAAIgCLKlkRauj5YgQAAQDqMtNkAgDqMtNkAwDqMtNkBADqMtNk";

export interface Options {
    appid: string,
    channel: string,
    uid: UID,
    // token: string
}

export interface RTCInfo {
    options: Options;
    audioTrack?: IMicrophoneAudioTrack;
    user?: IAgoraRTCRemoteUser;
    mediaType?: "audio" | "video"
}

export function getRtcClient(): IAgoraRTCClient {
    return AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
}

export async function join(client: IAgoraRTCClient, options: Options): Promise<RTCInfo> {
    client.on("user-published", async (user, mediaType) => {
        const id = user.uid;
        console.log(`[rte2022] ===user-published===`,user)

        // Subscribe to the remote user when the SDK triggers the "user-published" event
        await client.subscribe(user, mediaType);
        console.log("subscribe success");

        // If the remote user publishes an audio track.
        if (mediaType === "audio") {
            // Get the RemoteAudioTrack object in the AgoraRTCRemoteUser object.
            // const remoteAudioTrack = user.audioTrack;
            // // Play the remote audio track.
            // remoteAudioTrack && remoteAudioTrack.play();
            user.audioTrack?.play()
        }
    });
    client.on("user-unpublished", async (user) => {
        // Unsubscribe from the tracks of the remote user.
        client.unsubscribe(user);
    });
    let rtcInfo: RTCInfo = { options };

    const token = await getRTCToken(options.channel);

    [options.uid, rtcInfo.audioTrack] = await Promise.all([
        // join the channel
        client.join(options.appid, options.channel, token || null),
        // create local tracks, using microphone and camera
        AgoraRTC.createMicrophoneAudioTrack(),
        // AgoraRTC.createCameraVideoTrack()
    ]);
    console.log(`===user-published=====${options.uid}`)

    await client.publish([rtcInfo.audioTrack]);
    console.log("publish success");
    return new Promise<RTCInfo>((resolve, reject) => {
        resolve(rtcInfo);
    })
}

export async function leave(rtcClient: IAgoraRTCClient, audioTrack: any) {
  // Destroy the local audio track.
  audioTrack.close();
  // Leave the channel.
  await rtcClient.leave();
  console.log("leave success");
}

export function getRTCToken(channelName: string) {
    return new Promise<string>((reslove, reject) => {
        axios({
            method: 'get',
            url: 'https://cwiki.cn/rtcToken',
            responseType: 'json',
            params: {
                channelName: channelName
            }
        }).then(function (response) {
            reslove(response.data.key);
        });
    });
}