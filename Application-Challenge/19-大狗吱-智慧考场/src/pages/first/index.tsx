import React, { useState, useEffect, PropsWithChildren, useRef } from 'react';
import { Helmet } from 'umi';
import {
  Modal,
  Button,
  Space,
  Image,
  Badge,
  Popover,
  Table,
  message,
  Drawer,
  notification,
  Alert,
  ConfigProvider,
} from 'antd';
import classNames from 'classnames';
import { useMediaQuery } from 'react-responsive';
import styles from './index.less';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  CheckOutlined,
  QuestionCircleFilled,
} from '@ant-design/icons';

import { useDebounce, usePermission, useUnmount } from 'react-use';
import Countdown, { zeroPad } from 'react-countdown';
import WebRTC, {
  RtcLocalView,
  RtcRemoteView,
  autorun,
} from '@hongtangyun/webrtc';
import { RtcTypes } from '@hongtangyun/webrtc/dist/common/Enums';
import { DoctorModal, ValueType } from '../../components/Doctor/doctor';

import { reloadClearCache, serverTime, UserRole } from '@/utils';
import { OnGetTestPaper, OnChangePapers } from '@/components/PaperWrap/types';
import { ChatModal, ChatMsgNum } from '@/components/ChatWrap';
import lodash from 'lodash';
import delay from 'delay';

