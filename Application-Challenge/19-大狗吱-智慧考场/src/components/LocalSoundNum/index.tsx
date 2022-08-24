import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Progress } from 'antd';
import classNames from 'classnames';
import MyIconFont from '@/components/MyIconfont';
import styles from './styles.less';
import SoundMeter, { StreamAudioMeter } from '@/utils/SoundMeter';
import { _ } from 'ajv';
import lodash from 'lodash';
import { useDebounceEffect } from 'ahooks';

function jsonStringify(data: any) {
  var cache: any = [];
  var str = JSON.stringify(data, function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // 移除
        return;
      }
      // 收集所有的值
      cache.push(value);
    }
    return value;
  });
  cache = null; // 清空变量，便于垃圾回收机制回收
}

interface Props {
  muteAudio: boolean;
  stream: MediaStream;
}
function SoundNum(props: Props) {
  const { muteAudio, stream } = props;
  const soundMeterRef = useRef<SoundMeter>();
  const [soundNum, setSoundNum] = useState(0);
  const soundCallbackRef = useRef<(data: StreamAudioMeter) => void>((item) => {
    setSoundNum(lodash.toNumber((item.instant * 1000).toFixed(2)));
  });

  useDebounceEffect(
    () => {
      try {
        if (!soundMeterRef.current) {
          const sdk = new SoundMeter();
          soundMeterRef.current = sdk;
        }
        if (stream) {
          let d: any;
          if (stream?.localStream?.mediaStream_) {
            d = stream?.localStream?.mediaStream_;
          } else {
            const microphoneTrack =
              stream?.localStream?.microphoneTrack?.getMediaStreamTrack();
            d = new MediaStream([microphoneTrack]);
          }
          soundMeterRef.current?.connectToSource(d);
          soundMeterRef.current?.on(soundCallbackRef.current);
        }
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
      /**
       * agora 设备id
       */
      stream?.localStream?.microphoneTrack?._constraints?.deviceId,
      /**
       * trtc 设备id
       */
      stream?.localStream?.microphoneId_,
    ],
    {
      wait: 500,
    },
  );
  return (
    <div className={styles.soundNumWrap}>
      {muteAudio ? (
        <MyIconFont
          className={classNames(
            styles.icons,
            styles.iconVoice,
            styles.iconVoiceMute,
          )}
          type="icon-no_voice1"
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
