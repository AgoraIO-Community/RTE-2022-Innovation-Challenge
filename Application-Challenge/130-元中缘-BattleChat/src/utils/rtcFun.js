// import AgoraRTC, {
//   IAgoraRTCClient, IAgoraRTCRemoteUser, MicrophoneAudioTrackInitConfig, CameraVideoTrackInitConfig,
//   IMicrophoneAudioTrack, ICameraVideoTrack, ILocalVideoTrack, ILocalAudioTrack
// } from 'agora-rtc-sdk-ng';
import AgoraRTC from 'agora-rtc-sdk-ng';
const APP_ID = '0122a03c960d4a94b6940ef9f089f6c9';
const TOKEN_TEMP = null;
// 创建音频轨道对象
async function localAudioTrack(){
  /**
   * 入参:MicrophoneAudioTrackInitConfig
   * 反参:IMicrophoneAudioTrack
   */
   return await AgoraRTC.createMicrophoneAudioTrack();
}

// 创建视频轨道对象
async function localVideoTrack(data = {}){
  return await AgoraRTC.createCameraVideoTrack(data);
}

// 同时创建麦克风音频轨道和摄像头视频轨道
async function localAudioAndVideoTrack(){
  return await AgoraRTC.createMicrophoneAndCameraTracks();
}

// 加入频道
export async function join(client, channel = '', token = TOKEN_TEMP, type = 'audio'){
  let track;
  if(type === 'all'){
    // 音频+视频
    track = await localAudioAndVideoTrack();
  } else if(type === 'video'){
    // 视频
    track = await localVideoTrack();
    track.stop();
  } else {
    // 音频
    track = await localAudioTrack();
  }
  await client.join(APP_ID, channel, token);
  await client.publish(track);
  return track;
}

export async function joinChannel(client, channel, track){
  await client.join(APP_ID, channel, TOKEN_TEMP);
  await client.publish(track);
}

// 离开频道
export async function leave(client, track){
  if (track) {
    track.stop();
    track.close();
  }
  await client?.leave();
}

// 远程用户
export function remoteUsers(client){
  return client.remoteUsers;
}

// 设置回调
export function setCallBact(client, published = (user, mediaType) => {
  if (mediaType === "video") {
    console.log("subscribe video success");
    // user.videoTrack.play("xxx");
  }
  if (mediaType === "audio") {
    console.log("subscribe audio success");
    // user.audioTrack.play();
  }
}, unpublished = (user, mediaType) => {
  console.log("unpublished success");

}, joined = (user) => {
  /**
   * IAgoraRTCRemoteUser
   * hasAudio     是否有音频
   * audioTrack   音频轨道
   * hasVideo     是否有视频
   * videoTrack   视频轨道
   * uid          用户uid
   */
  console.log("joined success");

}, left = (user, reason) => {
  // reason离线原因
    console.log("left success");
    delCallBact(client);
}){
  // 用户发布
  client.on('user-published', published);
  // 取消发布
  client.on('user-unpublished', unpublished);
  // 用户加入
  client.on('user-joined', joined);
  // 离开频道
  client.on('user-left', left);
}
// 删除回调
export function delCallBact(client, published = () => {}, unpublished = () => {}, joined = () => {}, left = () => {}){
  client.off('user-published', published);
  client.off('user-unpublished', unpublished);
  client.off('user-joined', joined);
  client.off('user-left', left);
}