import { User, UserManager } from "../users/UserManager";


/// dispatch基础方法`
// export function dispatch(event: string, playloads: {}) {
//     window.room.dispatchMagixEvent(event, playloads);
// }


/////////////// 用户信息同步 ///////////////
// export function dispatchUserInfo(user: User) {
//     console.log('====dispatchUserInfo===', user)
//     window.room.dispatchMagixEvent("userInfoEvent", user.toJson());
// }

// export function addUserInfoListener() {
//     return new Promise<User>((reslove, reject) => {
//         window.room.addMagixEventListener("userInfoEvent", (message) => {
            
//             // const user: User = message.payload;
//             const user: User = new User(message.payload.roomUserId
//                 , message.payload.userName, message.payload.rtcUserId, message.payload.isAdmin);
            
//             window.userManager.setUser(user);
//             console.log('====addUserInfoListener===', window.userManager)
//             reslove(user);
//         });
//     });
// }
////////////////////////////////////////////



/////////////// 线索相关 ///////////////
/* 使用姿势

///  给自定用户发送消息

// 注册监听
addCluesListener(window?.userManager?.currentUser).then((clueEvent: ClueEvent) => {
    console.log(`== 接收 ==${JSON.stringify(context.getRoom()?.uid)},${JSON.stringify(clueEvent)}`);
})

// 发送线索卡
const clueEvent: ClueEvent = {
    type: 0,
    roomUserId: `k4657x3u1yi`, // 接收信息的用户
    clues: []
}

console.log(`== getCurrentRoomUID ==${JSON.stringify(context.getRoom()?.uid)}`);
dispatchClues(clueEvent);
*/

// export declare interface ClueInfo {
//     clueName: string;
//     clueUrl: string;
// }

// export declare interface ClueEvent {
//     type: number; // 0分发，1召回
//     roomUserId: string;
//     clues: ClueInfo[];
// }


// export function dispatchClues(clueEvent: ClueEvent) {
//     dispatch("clueEvent", clueEvent);
// }

// export function addCluesListener(currentUser?: User | undefined) {
//     return new Promise<ClueEvent>((reslove, reject) => {
//         window.room.addMagixEventListener("clueEvent", (message) => {
//             const clueEvent: ClueEvent = message.payload;
//             if (clueEvent.roomUserId == window.appContext.getRoom()?.uid) {
//                 reslove(clueEvent);
//             }
//         });
//     });
// }
////////////////////////////////////////////


// export declare interface SoundEvent {
//   roleId: number;
//   roomUserId: string;
// }

// export function dispatchSound(soundEvent: SoundEvent) {
//   dispatch("soundEvent", soundEvent);
// }

// export function addSoundListener(currentUser: User | undefined) {
//   return new Promise<SoundEvent>((reslove, reject) => {
//       window.room.addMagixEventListener("soundEvent", (message) => {
//           const soundEvent: SoundEvent = message.payload;
//           if (soundEvent.roomUserId == window.appContext.getRoom()?.uid) {
//               reslove(soundEvent);
//           }
//       });
//   });
// }