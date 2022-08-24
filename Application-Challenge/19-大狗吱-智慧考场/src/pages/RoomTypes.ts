import { ChatMessages } from '@/components/ChatWrap';
import { OnChangePapers, PAPER_DATA } from '@/components/PaperWrap/types';
import { HtmlPaperProps } from '@/components/PuzzleLibs/components/htmlPaper';
import { UserRole } from '@/utils';
import { SDK } from '@hongtangyun/rooms-sdk';
import {
  RoomUserType,
  RtcInfoType,
} from '@hongtangyun/rooms-sdk/dist/common/Classes';

/**
 * 状态
 * [1] 文档型试卷
 * [2] 在线型试卷
 * [3] url型试卷
 * [4] wps型试卷
 */
export enum PaperType {
  'PDF' = 1,
  '在线编辑' = 2,
  '网页' = 3,
  'wps文档' = 4,
}

export enum SendPapersType {
  '指定下发' = '指定下发',
  '随机下发' = '随机下发',
  '学生选取' = '学生选取',
  '取消下发' = '取消下发',
  '自定义下发' = '自定义下发',
  '已下发列表' = '已下发列表',
}

export type SendPaperListItem = {
  id: string;
  name: string;
  questionNum: number;
};

export type UserItem = RoomUserType & {
  /**
   * 是否签到
   */
  attendanceStatus?: boolean;
  /**
   * 第几页
   */
  pageNumber?: number;
};
/**
 * 房间状态
 */
export enum RoomStatus {
  '未开始' = '未开始',
  '进行中' = '进行中',
  '已结束' = '已结束',
  '未知' = '未知',
  '异常' = '异常',
}

/**
 * 考生用户详情
 */
export type StudentInfoType = {
  id: number;
  /**
   * 学号
   */
  studentNo: number;
  /**
   * 学校
   */
  school: string;
  /**
   * 简历url
   */
  resumeUrl: string;
  /**
   * 手机号
   */
  phone: string;
  /**
   * 届别
   */
  period: number;
  /**
   * 学生姓名
   */
  name: string;
  /**
   * 专业
   */
  major: string;
  /**
   * 学历
   */
  level: string;
  /**
   * 是否有异常
   */
  isAbnormal: string;
  /**
   * 性别
   */
  gender: string;
  /**
   * 人脸识别url
   */
  faceUrl: string;
  /**
   * 人脸识别状态
   */
  faceState: number;
  /**
   * 邮箱
   */
  email: string;
  /**
   * 学院
   */
  college: string;
  /**
   * 出勤状态
   */
  attendanceStatus: number;
};

export interface PageProps {
  /**
   * 返回url
   */
  backUrl: string | undefined;
  /**
   * 是否又机位
   */
  isDualCamera: boolean;
  /**
   * 当前用户角色
   */
  userRole: UserRole;
  /**
   * 二机位二维码
   */
  qrCode?: string;
  /**
   * 房间id
   */
  roomid: string;
  /**
   * 房间基础休息
   */
  roomInfo: SDK['roomData'];
  /**
   * 当前用户信息
   */
  userInfo: SDK['roomData']['userInfo'];
  /**
   * 当前房间用户列表
   */
  users: Array<UserItem>;
  /**
   * 考场开始时间
   */
  startTime: number;
  /**
   * 考场结束时间
   */
  endTime: number;
  /**
   * 聊天组件props
   */
  chatProps: {
    unreadNumber?: number;
    messages: ChatMessages[];
    user: ChatMessages['user'];
    users: Array<{ id: number; name: string }>;
    onSend?: (msg: ChatMessages, to: Array<number>) => void;
    // 回调查看时间
    onRead?: (time: number) => void;
  };
  attendanceProps: {
    /**
     * 出勤 人数 对像
     * key 学生id
     * value 是否出勤
     */
    attendanceObj: { [key: string]: boolean };
    onRefresh: () => void;
  };

  /**
   * 学生举手 人数 对像
   * key 学生id
   * value 是否举手
   */
  handObj: { [key: string]: boolean } | undefined;
  /**
   * 举手回调
   */
  onHand: (isHand: boolean) => void;
  /**
   * 刷新房间最新数据
   */
  onRefreshRoomInfo: () => void;
  /**
   * 开启对话
   */
  privateChat: {
    userid: number | undefined;
    teacherid: number | undefined;
    onChange: (userid: number) => void;
  };
  /**
   * 试卷相关props
   */
  paperProps: {
    /**
     * 提前试卷限制时间
     */
    submitLimit?: number;
    /**
     * 获取试卷
     */
    onGetPapers: () => Promise<PAPER_DATA>;
    /**
     * 试卷变化回调
     */
    onChangePapers: OnChangePapers;
    /**
     * 下发试卷
     */
    onSendPapers: () => Promise<any>;
    /**
     * 定时获取最新数据
     */
    timingConfig?: HtmlPaperProps['timingConfig'];
  };

  /**
   * 异常对象
   */
  abnormalProps: {
    /**
     * 用户 异常 对象
     * key 用户id
     * value 是否有异常
     */
    userObj: {
      [key: string]:
        | {
            info: any;
          }
        | boolean;
    };
    abnormalCnt: number;
    onChange: (uid: any) => void;
    onGetAbnormal: (query: {
      roomid: string | number;
      userid?: string | number;
      page?: number;
      pageSize?: number;
    }) => Promise<{
      current: number;
      list: Array<{}>;
      total: number;
      totalPage?: number;
    }>;
    onClose: () => Promise<any>;
  };

  /**
   * 静音对象
   */
  muteAudioProps: {
    /**
     * 用户 异常 对象
     * key 用户id
     * value 是否静音
     */
    userObj: {
      [key: string]: boolean;
    };
    onChange: (data: { [key: string]: boolean }) => void;
  };

  /**
   * 用户详情
   */
  userDetailsProps: {
    /**
     * 用户 异常 对象
     * key 用户id
     * value 是否静音
     */
    userObj: {
      [key: string]: Array<{ name: string; value: string }>;
    };
    onGetDetailsInfo: (uid: number) => any;
  };

  /**
   * 用户人脸识别详情
   */
  userFaceProps: {
    /**
     * 是否启用人脸功能
     */
    isEnable: boolean;
    /**
     * 用户 异常 对象
     * key 用户id
     * value 详情
     */
    userObj: {
      [key: string]: Array<{ isOk: boolean; url: string }>;
    };
    onGetFaceInfo: (uid: number) => any;
  };

  roomStatusProps: {
    status: RoomStatus;
    onChagne: (status: RoomStatus) => void;
  };
  /**
   * 默认房间rtc信息
   */
  defaultRtcInfo?: RtcInfoType;
  /**
   * 获取自定webRTC info
   * roomid: 自定房间名称
   */
  getWebRTCInfo: (roomid: string) => Promise<RtcInfoType>;
}
