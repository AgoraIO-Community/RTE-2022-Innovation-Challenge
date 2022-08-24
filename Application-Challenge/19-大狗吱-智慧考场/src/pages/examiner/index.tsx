import React, { useState, useEffect, PropsWithChildren, useRef } from 'react';
import { Helmet, useRouteMatch } from 'umi';
import {
  Modal,
  Button,
  Space,
  Image,
  Divider,
  Pagination,
  Radio,
  Popover,
  Table,
  Badge,
  message,
  Dropdown,
  Menu,
  Drawer,
} from 'antd';
import { useMediaQuery } from 'react-responsive';
import classNames from 'classnames';
import styles from './index.less';
import delay from 'delay';
import {
  ReloadOutlined,
  CloseOutlined,
  UnorderedListOutlined,
  CheckOutlined,
  QuestionCircleFilled,
  PauseCircleFilled,
} from '@ant-design/icons';

import { useDebounce, useUnmount } from 'react-use';
import Countdown, { zeroPad } from 'react-countdown';
import WebRTC, {
  RtcLocalView,
  RtcRemoteView,
  autorun,
} from '@hongtangyun/webrtc';
import { RtcTypes } from '@hongtangyun/webrtc/dist/common/Enums';
import { ValueType, DoctorModal } from '../../components/Doctor/doctor';
import lodash from 'lodash';
import MyIconFont from '@/components/MyIconfont';
import {
  getUsersGroup,
  Layout_enum,
  reloadClearCache,
  serverTime,
  UserRole,
} from '@/utils';
import ChatWrap from '@/components/ChatWrap';
import { AbnormalModal } from './components/AbnormalModal';
import { PageProps, RoomStatus, SendPapersType, UserItem } from '../RoomTypes';
import MyIcon from '@/components/MyIconfont';
import { ResumeModal } from './components/ResumeModal';
import { RemoteUser } from '@hongtangyun/webrtc/dist/Types';
import { useImmer } from 'use-immer';
import { resumeVideo } from './components/ResumeVideoModal';
import { SendPaperModal } from './components/SendPaperModal';
import { useDebounceEffect } from 'ahooks';
import Help from '@/components/Help';
import { globalFun } from '@/components/GlobalLoading';
import VideoPlayerWrap from '@/components/videoPlayer';
import LocalSoundNum from '@/components/LocalSoundNum';
import RemoteSoundNum from '@/components/RemoteSoundNum';

