import { Fastboard } from "@netless/fastboard-react";
import React from "react";
import { get_uid } from "../../utils/common";
import { FastboardAndRoom, useFastboard } from "./fastboardutils";
import "./index.less";

export default function Board(props: any) {

  const { updateFastboardAndRoom } = props;

  let app: FastboardAndRoom | null = null;

  if (props.uuid && props.roomToken) {
    app = useFastboard(() => ({
      sdkConfig: {
        appIdentifier: "ss4WoMf_EeqfCXcv33LmiA/izfIC88inXYJKw",
        region: "cn-hz",
      },
      joinRoom: {
        uid: get_uid(),
        uuid: props.uuid,
        roomToken: props.roomToken
      },
    }));
    if (app) {
      updateFastboardAndRoom(app);
    }
    if(app){
      window.fastboardApp = app.fastboardApp;
      window.room = app.room;
    }
   

    // if (app && app.room) {

    //   RoomManager.queryRolesByRoomId(app?.room.uuid as string).then((roomRolesInfos: Array<RoomRolesInfo>) => {
    //     console.log(`===queryRolesByRoomId===${JSON.stringify(roomRolesInfos)}`)
    //     // for(let roomRolesInfo in roomRolesInfos){
    //     //   let user = new User(roomRolesInfo.uid,"","","",roomRolesInfo.isRoomAdmin);
    //     //   window.userManager.setUser(user);

    //     // }
    //     updateRoomRolesInfoList(roomRolesInfos);
    //     // updateUserManager();
    //   })

    // }


  }

  return (
    app ? <div className="board"><Fastboard app={app.fastboardApp} /></div> : null
  );
}