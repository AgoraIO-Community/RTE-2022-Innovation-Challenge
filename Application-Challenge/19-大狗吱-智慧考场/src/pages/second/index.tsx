import React, { useState, useEffect, PropsWithChildren } from 'react';
import { Helmet, useRouteMatch } from 'umi';
import { Modal, Button, Space, Badge, Popover, message } from 'antd';
import classNames from 'classnames';
import styles from './index.less';
import delay from 'delay';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  CheckOutlined,
} from '@ant-design/icons';

import { useDebounce, useMeasure, usePermission } from 'react-use';
import WebRTC, {
  RtcLocalView,
  RtcRemoteView,
  autorun,
} from '@hongtangyun/webrtc';
import { RtcTypes } from '@hongtangyun/webrtc/dist/common/Enums';
import DoctorWrap, { ValueType } from '@/components/Doctor/doctor';

import { reloadClearCache, UserRole } from '@/utils';
import { PageProps } from '../RoomTypes';
import { DoctorModal } from '@/components/Doctor/doctor';
import { useImmer } from 'use-immer';
import { useDebounceEffect } from 'ahooks';
import { useMobileStatusBarHeight } from '@/utils/useWindowFocus';
import { useMediaQuery } from 'react-responsive';
import { globalFun } from '@/components/GlobalLoading';

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
export interface MainRoomProps extends PageProps {
  defaultDeviceValue?: ValueType;
}
const MainRoom = (props: MainRoomProps) => {
  const { defaultRtcInfo } = props;
  const { params } = useRouteMatch();
  const [deviceValue, setDeviceValue] = useState<ValueType>();
  const [doctorVisible, setDoctorVisible] = useState(false);
  const [currentRtcInfo, setCurrentRtcInfo] = useState(defaultRtcInfo);
  const statusBarHeight = useMobileStatusBarHeight();
  const [joined, setJoined] = useState(false);
  const [published, setPublished] = useState(false);
  const [localStream, setLocalStream] = useState<WebRTC['localStream']>();
  const [remoteUsers, setRemoteUsers] = useState<WebRTC['remoteUsers']>();

  const [clientSdk, setClientSdk] = useState<WebRTC>();

  const isDesktopOrLaptop = useMediaQuery({ minWidth: 1224 });
  const isBigScreen = useMediaQuery({ minWidth: 1824 });
  const isTabletOrMobile = useMediaQuery({ maxWidth: 800 });
  const isPortrait = useMediaQuery({ orientation: 'portrait' });
  const isRetina = useMediaQuery({ minResolution: '2dppx' });

  const onDoctorCahnge = (value: ValueType) => {
    setDeviceValue(value);
    setDoctorVisible(false);
    if (clientSdk?.localStream) {
      clientSdk.changeLocalStream(value.videoinput, value.audioinput);
    }
  };

  useDebounce(
    async () => {
      if (props?.isDualCamera !== true) {
        return;
      }
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
        _sdk.disableAudio(true);
      } catch (error) {
      } finally {
        hide();
      }
    },
    600,
    [currentRtcInfo?.uid, currentRtcInfo?.token, props?.isDualCamera],
  );

  useDebounceEffect(
    () => {
      if (localStream && joined && !published) {
        clientSdk?.publish();
        clientSdk?.disableAudio(true);
        setPublished(true);
      }
    },
    [localStream, joined, published],
    { wait: 500 },
  );

  return (
    <div className={styles.page}>
      <Helmet>
        <title>第二机位---笔试房间</title>
      </Helmet>
      {!isTabletOrMobile && (
        <div
          className={styles.headerToolsWrap}
          style={{
            paddingTop: statusBarHeight || 0,
          }}
        >
          <div className={styles.titleWrap}>
            <h1 className={styles.title}>
              笔试房间<span className={styles.subTitle}>(第二机位)</span>
            </h1>
          </div>
          <div className={styles.toolsWrap}>
            <Space size="middle">
              <Button
                className={styles.headerTools}
                onClick={() => {
                  setDoctorVisible(true);
                }}
              >
                <span
                  className={classNames(styles.icon, styles.icon001)}
                ></span>
                <strong>设备检测</strong>
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
                  <span
                    className={classNames(styles.icon, styles.icon004)}
                  ></span>
                  <strong>设置</strong>
                </Button>
              </Popover>
            </Space>
          </div>
        </div>
      )}
      <div className={styles.body}>
        <VideoWrap onBig={() => {}}>
          {props.userRole === UserRole.第二机位 && clientSdk && localStream && (
            <RtcLocalView
              rtcType={clientSdk?.rtcType}
              localStream={localStream}
              fit="contain"
            />
          )}
        </VideoWrap>
      </div>
      <DoctorModal
        visible={doctorVisible}
        value={deviceValue}
        onChange={onDoctorCahnge}
        onClose={() => {
          setDoctorVisible(false);
        }}
      />
    </div>
  );
};
interface VideoWrapProps {
  length: number;
  isBig: boolean;
  onBig: () => void;
}
const VideoWrap: React.FC<any> = (props: PropsWithChildren<VideoWrapProps>) => {
  const [isFullScreen, setFullScreen] = useState<boolean>(false);
  const videoSize = {
    ...props.style,
  };
  return (
    <div style={videoSize} className={classNames(styles.videoWrap)}>
      <div className={classNames(styles.videoBox)}>
        {props.children}
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
