import { IAgoraRTCClient, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import React, { useCallback, useEffect, useState } from "react";
import Play from "../../service/play";
import { getRtcClient, join, leave, Options } from "../../utils/RTCUtils";
import { search_parse } from "../../utils/common";
import { event, MyContext } from "../../index";
import "./index.less";

const APP_ID = "16cca950aca74708a9c3f1e2b7f2e655";
const CHANNEL_NAME = "rte2022";
let audioTrack: IMicrophoneAudioTrack | null | undefined = null;
let isTalk: boolean = false;

import RoomManager from "../../service/room";
import GlobalContext from "../../state/Global";

export default function Roles(props: any) {
  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState<number | null>(null);

  useEffect(() => {
    // ----- 初始化 roles -----
    const res = Play.getPlayInfo(1)
    const rs = (res?.roles || []).map((r: any) => {
      return {
        ...r,
        choosed: false,
      }
    })
    setRoles(rs as [])

    // ----- 更新角色选中信息 -----
    event.on("room", (room: any) => {
      room.addMagixEventListener("updateRoles", (res: any) => {
        const { payload } = res;
        console.log("updateRoles ========= ", payload)

        const search_obj = search_parse();
        const uid = search_obj['uid'];
        if (payload?.roomUserId !== uid && payload?.data) {
          setRoles(payload?.data)
        }
      });
    });
  }, [])

  const itemClick = (rtcClient: IAgoraRTCClient, id: number, context: GlobalContext) => {
    // ----- 可操作用户校验 -----
    const curUser = context?.currentUser;
    if (!curUser?.roleId) {
      setRoleId(id);
    } else {
      setRoleId(curUser?.roleId);
      if (curUser?.roleId && curUser?.roleId !== id) {
        console.error("你已经选择角色，不可再操作其他角色！")
        return;
      }
    }

    if (roleId && id !== roleId) {
      console.error("这不是你所选的角色，不能操作!")
      return;
    }

    // ----- 更改用户选中状态，并通过 RTC Client 加入或离开通信通道 -----
    const rs = roles.map((r: any) => {
      const option: Options = {
        appid: APP_ID,
        channel: context.room?.uuid || CHANNEL_NAME,
        uid: "0",
      }
      if (r.id === id) {
        if (r.choosed) {
          leave(rtcClient, audioTrack);
        } else {
          join(rtcClient, option).then((info) => {
            audioTrack = info.audioTrack;
          });
          console.log("[rte2022] ===RoomManager===", context, context?.currentUser)
          RoomManager.bindRole(context.room?.uid as string, `${id}`, context.room?.uuid as string, context.isAdmin ? "1" : "0").then((response) => {
            console.log('[rte2022] RoomManager bindRole result: ', response);
          }).finally(()=>{
            console.log('[rte2022] RoomManager bindRole updateUserInfo ');
            context?.room?.dispatchMagixEvent("updateUserInfo",{});
          });
        }
        return {
          ...r,
          choosed: !r.choosed
        }
      } else {
        return r
      }
    })
    setRoles(rs as []);

    const search_obj = search_parse();
    const uid = search_obj['uid'];
    window.room.dispatchMagixEvent("updateRoles", {
      roomUserId: uid,
      data: rs
    });
  }

  /**
   * 渲染用户节点
   */
  const renderRoles = useCallback((context: any) => {
    const items: JSX.Element[] = [];
    const rtcClient = getRtcClient();
    roles.forEach((role: any) => {
      items.push(
        <div key={role.uid}
          className={`role-item ${role.choosed ? 'role-item-choosed' : 'role-item-not-choosed'} ${role.choosed && isTalk ? 'sound-wave' : ''} ${role.id === context?.currentUser?.roleId ? "is-my-role" : "" }`}
          style={{ backgroundImage: "url('" + role.image + "')" }}
          onClick={() => itemClick(rtcClient, +role.id, context)}>
        </div>
      );
    })

    return items;
  }, [roles]);

  return (
    <div className="roles">
      <MyContext.Consumer>
        {
          value => {
            console.log("[rte2022] role page context value: ", value)
            return renderRoles(value)
          }
        }
      </MyContext.Consumer>
    </div>
  )
}