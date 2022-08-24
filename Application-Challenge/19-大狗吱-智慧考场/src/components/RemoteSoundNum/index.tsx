import React, { useEffect, useRef, useState } from 'react';
import { Progress } from 'antd';
import classNames from 'classnames';
import MyIconFont from '@/components/MyIconfont';
import styles from './styles.less';
import SoundMeter, { StreamAudioMeter } from '@/utils/SoundMeter';
import { _ } from 'ajv';
import lodash from 'lodash';
import { useDebounceEffect } from 'ahooks';

interface Props {
  muteAudio: boolean;
  stream: MediaStream;
}
function SoundNum(props: Props) {
  const { muteAudio, stream } = props;
  const soundMeterRef = useRef<SoundMeter>();
  const [soundNum, setSoundNum] = useState(0);
  const [streamAudioIsMute, setStreamAudioIsMute] = useState(false);
  const soundCallbackRef = useRef<(data: StreamAudioMeter) => void>((item) => {
    setSoundNum(lodash.toNumber((item.instant * 1000).toFixed(2)));
  });
  useDebounceEffect(
    () => {
      try {
        let streamAudioIsMute = false;
        if (!soundMeterRef.current) {
          const sdk = new SoundMeter();
          soundMeterRef.current = sdk;
        }
        if (stream) {
          let d: any;
          if (stream?.remoteStream?.mediaStream_) {
            // 腾讯
            d = stream?.remoteStream?.mediaStream_;
            try {
              streamAudioIsMute =
                stream?.remoteStream?.getAudioTrack()?.muted === true;
            } catch (error) {
              streamAudioIsMute = false;
            }
          } else {
            // 声网
            if (stream?.remoteStream?.audioTrack) {
              d = new MediaStream([
                stream?.remoteStream?.audioTrack?.getMediaStreamTrack(),
              ]);
              streamAudioIsMute =
                stream?.remoteStream?.audioTrack?.isPlaying === false;
            } else {
              streamAudioIsMute = true;
            }
          }
          if (d) {
            soundMeterRef.current?.connectToSource(d);
            soundMeterRef.current?.on(soundCallbackRef.current);
          }
        }
        console.log('streamAudioIsMute', streamAudioIsMute, muteAudio);
        setStreamAudioIsMute(muteAudio || streamAudioIsMute);
      } catch (error) {
        console.error(error);
      }
      return () => {
        soundMeterRef.current?.stop();
        soundMeterRef.current?.off(soundCallbackRef.current);
      };
    },
    [
      stream,
      muteAudio,
      stream?.remoteStream?.audioTrack?.isPlaying,
      stream?.remoteStream?.getAudioTrack &&
        stream?.remoteStream?.getAudioTrack()?.muted,
    ],
    {
      wait: 500,
    },
  );
  return (
    <div className={styles.soundNumWrap}>
      {streamAudioIsMute ? (
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
      <div className={styles.progressWrap}>
        <Progress
          className={styles.progress}
          percent={muteAudio ? 0 : soundNum}
          steps={5}
          size="small"
          showInfo={false}
          strokeColor="#52c41a"
        />
      </div>
    </div>
  );
}

export default SoundNum;
