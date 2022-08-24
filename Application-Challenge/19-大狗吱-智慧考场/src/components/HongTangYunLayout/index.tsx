import React, { useEffect, useState } from 'react';
import urlParse from 'url-parse';
import { history, useLocation, useModel } from 'umi';
import {
  Button,
  Layout,
  Result,
  Space,
  Spin,
  Select,
  Modal,
  notification,
  message,
  ConfigProvider,
} from 'antd';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';
import { useWindowSize, useDebounce } from 'react-use';
import { useImmer } from 'use-immer';
import { ErrorBoundary } from 'react-error-boundary';
import QRCode from 'qrcode';
import styles from './styles.less';

import sdk, { MasterPropsType, SDK } from '@hongtangyun/rooms-sdk';
import classNames from 'classnames';
import * as AppTempConfig from '@/AppTempConfig';
import {
  ErrTip,
  getUsersGroup,
  Layout_enum,
  reloadClearCache,
  UserRole,
} from '@/utils';
import Countdown, { zeroPad } from 'react-countdown';
import {
  RoomActionsItem,
  RtcInfoType,
} from '@hongtangyun/rooms-sdk/dist/common/Classes';
import {
  ActionsEnum,
  SystemActions,
  ToSystemEnum,
} from '@hongtangyun/rooms-sdk/dist/socket/types';

console.log(ActionsEnum);

import {
  ChangePapersEvent,
  OnChangePapers,
  PAPER_DATA,
  TypeEnum,
} from '@/components/PaperWrap/types';
import lodash from 'lodash';
import {
  PageProps,
  PaperType,
  RoomStatus,
  SendPapersType,
} from '@/pages/RoomTypes';
import moment from 'moment';
import { useDebounceFn } from 'ahooks';
import { globalFun } from '../GlobalLoading';

export enum CUSTOM_SOCKET_ENVET {
  /**
   * 举手事件
   */
  'CUSTOM_HAND_EVENT' = 'CUSTOM_HAND_EVENT',
  /**
   * 打开对话
   */
  'CUSTOM_PRIVATE_CHAT' = 'CUSTOM_PRIVATE_CHAT',
  /**
   * 禁播放音频
   */
  'CUSTOM_MUTE_AUDIO' = 'CUSTOM_MUTE_AUDIO',
  /**
   * 异常情况
   */
  'CUSTOM_ABNORMAL' = 'CUSTOM_ABNORMAL',
  /**
   * 下发试卷
   */
  'CUSTOM_GIVE_PAPER' = 'CUSTOM_GIVE_PAPER',
  /**
   * 取消试卷
   */
  'CUSTOM_UNGIVE_PAPER' = 'CUSTOM_UNGIVE_PAPER',
}

