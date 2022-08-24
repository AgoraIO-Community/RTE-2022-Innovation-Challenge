import clipboard from "clipboard-js";
import React, { useEffect, useState } from "react";
import { event, MyContext } from "../../index";
import Play from "../../service/play";
import { TYPES } from "../window";

import AudioIcon from "../../assets/audio.png";
import ClueIcon from "../../assets/clue.png";
import PlayIcon from "../../assets/play.png";
import RoomIcon from "../../assets/room.png";
import VoiceIcon from "../../assets/voice.png";

import GlobalContext from "../../state/Global";
import { User } from "../../users/UserManager";
import "./index.less";

export default function Toolbar(props: any) {
  const { roomId } = props;
  const [items, setItems] = useState<Array<any>>([]);
  const [plays, setPlays] = useState<any>(null);
  const [innerShowWindow, setInnerShowWindow] = useState<any>({
    show: false,
    name: "",
    id: 0
  });

  useEffect(() => {
    const plays = Play.getPlayInfo(1);
    setPlays(plays);
    setItems([
      {
        id: 0,
        icon: RoomIcon,
        showBubble: false,
        list: [
          {
            id: 0,
            name: "复制加入房间链接"
          }
        ]
      },
      {
        id: 3,
        icon: VoiceIcon,
        showBubble: false,
        list: plays.audios
      },
      {
        id: 4,
        icon: AudioIcon,
        showBubble: false,
        list: plays.videos
      },
      {
        id: 1,
        icon: PlayIcon,
        showBubble: false,
      },
      {
        id: 2,
        icon: ClueIcon,
        showBubble: false,
        list: plays.clues
      }
    ])
  }, [])

  const click = (value: GlobalContext, itemId: number) => {
    const curUser = value?.currentUser;
    const roles = Play.getPlayInfo(1).roles;

    let its = [];

    if (itemId == 0) {
      console.log(`==================`,items[0]?.list);
      let z = items[0].list[0];
      items[0].list = [];
      items[0].list.push(z);
      value.players.forEach((user: User) => {
        if (!user.isAdmin) {
          const role = roles.find((r) => {
            return r.id == user.roleId;
          })
          let a = {
            id: user.roleId,
            name: role?.name
          }

          items[0].list.push(a);
          setItems(items);
        }

      })
    }

    if (itemId === 1) {
      console.log(`[rte2022] show play, currentUser: `, value?.currentUser)
      let windowData: any = {
        show: true,
        type: TYPES.PLAY,
        data: ((plays.roles || []).filter((role: any) => role.id === curUser?.roleId))[0].play,
      }
      // 打开关闭自己的窗口
      if (innerShowWindow.id === itemId) {
        event.emit('window', {
          ...windowData,
          show: !innerShowWindow.show
        });
        setInnerShowWindow({
          show: !innerShowWindow.show,
          id: itemId
        });
      } else {
        event.emit('window', {
          ...windowData,
          show: true
        });
        setInnerShowWindow({
          show: true,
          id: itemId
        });
      }
      // 关闭其他弹窗
      its = items.map(item => {
        return {
          ...item,
          showBubble: false
        }
      })
    } else {
      event.emit('window', {
        data: [],
        type: -1,
        show: false
      });
      its = items.map(item => {
        if (itemId === item.id) {
          return {
            ...item,
            showBubble: !item.showBubble
          }
        } else {
          return {
            ...item,
            showBubble: false
          }
        }
      })
      setItems(its)
    }
  }

  const clickItem = (e: any, type: string, data: any, context: GlobalContext) => {
    // 防止事件捕获触发click调用
    e.stopPropagation();

    if (type === "media") {
      context.fastboardApp?.insertMedia("mic", data.src);
    } else {
      // 发送显示线索卡事件
      let windowData: any = {
        show: true,
        type: TYPES.CLUE,
        data: data?.data || [],
      }
      if (innerShowWindow.id === 2 && data.name === innerShowWindow.name) {
        event.emit('window', {
          ...windowData,
          isAdmin: context?.isAdmin || false,
          show: !innerShowWindow.show
        });
        setInnerShowWindow({
          show: !innerShowWindow.show,
          name: data.name,
          id: 2
        });
      } else {
        event.emit('window', {
          ...windowData,
          isAdmin: context?.isAdmin || false,
          show: true
        });
        setInnerShowWindow({
          show: true,
          name: data.name,
          id: 2
        });
      }
    }
  }

  const copyRoomLink = (context: GlobalContext, ind: number) => {
    if (ind == 0) {
      let url = new URL(window.location.href);
      url.searchParams.delete("uid");
      url.searchParams.delete("roomId");
      url.searchParams.set("roomId", context.room?.uuid as string);
      clipboard.copy(`${url}`);
      return;
    }

    items[0].list.slice(1).forEach((u) => {
      const player: User[] = context.players.filter((player) => {
        return player.roleId == u.id;
      })
      if (player.length <= 0) {
        return;
      }

      let url = new URL(window.location.href);
      url.searchParams.delete("uid");
      url.searchParams.delete("roomId");
      url.searchParams.set("roomId", context.room?.uuid as string);
      url.searchParams.set("uid", `${player[0].roomUserId}`);
      clipboard.copy(`${url}`);
    })

  }

  return (
    <div className="toolbar">
      <MyContext.Consumer>
        {
          value => {
            const list = value.isAdmin ? items : items.slice(3);
            return list.map((item, index) => {
              return (
                <div key={index}
                  className="toolbar-item"
                  style={{ background: `no-repeat center/60% url(${item.icon})` }}
                  onClick={() => click(value, item.id)}
                >
                  {
                    item.list && item.showBubble ? <div className="toolbar-item-bubble">
                      {
                        item.list.map((i: any, ind: number) => {
                          return (
                            <div key={ind} className="toolbar-item-bubble-line"
                              onClick={(e) => item.id === 0 ? copyRoomLink(value, ind) : clickItem(e, i?.src ? "media" : "clue", i, value)}>
                              {i.name}
                            </div>)
                        })
                      }
                    </div> : null
                  }
                </div>
              )
            })
          }
        }
      </MyContext.Consumer>
    </div>
  )
}