import EndTip, { EndTipTools } from './components/EndTip';
import { PageProps, RoomStatus } from '../RoomTypes';
import MyIcon from '@/components/MyIconfont';
import { RemoteUser } from '@hongtangyun/webrtc/dist/Types';
import { useImmer } from 'use-immer';
import PuzzleLibs, { TypeEnum } from '@/components/PuzzleLibs';
import { useDebounceEffect, useDebounceFn } from 'ahooks';
import Help from '@/components/Help';
import { HtmlPaperProps } from '@/components/PuzzleLibs/components/htmlPaper';
import { globalFun } from '@/components/GlobalLoading';
import CheatSDK, { EventNames } from '@/utils/CheatSDK';
import LocalSoundNum from '@/components/LocalSoundNum';

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
  if (!deviceValue?.audioinput) {
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
let __disableScreenSharing__: boolean = true;
export interface MainRoomProps extends PageProps {
  defaultDeviceValue?: ValueType;
}
const MainRoom = (props: MainRoomProps) => {
  const {
    qrCode,
    userInfo,
    chatProps,
    handObj,
    onHand,
    defaultRtcInfo,
    privateChat = {
      teacherid: undefined,
      userid: undefined,
      onChange: () => {},
    },
  } = props;
  const [newChatLength, setNewChatLength] = useState<number>(0);
  const [currentRtcInfo, setCurrentRtcInfo] = useState(defaultRtcInfo);
  console.log('currentRtcInfo', currentRtcInfo);
  const [deviceValue, setDeviceValue] = useState<ValueType | undefined>(
    props.defaultDeviceValue,
  );
  const [willEndTipVisible, setWillEndTipVisible] = useState(false);
  const [openHelp, setOpenHelp] = useState<boolean>(false);
  const [disableScreenSharing, setDisableScreenSharing] = useState(true);
  const [disableAudio, setDisableAudio] = useState(false);
  const [disableVideo, setDisableVideo] = useState(false);

  const [joined, setJoined] = useState(false);
  const [published, setPublished] = useState(false);
  const [localStream, setLocalStream] = useState<WebRTC['localStream']>();
  const [remoteUsers, setRemoteUsers] = useState<WebRTC['remoteUsers']>();
  const [clientSdk, setClientSdk] = useState<WebRTC>();

  const chatRef = useRef();

  const isDesktopOrLaptop = useMediaQuery({ minWidth: 1224 });
  const isBigScreen = useMediaQuery({ minWidth: 1824 });
  const isTabletOrMobile = useMediaQuery({ maxWidth: 800 });
  const isPortrait = useMediaQuery({ orientation: 'portrait' });
  const isRetina = useMediaQuery({ minResolution: '2dppx' });

  /**
   * 真实用户id
   */
  const userRealId = userInfo?.id;

  const [doctorVisible, setDoctorVisible] = useState<boolean>(false);
  const onDoctorCahnge = (value: ValueType) => {
    setDeviceValue(value);
    if (clientSdk?.localStream) {
      clientSdk.changeLocalStream(value.videoinput, value.audioinput);
    }
  };
  const handleOpenDoctorModal = async () => {
    setDoctorVisible(true);
  };

  useDebounce(
    async () => {
      let hide = message.loading({
        key: 'global_loading_webrtc',
        content: '获取音视频房间信息...',
      });
      try {
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
        if (!currentRtcInfo) {
          return;
        }
        const _sdk = new WebRTC(
          currentRtcInfo.type === 'agoral'
            ? RtcTypes.AgoraWeb
            : RtcTypes.TRTCWeb,
          {
            uid: currentRtcInfo.uid,
            token: currentRtcInfo.token,
            appid: `${currentRtcInfo.appid}`,
            channel: `${currentRtcInfo.channel}`,
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
    [currentRtcInfo?.uid, currentRtcInfo?.token, currentRtcInfo?.channel],
  );

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
  const isHand = lodash.get(handObj, `${userInfo?.id}`, false);

  useEffect(() => {
    if (chatProps?.messages && chatProps?.messages?.length) {
      const newLength = chatProps?.messages?.length - ChatMsgNum?.getNum();
      setNewChatLength(newLength);
    }
  }, [chatProps?.messages]);

  useDebounceEffect(
    () => {
      if (remoteUsers && remoteUsers.length) {
        /**
         * 判断是否有自己共享屏幕流
         */
        const sInde = remoteUsers.findIndex(
          (i) => i.uid === `${UserRole.考生屏幕分享}${userInfo.id}`,
        );
        if (sInde > -1) {
          setDisableScreenSharing(false);
        }
      }
    },
    [remoteUsers, userInfo],
    {
      wait: 500,
    },
  );

  useUnmount(() => {
    try {
      clientSdk?.stopScreenSharing();
    } catch (error) {
      console.error(`useUnmount stopScreenSharing error : ${err}`);
    }
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
        try {
          clientSdk?.stopScreenSharing();
        } catch (error) {
          console.error(`useUnmount stopScreenSharing error : ${err}`);
        }
        clientSdk?.clearLocalRTCStream();
        clientSdk.unpublish();
        clientSdk.destroy();
      }
    }
  }, [props.roomStatusProps.status]);

  useEffect(() => {
    __disableScreenSharing__ = disableScreenSharing;
    if (__disableScreenSharing__) {
      // document.body.requestFullscreen();
    }
  }, [disableScreenSharing]);

  const initCheat = async () => {};

  useEffect(() => {
    // document.body.requestFullscreen();
    const testCheat = new CheatSDK({
      events: Object.values(EventNames),
    });
    const cheatErrNotificationClassName = 'cheatErrNotificationClassName';
    let errList: string[] = [];
    let onClose = () => {
      errList = [];
      notification.close(EventNames.mouseleave);
      if (__disableScreenSharing__) {
        // document.body.requestFullscreen();
      }
      setTimeout(() => {
        if (
          document.querySelectorAll('.cheatErrNotificationClassName').length <=
          0
        ) {
          testCheat.hideTip();
        }
      }, 600);
    };
    onClose = lodash.debounce(onClose, 600);
    const showTip = (text: string, hideText?: boolean) => {
      testCheat.showTip();
      errList.unshift(text);
      errList = lodash.compact(errList);
      if (hideText) {
        errList = errList.filter((i) => i !== text);
      }
      if (errList.length) {
        notification.warn({
          className: cheatErrNotificationClassName,
          key: EventNames.mouseleave,
          message: `检测到异常`,
          description: (
            <div>
              <div className={styles.tipSpan}>
                为了公平公正，请误违反规则，否则将判考试异常
              </div>
              <div style={{ maxHeight: 100, overflow: 'auto' }}>
                {errList?.map((item: string, index) => {
                  return (
                    <div key={`${item}_${index}`}>
                      <span>{errList.length - index}: </span>
                      {item}
                    </div>
                  );
                })}
              </div>
            </div>
          ),
          duration: 0,
          btn: [
            <ConfigProvider prefixCls={__prefixCls__}>
              <Button
                onClick={() => {
                  onClose();
                }}
              >
                知道了
              </Button>
            </ConfigProvider>,
          ],
          onClose: () => {
            onClose();
          },
        });
      } else {
        onClose();
      }
    };
    testCheat.on((data) => {
      if (data.eventname === EventNames.mouseleave) {
        if (__disableScreenSharing__) {
          showTip('请误把鼠标离开页面');
          // document.body.requestFullscreen();
        }
      }
      if (data.eventname === EventNames.mouseenter) {
        if (__disableScreenSharing__) {
          // document.body.requestFullscreen();
        }
      }
      if (data.eventname === EventNames.blur) {
        if (__disableScreenSharing__) {
          showTip('请误离开页面');
          // document.body.requestFullscreen();
        }
      }
      if (data.eventname === EventNames.focus) {
        if (__disableScreenSharing__) {
          // document.body.requestFullscreen();
        }
      }
      if (data.eventname === EventNames.exitfullscreen) {
        if (__disableScreenSharing__) {
          showTip('请误退出全屏');
          // document.body.requestFullscreen();
        }
      }
      if (data.eventname === EventNames.resize) {
        if (__disableScreenSharing__) {
          showTip('请误改变页面大小');
          // document.body.requestFullscreen();
        }
      }
      if (data.eventname === EventNames.copy) {
        showTip('请误复制页面内容');
      }
      if (data.eventname === EventNames.cut) {
        showTip('请误剪贴页面内容');
      }
      if (data.eventname === EventNames.paste) {
        showTip('请误粘贴数据到页面');
      }
      if (data.eventname === EventNames.select) {
        showTip('请误选中页面内容');
      }
      if (data.eventname === EventNames.offline) {
        showTip('网络断开，请检查网络');
      }
      if (data.eventname === EventNames.online) {
        showTip('网络断开，请检查网络', true);
      }
    });
    return () => {
      testCheat.destroy();
    };
  }, []);

  return (
    <div
      className={classNames(
        styles.page,
        isTabletOrMobile && styles.isTabletOrMobile,
      )}
    >
      <Helmet>
        <title>笔试房间---第一机位</title>
      </Helmet>
      {!isTabletOrMobile && (
        <div className={styles.headerToolsWrap}>
          <div className={styles.titleWrap}>
            <h1 className={styles.title}>笔试房间</h1>
          </div>
          <div className={styles.toolsWrap}>
            <Space size="middle">
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
                  // setDisableAudio((_disableAudio) => {
                  //   clientSdk?.disableAudio(!_disableAudio);
                  //   return !_disableAudio;
                  // });
                }}
              >
                <LocalSoundNum muteAudio={disableAudio} stream={localStream} />
                <strong>{disableAudio ? '启用' : ''}麦克风</strong>
              </Button>
              <Button
                className={styles.headerTools}
                onClick={async () => {
                  // setDeviceValue()
                  const getScreenSharingConfig = props?.getScreenSharingConfig;
                  if (getScreenSharingConfig) {
                    if (disableScreenSharing) {
                      setDisableScreenSharing(false);
                      const _roomid = currentRtcInfo?.channel.split('_').pop();
                      const config = await getScreenSharingConfig(_roomid);
                      const _screenStream = await clientSdk?.startScreenSharing(
                        {
                          appid: `${config.appid}`,
                          channel: `${config.channel}`,
                          token: config.token,
                          uid: config.uid,
                        },
                        (err: any) => {
                          console.log('startScreenSharing error: ', err);
                          if (!!err) {
                            try {
                              window
                                ?.require('electron')
                                ?.remote.getCurrentWindow()
                                ?.focus();
                            } catch (error) {
                              console.log('桌面端才可focus');
                            }
                            try {
                              // @ts-ignore
                              __DESKTOP_SDK__?.getCurrentWindow()?.focus();
                            } catch (error) {
                              console.log('桌面端才可focus');
                            }
                            setDisableScreenSharing(true);
                          }
                        },
                      );
                      if (_screenStream === true) {
                        _screenStream?.localStream?.then(() => {
                          try {
                            window
                              ?.require('electron')
                              ?.remote?.getCurrentWindow()
                              ?.minimize();
                          } catch (error) {
                            console.log('桌面端才可最小化窗口');
                          }
                          try {
                            // @ts-ignore
                            __DESKTOP_SDK__?.getCurrentWindow()?.minimize();
                          } catch (error) {
                            console.log('桌面端才可focus');
                          }
                        });
                      } else {
                        try {
                          window
                            ?.require('electron')
                            ?.remote?.getCurrentWindow()
                            ?.minimize();
                        } catch (error) {
                          console.log('桌面端才可最小化窗口');
                        }
                        try {
                          // @ts-ignore
                          __DESKTOP_SDK__?.getCurrentWindow()?.minimize();
                        } catch (error) {
                          console.log('桌面端才可focus');
                        }
                      }
                    } else {
                      Modal.confirm({
                        title: '是否关闭共享屏幕',
                        content: '关闭后将无法看到你屏幕视频',
                        cancelText: '再想想',
                        onCancel: () => {},
                        okText: '关闭',
                        onOk: () => {
                          clientSdk?.stopScreenSharing();
                          setDisableScreenSharing(true);
                        },
                      });
                    }
                  } else {
                    Modal.warn({
                      title: '确少屏幕共享配置',
                    });
                  }
                }}
              >
                <MyIcon
                  className={classNames(
                    styles.icon,
                    !disableScreenSharing && styles.on,
                  )}
                  type="icon-sharescreen"
                />
                <strong>
                  {disableScreenSharing ? '共享屏幕' : '取消共享'}
                </strong>
              </Button>
              <Button
                className={styles.headerTools}
                onClick={() => {
                  onHand(!isHand);
                }}
              >
                <MyIcon
                  type="icon-hands1"
                  className={classNames(
                    styles.icon,
                    styles.icon002,
                    isHand && styles.onIcon002,
                  )}
                ></MyIcon>
                <strong>{isHand && '取消'}举手</strong>
              </Button>
              <Button
                className={styles.headerTools}
                onClick={() => {
                  chatRef.current?.show();
                }}
              >
                <Badge
                  count={
                    lodash.isNumber(chatProps?.unreadNumber)
                      ? chatProps?.unreadNumber
                      : 0
                  }
                >
                  <MyIcon
                    type="icon-talk_full"
                    className={classNames(styles.icon)}
                  ></MyIcon>
                </Badge>
                <strong>聊天</strong>
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
                    type="icon-config"
                    className={classNames(styles.icon)}
                  ></MyIcon>
                  <strong>设置</strong>
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
            </Space>
          </div>
        </div>
      )}

      {willEndTipVisible && <EndTip />}
      <div className={styles.body}>
        <div className={styles.left}>
          <div className={styles.countdownWrap}>
            <h2>距离考试结束</h2>
            <div>
              <Countdown
                daysInHours
                key={props?.endTime}
                date={props?.endTime}
                now={() => {
                  return window?.__room_sdk__?.getTime();
                }}
                onComplete={() => {
                  EndTipTools.showEndModal();
                  props.roomStatusProps.onChagne(RoomStatus.已结束);
                }}
                renderer={(data) => {
                  const { hours, minutes, seconds } = data?.formatted;
                  const isTimeMin =
                    parseInt(hours) === 0 &&
                    parseInt(minutes) < 5 &&
                    parseInt(minutes) >= 0;
                  if (!willEndTipVisible && isTimeMin) {
                    setWillEndTipVisible(true);
                  }
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
                    </Space>
                  );
                }}
              />
            </div>
          </div>
          <div className={styles.gridLayoutWrap}>
            <VideoWrap
              localStream={localStream}
              rtcType={clientSdk?.rtcType}
              audiooutput={deviceValue?.audiooutput}
            ></VideoWrap>
            {props?.isDualCamera === true && (
              <VideoWrap
                rtcType={clientSdk?.rtcType}
                qrCode={qrCode}
                remoteUsers={remoteUsers}
                remoteUid={parseInt(`${UserRole.第二机位}${userRealId}`)}
                audiooutput={deviceValue?.audiooutput}
              ></VideoWrap>
            )}
          </div>
          {!disableScreenSharing ? (
            <div className={styles.otherVideoWrap}>
              <VideoWrap
                rtcType={clientSdk?.rtcType}
                remoteUsers={remoteUsers}
                remoteUid={parseInt(`${UserRole.考生屏幕分享}${userRealId}`)}
                audiooutput={deviceValue?.audiooutput}
              />
            </div>
          ) : undefined}
          <div className={styles.otherVideoWrap}>
            {privateChat!?.userid &&
              privateChat!?.userid === userInfo.id &&
              privateChat.teacherid &&
              clientSdk && (
                <VideoWrap
                  rtcType={clientSdk?.rtcType}
                  remoteUid={
                    remoteUsers?.find(
                      ({ uid }) =>
                        `${uid}`.substring(2) === `${privateChat.teacherid}`,
                    )?.uid
                  }
                  remoteUsers={remoteUsers}
                  audiooutput={deviceValue?.audiooutput}
                />
              )}
          </div>
        </div>
        <div className={styles.right}>
          {!props?.paperProps?.list && (
            <div className={styles.paperWrap}>
              <div className={styles.tipCardWrap}>
                <h2 className={styles.tipCardHeader}>
                  注意事项{props?.paperProps?.list?.length}
                </h2>
                <div className={styles.tipTextWrap}>
                  <p>
                    <strong>1、</strong>
                    考生需在一个安静的房间，中途不能被打扰，噪音应低于40分贝
                  </p>
                  <p>
                    <strong>2、</strong>
                    考生双手摆放桌面，第一机位从正面拍摄，放置在距离本人30cm处，完整拍摄到考生双手以上身体部位
                  </p>
                  <p>
                    <strong>3、</strong>
                    考试时需关闭电脑和手机中与考试无关的软件与应用
                  </p>
                  <p>
                    <strong>4、</strong>
                    请保证稳定的网络环境，最好是网线接入，备用4G/wifi
                  </p>
                  <p>
                    <strong>5、</strong>保证电脑或者手机充满电
                  </p>
                  <p>
                    <strong>6、</strong>
                    在面试过程中因断电、断网等情况导致异常退出，若间隔时间很短，可重新登录系统继续参加考试，若间隔时间较长，可联系企业说明情况
                  </p>
                  <p>
                    <strong>7、</strong>
                    若考试要求使用双机位，则第二机位需从考生侧后方45°距离本人1m处拍摄，可以拍摄到考生侧面及主设备电脑全屏幕，需保证面试考官能够从第二机位清晰看到第一机位的屏幕。
                  </p>
                </div>
                <div className={styles.tipCardFooter}>
                  <Button
                    type="primary"
                    onClick={() => {
                      props?.paperProps?.onGetPapers();
                    }}
                  >
                    查看试卷
                  </Button>
                </div>
              </div>
            </div>
          )}
          {props?.paperProps?.list && (
            <RenderTable
              timingConfig={props?.paperProps?.timingConfig}
              data={props?.paperProps?.list}
              onChangePapers={props?.paperProps?.onChangePapers}
              onGetPaperForID={props?.paperProps?.onGetPaperForID}
              onGetPaperAnswerForID={props?.paperProps?.onGetPaperAnswerForID}
            />
          )}
        </div>
      </div>
      <ChatModal ref={chatRef} {...props?.chatProps} />
      <DoctorModal
        visible={doctorVisible}
        value={deviceValue}
        onChange={onDoctorCahnge}
        onClose={() => {
          setDoctorVisible(false);
        }}
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
  length: number;
  isBig: boolean;
  onBig: () => void;
  remoteUid?: number;
  remoteUsers?: RemoteUser[];
  qrCode?: string;
  localStream?: RemoteUser;
  rtcType: any;
  audiooutput?: string;
}
const VideoWrap: React.FC<any> = (props: PropsWithChildren<VideoWrapProps>) => {
  const [isFullScreen, setFullScreen] = useState<boolean>(false);
  const videoSize = {
    ...props.style,
  };
  const [isPlayAudio, setIsPlayAudio] = useState(false);
  const [itemRemoteStream, setItemRemoteStream] = useState<
    RemoteUser | undefined
  >(undefined);
  const [, cancel] = useDebounce(
    () => {
      let _itemRemoteStream: any;
      let _isPlayAudio: boolean = false;
      if (props.remoteUid && lodash.isArray(props?.remoteUsers)) {
        (props?.remoteUsers || []).forEach((item) => {
          if (`${item?.uid}` === `${props.remoteUid}`) {
            _itemRemoteStream = item;
            window.___itemRemoteStream = item;
          }
        });
        setItemRemoteStream(_itemRemoteStream);
        if (`${props.remoteUid}`.startsWith(`${UserRole.第二机位}`)) {
          setIsPlayAudio(false);
        } else {
          setIsPlayAudio(true);
        }
      }
    },
    1000,
    [props.remoteUid, props?.remoteUsers],
  );
  useUnmount(() => {
    cancel();
  });
  return (
    <div style={videoSize} className={classNames(styles.videoWrap)}>
      <div className={classNames(styles.videoBox)}>
        {props.qrCode && (
          <div className={styles.qrImgWrap}>
            <Image
              className={styles.qrImg}
              src={
                props.qrCode?.startsWith('http')
                  ? props.qrCode
                  : `${props.qrCode}`
              }
            />
          </div>
        )}
        {props.localStream && (
          <RtcLocalView
            rtcType={props?.rtcType}
            localStream={props.localStream}
            fit="contain"
          />
        )}
        {props.remoteUid && itemRemoteStream && (
          <RtcRemoteView
            rtcType={props?.rtcType}
            remoteStream={itemRemoteStream}
            fit="contain"
            isPlayVideo={true}
            isPlayAudio={isPlayAudio}
            audioOutputDeviceId={props?.audiooutput}
          />
        )}
        <span className={styles.toolsWrap}>
          <Button
            type="link"
            onClick={() => {
              props.onBig && props.onBig();
            }}
          >
            {props.isBig ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          </Button>
        </span>
      </div>
    </div>
  );
};

interface RenderTableProps {
  submitLimit?: number;
  data: any[];
  onChangePapers: OnChangePapers;
  onGetPaperForID: Function;
  onGetPaperAnswerForID: Function;
  timingConfig?: HtmlPaperProps['timingConfig'];
}
/**
 * 状态
 * [1] 文档型试卷
 * [2] 在线型试卷
 * [3] url型试卷
 * [4] wps型试卷
 */
enum PaperType {
  'PDF' = 1,
  '在线编辑' = 2,
  '网页' = 3,
  'wps文档' = 4,
}

function RenderTable(props: RenderTableProps) {
  const [paperObj, setPaperObj] = useImmer({});
  const [currentPaper, setCurrentPaper] = useState();
  const [initValue, setInitValue] = useState();
  const testRef = useRef<HTMLDivElement>();
  const data = props?.data || {};

  const columns = [
    {
      title: '试卷名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '题数',
      dataIndex: 'totalQuestion',
      key: 'totalQuestion',
      render: (data) => {
        return <div>{data || '---'}</div>;
      },
    },
    {
      title: '分数',
      dataIndex: 'totalScore',
      key: 'totalScore',
      render: (data, row) => {
        return <div>{(data && data!?.toFixed(2)) || '---'}</div>;
      },
    },
    {
      title: '答题进度',
      dataIndex: 'totalQuestion',
      key: 'totalQuestion',
      render: (item, row) => {
        let endS: number = 0;
        const _currentPaper: HTML_PAPER_DATA = lodash.cloneDeep(row) as any;
        _currentPaper?.bigQuestions &&
          _currentPaper?.bigQuestions?.forEach((item) => {
            const { questions = [] } = item;
            questions?.forEach((item) => {
              if (lodash.get(item, 'respond', []).length > 0) {
                endS += 1;
              }
            });
          });
        return (
          <div>
            {endS || '0'}/{item || '---'}
          </div>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'address',
      key: 'address',
      render: (item, row) => {
        return (
          <div>
            <a
              href=""
              onClick={async (e) => {
                e.preventDefault();
                if (props.onGetPaperForID) {
                  const data = await props.onGetPaperForID(row.id, row);
                  if (data.type === PaperType.在线编辑) {
                    const a = await props.onGetPaperAnswerForID(row.id);
                    const htmlData = {
                      type: TypeEnum.HTML,
                      data: data.sourceData,
                    };
                    setInitValue(a);
                    setPaperObj((_obj) => {
                      return {
                        ..._obj,
                        [row.id]: htmlData,
                      };
                    });
                  }

                  if (data.type === PaperType.PDF) {
                    const pdfData = {
                      type: TypeEnum.PDF,
                      data: data.sourceData,
                      // data: {
                      //   id: '123123',
                      //   name: 'pdfData',
                      //   startTime: 111,
                      //   endTime: 222,
                      //   answerSheetUrl:
                      //     'https://dagouzhi.oss-cn-qingdao.aliyuncs.com/assets/sample.pdf',
                      //   url: 'https://dagouzhi.oss-cn-qingdao.aliyuncs.com/assets/sample.pdf',
                      // },
                    };
                    setPaperObj((_obj) => {
                      return {
                        ..._obj,
                        [row.id]: pdfData,
                      };
                    });
                  }

                  if (data.type === PaperType.网页) {
                    const c = {
                      type: TypeEnum.URL,
                      data: data.sourceData,
                    };
                    setPaperObj((_obj) => {
                      return {
                        ..._obj,
                        [row.id]: c,
                      };
                    });
                  }

                  if (data.type === PaperType.wps文档) {
                    const c = {
                      type: TypeEnum.URL,
                      data: data.sourceData,
                    };
                    setPaperObj((_obj) => {
                      return {
                        ..._obj,
                        [row.id]: c,
                      };
                    });
                  }

                  setCurrentPaper(row.id);
                }
              }}
            >
              开始答题
            </a>
          </div>
        );
      },
    },
  ];

  return (
    <div ref={testRef} className={styles.testTableWrap}>
      <Helmet>
        <title>第一机位---笔试房间</title>
      </Helmet>
      {!currentPaper && (
        <>
          <div className={styles.body}>
            <Table
              style={{
                width: '100%',
              }}
              pagination={false}
              className={styles.table}
              dataSource={data}
              columns={columns}
            />
          </div>
          <div className={styles.footer}>
            <Countdown
              daysInHours
              key={props.submitLimit}
              date={props.submitLimit}
              now={() => {
                return window?.__room_sdk__?.getTime();
              }}
              onComplete={() => {}}
              renderer={(data) => {
                const { hours, minutes, seconds } = data?.formatted;
                const isDisabled =
                  data.hours > 0 || data.minutes > 0 || data.seconds > 0;
                return (
                  <Button
                    type="primary"
                    disabled={isDisabled}
                    onClick={() => {}}
                  >
                    {isDisabled ? (
                      <Space>
                        <span className={styles.countdownItem}>
                          {zeroPad(hours)}
                        </span>
                        <span>:</span>
                        <span className={styles.countdownItem}>
                          {zeroPad(minutes)}
                        </span>
                        <span>:</span>
                        <span className={styles.countdownItem}>
                          {zeroPad(seconds)}
                        </span>
                        <span>我要交卷</span>
                      </Space>
                    ) : (
                      '我要交卷'
                    )}
                  </Button>
                );
              }}
            />
          </div>
        </>
      )}
      {currentPaper && (
        <>
          <PuzzleLibs
            width={'100%'}
            height={'100%'}
            currentPaper={lodash.get(paperObj, `${currentPaper}`)}
            readonly={false}
            showTip={false}
            initValue={initValue}
            timingConfig={props?.timingConfig}
            onChange={async (data) => {
              console.log('onChangePapers: ', data);
              if (props.onChangePapers) {
                props.onChangePapers('change', {
                  paperid: currentPaper,
                  data: data,
                });
              }
            }}
            onSubmit={async (data) => {
              console.log('onSubmit: ', data);
            }}
            onBack={() => {
              setCurrentPaper(undefined);
            }}
          />
        </>
      )}
    </div>
  );
}
