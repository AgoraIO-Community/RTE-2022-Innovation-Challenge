import {
  Button,
  ConfigProvider,
  Modal,
  notification,
  Result,
  Space,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useTimeout } from 'react-use';
import Countdown, { zeroPad } from 'react-countdown';
import styles from './styles.less';
import delay from 'delay';
import lottie from 'lottie-web';
import URLParse from 'url-parse';
import tipAudio from './assets/tip.mp3';
import searchingJson from './assets/100256-tech-coding-upload.json';

type GLoadingProps = {
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  /**
   * 毫米 超时
   * 默认 30s
   */
  ms?: number;
};
function GLoading(props: GLoadingProps) {
  const lottRef = useRef<HTMLDivElement>();
  const { title, subTitle } = props;
  const ms = 1000 * 30;
  const [isReady, cancel] = useTimeout(props.ms || ms);
  const [countdownTime, setCountDownTime] = useState(0);
  useEffect(() => {
    setCountDownTime(Date.now() + ms);
    if (lottRef.current) {
      lottie.loadAnimation({
        name: 'globalLoading',
        container: lottRef.current, // the dom element that will contain the animation
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: searchingJson,
      });
    }
    return () => {
      cancel();
      lottie.destroy('globalLoading');
    };
  }, []);
  const err = isReady();
  return (
    <div
      className={styles.gloadingWrap}
      style={{ background: '#fff', borderRadius: 4 }}
    >
      <Result
        title={
          title ? (
            title
          ) : (
            <span>
              加载系统资源中
              <span className={styles.dotting}></span>
            </span>
          )
        }
        subTitle={
          subTitle ? (
            subTitle
          ) : (
            <span>
              <span>
                加载资源中, 需要一些时间，请耐心等待
                <Countdown
                  key={countdownTime}
                  date={countdownTime}
                  renderer={(data) => {
                    const { seconds } = data?.formatted;
                    return `(${zeroPad(seconds)})`;
                  }}
                />
              </span>
              {err === true ? <div>(长时间加载可点`刷新重试`)</div> : ''}
            </span>
          )
        }
        icon={
          <div className={styles.loaderWrap}>
            <div className={styles.loadingLottieWrap}>
              <div className={styles.loadingLottie} ref={lottRef} />
            </div>
          </div>
        }
        extra={
          err === true ? (
            <Button
              type="primary"
              onClick={() => {
                reloadClearCache(window.location.href);
              }}
            >
              刷新重试
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}

/**
 * 全局方法
 */
export class GLOBAL_FUN {
  loadingModal: any;
  audioContext?: AudioContext;
  audioSource?: AudioBufferSourceNode;
  audioBuffer?: AudioBuffer;
  constructor() {
    this.initAudio();
  }
  initAudio = async () => {
    try {
      this.audioContext = new AudioContext();
      const context = this.audioContext;
      if (!this.audioBuffer) {
        window
          .fetch(tipAudio)
          .then((response) => response.arrayBuffer())
          .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
          .then((audioBuffer) => {
            const source = context.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(context.destination);
            source.loop = true;
            this.audioBuffer = audioBuffer;
            this.audioSource = source;
          });
      } else {
        const source = context.createBufferSource();
        source.buffer = this.audioBuffer;
        source.connect(context.destination);
        source.loop = true;
        this.audioBuffer = this.audioBuffer;
        this.audioSource = source;
      }
    } catch (error) {}
  };
  playAudio = async () => {
    try {
      await this.initAudio();
      const context = this.audioContext;
      const audioSource = this.audioSource;
      if (context && audioSource) {
        audioSource.loop = false;
        audioSource.start(0);
      }
    } catch (error) {
      console.error(error);
    }
  };
  stopAudio = () => {
    try {
      const context = this.audioContext;
      const audioSource = this.audioSource;
      if (context && audioSource) {
        audioSource.stop(0); //立即停止
      }
    } catch (error) {}
  };
  /**
   * 全局加载loading
   * @param text
   */
  async showLoading(text: string) {
    this.loadingModal = Modal.warning({
      centered: true,
      closable: true,
      maskClosable: false,
      maskTransitionName: styles.bg,
      modalRender: () => {
        return <GLoading />;
      },
    });
  }
  async updateLoading(text: string) {
    if (!this.loadingModal) {
      this.loadingModal(text);
    } else {
      this.loadingModal.update((prevConfig: any) => ({
        ...prevConfig,
      }));
    }
  }
  async hideLoading() {
    if (this.loadingModal) {
      await delay(1000);
      this.loadingModal?.destroy();
      this.loadingModal = undefined;
    }
  }
  /**
   * 全局时间提示
   * @param text
   * @param description
   */
  async showTimeTip(text: string, description?: string) {
    this.playAudio();
    notification.warning({
      key: '__GLOBAL_FUN_FOR_RoomTimeTip__',
      message: text,
      placement: 'topRight',
      onClose: () => {
        this.hideTimeTip();
      },
      description: description ? (
        <ConfigProvider prefixCls={__prefixCls__}>
          <p>{description}</p>
        </ConfigProvider>
      ) : undefined,
      duration: 0,
      btn: [
        <ConfigProvider prefixCls={__prefixCls__}>
          <Space>
            <Button
              type="primary"
              onClick={() => {
                this.hideTimeTip();
              }}
            >
              知道了
            </Button>
          </Space>
        </ConfigProvider>,
      ],
    });
  }
  /**
   * 关闭全局时间提示
   */
  async hideTimeTip() {
    this.stopAudio();
    notification.close('__GLOBAL_FUN_FOR_RoomTimeTip__');
  }
  /**
   * 全局房间状态提示
   * @param text
   * @param description
   * @param _backUrl
   */
  async showRoomStatusTip(
    text: string,
    description?: string,
    _backUrl?: string,
  ) {
    this.playAudio();
    notification.warning({
      key: '__GLOBAL_FUN_FOR_RoomStatusTip__',
      message: text,
      placement: 'topRight',
      onClose: () => {
        this.hideRoomStatusTip();
      },
      description: description ? (
        <ConfigProvider prefixCls={__prefixCls__}>
          <p>{description}</p>
        </ConfigProvider>
      ) : undefined,
      duration: 0,
      btn: [
        <ConfigProvider prefixCls={__prefixCls__}>
          <Space>
            <Button
              type="default"
              onClick={() => {
                this.hideRoomStatusTip();
                reloadClearCache();
              }}
            >
              刷新
            </Button>
            {_backUrl ? (
              <Button
                type="primary"
                onClick={() => {
                  this.hideRoomStatusTip();
                  window.location.href = _backUrl;
                }}
              >
                返回
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => {
                  this.hideRoomStatusTip();
                }}
              >
                知道了
              </Button>
            )}
          </Space>
        </ConfigProvider>,
      ],
    });
  }
  /**
   * 关闭全局房间状态提示
   */
  async hideRoomStatusTip() {
    this.stopAudio();
    notification.close('__GLOBAL_FUN_FOR_RoomStatusTip__');
  }
}
export const globalFun = new GLOBAL_FUN();
/**
 * 清除缓存刷新
 * @param url
 */
export function reloadClearCache(url?: string) {
  url = url || window.location.href;
  const urlObj = URLParse(url, true);
  console.log(urlObj, urlObj.toString());
  urlObj.set('query', {
    ...urlObj?.query,
    __RELOAD_TIME__: new Date().getTime(),
  });
  const newUrl = urlObj.toString();
  window.location.href = newUrl;
}

export default GLoading;
