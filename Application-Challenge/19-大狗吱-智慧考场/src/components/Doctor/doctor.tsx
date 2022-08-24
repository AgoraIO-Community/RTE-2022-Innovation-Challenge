import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Bowser from 'bowser';
import {
  Form,
  Button,
  Modal,
  Card,
  Select,
  Space,
  Divider,
  Spin,
  Collapse,
  Tooltip,
  Drawer,
  Progress,
  notification,
  ConfigProvider,
  Image,
  Input,
} from 'antd';
import {
  ExclamationCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  CaretRightOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import lodash from 'lodash';
import { useNetworkState } from 'react-use';
import { Scrollbars } from 'react-custom-scrollbars';
import 'react-custom-scroll/dist/customScroll.css';
import styles from './index.less';
import delay from 'delay';
import classNames from 'classnames';
import testMp3 from './assets/test.mp3';

import Help from '../Help';
import SoundMeter from '@/utils/SoundMeter';
import { useDebounceFn } from 'ahooks';
import { reloadClearCache } from '@/utils';
import { getAverageRGB } from './utls';

const { warning } = Modal;

export type ValueType = {
  videoinput: string | undefined;
  audioinput: string | undefined;
  audiooutput: string | undefined;
};
export interface IProps {
  value: ValueType | undefined;
  onChange: (v: ValueType) => void;
}
function Doctor(props: IProps) {
  const [form] = Form.useForm();
  const audioRef = useRef<HTMLAudioElement>();
  const soundMeterRef = useRef<SoundMeter>();
  const [soundNum, setSoundNum] = useState(0);
  const [openHelp, setOpenHelp] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [isGetSpeed, setIsGetSpeed] = useState(false);
  const [errObj, setErrObj] = useState<{
    browser?: string;
    videoinput?: string;
    audioinput?: string;
    audiooutput?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [audioinput, setAudioinput] = useState<Array<MediaDeviceInfo>>([]);
  const [videoinput, setVideoinput] = useState<Array<MediaDeviceInfo>>([]);
  const [audiooutput, setAudiooutput] = useState<Array<MediaDeviceInfo>>([]);
  const [videoImage, setVideImage] = useState<string>();
  const [isPlay, setIsPlay] = useState(false);
  const ref = useRef<{
    mediaStream?: MediaStream;
  }>();
  const netWorkState = useNetworkState();
  const checkBrowser = () => {
    let isValidBrowser = true;
    try {
      var browser = Bowser.getParser(window.navigator.userAgent);
      console.log('browser', browser);
      isValidBrowser = !!browser.satisfies({
        windows: {
          'internet explorer': '>11',
        },
        macos: {
          safari: '>11',
        },
        mobile: {
          safari: '>11',
          'android browser': '>3.10',
        },
        edge: '>80',
        chrome: '>58',
        firefox: '>100',
        opera: '>70',
        qq: '>100',
        electron: '>8',
      });
    } catch (error) {}
    return isValidBrowser;
  };
  const getRequest = async (): Promise<boolean> => {
    let isGrantd = false;
    try {
      const st = await tryOpenVideo();
      const devices = await navigator.mediaDevices.enumerateDevices();
      if (devices.length) {
        const _list = devices.filter((i) => i.deviceId);
        isGrantd = !!_list.length;
        console.log('isGrantd:=[==', devices, _list);
      } else {
        isGrantd = false;
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (!isGrantd) {
        warning({
          wrapClassName: styles.notAuthWarning,
          title: '麦克风/摄像头权限未授权!',
          icon: <ExclamationCircleOutlined />,
          content: (
            <div>
              如未授权,将无法正常使用此功能! <br />
              如无法授权,可单独到设置权限
            </div>
          ),
          okText: '立即授权',
          onOk: async () => {
            return new Promise(async (resolve) => {
              const st = await tryOpenVideo();
              await delay(500);
              resolve(true);
              const isOk = await getRequest();
              if (isOk) {
                Modal.info({
                  wrapClassName: styles.notAuthWarning,
                  title: '是否刷新?',
                  icon: <ExclamationCircleOutlined />,
                  content: (
                    <div>
                      如已重新授权! <br />
                      是否尝试刷新进入房间
                    </div>
                  ),
                  okText: '刷新',
                  onOk() {
                    console.log('OK');
                    reloadClearCache(window.location.href);
                  },
                });
              }
            });
          },
        });
      }
    }
    return isGrantd;
  };
  const tryOpenVideo = async () => {
    try {
      const constraints = {
        audio: true,
        video: true,
      };
      if (!navigator.mediaDevices) {
        console.log('Document not secure. Unable to capture WebCam.');
        return false;
      } else {
        const st = await navigator.mediaDevices.getUserMedia(constraints);
        st.getTracks().forEach(function (track) {
          track.stop();
        });
        return true;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const init = async () => {
    try {
      setLoading(true);
      getSpeed();
      const isRequest = await getRequest();
      if (isRequest === false) {
        return;
      }
      if (netWorkState?.online === false && netWorkState?.downlinkMax) {
        warning({
          title: '网络异常!',
          icon: <ExclamationCircleOutlined />,
          content: '当前网络异常，未连接网络 \n 请检查本地网络情况',
          okText: '重试',
          onOk() {},
        });
        return;
      }

      const list = await navigator.mediaDevices.enumerateDevices();

      const audioinputList = lodash.uniqBy(
        list.filter((i: MediaDeviceInfo) => i.kind === 'audioinput'),
        'groupId',
      );
      const videoinputList = lodash.uniqBy(
        list.filter((i: MediaDeviceInfo) => i.kind === 'videoinput'),
        'groupId',
      );
      const audiooutputList = lodash.uniqBy(
        list.filter((i: MediaDeviceInfo) => i.kind === 'audiooutput'),
        'groupId',
      );

      setAudioinput(audioinputList);
      setVideoinput(videoinputList);
      setAudiooutput(audiooutputList);

      const sessionValue = DevicesInitValue.getValue();

      const default_videoinput =
        props?.value?.videoinput ||
        sessionValue?.videoinput ||
        videoinputList?.find((i: MediaDeviceInfo) => i.deviceId === 'default')
          ?.deviceId ||
        lodash.get(videoinputList, `[0].deviceId`, undefined);
      const default_audioinput =
        props?.value?.audioinput ||
        sessionValue?.audioinput ||
        audioinputList?.find((i: MediaDeviceInfo) => i.deviceId === 'default')
          ?.deviceId ||
        lodash.get(audioinputList, `[0].deviceId`, undefined);
      const default_audiooutput =
        props?.value?.audiooutput ||
        sessionValue?.audiooutput ||
        audiooutputList?.find((i: MediaDeviceInfo) => i.deviceId === 'default')
          ?.deviceId ||
        lodash.get(audiooutputList, `[0].deviceId`, undefined);

      const _defaultDeviceIds = {
        videoinput:
          lodash.find(videoinputList, (i) => i.deviceId === default_videoinput)
            ?.deviceId ||
          audioinputList[0].deviceId ||
          undefined,
        audioinput:
          lodash.find(audioinputList, (i) => i.deviceId === default_audioinput)
            ?.deviceId ||
          audioinputList[0].deviceId ||
          undefined,
        audiooutput:
          lodash.find(
            audiooutputList,
            (i) => i.deviceId === default_audiooutput,
          )?.deviceId ||
          audiooutput[0].deviceId ||
          undefined,
      };
      console.log('');
      console.log('==========================');
      console.log('');
      console.log('当前默认设备: ', _defaultDeviceIds);
      console.log('');
      console.log('==========================');
      console.log('');

      form.setFieldsValue(_defaultDeviceIds);

      props.onChange(_defaultDeviceIds);

      let _errObj = {};

      if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
        // 当前设备是移动设备
      } else {
        const isBrowserOk = checkBrowser();
        if (!isBrowserOk) {
          _errObj = {
            ..._errObj,
            browser: '当前软件不支持',
          };
        }
        if (!audioinputList.length) {
          _errObj = {
            ..._errObj,
            audioinput: '未检查到麦克风',
          };
        }
        if (!videoinputList.length) {
          _errObj = {
            ..._errObj,
            videoinput: '未检查到摄像头',
          };
        }
        if (!audiooutputList.length) {
          _errObj = {
            ..._errObj,
            audiooutput: '未检查到播放器',
          };
        }
      }
      console.error(_errObj);
      setErrObj(_errObj);
      if (lodash.isEmpty(_errObj)) {
        setVideo(_defaultDeviceIds.videoinput, _defaultDeviceIds.audioinput);
      } else {
        throw _errObj;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSpeed = async () => {
    let speed: number;
    try {
      setIsGetSpeed(true);
      speed = await getNetWorkSpeed(`/index.html?time=${new Date().getTime()}`);
      await delay(1000);
    } catch (error) {
      speed = 0;
    } finally {
      setIsGetSpeed(false);
    }
    form.setFieldsValue({
      network: speed?.toFixed(2),
    });
    return speed;
  };

  const closeMediaStream = () => {
    try {
      const mediaStream = lodash.get(ref, 'current.mediaStream') as MediaStream;
      if (mediaStream) {
        mediaStream?.getTracks()?.forEach((item) => {
          item?.stop();
        });
      }
    } catch (error) {}
  };

  useEffect(() => {
    init();
    return () => {
      cancelSetVideo();
      closeMediaStream();
      soundMeterRef.current?.stop();
      soundMeterRef.current = undefined;
    };
  }, []);
  const { run: setVideo, cancel: cancelSetVideo } = useDebounceFn(
    async (videoDeviceId?: string, audioDeviceId?: string) => {
      try {
        getSpeed();
        setVideImage(undefined);
        closeMediaStream();
        var constraints: MediaStreamConstraints = {
          audio: audioDeviceId ? { deviceId: audioDeviceId } : true,
          video: videoDeviceId ? { deviceId: videoDeviceId } : true,
        };
        console.log('setVideo- audioDeviceId: ', audioDeviceId);
        console.log('setVideo- videoDeviceId: ', videoDeviceId);
        const mediaStream = await navigator.mediaDevices.getUserMedia(
          constraints,
        );
        const video = document.querySelector('#testVideo') as HTMLVideoElement;
        if (video) {
          if ('srcObject' in video) {
            video.srcObject = mediaStream;
          } else {
            // 防止在新的浏览器里使用它，应为它已经不再支持了
            video.src = window.URL.createObjectURL(mediaStream as any);
          }
          video.onplay = async () => {
            await delay(1000);
            const img = getScreenshot(video);
            setVideImage(img.src);
          };
          video.onloadedmetadata = function (e) {
            video.play();
          };
          lodash.set(ref, 'current.mediaStream', mediaStream);
          if (soundMeterRef.current) {
            soundMeterRef.current.stop();
            soundMeterRef.current = undefined;
          }
          const sdk = new SoundMeter();
          soundMeterRef.current = sdk;
          soundMeterRef.current?.connectToSource(mediaStream);
          soundMeterRef.current?.on((item) => {
            setSoundNum(lodash.toNumber((item.instant * 1000).toFixed(2)));
          });
        }
      } catch (error) {
        console.error('setVideo: ', error);
        notification.warning({
          key: '设备检测异常',
          message: '设备检测异常',
          // placement: "topLeft",
          onClose: () => {
            reloadClearCache(window.location.href);
          },
          description: (
            <ConfigProvider prefixCls={__prefixCls__}>
              <p>
                设备检测无法获取摄像头/麦克风数据，请检查是否给软件相关权限！
                具体可查看
                <a
                  onClick={() => {
                    setOpenHelp(true);
                    notification.close('设备检测异常');
                  }}
                >
                  帮助中心
                </a>
                , 重新设置权限后再关闭并重启软件！
              </p>
            </ConfigProvider>
          ),
          duration: 0,
          closeIcon: false,
          btn: [
            <ConfigProvider prefixCls={__prefixCls__}>
              <Space>
                <Button
                  onClick={() => {
                    setOpenHelp(true);
                    notification.close('设备检测异常');
                  }}
                >
                  帮助中心
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    reloadClearCache();
                    notification.close('设备检测异常');
                  }}
                >
                  刷新
                </Button>
              </Space>
            </ConfigProvider>,
          ],
        });
      }
    },
    {
      wait: 600,
    },
  );

  const onFinish = (values: any) => {
    props.onChange(values);
  };

  const onChange = () => {
    const values = form.getFieldsValue();
    console.log(values.videoinput, values.audioinput);
    props!?.onChange(values);
    DevicesInitValue.setValue(values);
    setVideo(values.videoinput, values.audioinput);
  };

  return (
    <>
      <div className={styles.body}>
        <Spin spinning={loading}>
          <div className={styles.left}>
            <Card>
              <div className={styles.manBody}>
                <div className={styles.videoPlayer}>
                  <video playsInline autoPlay muted id="testVideo" />
                </div>
                <Form
                  name="config"
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  onChange={onChange}
                >
                  <div className={styles.outWrap}>
                    <Form.Item
                      className={styles.flexGrow}
                      label="视频输入"
                      name="videoinput"
                      required
                      rules={[{ required: true, message: '请先选择摄像头!' }]}
                    >
                      <Select placeholder="视频输入" onChange={onChange}>
                        {videoinput.map((item) => {
                          return (
                            <Select.Option
                              key={`video_${item?.deviceId}`}
                              value={item.deviceId}
                            >
                              {item?.label}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                    <Tooltip placement="left" title={'摄像头缩略图'}>
                      <Button
                        style={{ marginTop: 5 }}
                        onClick={() => {
                          if (videoImage) {
                            setOpenPreview(true);
                          } else {
                            setOpenPreview(false);
                          }
                        }}
                      >
                        <span className={styles.endWarp}>
                          {videoImage ? (
                            <img src={videoImage} />
                          ) : (
                            <Spin size="small" />
                          )}
                          <div
                            style={{
                              display: 'none',
                              position: 'absolute',
                              top: -100,
                              width: 0,
                              height: 0,
                            }}
                          >
                            <Image
                              width={0}
                              style={{ display: 'none' }}
                              src={videoImage}
                              preview={{
                                visible: !!(openPreview && videoImage),
                                onVisibleChange: (value) => {
                                  setOpenPreview(value);
                                },
                              }}
                            />
                          </div>
                        </span>
                      </Button>
                    </Tooltip>
                  </div>
                  <div className={styles.outWrap}>
                    <Form.Item
                      className={styles.flexGrow}
                      required
                      label="音频输入"
                      name="audioinput"
                      rules={[
                        {
                          type: 'string',
                          whitespace: true,
                          required: true,
                          message: '请选择音频输入!',
                        },
                      ]}
                      initialValue={'default'}
                    >
                      <Select placeholder="音频输入" onChange={onChange}>
                        {audioinput.map((item) => {
                          return (
                            <Select.Option
                              key={`audio_${item?.deviceId}`}
                              value={item.deviceId}
                            >
                              {item?.label}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                    <Tooltip placement="left" title={'麦克风音量'}>
                      <Button style={{ marginTop: 5 }}>
                        <span className={styles.endWarp}>
                          <Progress
                            percent={soundNum}
                            steps={5}
                            size="small"
                            showInfo={false}
                            strokeColor="#52c41a"
                          />
                        </span>
                      </Button>
                    </Tooltip>
                  </div>
                  <div className={styles.outWrap}>
                    <Form.Item
                      className={styles.flexGrow}
                      label="音频输出"
                      required
                      name="audiooutput"
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: '请选择音频输出!',
                        },
                      ]}
                      initialValue={'default'}
                    >
                      <Select
                        placeholder="音频输出"
                        onChange={() => {
                          audioRef.current?.pause();
                          setIsPlay(false);
                          onChange();
                        }}
                      >
                        {audiooutput.map((item) => {
                          return (
                            <Select.Option
                              key={`outaudio_${item?.deviceId}`}
                              value={item.deviceId}
                            >
                              {item?.label}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                    <Tooltip placement="left" title={'扬声器测试'}>
                      <Button
                        style={{ marginTop: 5 }}
                        onClick={async () => {
                          const audiooutputid =
                            form.getFieldValue('audiooutput');
                          try {
                            // @ts-ignore
                            await audioRef.current?.setSinkId(
                              audiooutputid || undefined,
                            );
                          } catch (error) {}
                          if (isPlay) {
                            audioRef.current?.pause();
                          } else {
                            audioRef.current?.play();
                          }
                          setIsPlay(!isPlay);
                        }}
                      >
                        <span className={styles.endWarp}>
                          <span className={styles.playBtn}>
                            {!isPlay ? '测试' : '停止'}
                          </span>
                          <audio
                            src={testMp3}
                            style={{ display: 'none' }}
                            ref={audioRef}
                            onPause={() => {
                              setIsPlay(false);
                            }}
                          />
                        </span>
                      </Button>
                    </Tooltip>
                  </div>
                  <div className={styles.outWrap}>
                    <Form.Item
                      className={styles.flexGrow}
                      label="网络信息"
                      required
                      name="network"
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: '请检查当前网络!',
                        },
                      ]}
                      initialValue={'default'}
                    >
                      <Input disabled addonAfter="KB/s" />
                    </Form.Item>
                    <Tooltip placement="left" title={'检测当前网络'}>
                      <Button
                        style={{ marginTop: 5 }}
                        onClick={async () => {
                          getSpeed();
                        }}
                      >
                        <span className={styles.endWarp}>
                          <span className={styles.playBtn}>
                            {!isGetSpeed ? '检测' : <Spin size="small" />}
                          </span>
                          <audio
                            src={testMp3}
                            style={{ display: 'none' }}
                            ref={audioRef}
                            onPause={() => {
                              setIsPlay(false);
                            }}
                          />
                        </span>
                      </Button>
                    </Tooltip>
                  </div>
                </Form>
              </div>
            </Card>
          </div>
        </Spin>
      </div>
      <Modal
        maskStyle={{
          backdropFilter: 'blur(10px)',
        }}
        title="设备检测"
        closable={false}
        maskClosable={false}
        keyboard={false}
        visible={!lodash.isEmpty(errObj)}
        wrapClassName={styles.wrapClassName}
        className={styles.modalWrap}
        okText={'确定'}
        cancelText="取消"
        destroyOnClose
        onCancel={() => {}}
        onOk={() => {}}
        footer={false}
        afterClose={() => {}}
      >
        <div className={styles.modalBox}>
          <div className={styles.mainBox}>
            <div className={styles.formWrap}>
              <div className={styles.scrollbarsWrap}>
                <Scrollbars>
                  <div className={styles.detectionWrap}>
                    <Collapse
                      defaultActiveKey={['1']}
                      expandIcon={({ isActive }) => (
                        <CaretRightOutlined rotate={isActive ? 90 : 0} />
                      )}
                    >
                      <Collapse.Panel
                        header="软件检查"
                        key="1"
                        extra={
                          <div
                            className={classNames(
                              styles.statusWrap,
                              errObj.browser
                                ? styles.errorWrap
                                : styles.successWrap,
                            )}
                          >
                            {!errObj.browser && (
                              <Space>
                                <span className={classNames(styles.icon)}>
                                  <CheckOutlined />
                                </span>
                                <span className={classNames(styles.status)}>
                                  成功
                                </span>
                              </Space>
                            )}
                            {errObj.browser && (
                              <Space>
                                <span className={classNames(styles.icon)}>
                                  <CloseOutlined />
                                </span>
                                <span className={classNames(styles.status)}>
                                  失败
                                </span>
                              </Space>
                            )}
                          </div>
                        }
                      >
                        <div className={styles.itemWrap}>
                          <div className={styles.itemInfo}>
                            1、请使用桌面端或都使用谷歌内核的浏览器
                          </div>
                          <div className={styles.itemInfo}>
                            2、请认准谷歌浏览器的logo
                          </div>
                          <div className={styles.itemInfo}>
                            {/* <img src={require('./assets/list.png')} /> */}
                          </div>
                        </div>
                      </Collapse.Panel>
                      <Collapse.Panel
                        header="摄像头检查"
                        key="2"
                        extra={
                          <div
                            className={classNames(
                              styles.statusWrap,
                              errObj.videoinput
                                ? styles.errorWrap
                                : styles.successWrap,
                            )}
                          >
                            {!errObj.videoinput && (
                              <Space>
                                <span className={classNames(styles.icon)}>
                                  <CheckOutlined />
                                </span>
                                <span className={classNames(styles.status)}>
                                  成功
                                </span>
                              </Space>
                            )}
                            {errObj.videoinput && (
                              <Space>
                                <span className={classNames(styles.icon)}>
                                  <CloseOutlined />
                                </span>
                                <span className={classNames(styles.status)}>
                                  失败
                                </span>
                              </Space>
                            )}
                          </div>
                        }
                      >
                        <div className={styles.itemWrap}>
                          <div className={styles.itemInfo}>
                            1、请检查是否授予摄像头使用权限，包括当前软件是否禁止使用摄像头？系统是否禁止当前软件调用摄像头？
                          </div>
                          <div className={styles.itemInfo}>
                            2、重新插拔及调试出现异常的摄像头
                          </div>
                        </div>
                      </Collapse.Panel>
                      <Collapse.Panel
                        header="麦克风检查"
                        key="3"
                        extra={
                          <div
                            className={classNames(
                              styles.statusWrap,
                              errObj.audioinput
                                ? styles.errorWrap
                                : styles.successWrap,
                            )}
                          >
                            {!errObj.audioinput && (
                              <Space>
                                <span className={classNames(styles.icon)}>
                                  <CheckOutlined />
                                </span>
                                <span className={classNames(styles.status)}>
                                  成功
                                </span>
                              </Space>
                            )}
                            {errObj.audioinput && (
                              <Space>
                                <span className={classNames(styles.icon)}>
                                  <CloseOutlined />
                                </span>
                                <span className={classNames(styles.status)}>
                                  失败
                                </span>
                              </Space>
                            )}
                          </div>
                        }
                      >
                        <div className={styles.itemWrap}>
                          <div className={styles.itemInfo}>
                            1、请检查是否授予麦克风使用权限，包括当前软件是否禁止使用麦克风？系统是否禁止当前软件调用麦克风？
                          </div>
                          <div className={styles.itemInfo}>
                            2、重新插拔及调试出现异常的麦克风
                          </div>
                        </div>
                      </Collapse.Panel>
                      <Collapse.Panel
                        header="扬声器检查"
                        key="4"
                        extra={
                          <div
                            className={classNames(
                              styles.statusWrap,
                              errObj.audiooutput
                                ? styles.errorWrap
                                : styles.successWrap,
                            )}
                          >
                            {!errObj.audiooutput && (
                              <Space className={styles.success}>
                                <span className={classNames(styles.icon)}>
                                  <CheckOutlined />
                                </span>
                                <span className={classNames(styles.status)}>
                                  成功
                                </span>
                              </Space>
                            )}
                            {errObj.audiooutput && (
                              <Space className={styles.error}>
                                <span className={classNames(styles.icon)}>
                                  <CloseOutlined />
                                </span>
                                <span className={classNames(styles.status)}>
                                  失败
                                </span>
                              </Space>
                            )}
                          </div>
                        }
                      >
                        <div className={styles.itemWrap}>
                          <div className={styles.itemInfo}>
                            1、请检查当前软件是否禁止播放声音？
                          </div>
                          <div className={styles.itemInfo}>
                            2、重新插拔或调试出现异常的扬声器
                          </div>
                        </div>
                      </Collapse.Panel>
                    </Collapse>
                  </div>
                </Scrollbars>
              </div>
              <Divider />
              <div className={styles.btnsWrap}>
                <div className={styles.tipBtnsWrap}>
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenHelp(true);
                    }}
                  >
                    查看设备自检方法
                  </a>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      onClick={() => {
                        reloadClearCache(window.location.href);
                      }}
                    >
                      刷新
                    </Button>
                  </Space>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
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
    </>
  );
}

export interface PropsModal extends IProps {
  visible: boolean;
  onClose: () => void;
}
function DoctorModalWrap(
  props: PropsModal,
  ref: React.Ref<unknown> | undefined,
) {
  const [value, setValue] = useState<PropsModal['value']>();
  const [openHelp, setOpenHelp] = useState<boolean>(false);
  useImperativeHandle(ref, () => ({
    show: async () => {},
    hide: () => {},
    addMessages: (msg: any) => {
      if (!msg) {
        return;
      }
    },
  }));

  return (
    <>
      <Modal
        maskStyle={{
          backdropFilter: 'blur(10px)',
        }}
        title={
          <Space>
            <strong>设备检测</strong>
            <span style={{ color: 'rgba(0,0,0,.3)', cursor: 'pointer' }}>
              <Tooltip placement="bottomLeft" title={'帮助中心'}>
                <QuestionCircleOutlined
                  onClick={() => {
                    setOpenHelp(true);
                  }}
                />
              </Tooltip>
            </span>
          </Space>
        }
        closable={false}
        maskClosable={false}
        keyboard={false}
        visible={props.visible}
        className={styles.modalWrap}
        okText={'确定'}
        cancelText="取消"
        destroyOnClose
        onCancel={() => {
          props!!.onClose();
        }}
        onOk={() => {
          props!!.onClose();
        }}
        footer={false}
        afterClose={() => {
          setValue(undefined);
          props!!.onClose();
        }}
      >
        <div className={styles.modalBox}>
          <div className={styles.mainBox}>
            <div className={styles.formWrap}>
              <div className={styles.scrollbarsWrap}>
                <Scrollbars>
                  <Doctor
                    value={props.value}
                    onChange={(_value) => {
                      setValue(_value);
                      DevicesInitValue.setValue(_value);
                    }}
                  />
                </Scrollbars>
              </div>
              <Divider />
              <div className={styles.btnsWrap}>
                <Space>
                  <Button
                    htmlType="submit"
                    onClick={() => {
                      Modal.confirm({
                        title: '刷新页面',
                        content: '刷新页面会关闭当前页面，重新进入房间！',
                        okText: '确定',
                        onOk: () => {
                          reloadClearCache(window.location.href);
                        },
                        cancelText: '取消',
                        onCancel: () => {},
                      });
                    }}
                  >
                    刷新
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    onClick={() => {
                      if (value) {
                        props!?.onChange(value);
                        DevicesInitValue.setValue(value);
                      }
                      props!!.onClose();
                    }}
                  >
                    确定
                  </Button>
                </Space>
              </div>
            </div>
          </div>
        </div>
      </Modal>
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
    </>
  );
}

export const DoctorModal = forwardRef(DoctorModalWrap);

export default Doctor;

interface InitV {
  videoinput: string | undefined;
  audioinput: string | undefined;
  audiooutput: string | undefined;
}
class DevicesInitValue {
  static getKey() {
    // const pathname = window.location.pathname;
    return `___DevicesInitValue___`;
  }
  static setValue(data: InitV) {
    const initData: InitV = {
      ...data,
    };
    sessionStorage.setItem(this.getKey(), JSON.stringify(initData));
  }
  static getValue(): InitV {
    let initData = {
      videoinput: undefined,
      audioinput: undefined,
      audiooutput: undefined,
    };
    try {
      const _initData = JSON.parse(`${sessionStorage.getItem(this.getKey())}`);
      initData = {
        ...initData,
        ..._initData,
      };
    } catch (error) {}
    return initData;
  }
}
/**
 * 从视频中截屏。
 * @param videoEl {Element} Video element
 * @param scale {Number} Screenshot scale (default = 1)
 * @returns {Element} Screenshot image element
 */
function getScreenshot(
  videoEl: HTMLVideoElement,
  scale?: number,
): HTMLImageElement {
  scale = scale || 1;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  canvas.width = videoEl.clientWidth * scale;
  canvas.height = videoEl.clientHeight * scale;
  context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  const image = new window.Image(canvas.width, canvas.height);
  image.src = canvas.toDataURL();
  return image;
}
/**
 * 获取网速
 * @param url
 * @returns
 */
async function getNetWorkSpeed(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    try {
      let start: number = new Date().getTime();
      let end = null;
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          end = new Date().getTime();
          const contentLength = xhr.getResponseHeader('Content-Length') as any;
          const size = contentLength ? contentLength / 1024 : 0;
          const speed = (size * 1000) / (end - start);
          const connection = window.navigator.connection;
          let navigatorSpped = 0;
          // @ts-ignore
          if (connection && connection?.downlink) {
            // @ts-ignore
            navigatorSpped = (connection.downlink * 1024) / 8;
          }
          resolve(navigatorSpped);
        }
      };
      xhr.open('GET', url);
      xhr.send();
    } catch (error) {
      const connection = window.navigator.connection;
      let navigatorSpped = 0;
      // @ts-ignore
      if (connection && connection?.downlink) {
        // @ts-ignore
        navigatorSpped = (connection.downlink * 1024) / 8;
      }
      resolve(navigatorSpped);
    }
  });
}
