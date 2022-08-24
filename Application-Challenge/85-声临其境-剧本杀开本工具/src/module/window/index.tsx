import React, { useEffect, useState } from "react";
import { event } from "../../index";
import Play from "../play/play";
import "./index.less";
import { search_parse } from "../../utils/common";

export const TYPES = {
  PLAY: 1, // 剧本
  CLUE: 2, // 线索卡
}

export default function Window(props: any) {
  const [data, setData] = useState<any>(null);
  const [selectAll, setSelectAll] = useState<boolean>(false);

  useEffect(() => {
    // ----- 接收房主同步的线索卡 -----
    event.on("room", (room: any) => {
      room.addMagixEventListener("sendClues", (res: any) => {
        const { payload } = res;
        const search_obj = search_parse();
        const uid = search_obj['uid'];
        if (payload?.roomUserId !== uid) {
          setData({
            show: true,
            isAdmin: false,
            type: TYPES.CLUE,
            data: (payload?.data || [])
          })
        }
      });
    });

    // ----- 更新window显示内容 -----
    event.on("window", ((res: any) => {
      if (res?.isAdmin && res?.type === TYPES.CLUE) {
        setData({
          ...res,
          data: (res?.data || []).map((r: any) => {
            return {
              ...r,
              checked: false
            }
          })
        })
      } else if (res?.type === TYPES.PLAY) {
        setData(res);
      }
    }))
  }, [])

  /**
   * 全选所有线索
   * @param context 
   */
  const selectAllClues = () => {
    setSelectAll(!selectAll)
    if (!selectAll) {
      setData({
        ...data,
        data: (data?.data || []).map((r: any) => {
          return {
            ...r,
            checked: true
          }
        })
      })
      sendClues(data?.data || []);
    } else {
      setData({
        ...data,
        data: (data?.data || []).map((r: any) => {
          return {
            ...r,
            checked: false
          }
        })
      })
      sendClues([]);
    }
  }

  /**
   * 选中线索
   * @param context 
   */
  const chooseClue = (clue: any) => {
    if (data?.isAdmin) {
      // 设置勾选状态
      setData({
        ...data,
        data: (data?.data || []).map((r: any) => {
          if (clue.name === r.name) {
            return {
              ...r,
              checked: !r.checked
            }
          } else {
            return r
          }
        })
      })
      
      const clues = (data?.data || []).filter((c: any) => c.checked || c.name === clue.name);
      sendClues(clues);
    }
  }

  /**
   * 向玩家同步选中线索
   * @param clues 选中线索 
   */
  const sendClues = (clues: any) => {
    const search_obj = search_parse();
    const uid = search_obj['uid'];
    window.room.dispatchMagixEvent("sendClues", {
      roomUserId: uid,
      data: clues
    });
  }
  
  return (
    data?.show && data?.type ? <div className="window">
      {
        data.type === TYPES.PLAY ? <Play url={data?.data || ""} /> : <div>
          {
            data?.isAdmin ? 
              <>
                <span className={`check-box ${selectAll ? 'check-box-checked' : ''}`} onClick={() => selectAllClues()}></span>
                <span>全选</span>
              </> : null
          }
          {
            (data?.data || []).map((item: any, index: number) => {
              return (
                <div key={index}>
                  <img className="clue" src={item.src} />
                  <div className="info">
                    {
                      data?.isAdmin ? <span className={`check-box ${item.checked ? 'check-box-checked' : ''}`} onClick={() => chooseClue(item)}></span> : null
                    }
                    <span>{item.name}</span>
                  </div>
                </div>
              )
            })
          }
        </div>
      }
    </div> : null
  )
}