function MainLayout(props: any) {
  const masterProps = useModel('@@qiankunStateFromMaster')
    ?.masterProps as MasterPropsType;
  console.log('masterProps: ', masterProps);
  const [pageProps, setPageProps] = useImmer<PageProps | undefined>(undefined);

  const { children } = props;
  const dispatch = useDispatch();
  const { width, height } = useWindowSize();
  const [loading, setLoading] = useState(true);
  /**
   * 房间信息
   */
  const [tempConfig, setTempConfig] = useImmer<
    AppTempConfig.TempConfig | undefined
  >(undefined);
  const [roomInfo, setRoomInfo] = useImmer<SDK['roomData'] | undefined>(
    undefined,
  );
  const [defaultRtcInfo, setDefaultRtcInfo] = useImmer<RtcInfoType | undefined>(
    undefined,
  );
  const [userRole, setUserRole] = useState<UserRole>();
  const [customUserRoomid, setCustomUserRoomid] = useState<string>();
  const [socket, setSocket] = useImmer<SDK['socket'] | undefined>(undefined);
  const [qrCode, setQrCode] = useState<string>();
  const [userInfo, setUserInfo] = useImmer<
    SDK['roomData']['userInfo'] | undefined
  >(undefined);
  const [startTime, setStartTime] = useState<number>();
  const [endTime, setEndTime] = useState<number>();
  const [isDualCamera, setIsDualCamera] = useState<boolean>(false);
  const [handObj, setHandObj] = useState<{ [key: string]: boolean }>();
  const [users, setUsers] = useImmer<PageProps['users'] | undefined>(undefined);
  const [privateChatUid, setPrivateChatUid] = useState<number>();
  const [privateChatTUid, setPrivateChatTUid] = useState<number>();
  const [roomStatus, setRoomStatus] = useState<RoomStatus>();
  const [backUrl, setBackUrl] = useState<string>();
  const [paperList, setPaperList] = useState();
  /**
   * 签到
   */
  const [attendanceObj, setAttendanceObj] = useImmer<
    PageProps['attendanceProps']['attendanceObj']
  >({});

  const [muteAudioObj, setMuteAudioObj] = useImmer<
    PageProps['muteAudioProps']['userObj']
  >({});

  const [userDetailsObj, setUserDetailsObj] = useImmer<
    PageProps['userDetailsProps']['userObj']
  >({});

  const [userFaceObj, setUserFaceObj] = useImmer<
    PageProps['userFaceProps']['userObj']
  >({});

  const [abnormalObj, setAbnormalObj] = useImmer<
    PageProps['abnormalProps']['userObj']
  >({});

  const [customPapers, setCustomPapers] = useState<
    Array<{ name: string; type: 'URL' | 'PDF'; url: string }>
  >([]);

  const [chatProps, setChatProps] = useImmer<PageProps['chatProps']>({
    unreadNumber: 0,
    messages: [],
    user: {
      id: -1,
      name: '',
    },
    users: [],
    onSend: () => {},
    onRead: () => {},
  });

  const [abnormalCnt, setAbnormalCnt] = useState<number>(0);

  const [msgReadTime, setMsgReadTime] = useState<number>(0);

  useDebounce(
    () => {
      onGetPapers();
    },
    600,
    [customPapers],
  );

  const init = async () => {
    try {
      setLoading(true);
      const url = urlParse(window.location.href, true);
      console.log(url);
      const urlToken = url?.query?.token;
      const _backUrl = url?.query?._backUrl;
      if (_backUrl) {
        setBackUrl(_backUrl);
      }
      dispatch({
        type: 'global/saveToken',
        token: urlToken ?? undefined,
      });
      if (urlToken) {
        await sdk.config({
          token: urlToken,
          // host: 'http://localhost:3000',
        });
        window.__room_sdk__ = sdk;
      }

      if (sdk.initComplete) {
        const _roomInfo = await sdk.getRoomInfo();
        const { roomTempConfig, users } = _roomInfo?.roomInfo;
        const _userInfo = _roomInfo?.userInfo;
        const _userRole = lodash.toNumber(_userInfo?.role);
        setUserRole(_userRole);
        const _customUserRoomid = `teacher_${_roomInfo!?.roomInfo!?._id}`;
        setCustomUserRoomid(_customUserRoomid);
        let isT = false;
        if (
          _userRole === UserRole.主考官 ||
          _userRole === UserRole.副考官 ||
          _userRole === UserRole.候考官 ||
          _userRole === UserRole.创建者
        ) {
          isT = true;
        }
        const initActions = await sdk.getRoomExcludeChatActions(
          isT ? _customUserRoomid : undefined,
        );

        setTimeout(() => {
          sdk
            .getRoomChatActions(isT ? _customUserRoomid : undefined)
            .then(async (list) => {
              for (let index = 0; index < list.length; index++) {
                const element = list[index];
                await handleActions(element, _userRole, true);
              }
            });
        }, 1000 * 3);

        const handleActions = async (
          actionData: RoomActionsItem,
          userRole: UserRole,
          init?: boolean,
        ) => {
          const { action, data, publisher, uuid, time } = actionData;
          console.log('=====================');
          console.log(action, data);
          console.log('=====================');
          if (init === true) {
            if (action === 'custom.action') {
              if (data!?.type === CUSTOM_SOCKET_ENVET.CUSTOM_GIVE_PAPER) {
                if (data!?.sendType === 'CUSTOM') {
                  const customPaper = data!?.customPaper || {};
                  setCustomPapers((_customPapers: any) => {
                    const newC = (_customPapers || [])?.filter(
                      (i) => i?.url !== customPaper?.url,
                    );
                    newC.push(customPaper);
                    return newC;
                  });
                }
                if (data!?.sendType === 'SYSTEM') {
                  onGetPapers();
                }
              }
              if (data!?.type === CUSTOM_SOCKET_ENVET.CUSTOM_UNGIVE_PAPER) {
                if (data!?.sendType === 'CUSTOM') {
                  const customPaper = data!?.customPaper || {};
                  setCustomPapers((_customPapers) => {
                    return (_customPapers || [])?.filter(
                      (i) => i?.url !== customPaper?.url,
                    );
                  });
                }
                if (data!?.sendType === 'SYSTEM') {
                  onGetPapers();
                }
              }
            }
          }
          if (action === 'custom.action') {
            if (
              data!?.type === CUSTOM_SOCKET_ENVET.CUSTOM_GIVE_PAPER &&
              !init
            ) {
              if (data!?.sendType === 'CUSTOM') {
                const customPaper = data!?.customPaper || {};
                setCustomPapers((_customPapers: any) => {
                  const newC = (_customPapers || [])?.filter(
                    (i) => i?.url !== customPaper?.url,
                  );
                  newC.push(customPaper);
                  return newC;
                });
              }
              if (data!?.sendType === 'SYSTEM') {
                onGetPapers();
              }
              if (userRole !== UserRole.主考官) {
                Modal.warning({
                  title: '试卷已下发',
                  onOk: () => {
                    onGetPapers();
                  },
                });
              }
            }
            if (
              data!?.type === CUSTOM_SOCKET_ENVET.CUSTOM_UNGIVE_PAPER &&
              !init
            ) {
              if (data!?.sendType === 'CUSTOM') {
                const customPaper = data!?.customPaper || {};
                setCustomPapers((_customPapers) => {
                  return (_customPapers || [])?.filter(
                    (i) => i?.url !== customPaper?.url,
                  );
                });
              }
              if (data!?.sendType === 'SYSTEM') {
                onGetPapers();
              }
              if (userRole !== UserRole.主考官) {
                Modal.warning({
                  title: '试卷取消下发',
                  onOk: () => {
                    onGetPapers();
                  },
                });
              }
            }
            if (data!?.type === CUSTOM_SOCKET_ENVET.CUSTOM_PRIVATE_CHAT) {
              setPrivateChatUid(data!?.uid);
              setPrivateChatTUid(data!?.tid);
            }
            if (data!?.type === CUSTOM_SOCKET_ENVET.CUSTOM_HAND_EVENT) {
              setHandObj((_handObj) => {
                return {
                  ..._handObj,
                  [data?.id]: !!data!?.hand,
                };
              });
            }
            if (data!?.type === CUSTOM_SOCKET_ENVET.CUSTOM_ABNORMAL) {
              setAbnormalObj((_handObj) => {
                return {
                  ..._handObj,
                  [publisher]: data,
                };
              });
            }
            if (data!?.type === CUSTOM_SOCKET_ENVET.CUSTOM_MUTE_AUDIO) {
              const muteAudioObj = data!?.data || {};
              setMuteAudioObj((_muteAudioObj) => {
                return {
                  ..._muteAudioObj,
                  ...muteAudioObj,
                };
              });
            }
          }
          if (action === 'room.join') {
            setAttendanceObj((_attendanceObj) => {
              return {
                ..._attendanceObj,
                [publisher]: true,
              };
            });
          }
          if (action === 'room.leave') {
            setAttendanceObj((_attendanceObj) => {
              return {
                ..._attendanceObj,
                [publisher]: false,
              };
            });
          }
          if (action === 'chat.send') {
            setChatProps((_chatProps) => {
              const cuUserId = _roomInfo?.userInfo?.id;
              if (cuUserId && cuUserId !== publisher) {
                _chatProps.unreadNumber = (_chatProps.unreadNumber || 0) + 1;
              }
              _chatProps.messages = [...(_chatProps?.messages || []), data];
            });
          }
          if (action === 'chat.read') {
            setMsgReadTime(data?.time);
          }
          if (action === 'client.connect') {
            socketErrTipCancel && socketErrTipCancel();
          }
          if (init !== true) {
            if (action === 'system.ROOM_NOTIFICATION') {
              const _data = data as SystemActions['system.ROOM_NOTIFICATION'];
              const key = `system.ROOM_NOTIFICATION_${_data.code}`;
              notification['warning']({
                key: key,
                duration: null,
                message: _data.message,
                description: _data.description,
                onClose: () => {
                  notification.close(key);
                },
              });
            }
            if (
              action === 'client.connect_error' ||
              action === 'client.disconnect' ||
              action === 'client.err'
            ) {
              socketErrTipRun && socketErrTipRun(action);
            }
            if (action === 'system.USER_SQUEEZE_CONNECTED') {
              Modal.warning({
                title: '账号被挤',
                content: '当前账号被挤, 已在其它地方登录',
                okText: '知道了',
                onOk: () => {},
              });
            }
            if (
              action === 'system.ROOM_INFO_DELETE' ||
              action === 'system.ROOM_USER_ADD' ||
              action === 'system.ROOM_USER_UPDATE' ||
              action === 'system.ROOM_INFO_UPDATE' ||
              action === 'system.ROOM_USER_DELETE'
            ) {
              Modal.warning({
                title: '房间信息有更新',
                content: '请刷新后重新进入获取最新数据',
                okText: '知道了',
                onOk: () => {
                  reloadClearCache(window.location.href);
                },
              });
            }
          }
        };

        for (let index = 0; index < initActions.length; index++) {
          const element = initActions[index];
          await handleActions(element, _userRole, true);
        }

        const tempConfig: AppTempConfig.TempConfig = JSON.parse(roomTempConfig);
        if (tempConfig?.isDualCamera && /^[1-9]0$/.test(`${_userRole}`)) {
          const dualCameraToken = await sdk.createSubAuthToken(1);
          const dualCameraUrl = `${window.location.origin}?token=${dualCameraToken}`;
          console.log('dualCameraUrl: ', dualCameraUrl);
          QRCode.toDataURL(dualCameraUrl)
            .then((url) => {
              setQrCode(url);
            })
            .catch((err) => {
              console.error(err);
            });
        }
        const _socket = await sdk.getSocket();
        setSocket(_socket);
        setRoomInfo(_roomInfo);

        setUserInfo(_roomInfo?.userInfo);

        getEndTime(tempConfig);
        const serverTimeUnix = moment(sdk.getTime()).unix();

        let _roomStatus: RoomStatus = RoomStatus.未知;
        if (
          tempConfig.startTime < serverTimeUnix &&
          serverTimeUnix < tempConfig.endTime
        ) {
          _roomStatus = RoomStatus.进行中;
        }
        if (tempConfig.startTime > serverTimeUnix) {
          _roomStatus = RoomStatus.未开始;
        }
        if (tempConfig.endTime < serverTimeUnix) {
          _roomStatus = RoomStatus.已结束;
        }

        setRoomStatus(_roomStatus);

        _socket.on((data) => {
          handleActions(data, _userRole, false);
        });
        setChatProps((_chatProps: PageProps['chatProps']) => {
          _chatProps.user = {
            id: _roomInfo?.userInfo?.id,
            name: _roomInfo?.userInfo?.name,
          };
          _chatProps.users = users.map((user) => {
            return {
              ...user,
              id: user.id,
              name: user.name,
            };
          });
          _chatProps.onSend = (data: any, to?: number[]) => {
            console.log(_socket.emit);
            if (
              _userRole === UserRole.考生 ||
              _userRole === UserRole.第二机位
            ) {
              const _to = [];
              if (!to || to.indexOf(ToSystemEnum.ALL_USER) > -1) {
                _to.push(_customUserRoomid);
              } else {
                _to.push(...to);
              }
              _socket?.emit('chat.send', data, _to);
              // _socket?.emit('chat.send', data, to || []);
            } else {
              _socket?.emit('chat.send', data, to || []);
            }
          };
          _chatProps.onRead = (time: number) => {
            setChatProps((_chatProps) => {
              _chatProps.unreadNumber = 0;
            });
            _socket?.emit('chat.read', {
              time: time,
            });
          };
        });
        //

        if (_roomInfo && _userInfo && _userRole) {
          const usersStudentGroup = lodash.uniqBy(
            users.filter((item) => {
              return (
                item.role === UserRole.考生 || item.role === UserRole.第二机位
              );
            }),
            'id',
          );
          console.log('usersStudentGroup', users, usersStudentGroup);

          if (_userRole === UserRole.考生 || _userRole === UserRole.第二机位) {
            const chunkSGroup = lodash.chunk(
              usersStudentGroup,
              Layout_enum.Layout4,
            );
            console.log('chunkSGroup', chunkSGroup);
            const pageNum = lodash.findIndex(chunkSGroup, (o) => {
              return lodash.findIndex(o, (i) => i.id === _userInfo?.id) > -1;
            });
            const _defaultRtcInfo = await sdk.createWebRTCRoom(
              `${pageNum + 1}`,
            );
            setDefaultRtcInfo(_defaultRtcInfo);
          } else {
            const _defaultRtcInfo = await sdk.createWebRTCRoom(`${1}`);
            setDefaultRtcInfo(_defaultRtcInfo);
          }
          setUsers(usersStudentGroup);
        }
        // 根据不同角色 去不同页面
        if (_userRole && _socket && _customUserRoomid) {
          const url = urlParse(window.location.href, true);
          const query: any = url?.query || {};
          if (_userRole === UserRole.考生) {
            history.replace({
              pathname: '/first',
              query: query,
            });
          }
          if (_userRole === UserRole.第二机位) {
            history.replace({
              pathname: '/second',
              query: query,
            });
          }
          if (_userRole === UserRole.监考官 || _userRole === UserRole.创建者) {
            history.replace({
              pathname: '/monitor',
              query: query,
            });
            _socket.emit('room.joinCustomRoom', {
              roomid: _customUserRoomid,
            });
          }
          if (_userRole === UserRole.主考官 || _userRole === UserRole.副考官) {
            history.replace({
              pathname: '/examiner',
              query: query,
            });
            _socket.emit('room.joinCustomRoom', {
              roomid: _customUserRoomid,
            });
          }
          const timeCallBackTemp: any = {};
          const onTimeCallback = lodash.throttle((time: number) => {
            const serverTimeUnix = moment(sdk.getTime()).unix();
            let _roomStatus: RoomStatus = RoomStatus.未知;
            if (
              tempConfig.startTime < serverTimeUnix &&
              serverTimeUnix < tempConfig.endTime
            ) {
              _roomStatus = RoomStatus.进行中;
              setRoomStatus(_roomStatus);
              // if (timeCallBackTemp.roomStatus !== _roomStatus) {
              //   timeCallBackTemp.roomStatus = _roomStatus;
              //   handleTipRoomStatus('进行中');
              //   globalFun.hideTimeTip()
              // }
              // handleTipRoomStatus('进行中');
            }
            if (tempConfig.startTime > serverTimeUnix) {
              _roomStatus = RoomStatus.未开始;
              setRoomStatus(_roomStatus);
              if (timeCallBackTemp.roomStatus !== _roomStatus) {
                timeCallBackTemp.roomStatus = _roomStatus;
                globalFun.showRoomStatusTip('未开始', '', _backUrl);
              }
              globalFun.hideTimeTip();
            }
            if (tempConfig.endTime < serverTimeUnix) {
              _roomStatus = RoomStatus.已结束;
              setRoomStatus(_roomStatus);
              if (timeCallBackTemp.roomStatus !== _roomStatus) {
                timeCallBackTemp.roomStatus = _roomStatus;
                globalFun.showRoomStatusTip('已结束', '', _backUrl);
              }
              globalFun.hideTimeTip();
            }
            const endTimeNum = tempConfig.endTime - serverTimeUnix;
            if (endTimeNum <= 60 * 10 && endTimeNum > 0) {
              const minutes = Math.ceil(endTimeNum / 60);
              const text = minutes > 1 ? `${minutes}分钟` : `${endTimeNum}秒`;
              let description = '';
              if (minutes <= 5) {
                if (_userRole === UserRole.考生) {
                  description =
                    '请尽快完成并提交试卷(上传资料时间与文件大小和网络有关), 考试结束将无法提交保存试卷';
                }
                if (_userRole !== UserRole.考生) {
                  description = '考试即将结束, 请注意';
                }
              }
              if (timeCallBackTemp.showTime !== minutes || minutes <= 1) {
                timeCallBackTemp.showTime = minutes;
                globalFun.showTimeTip(`离考试结束小于${text}`, description);
              }
            }
          }, 1000);
          sdk?.on('__TIME_ANIME_LOOP__', onTimeCallback);
        }
      }
    } catch (err) {
      console.error('init err', err);
    } finally {
      setLoading(false);
    }
  };

  const { run: socketErrTipRun, cancel: socketErrTipCancel } = useDebounceFn(
    (action) => {
      const key = 'client-actions';
      notification['warning']({
        key: key,
        duration: null,
        message: `socket连接错误(${action})`,
        description: 'socket连接错误，许多功能将无法使用，请刷新页面重试！',
        btn: (
          <ConfigProvider prefixCls={__prefixCls__}>
            <Button
              type="primary"
              onClick={() => {
                reloadClearCache(window.location.href);
              }}
            >
              刷新页面
            </Button>
          </ConfigProvider>
        ),
      });
    },
    {
      wait: 1000 * 6,
    },
  );

  const getEndTime = (roomConfig: AppTempConfig.TempConfig) => {
    setEndTime(roomConfig.endTime * 1000);
    setStartTime(roomConfig.startTime * 1000);
    setIsDualCamera(roomConfig.isDualCamera);
    /**
     * 合并默认配置与线上配置
     */
    setTempConfig(roomConfig);
  };

  /**
   * 举手
   */
  const onHand = async (isHand: boolean) => {
    socket?.emit(
      'custom.action',
      {
        type: CUSTOM_SOCKET_ENVET.CUSTOM_HAND_EVENT,
        id: userInfo?.id,
        hand: !!isHand,
      },
      customUserRoomid ? [customUserRoomid] : [],
    );
    console.log();
  };

  /**
   * 获取试卷信息
   */
  const onGetPapers = async () => {
    const data = await sdk.getUserTestPaperList();
    setCustomPapers((customPapers) => {
      setPaperList(() => {
        const _systemList = data?.list?.map((item) => {
          return {
            ...item,
            __type__: 'SYSTEM',
            id: item.paperid,
            name: item.paperName,
            totalScore: lodash.toNumber(item.paperScore),
            totalQuestion: lodash.toNumber(item.questionNumber),
          };
        });
        const _customPapers = customPapers
          ? customPapers?.map((item) => {
              let type: PaperType = PaperType.网页;
              if (item.type === 'URL') {
                type = PaperType.网页;
              }
              if (item.type === 'PDF') {
                type = PaperType.PDF;
              }
              return {
                __type__: 'CUSTOM',
                type: type,
                id: item.url,
                name: item.name || item.url,
                url: item.url,
                totalScore: 0,
                totalQuestion: 0,
              };
            })
          : [];
        return [].concat(..._systemList, ..._customPapers);
      });
      return customPapers;
    });
  };
  /**
   * 保存试卷
   * @param data
   */
  const onChangePapers: OnChangePapers = async (type, data) => {
    if (type === 'change' && data.data) {
      await sdk.saveTestPaperAnswerForID(data.paperid, data.data);
      message.success({
        content: '保存成功',
        key: 'global_paper_save',
      });
    }
  };

  /**
   * 下发试卷
   */
  const onSendPapers = async () => {};

  const renderMain = () => {
    if (
      !loading &&
      userRole &&
      roomInfo?.roomInfo?._id &&
      defaultRtcInfo &&
      userInfo &&
      startTime &&
      endTime &&
      onChangePapers &&
      attendanceObj &&
      roomStatus
    ) {
      const _pageProps: PageProps = {
        backUrl: backUrl,
        isDualCamera: isDualCamera,
        userRole: userRole,
        qrCode: qrCode,
        roomid: roomInfo?.roomInfo?._id,
        roomInfo: roomInfo,
        defaultRtcInfo: defaultRtcInfo,
        userInfo: userInfo,
        startTime: startTime,
        endTime: endTime,
        chatProps: chatProps,
        handObj: handObj,
        onHand: onHand,
        paperProps: {
          list: paperList,
          onGetPapers: onGetPapers,
          timingConfig: {
            time: 1000 * 10,
            onChange: (value, paperInfo) => {
              console.log('timingConfig', value, paperInfo);
            },
          },
          onGetPaperForID: async (paperid: string, data?: any) => {
            console.log(paperid, data);
            if (data['__type__'] === 'CUSTOM') {
              return {
                id: data?.id,
                name: data?.url,
                startTime: 111,
                endTime: 222,
                url: data?.url,
                type: data.type,
                sourceData: {
                  id: data?.id,
                  name: data?.name || data?.url,
                  url: data?.url,
                },
              };
            }
            const _data = await sdk.getUserTestPaperInfo(paperid);
            console.log(paperid, data, _data);
            return _data;
          },
          onGetPaperAnswerForID: async (paperid: string) => {
            return await sdk.getTestPaperAnswerForID(paperid);
          },
          onChangePapers: onChangePapers,
          onSendPapers: onSendPapers,
          onGetSendPaperList: async () => {
            const data = await sdk.getTestPaperList();
            return {
              page: data.page,
              pageSize: data.pageSize,
              list: data.list,
              total: data.total,
            };
          },
          onSelectSendPaper: async ({
            type,
            id,
            customUrl,
            customType,
            customName,
          }) => {
            try {
              if (
                type === SendPapersType.指定下发 ||
                type === SendPapersType.随机下发
              ) {
                const data = await sdk.giveTestPaperForID(id);
                socket?.emit(
                  'custom.action',
                  {
                    type: CUSTOM_SOCKET_ENVET.CUSTOM_GIVE_PAPER,
                    sendType: 'SYSTEM',
                    paperid: id,
                  },
                  [ToSystemEnum.ALL_USER],
                );
                Modal.success({ title: '下发试卷成功' });
              }
              if (type === SendPapersType.自定义下发) {
                socket?.emit(
                  'custom.action',
                  {
                    type: CUSTOM_SOCKET_ENVET.CUSTOM_GIVE_PAPER,
                    sendType: 'CUSTOM',
                    paperid: undefined,
                    customPaper: {
                      name: customName,
                      type: customType,
                      url: customUrl,
                    },
                  },
                  [ToSystemEnum.ALL_USER],
                );
                Modal.success({ title: '下发试卷成功' });
              }
              if (type === SendPapersType.学生选取) {
                Modal.warn({ title: '暂不开放此功能' });
              }
            } catch (error) {
              Modal.error({ title: '下发试卷失败' });
            }
          },
          onUnGivePaper: async ({
            type,
            id,
            customUrl,
            customType,
            customName,
          }) => {
            const data = await sdk.unGiveTestPaperForID(id);
            if (
              type === SendPapersType.指定下发 ||
              type === SendPapersType.随机下发
            ) {
              socket?.emit(
                'custom.action',
                {
                  type: CUSTOM_SOCKET_ENVET.CUSTOM_UNGIVE_PAPER,
                  sendType: 'SYSTEM',
                  paperid: id,
                },
                [ToSystemEnum.ALL_USER],
              );
              Modal.success({ title: '取消下发试卷成功' });
            }
            if (type === SendPapersType.自定义下发) {
              socket?.emit(
                'custom.action',
                {
                  type: CUSTOM_SOCKET_ENVET.CUSTOM_UNGIVE_PAPER,
                  sendType: 'CUSTOM',
                  paperid: undefined,
                  customPaper: {
                    name: customName,
                    type: customType,
                    url: customUrl,
                  },
                },
                [ToSystemEnum.ALL_USER],
              );
              Modal.success({ title: '取消下发试卷成功' });
            }
            if (type === SendPapersType.学生选取) {
              Modal.warn({ title: '暂不开放此功能' });
            }
          },
          onGetGivePaper: async () => {
            const data = await sdk.getUserTestPaperList();
            const _systemList = data?.list?.map((item) => {
              return {
                ...item,
                __type__: 'SYSTEM',
                id: item.paperid,
                name: item.paperName,
                totalScore: lodash.toNumber(item.paperScore),
                totalQuestion: lodash.toNumber(item.questionNumber),
              };
            });
            const _customPapers = customPapers
              ? customPapers?.map((item) => {
                  let type: PaperType = PaperType.网页;
                  if (item.type === 'URL') {
                    type = PaperType.网页;
                  }
                  if (item.type === 'PDF') {
                    type = PaperType.PDF;
                  }
                  return {
                    __type__: 'CUSTOM',
                    type: type,
                    id: item.url,
                    name: item.name || item.url,
                    url: item.url,
                    totalScore: 0,
                    totalQuestion: 0,
                  };
                })
              : [];
            return [].concat(..._systemList, ..._customPapers);
          },
          onPreviewPaperInfo: async (paperid: string) => {
            debugger;
            const data = await sdk.getTestPaperForID(paperid);
            let _data;
            if (data.type === PaperType.在线编辑) {
              _data = {
                type: TypeEnum.HTML,
                data: data.sourceData,
              };
            }
            if (data.type === PaperType.PDF) {
              _data = {
                type: TypeEnum.PDF,
                data: data.sourceData,
              };
            }
            if (data.type === PaperType.网页) {
              _data = {
                type: TypeEnum.URL,
                data: data.sourceData,
              };
            }
            if (data.type === PaperType.wps文档) {
              _data = {
                type: TypeEnum.WPS,
                data: data.sourceData,
              };
            }
            return _data;
          },
        },
        users: users || [],
        attendanceProps: {
          attendanceObj: attendanceObj,
          onRefresh: () => {},
        },
        privateChat: {
          teacherid: privateChatTUid,
          userid: privateChatUid,
          onChange: (uid) => {
            // setPrivateChatUid(uid)
            socket!?.emit(
              'custom.action',
              {
                type: CUSTOM_SOCKET_ENVET.CUSTOM_PRIVATE_CHAT,
                uid: uid,
                tid: userInfo.id,
              },
              [ToSystemEnum.ALL_USER],
            );
          },
        },
        onRefreshRoomInfo: () => {},
        muteAudioProps: {
          userObj: muteAudioObj,
          onChange: (data) => {
            socket?.emit('custom.action', {
              type: CUSTOM_SOCKET_ENVET.CUSTOM_MUTE_AUDIO,
              data: {
                ...data,
              },
            });
            setMuteAudioObj((_muteAudioObj) => {
              return {
                ..._muteAudioObj,
                ...data,
              };
            });
          },
        },
        userDetailsProps: {
          userObj: userDetailsObj,
          onGetDetailsInfo: (uid) => {
            setUserDetailsObj((_userDetailsObj) => {
              const dataSource = [
                {
                  key: '1',
                  name: '序号',
                  value: 10001,
                },
                {
                  key: '2',
                  name: '学生姓名',
                  value: 42,
                },
              ];
              return {
                ..._userDetailsObj,
                [uid]: dataSource,
              };
            });
          },
        },
        userFaceProps: {
          userObj: userFaceObj,
          onGetFaceInfo: (uid) => {
            setUserFaceObj((_userFaceObj) => {
              return {
                ...userFaceObj,
                [uid]: {
                  isOk: false,
                  url: 'https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp',
                },
              };
            });
          },
        },
        roomStatusProps: {
          status: roomStatus,
          onChagne: () => {
            setRoomStatus(RoomStatus.已结束);
          },
        },
        abnormalProps: {
          abnormalCnt: abnormalCnt,
          userObj: abnormalObj,
          onChange: (uid) => {
            setAbnormalObj((_abnormalObj) => {
              return {
                ..._abnormalObj,
                [uid]: true,
              };
            });
          },
          onGetAbnormal: (query) => {
            setAbnormalObj((_abnormalObj) => {
              return {
                ..._abnormalObj,
                [query?.uid]: false,
              };
            });
          },
          onClose: async () => {
            setAbnormalCnt(0);
          },
        },
        getWebRTCInfo: async (roomid) => {
          return sdk.createWebRTCRoom(roomid);
        },
        getScreenSharingConfig: async (roomid: string) => {
          try {
            const token = await sdk.createSubAuthToken(2);
            const data = await sdk.createWebRTCRoom(roomid, token);
            return data;
          } catch (error) {
            return undefined;
          }
        },
      };
      return (
        <div style={{ flexGrow: 2 }}>
          <Helmet>
            <title>在线笔试</title>
          </Helmet>
          {defaultRtcInfo &&
            React.cloneElement(children, {
              ..._pageProps,
              ...pageProps,
            })}
        </div>
      );
    }
    return '';
  };

  useEffect(() => {
    init();
    return () => {
      cancelMsgReadTime();
    };
  }, []);

  const [, cancelMsgReadTime] = useDebounce(
    () => {
      if (msgReadTime > 0 && chatProps.messages.length) {
        let time: any;
        if (lodash.isNumber(msgReadTime) && msgReadTime) {
          time = moment(msgReadTime);
        }
        if (lodash.isString(msgReadTime)) {
          time = moment(msgReadTime);
        }
        const cuUserId = userInfo?.id;
        setChatProps((_chatProps) => {
          _chatProps.unreadNumber = [...chatProps.messages].filter((msg) => {
            if (cuUserId && cuUserId === msg?.user?.id) {
              return false;
            }
            return moment(msg.createdAt).isAfter(time);
          }).length;
        });
      }
    },
    600,
    [chatProps.messages, msgReadTime, userInfo],
  );
  console.log('roomStatus =====', roomStatus);
  return (
    <Layout
      className={styles.roomWrap}
      style={{
        width: width,
        height: height,
      }}
    >
      <Helmet>
        <title>在线笔试</title>
      </Helmet>
      <div
        className={styles.content}
        style={{ height: '100%', overflow: 'initial', display: 'flex' }}
      >
        {!loading && (
          <>
            {roomStatus !== RoomStatus.进行中 && (
              <RenderRoomStatus
                backUrl={backUrl}
                status={roomStatus}
                startTime={startTime || 0}
                endTime={endTime || 0}
              />
            )}
            {roomStatus === RoomStatus.进行中 && renderMain()}
          </>
        )}
        <div
          className={classNames(
            styles.loadingWrap,
            !loading && styles.hideLoading,
          )}
        >
          <Spin size="large" tip="加载数据中...." />
        </div>
      </div>
    </Layout>
  );
}

