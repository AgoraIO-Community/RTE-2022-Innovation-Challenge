import { EventEmitter } from "events";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import './index.less';
import { registering } from "./module/apps";
import Room, { Role, RoomRolesInfo } from "./service/room";
import { search_parse } from "./utils/common";

import Board from "./module/board";
import { FastboardAndRoom } from "./module/board/fastboardutils";
import Roles from "./module/roles";
import Toolbar from "./module/toolbar";
import Window from "./module/window";
import RoomManager from "./service/room";
import GlobalContext from "./state/Global";
import { User, UserManager } from "./users/UserManager";

export const event = new EventEmitter();
export const MyContext = React.createContext(new GlobalContext());
function App() {
  registering();
  const [options, setOptions] = useState<{ uuid: string, roomToken: string } | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userManager, setUserManager] = useState<UserManager>(new UserManager());
  const [globalContext, setGlobalContext] = useState<GlobalContext>(new GlobalContext());

  useEffect(() => {
    window.userManager = new UserManager();
    if (!/roomId/.test(window.location.search)) { // 如果没有uuid则生成一个作为房间
      Room.createRoom(Role.Admin).then((res: any) => {
        setRoomId(res.uuid);
        setOptions({
          uuid: res.uuid,
          roomToken: res.roomToken
        });
      });
      globalContext.isAdmin = true;
      setGlobalContext(globalContext);

      // window.userManager.isAdmin = true;
      // window.userManager.admin = window.userManager.currentUser;

      // userManager.isAdmin = true;
      // setUserManager(userManager);

      console.log('=====room admin======', globalContext);
    } else { // 如果有uuid则加入uuid对应的房间
      // admin or user
      console.log(`=====room players======`);
      const search_obj = search_parse();
      const uuid = search_obj['roomId'];
      const uid = search_obj['uid'];
      // 分享url，此时无uid，uid随后自动生成
      if (uid == undefined) {
        Room.joinRoom(Role.Writer, uuid).then((res: any) => {
          setOptions({
            uuid: res.uuid,
            roomToken: res.roomToken
          });
        });

      } else { // 刷新url，此时有uid
        RoomManager.queryRolesByRoomId(uuid).then((roomRolesInfos: Array<RoomRolesInfo>) => {
          console.log('===queryRolesByRoomId===', roomRolesInfos)
          roomRolesInfos.forEach((ri) => {
            console.log(`===roomRolesInfos=====${ri}`);
            if (ri.uid == uid) { // 查询到已经注册过
              let role = ri.isRoomAdmin ? Role.Admin : Role.Writer;
              Room.joinRoom(role, uuid).then((res: any) => {
                setOptions({
                  uuid: res.uuid,
                  roomToken: res.roomToken
                });
              });

              let user = globalContext.currentUser;
              if (user == undefined) {
                user = new User(ri.uid, "", "", +ri.roleId, ri.isRoomAdmin);
              }
              globalContext.currentUser = user;
              globalContext.isAdmin = ri.isRoomAdmin;
              setGlobalContext(globalContext);
              console.log(`[rte2022] currentUser: `, globalContext)
            }
          })
        })
      }
    }
  }, [])



  const queryRolesByRoomId = (roomId: string, currentUid: string) => {
    console.log(`[rte2022] queryRolesByRoomId params: ${roomId} ${currentUid}`)
    RoomManager.queryRolesByRoomId(roomId).then((roomRolesInfos: Array<RoomRolesInfo>) => {
      console.log(`[rte2022] queryRolesByRoomId result:`, roomRolesInfos, currentUid)
      roomRolesInfos.forEach((ri) => {
        console.log(`[rte2022] queryRolesByRoomId forEach`, ri)
        if (ri.uid == currentUid) {

          let user = globalContext.currentUser;
          if (user == undefined) {
            user = new User(ri.uid, "", "", +ri.roleId, ri.isRoomAdmin);
          }
          globalContext.currentUser = user;
          globalContext.isAdmin = ri.isRoomAdmin;
        }
        let user = new User(ri.uid, "", "", +ri.roleId, ri.isRoomAdmin);
        globalContext.setPlayer(user);
        setGlobalContext(globalContext);
        console.log(`[rte2022] queryRolesByRoomId setGlobalContext: `, globalContext)
      })

    })
  }


  const configRoom = (fastboardAndRoom: FastboardAndRoom) => {
    if (fastboardAndRoom && fastboardAndRoom.room) {

      // RoomManager.bindRole()
      const currentUid = fastboardAndRoom.room.uid;

      queryRolesByRoomId(fastboardAndRoom.room.uuid as string, currentUid);
      // RoomManager.queryRolesByRoomId(fastboardAndRoom.room.uuid as string).then((roomRolesInfos: Array<RoomRolesInfo>) => {
      //   console.log(`===queryRolesByRoomId===${JSON.stringify(roomRolesInfos)}, currentUid=${currentUid}`)
      //   roomRolesInfos.forEach((ri) => {

      //     if (ri.uid == currentUid) {
      //       let user = globalContext.currentUser;
      //       if (user == undefined) {
      //         user = new User(ri.uid, "", "", +ri.roleId, ri.isRoomAdmin);
      //       }
      //       globalContext.currentUser = user;
      //       globalContext.isAdmin = ri.isRoomAdmin;
      //     }
      //     let user = new User(ri.uid, "", "", +ri.roleId, ri.isRoomAdmin);
      //     globalContext.setPlayer(user);
      //     setGlobalContext(globalContext);
      //   })
      //   // console.log(`===RoomId===${JSON.stringify(globalContext)}`)

      // })

      globalContext.room = fastboardAndRoom.room;
      console.log("===globalContext====" + globalContext.room.uid);
      globalContext.fastboardApp = fastboardAndRoom.fastboardApp;

      setGlobalContext(globalContext);

      // 修改url，为 uid=xx&roomId=xxx

      let url = new URL(window.location.href);
      url.searchParams.delete("roomId");
      url.searchParams.set("roomId", fastboardAndRoom.room.uuid);
      // // url.hostname
      // console.log(`globalContext.uuid=${fastboardAndRoom.room.uuid}`);
      // let newUrl;
      // if (globalContext.isAdmin) {
      //   newUrl = `/?${url.searchParams}&admin=true`;
      // } else {
      //   newUrl = `/?${url.searchParams}`;
      // }
      history.replaceState({}, "", url);
      globalContext.room.addMagixEventListener("updateUserInfo", () => {
        console.log("[rte2022] receive updateUserInfo event");
        queryRolesByRoomId(globalContext.room?.uuid as string, globalContext.room?.uid as string);
      });

    }
  }

  return (
    <MyContext.Provider value={globalContext}>
      <div className="app">
        <Board uuid={options?.uuid} roomToken={options?.roomToken}
          updateFastboardAndRoom={configRoom}
        />
        <Roles />
        <Toolbar roomId={roomId} />
        <Window />
      </div>
    </MyContext.Provider>
  );
}

ReactDOM.render(<App />, document.getElementById("app"));

// function MyRoute() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* <Route path="/" element={<CreateOrJoinRoomPage />} /> */}
//         <Route path="/" element={<App />} />
//         {/* <Route path="/createRoom" element={<CreateOrJoinRoomPage />} /> */}
//         {/* <Route path="/room/:uuid/" element={<App />} /> */}
//         {/* <Route path="/:admin/room/:uuid" element={<App />} /> */}
//       </Routes>
//     </BrowserRouter>
//   );
// }

// window.userManager = new UserManager();
// const root = ReactDOM.createRoot(document.getElementById("app"));
// root.render(<MyRoute />);

// function useParams(): { uuid: any; } {
//   throw new Error("Function not implemented.");
// }