export default function DoctorInitWrap(props: PageProps) {
  const [deviceValue, setDeviceValue] = useImmer<ValueType | undefined>(
    undefined,
  );
  const [doctorVisible, setDoctorVisible] = useState<boolean>(true);
  const onDoctorCahnge = (value: ValueType) => {
    setDeviceValue(value);
  };
  useEffect(() => {
    globalFun.hideLoading();
  }, []);
  if (!deviceValue?.videoinput) {
    return (
      <DoctorModal
        visible={doctorVisible}
        value={deviceValue}
        onChange={onDoctorCahnge}
        onClose={() => {
          setDoctorVisible(false);
        }}
      />
    );
  }
  return <MainRoom {...props} defaultDeviceValue={deviceValue} />;
}
export interface MainRoomProps extends PageProps {
  defaultDeviceValue?: ValueType;
}
const MainRoom = (props: MainRoomProps) => {
  const {
    isDualCamera,
    userRole,
    defaultRtcInfo,
    userInfo,
    handObj,
    users = [],
    privateChat = {
      userid: undefined,
      onChange: () => {},
    },
    attendanceProps,
    muteAudioProps,
    userDetailsProps,
    userFaceProps,
    roomStatusProps,
    abnormalProps,
  } = props;

  const abnormalModalRef = useRef<AbnormalModal>();
  const [openRecordVideo, setOpenRecordVideo] = useState(false);
  const [openHelp, setOpenHelp] = useState<boolean>(false);
  const [deviceValue, setDeviceValue] = useState<ValueType>();
  const [isOpenChat, setOpenChat] = useState(true);
  const [isShowAttendance, setIsShowAttendance] = useState<'a' | 'b'>('a');
  const [currentRtcInfo, setCurrentRtcInfo] = useState(defaultRtcInfo);
  console.log(
    '================================ currentRtcInfo ================================',
  );
  console.log('currentRtcInfo : ', currentRtcInfo);
  console.log(
    '================================ currentRtcInfo ================================',
  );
  const [currentPageNumber, setCurrentPageNumber] = useState(1);

  const [disableAudio, setDisableAudio] = useState(false);
  const [disableVideo, setDisableVideo] = useState(false);

  const [joined, setJoined] = useState(false);
  const [published, setPublished] = useState(false);
  const [localStream, setLocalStream] = useState<WebRTC['localStream']>();
  const [remoteUsers, setRemoteUsers] = useState<WebRTC['remoteUsers']>();
  const [remoteUsersGroup, setRemoteUsersGroup] = useState<Array<any>>([]);
  const [emptyUsersGroup, setEmptyUsersGroup] = useState<string[]>([]);

  const [clientSdk, setClientSdk] = useState<WebRTC>();

  const layoutLength = isDualCamera ? Layout_enum.Layout4 : Layout_enum.Layout8;

  const [doctorVisible, setDoctorVisible] = useState<boolean>(false);

  const sendPaperModalRef = useRef<SendPaperModal>();

  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1224px)',
  });
  const isBigScreen = useMediaQuery({ query: '(min-width: 1824px)' });
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });

  const onDoctorCahnge = (value: ValueType) => {
    setDeviceValue(value);
    if (clientSdk?.localStream) {
      clientSdk.changeLocalStream(value.videoinput, value.audioinput);
    }
  };
  const handleOpenDoctorModal = async () => {
    setDoctorVisible(true);
  };

  useEffect(() => {
    if (localStream && currentRtcInfo?.channel) {
      if (disableVideo) {
        clientSdk?.disableVideo(disableVideo);
      }
      if (disableAudio) {
        clientSdk?.disableAudio(disableAudio);
      }
    }
  }, [disableVideo, disableAudio, currentRtcInfo?.channel, localStream]);

  useDebounceEffect(
    () => {
      if (localStream && joined && !published) {
        clientSdk?.publish();
        setPublished(true);
      }
    },
    [localStream, joined, published],
    { wait: 500 },
  );

  useUnmount(() => {
    try {
      clientSdk?.clearLocalRTCStream();
      clientSdk?.unpublish();
      clientSdk?.destroy();
    } catch (err) {
      console.error(`useUnmount error : ${err}`);
    } finally {
    }
  });

  useEffect(() => {
    if (props.roomStatusProps.status === RoomStatus.已结束) {
      if (clientSdk && clientSdk.destroy) {
        clientSdk?.clearLocalRTCStream();
        clientSdk.unpublish();
        clientSdk.destroy();
      }
    }
  }, [props.roomStatusProps.status]);

  useEffect(() => {
    if (users) {
      const list = users.filter((i) => {
        const isUser = i.role === UserRole.考生 || i.role === UserRole.第二机位;
        return isUser;
      });
      setRemoteUsersGroup(list);
    }
  }, [users, props.isDualCamera]);

  useDebounce(
    async () => {
      let _currentRtcInfo: any;
      let hide = message.loading({
        key: 'global_loading_webrtc',
        content: '获取音视频房间信息...',
      });
      try {
        if (props?.getWebRTCInfo) {
          const data = await props?.getWebRTCInfo(`${currentPageNumber}`);
          _currentRtcInfo = data;
        }
        setCurrentRtcInfo(_currentRtcInfo);
        // @ts-ignore
        if (window.__sdk__) {
          // @ts-ignore
          window.__sdk__!?.destroy();
          // @ts-ignore
          window.__sdk__ = null;
          setJoined(false);
          setPublished(false);
          setLocalStream(undefined);
          setRemoteUsers([]);
        }
        if (!_currentRtcInfo) {
          return;
        }
        await delay(300);
        hide = message.loading({
          key: 'global_loading_webrtc',
          content: '正在加入音视频房间...',
        });
        /**
         * 初始本地状态
         */
        setLocalStream(undefined);
        setRemoteUsers([]);
        setJoined(false);
        setPublished(false);
        await delay(300);

        const _sdk = new WebRTC(
          _currentRtcInfo.type === 'agoral'
            ? RtcTypes.AgoraWeb
            : RtcTypes.TRTCWeb,
          {
            uid: _currentRtcInfo.uid,
            token: _currentRtcInfo.token,
            appid: `${_currentRtcInfo.appid}`,
            channel: `${_currentRtcInfo.channel}`,
          },
        );
        // @ts-ignore
        window.__sdk__ = _sdk;

        autorun(() => {
          console.log('autorun', {
            ..._sdk,
          });
          setJoined(_sdk.joined);
          // setPublished(_sdk.published);
          setLocalStream(_sdk.localStream);
          setRemoteUsers(_sdk.remoteUsers);
        });
        setClientSdk(_sdk);
        await _sdk?.join();
        _sdk.createLocalStream(
          props?.defaultDeviceValue?.videoinput,
          props?.defaultDeviceValue?.audioinput,
        );
      } catch (error) {
      } finally {
        await delay(1000);
        hide();
      }
    },
    600,
    [currentPageNumber],
  );

  const pagingForRemoteUsersGroup = lodash.chunk(
    [...remoteUsersGroup, ...emptyUsersGroup],
    layoutLength,
  );
  const currentRemoteUsersGroup = lodash.get(
    pagingForRemoteUsersGroup,
    `[${currentPageNumber - 1}]`,
    [],
  );
  console.log(pagingForRemoteUsersGroup);

  const attendanceObj_true = [];
  const attendanceObj_false = [];
  const attendanceObj = attendanceProps!?.attendanceObj || {};
  remoteUsersGroup.forEach((item) => {
    const userInfo: UserItem = item;
    if (attendanceObj[userInfo.id]) {
      attendanceObj_true.push({
        ...item,
      });
    } else {
      attendanceObj_false.push({
        ...item,
      });
    }
  });
  console.log('muteAudioProps', muteAudioProps);
  const isMuteAuidoAll = lodash.find(
    Object.values(muteAudioProps!?.userObj || {}),
    (i) => i,
  );

  const handleShowAbnormal = async (uid?: number) => {
    abnormalModalRef.current!?.show(async (page) => {
      return await abnormalProps!?.onGetAbnormal({
        roomid: '',
        userid: uid,
        page,
      });
    });
  };

  const handleSendPaperModal = async (type: SendPapersType) => {
    sendPaperModalRef.current!?.show(type);
    // paperProps.onSendPapers({
    //   type: SendPapersType.指定下发,
    // })
  };

  return (
    <div className={styles.page}>
      <Helmet>
        <title>考官端---笔试房间</title>
      </Helmet>
      <>
        <div
          className={classNames(
            styles.mainChat,
            isOpenChat ? styles.chatBoxOpen : styles.chatBoxClose,
          )}
        >
          <div
            onClick={() => {
              setOpenChat((isOpen) => {
                return !isOpen;
              });
            }}
            className={classNames(styles.chatBoxBtn)}
          />
          <div className={styles.chatBody}>
            <div className={styles.headerWrap}>
              <h2 className={styles.title}>考生列表</h2>
            </div>
            <div className={styles.userListWrap}>
              <div className={styles.userListMianBox}>
                <div className={styles.userListTabs}>
                  <Radio.Group
                    value={isShowAttendance}
                    buttonStyle="solid"
                    onChange={(e) => {
                      setIsShowAttendance(e.target.value);
                    }}
                  >
                    <Radio.Button value="a">
                      已出勤({Object.keys(attendanceObj_true).length || 0})
                    </Radio.Button>
                    <Radio.Button value="d">
                      未出勤({Object.keys(attendanceObj_false).length || 0})
                    </Radio.Button>
                  </Radio.Group>
                </div>
                <div className={styles.list}>
                  {lodash
                    .orderBy(
                      isShowAttendance === 'a'
                        ? attendanceObj_true
                        : attendanceObj_false,
                      (item) => {
                        const userInfo: UserItem = item;
                        const isHand = lodash.get(
                          handObj,
                          `${userInfo?.id}`,
                          false,
                        );
                        const isAbnormal = lodash.get(
                          abnormalProps!?.userObj,
                          `${userInfo?.id}`,
                          false,
                        );
                        return !isHand || !isAbnormal;
                      },
                    )
                    .map((item) => {
                      const userInfo: UserItem = item;
                      const isHand = lodash.get(
                        handObj,
                        `${userInfo?.id}`,
                        false,
                      );
                      console.log(
                        'xxxxxx isShowAttendance',
                        item,
                        isHand,
                        userInfo,
                        handObj,
                      );
                      const pageNumber = userInfo?.pageNumber;

                      const isAbnormal = lodash.get(
                        abnormalProps!?.userObj,
                        `${userInfo?.id}`,
                        false,
                      );
                      console.log(
                        'abnormalProps!?.userObj',
                        abnormalProps!?.userObj,
                      );

                      const isSubmit = lodash.get(userInfo, 'is_submit', false);
                      /**
                       * 判断是否在私聊
                       */
                      const isPrivateChat =
                        privateChat!?.userid &&
                        privateChat!?.teacherid &&
                        privateChat!?.teacherid === userInfo?.id;

                      return (
                        <div
                          key={JSON.stringify(item)}
                          className={classNames(
                            styles.userItemWrap,
                            isShowAttendance !== 'a' && styles.notOnlineWrap,
                          )}
                        >
                          <img
                            className={styles.userHeader}
                            src={
                              userInfo?.avatar || require('./assets/user.png')
                            }
                          />
                          <div className={styles.userInfo}>
                            <strong>{userInfo!?.name}</strong>
                            <span>{userInfo!?.phone}</span>
                          </div>
                          {isSubmit ? (
                            <div className={styles.actionsWrap}>
                              <Button
                                type="link"
                                onClick={() => {
                                  // handleShowAbnormal(userInfo!?.id);
                                }}
                              >
                                <MyIconFont
                                  className={classNames(
                                    styles.icons,
                                    styles.icon5,
                                  )}
                                  type="icon-yidafen"
                                />
                              </Button>
                              <Button type="link" onClick={() => {}}>
                                已交卷
                              </Button>
                            </div>
                          ) : (
                            <div className={styles.actionsWrap}>
                              <Button
                                type="link"
                                onClick={() => {
                                  handleShowAbnormal(userInfo!?.id);
                                }}
                              >
                                <MyIconFont
                                  className={classNames(
                                    styles.icons,
                                    styles.icon1,
                                    isAbnormal && styles.onIcon1,
                                  )}
                                  type="icon-alarm"
                                />
                              </Button>
                              <Button type="link" onClick={() => {}}>
                                <MyIconFont
                                  className={classNames(
                                    styles.icons,
                                    styles.icon2,
                                    isHand && styles.onIcon2,
                                  )}
                                  type="icon-hands1"
                                />
                              </Button>
                              <Button
                                type="link"
                                onClick={() => {
                                  if (isPrivateChat) {
                                    Modal.warn({
                                      title: '请先关闭对话',
                                      content: '请先关闭对话，再使用此功能',
                                      okText: '知道了',
                                      onOk: () => {},
                                    });
                                    return;
                                  }
                                  if (pageNumber) {
                                    setCurrentPageNumber(pageNumber);
                                  }
                                }}
                              >
                                <MyIconFont
                                  className={classNames(
                                    styles.icons,
                                    styles.icon3,
                                  )}
                                  type="icon-tiaozhuan"
                                />
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
                <div className={styles.btnWrap}>
                  <Button
                    className={styles.btn}
                    type={isMuteAuidoAll ? 'primary' : 'default'}
                    onClick={() => {
                      const obj: any = {};
                      users.forEach((item) => {
                        obj[item.id] = !isMuteAuidoAll;
                      });
                      muteAudioProps!?.onChange(obj);
                    }}
                  >
                    {isMuteAuidoAll ? '取消全体禁音' : '全体禁音'}
                  </Button>
                </div>
              </div>
            </div>
            <div className={styles.chatListWrap}>
              <div className={styles.chatMianBox}>
                <ChatWrap {...props?.chatProps} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.mainBox}>
          <div className={styles.headerToolsWrap}>
            <div className={styles.toolsWrap}>
              <Button
                className={styles.headerTools}
                onClick={() => {
                  handleOpenDoctorModal();
                }}
              >
                <MyIcon
                  className={classNames(styles.icon)}
                  type="icon-shebeijiance"
                />
                <strong>设备检测</strong>
              </Button>
              <Button
                className={styles.headerTools}
                onClick={() => {
                  setDisableAudio((_disableAudio) => {
                    clientSdk?.disableAudio(!_disableAudio);
                    return !_disableAudio;
                  });
                }}
              >
                <LocalSoundNum muteAudio={disableAudio} stream={localStream} />
                <strong>{disableAudio ? '启用' : '禁用'}麦克风</strong>
              </Button>
              <Button
                className={styles.headerTools}
                onClick={() => {
                  setDisableVideo((_disableVideo) => {
                    clientSdk?.disableVideo(!_disableVideo);
                    return !_disableVideo;
                  });
                }}
              >
                <MyIcon
                  className={classNames(styles.icon)}
                  type={disableVideo ? 'icon-camera_close' : 'icon-camera'}
                />
                <strong>{disableVideo ? '启用' : '禁用'}摄像头</strong>
              </Button>
              <Button
                className={styles.headerTools}
                onClick={() => {
                  handleShowAbnormal();
                }}
              >
                <Badge count={abnormalProps?.abnormalCnt || 0}>
                  <MyIcon
                    className={classNames(styles.icon)}
                    type="icon-alarm"
                  />
                </Badge>
                <strong>异常行为</strong>
              </Button>
              <Popover
                placement="bottomLeft"
                content={
                  <div className={styles.settingMenuWrap}>
                    <div className={styles.settingMenuItem}>
                      <a
                        onClick={(e) => {
                          e.preventDefault();
                          Modal.confirm({
                            title: '要刷新当前页面吗',
                            content: '',
                            okText: '确定',
                            onOk: () => {
                              reloadClearCache(window.location.href);
                            },
                            cancelText: '再想想',
                            onCancel: () => {},
                          });
                        }}
                      >
                        <CheckOutlined className={styles.icon} />
                        <strong>刷新</strong>
                      </a>
                    </div>
                    <div className={styles.settingMenuItem}>
                      <a
                        onClick={(e) => {
                          e.preventDefault();
                          Modal.confirm({
                            title: '要离开当前页面吗',
                            content: '',
                            okText: '确定',
                            onOk: () => {
                              if (props.backUrl) {
                                window.location.replace(props.backUrl);
                              } else {
                                window.history.back();
                              }
                            },
                            cancelText: '再想想',
                            onCancel: () => {},
                          });
                        }}
                      >
                        <CheckOutlined className={styles.icon} />
                        <strong>返回首页</strong>
                      </a>
                    </div>
                  </div>
                }
                trigger="click"
              >
                <Button className={styles.headerTools}>
                  <MyIcon
                    className={classNames(styles.icon)}
                    type="icon-config"
                  />
                  <strong>设置</strong>
                </Button>
              </Popover>
              {userRole === UserRole.主考官 && (
                <Button
                  className={styles.headerTools}
                  onClick={() => {
                    Modal.confirm({
                      title: '确定结束考场？',
                      content:
                        '结束后会踢出考场所有人，并无法进入考场，请谨慎选择',
                      cancelText: '取消',
                      okText: '确定',
                      onCancel: () => {},
                      onOk: () => {
                        roomStatusProps!?.onChagne &&
                          roomStatusProps!?.onChagne(RoomStatus.已结束);
                      },
                    });
                  }}
                >
                  <MyIcon className={classNames(styles.icon)} type="icon-off" />
                  <strong>结束考场</strong>
                </Button>
              )}
              <Popover
                placement="bottomLeft"
                onVisibleChange={(b) => {
                  setOpenRecordVideo(b);
                }}
                content={
                  <div className={styles.recordWrap}>
                    {openRecordVideo ? (
                      <VideoPlayerWrap url="//recording-1252095557.cos.ap-chengdu.myqcloud.com/directory1/directory2/b5f1a95dfb404ea6cdac82bbecfe6afe_httpClient463224.m3u8" />
                    ) : undefined}
                    查看录制视频
                  </div>
                }
                // trigger={["click"]}
                trigger={['hover', 'click']}
              >
                <Button className={styles.headerTools} onClick={() => {}}>
                  <PauseCircleFilled
                    style={{ fontSize: 17 }}
                    className={classNames(styles.icon)}
                  />
                  <strong>录制</strong>
                </Button>
              </Popover>
              <Button
                className={styles.headerTools}
                onClick={() => {
                  setOpenHelp(true);
                }}
              >
                <QuestionCircleFilled
                  style={{ fontSize: 17 }}
                  className={classNames(styles.icon)}
                />
                <strong>帮助中心</strong>
              </Button>
            </div>
            <div className={styles.titleWrap}>
              <Space>
                {
                  // (!paperProps!?.data!?.isSendSuccess && userRole === UserRole.主考官) && (
                  userRole === UserRole.主考官 && (
                    <>
                      <Popover
                        placement="bottomRight"
                        content={
                          <div className={styles.settingMenuWrap}>
                            <div className={styles.settingMenuItem}>
                              <a
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleSendPaperModal(SendPapersType.指定下发);
                                }}
                              >
                                <CheckOutlined className={styles.icon} />
                                <strong>指定下发</strong>
                              </a>
                            </div>
                            <div className={styles.settingMenuItem}>
                              <a
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleSendPaperModal(SendPapersType.随机下发);
                                }}
                              >
                                <CheckOutlined className={styles.icon} />
                                <strong>随机下发</strong>
                              </a>
                            </div>
                            {/* <div className={styles.settingMenuItem}>
                              <a
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleSendPaperModal(SendPapersType.学生选取);
                                }}
                              >
                                <CheckOutlined className={styles.icon} />
                                <strong>学生选取</strong>
                              </a>
                            </div> */}
                            <div className={styles.settingMenuItem}>
                              <a
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleSendPaperModal(
                                    SendPapersType.自定义下发,
                                  );
                                }}
                              >
                                <CheckOutlined className={styles.icon} />
                                <strong>自定义</strong>
                              </a>
                            </div>
                          </div>
                        }
                      >
                        <a
                          className="ant-dropdown-link"
                          onClick={(e) => e.preventDefault()}
                        >
                          下发试卷
                        </a>
                      </Popover>
                      <Divider type="vertical" />
                    </>
                  )
                }
                <a
                  className="ant-dropdown-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSendPaperModal(SendPapersType.已下发列表);
                  }}
                >
                  查看已下发试卷
                </a>
                <div className={styles.countdownWrap}>
                  <Countdown
                    daysInHours
                    key={props?.endTime}
                    date={props?.endTime}
                    now={() => {
                      return window?.__room_sdk__?.getTime();
                    }}
                    renderer={(data) => {
                      const { hours, minutes, seconds } = data?.formatted;
                      return (
                        <Space>
                          <Button className={styles.countdownItem}>
                            {zeroPad(hours)}
                          </Button>
                          <span>:</span>
                          <Button className={styles.countdownItem}>
                            {zeroPad(minutes)}
                          </Button>
                          <span>:</span>
                          <Button className={styles.countdownItem}>
                            {zeroPad(seconds)}
                          </Button>
                          <span>后考场结束</span>
                        </Space>
                      );
                    }}
                  />
                </div>
                <Divider type="vertical" />
                <div className={styles.localVideoWrap}>
                  {clientSdk && localStream && (
                    <RtcLocalView
                      rtcType={clientSdk?.rtcType}
                      localStream={localStream}
                      fit="contain"
                    />
                  )}
                </div>
              </Space>
            </div>
          </div>
          <div className={styles.body}>
            <div className={styles.left}>
              <div
                className={classNames(
                  styles.gridLayoutWrap,
                  styles[`grid${currentRemoteUsersGroup?.length || 1}`],
                )}
              >
                {currentRemoteUsersGroup.map((userGroup) => {
                  const itemUserInfo = userGroup;
                  const userid = itemUserInfo!?.id;

                  console.log(userGroup, 111, userid, privateChat!?.userid);
                  const isBig =
                    privateChat!?.userid &&
                    privateChat!?.teacherid &&
                    privateChat!?.teacherid === userInfo.id &&
                    userid === privateChat!?.userid;

                  let isMuteAudio = lodash.get(
                    muteAudioProps!?.userObj,
                    `${userid}`,
                    false,
                  );
                  if (!!privateChat!?.userid && privateChat!?.userid > 0) {
                    isMuteAudio = true;
                  }
                  const userDetails = lodash.get(
                    userDetailsProps!?.userObj,
                    `${userid}`,
                  );

                  const userFace = lodash.get(
                    userFaceProps!?.userObj,
                    `${userid}`,
                  );
                  return (
                    <div
                      key={JSON.stringify(userGroup)}
                      className={classNames(
                        styles.userGroupWrap,
                        !userGroup ? styles.emptyUsersGroup : undefined,
                      )}
                    >
                      <div className={styles.userGroupBody}>
                        <VideoWrap
                          rtcType={clientSdk?.rtcType}
                          data={userGroup}
                          remoteUsers={remoteUsers}
                          isBig={isBig}
                          isDualCamera={isDualCamera}
                          isMuteAudio={isMuteAudio}
                          userDetails={userDetails}
                          onGetDetailsInfo={userDetailsProps!?.onGetDetailsInfo}
                          userFace={userFace}
                          onGetFaceInfo={userFaceProps!?.onGetFaceInfo}
                          onBig={(isOpen) => {
                            privateChat!?.onChange(isOpen ? userid : undefined);
                          }}
                          audiooutput={deviceValue?.audiooutput}
                          paperIsEnable={userFaceProps?.isEnable}
                        ></VideoWrap>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {(!privateChat!?.userid || privateChat!?.userid < 0) && (
              <div className={styles.footerWrap}>
                <Pagination
                  current={currentPageNumber}
                  pageSize={layoutLength}
                  defaultCurrent={1}
                  total={remoteUsersGroup?.length}
                  onChange={async (page) => {
                    setCurrentPageNumber(page);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </>
      <AbnormalModal
        ref={abnormalModalRef}
        onClose={props!?.abnormalProps!?.onClose}
      />
      <DoctorModal
        visible={doctorVisible}
        value={deviceValue}
        onChange={onDoctorCahnge}
        onClose={() => {
          setDoctorVisible(false);
        }}
      />
      <SendPaperModal
        list={props?.paperProps!?.list}
        ref={sendPaperModalRef}
        onGetSendPaperList={props?.paperProps!?.onGetSendPaperList}
        onSelectSendPaper={props?.paperProps!?.onSelectSendPaper}
        onPreviewPaperInfo={props?.paperProps!?.onPreviewPaperInfo}
        onUnGivePaper={props?.paperProps!?.onUnGivePaper}
        onGetGivePaper={props?.paperProps!?.onGetGivePaper}
      />
      <Drawer
        maskStyle={{
          backdropFilter: 'blur(10px)',
        }}
        width={'40%'}
        title="帮助中心"
        placement="right"
        onClose={() => {
          setOpenHelp(false);
        }}
        visible={openHelp}
      >
        <Help />
      </Drawer>
    </div>
  );
};
interface VideoWrapProps {
  rtcType: any;
  length: number;
  isDualCamera: boolean;
  isBig: boolean;
  isMuteAudio: boolean;
  onBig: (isOpen: boolean) => void;
  data: any;
  remoteUsers: any;
  userDetails: any;
  onGetDetailsInfo: (uid: number) => any;
  userFace: any;
  onGetFaceInfo: (uid: number) => any;
  paperIsEnable: boolean;
}
const VideoWrap: React.FC<any> = (props: PropsWithChildren<VideoWrapProps>) => {
  const [isFullScreen, setFullScreen] = useState<
    'videoRenderScreen' | 'videoRenderSecond' | 'videoRenderFirst'
  >('videoRenderFirst');
  const [isShowFaceImg, setShowFaceImg] = useState<boolean | string>(false);
  const [item_1_RemoteStream, setItem_1_RemoteStream] = useState<
    RemoteUser | undefined
  >(undefined);
  const [item_2_RemoteStream, setItem_2_RemoteStream] = useState<
    RemoteUser | undefined
  >(undefined);
  const [item_3_RemoteStream, setItem_3_RemoteStream] = useState<
    RemoteUser | undefined
  >(undefined);
  const videoSize = {
    ...props.style,
  };
  const data1 = lodash.get(props, `data`);
  const data2 = lodash.get(props, `data`);
  const userInfo = lodash.get(props, `data`, {});
  const resumeModalRef = useRef<ResumeModal>();
  const _isMuteAudio = props.isBig ? false : props.isMuteAudio;

  const handleResumeModal = async (url: string) => {
    if (url) {
      resumeModalRef.current!?.show(url);
    } else {
      Modal.warn({
        title: '暂未发现简历',
      });
    }
  };

  const [, cancel] = useDebounce(
    () => {
      let _item_1_RemoteStream: any;
      let _item_2_RemoteStream: any;
      let _item_3_RemoteStream: any;
      if (lodash.isArray(props?.remoteUsers)) {
        (props?.remoteUsers || []).forEach((item) => {
          if (`${item?.uid}` === `${UserRole.考生}${data1?.id}`) {
            _item_1_RemoteStream = item;
          }
          if (`${item?.uid}` === `${UserRole.第二机位}${data2?.id}`) {
            _item_2_RemoteStream = item;
          }
          if (`${item?.uid}` === `${UserRole.考生屏幕分享}${data2?.id}`) {
            _item_3_RemoteStream = item;
          }
        });
        setItem_1_RemoteStream(_item_1_RemoteStream);
        setItem_2_RemoteStream(_item_2_RemoteStream);
        setItem_3_RemoteStream(_item_3_RemoteStream);
      }
    },
    1000,
    [data1?.id, data2?.id, props?.remoteUsers],
  );
  useEffect(() => {
    if (item_3_RemoteStream) {
      setFullScreen('videoRenderScreen');
    } else {
      setFullScreen((_type) => {
        if (_type === 'videoRenderScreen') {
          return 'videoRenderFirst';
        }
        return _type;
      });
    }
  }, [item_3_RemoteStream]);
  useUnmount(() => {
    cancel();
  });

  return (
    <div
      style={videoSize}
      className={classNames(
        styles.videoWrap,
        !userInfo ? styles.videoDisabled : '',
        props.isBig && styles.videoBigWrap,
      )}
    >
      {props.isBig && (
        <div className={styles.bigCloseBtnWrap}>
          <Button
            type="default"
            shape="circle"
            onClick={() => {
              props.onBig(false);
              setFullScreen((_type) => {
                return _type || 'videoRenderFirst';
              });
            }}
          >
            <CloseOutlined />
          </Button>
        </div>
      )}
      <div className={classNames(styles.videoBox)}>
        <div
          className={classNames(
            styles.videoRenderWrap,
            isFullScreen === 'videoRenderFirst' ? styles.videoRenderFWrap : '',
            isFullScreen === 'videoRenderSecond' ? styles.videoRenderSWrap : '',
            isFullScreen === 'videoRenderScreen'
              ? styles.videoRenderScreenWrap
              : '',
          )}
        >
          <div
            className={classNames(
              styles.videoRenderItem,
              styles.videoRenderFirst,
            )}
            onClick={() => {
              setFullScreen('videoRenderFirst');
            }}
          >
            {item_1_RemoteStream && (
              <RtcRemoteView
                rtcType={props.rtcType}
                remoteStream={item_1_RemoteStream}
                fit="contain"
                isPlayVideo={true}
                isPlayAudio={!_isMuteAudio}
                audioOutputDeviceId={props?.audiooutput}
              />
            )}
          </div>
          {props?.isDualCamera && (
            <div
              className={classNames(
                styles.videoRenderItem,
                styles.videoRenderSecond,
              )}
              onClick={() => {
                setFullScreen('videoRenderSecond');
              }}
            >
              {item_2_RemoteStream && (
                <RtcRemoteView
                  rtcType={props.rtcType}
                  remoteStream={item_2_RemoteStream}
                  fit="contain"
                  isPlayAudio={false}
                  isPlayVideo={true}
                  audioOutputDeviceId={props?.audiooutput}
                />
              )}
            </div>
          )}
          {item_3_RemoteStream ? (
            <div
              className={classNames(
                styles.videoRenderItem,
                styles.videoRenderScreen,
              )}
              onClick={() => {
                setFullScreen('videoRenderScreen');
              }}
            >
              <RtcRemoteView
                rtcType={props.rtcType}
                remoteStream={item_3_RemoteStream}
                fit="contain"
                isPlayAudio={false}
                isPlayVideo={true}
                audioOutputDeviceId={props?.audiooutput}
              />
            </div>
          ) : undefined}
        </div>
        <span className={styles.toolsWrap}>
          <Space size={0}>
            <Button type="link" onClick={() => {}}>
              <RemoteSoundNum
                muteAudio={_isMuteAudio}
                stream={item_1_RemoteStream}
              />
            </Button>
            <span>{userInfo?.name || '---'}</span>
          </Space>
          <Space size={0}>
            <Popover
              mouseEnterDelay={0.6}
              placement="leftTop"
              onVisibleChange={(visible) => {
                if (visible) {
                  props!?.onGetDetailsInfo(userInfo!?.id);
                }
              }}
              content={() => {
                const columns = [
                  {
                    title: '字段名',
                    dataIndex: 'name',
                    key: 'name',
                    render: (name: string) => {
                      return <span className={styles.lable}>{name}:</span>;
                    },
                  },
                  {
                    title: '值',
                    dataIndex: 'value',
                    key: 'value',
                    render: (value: string, rowData: any) => {
                      if (rowData!?.name === '简历') {
                        return (
                          <a
                            onClick={() => {
                              handleResumeModal(value);
                            }}
                          >
                            查看
                          </a>
                        );
                      }
                      if (rowData!?.name === '视频简历') {
                        return (
                          <a
                            onClick={() => {
                              resumeVideo(value);
                            }}
                          >
                            查看
                          </a>
                        );
                      }
                      return <span className={styles.value}>{value}</span>;
                    },
                  },
                ];
                let dataSource = props?.userDetails || [];
                return (
                  <div className={styles.popoverUserInfo}>
                    <Table
                      className={styles.infoTable}
                      size={'small'}
                      showHeader={false}
                      pagination={false}
                      dataSource={dataSource}
                      columns={columns}
                    />
                  </div>
                );
              }}
            >
              <Button type="link" onClick={() => {}}>
                <MyIconFont
                  className={classNames(styles.icons)}
                  type="icon-id"
                />
              </Button>
            </Popover>
            {props.paperIsEnable && (
              <Popover
                mouseEnterDelay={0.6}
                placement="top"
                onVisibleChange={(visible) => {
                  if (visible) {
                    props!?.onGetFaceInfo(userInfo!?.id);
                  }
                }}
                content={() => {
                  return (
                    <div>
                      <Space>
                        <span>
                          人脸识别{props?.userFace!?.isOk ? '通过' : '未通过'}
                        </span>
                        <a
                          onClick={() => {
                            if (props!?.userFace!?.url) {
                              setShowFaceImg(props!?.userFace!?.url);
                            } else {
                              Modal.warn({
                                title: '暂无人脸识别图片',
                              });
                            }
                            console.log(props!?.userFace!?.url);
                          }}
                        >
                          查看
                        </a>
                      </Space>
                    </div>
                  );
                }}
              >
                <Button type="link" onClick={() => {}}>
                  <MyIconFont
                    className={classNames(
                      styles.icons,
                      props?.userFace!?.isOk === true && styles.faceIconsOk,
                      props?.userFace!?.isOk == false && styles.faceIconsWarn,
                    )}
                    type="icon-face"
                  />
                </Button>
              </Popover>
            )}
            <Button
              type="link"
              onClick={() => {
                props.onBig(!!props.isBig ? false : true);
                setFullScreen((_type) => {
                  return _type || 'videoRenderFirst';
                });
              }}
            >
              <MyIconFont
                className={classNames(styles.icons)}
                type="icon-opentalk"
              />
            </Button>
          </Space>
        </span>
      </div>
      <Image
        preview={{
          visible: !!isShowFaceImg,
          onVisibleChange: (value) => {
            setShowFaceImg(value);
          },
          destroyOnClose: true,
        }}
        width={0}
        height={0}
        src={`${isShowFaceImg}`}
      />
      <ResumeModal ref={resumeModalRef} />
    </div>
  );
};