interface RenderProomStatusProps {
  status: RoomStatus | undefined;
  startTime: number;
  endTime: number;
  backUrl: string | undefined;
  error?: Error | string | undefined;
  resetErrorBoundary?: () => void;
}
function RenderRoomStatus(props: RenderProomStatusProps) {
  const { status } = props;
  const [time, setTime] = useState<number>();
  useEffect(() => {
    if (status === RoomStatus.未开始) {
      setTime(props.startTime);
    }
    if (status === RoomStatus.已结束) {
      setTime(props.endTime);
    }
    globalFun.hideLoading();
    const errTip = new ErrTip();
    errTip.showTip();
    return () => {
      errTip.hideTip();
    };
  }, [props]);
  let title: any = <Spin size="large" tip="加载数据中...." />;
  if (status === RoomStatus.未开始) {
    title = '当前房间暂未开启!';
  } else if (status === RoomStatus.已结束) {
    title = '当前房间已结束!';
  } else if (status === RoomStatus.未知) {
    title = '当前房间异常!';
  } else {
    title = '当前房间异常';
  }
  return (
    <div className={styles.notStart}>
      <Result
        status="warning"
        title={<div className={styles.notStartTitle}>{title}</div>}
        subTitle={
          <div>
            {/* <h3 className={styles.notStartSubTitle}>
              {status === RoomStatus.未开始 && ' 开启倒计时'}
              {status === RoomStatus.已结束 && ' 已结束'}
              {status === RoomStatus.未知 && ' 异常'}
            </h3> */}
            <Countdown
              daysInHours
              key={time}
              date={time}
              now={() => {
                return sdk.getTime();
              }}
              renderer={(data) => {
                const { hours, minutes, seconds } = data?.formatted;
                const completed = data?.completed;
                return (
                  <Space>
                    <Button className={styles.countdownItem}>
                      {zeroPad(hours)}
                    </Button>
                    <span className={styles.notStartTime}>:</span>
                    <Button className={styles.countdownItem}>
                      {zeroPad(minutes)}
                    </Button>
                    <span className={styles.notStartTime}>:</span>
                    <Button className={styles.countdownItem}>
                      {zeroPad(seconds)}
                    </Button>
                  </Space>
                );
              }}
            />
          </div>
        }
        extra={[
          <Button
            type="primary"
            key="console"
            onClick={() => {
              reloadClearCache(window.location.href);
            }}
          >
            刷新
          </Button>,
          props.backUrl ? (
            <Button
              key="back"
              onClick={() => {
                if (props.backUrl) {
                  window.location.replace(props.backUrl);
                } else {
                  window.history.back();
                }
              }}
            >
              返回
            </Button>
          ) : undefined,
        ]}
      />
    </div>
  );
}

export default (props: any) => {
  const history = useLocation();
  // @ts-ignore
  const query = history?.query;
  const backUrl = query?._backUrl;
  console.log(history);
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => {
        console.error('FallbackComponent: ', error);
        return (
          <RenderRoomStatus
            backUrl={backUrl}
            status={RoomStatus.异常}
            startTime={0}
            endTime={0}
            error={error}
            resetErrorBoundary={resetErrorBoundary}
          />
        );
      }}
      onReset={() => {
        // reset the state of your app so the error doesn't happen again
      }}
    >
      <MainLayout {...props} />
    </ErrorBoundary>
  );
};
