import React, { useState, useEffect, PropsWithChildren, useRef } from 'react';
import { Helmet } from 'umi';
import {
  Modal,
  Button,
  Space,
  Image,
  Pagination,
  Radio,
  Popover,
  Table,
  message,
  Badge,
} from 'antd';
import { useMediaQuery } from 'react-responsive';
import classNames from 'classnames';
import styles from './index.less';
import delay from 'delay';
import { ReloadOutlined, CloseOutlined } from '@ant-design/icons';

import { useDebounce, useUnmount } from 'react-use';
import Countdown, { zeroPad } from 'react-countdown';
import WebRTC, {
  RtcLocalView,
  RtcRemoteView,
  autorun,
} from '@hongtangyun/webrtc';
import { RtcTypes } from '@hongtangyun/webrtc/dist/common/Enums';
import lodash from 'lodash';
import MyIconFont from '@/components/MyIconfont';
import { Layout_enum, serverTime, UserRole } from '@/utils';
import { AbnormalModal } from './components/AbnormalModal';
import { PageProps, RoomStatus, SendPapersType, UserItem } from '../RoomTypes';
import { ResumeModal } from './components/ResumeModal';
import { RemoteUser } from '@hongtangyun/webrtc/dist/Types';
import { resumeVideo } from './components/ResumeVideoModal';
import MyIcon from '@/components/MyIconfont';
import { globalFun } from '@/components/GlobalLoading';

export default function DoctorInitWrap(props: PageProps) {
  return <MainRoom {...props} />;
}
export interface MainRoomProps extends PageProps {}
const MainRoom = (props: MainRoomProps) => {
  const {
    isDualCamera,
    userRole,
    defaultRtcInfo,
    userInfo,
    handObj,
    users = [],
    attendanceProps,
    muteAudioProps,
    userDetailsProps,
    userFaceProps,
    roomStatusProps,
    abnormalProps,
  } = props;

  const [privateChat, setPrivateChat] = useState({
    userid: undefined,
    onChange: () => {},
  });

  const abnormalModalRef = useRef<AbnormalModal>();
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

  useUnmount(() => {
    try {
      clientSdk?.clearLocalRTCStream();
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

  useEffect(() => {
    globalFun.hideLoading();
  }, []);

  return (
    <div className={styles.page}>
      <Helmet>
        <title>监考端</title>
      </Helmet>
      <div className={styles.mainBox}>
        <div
          className={classNames(styles.bodyHeaderWrap, styles.headerToolsWrap)}
        >
          <h1 className={classNames(styles.roomTitle, styles.titleWritten)}>
            笔试
          </h1>
          <div className={styles.titleWrap}>
            <Space>
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
              <div>试卷已下发</div>
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
                  lodash.isNumber(privateChat!?.userid) &&
                  lodash.isNumber(privateChat!?.teacherid) &&
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
                          setPrivateChat(() => {
                            if (!isOpen) {
                              return {};
                            }
                            return {
                              userid,
                              teacherid: props.userInfo.id,
                            };
                          });
                        }}
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
                  const _currentRtcInfo = lodash.get(rtcInfo, `[${page}]`);

                  // if (_currentRtcInfo) {
                  //   setCurrentRtcInfo(_currentRtcInfo);
                  // }
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div className={classNames(styles.mainChat)}>
        <div
          onClick={() => {
            setOpenChat((isOpen) => {
              return !isOpen;
            });
          }}
          className={classNames(styles.chatBoxBtn)}
        />
        <div className={styles.chatBody}>
          <div className={styles.bodyHeaderWrap}>
            <strong
              className={classNames(
                styles.headerTitle,
                styles.titleStudentList,
              )}
            >
              考生列表
            </strong>
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
                          src={userInfo?.avatar || require('./assets/user.png')}
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
                  {isMuteAuidoAll ? '取消全体禁音' : '一键静音'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AbnormalModal
        ref={abnormalModalRef}
        onClose={props!?.abnormalProps!?.onClose}
      />
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
          <div className={styles.toolsLeftWrap}>
            <Button type="link" onClick={() => {}}>
              {_isMuteAudio ? (
                <MyIconFont
                  className={classNames(
                    styles.icons,
                    styles.iconVoice,
                    styles.iconVoiceMute,
                  )}
                  type="icon-no_voice"
                />
              ) : (
                <MyIconFont
                  className={classNames(styles.icons, styles.iconVoice)}
                  type="icon-voice"
                />
              )}
            </Button>
            <div className={styles.nameWrap}>
              <span className={styles.name}>{userInfo?.name || '---'}</span>
            </div>
          </div>
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
              {props.isBig ? (
                <MyIcon className={styles.icons} type="icon-offscreen" />
              ) : (
                <MyIcon className={styles.icons} type="icon-fullscreen" />
              )}
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
