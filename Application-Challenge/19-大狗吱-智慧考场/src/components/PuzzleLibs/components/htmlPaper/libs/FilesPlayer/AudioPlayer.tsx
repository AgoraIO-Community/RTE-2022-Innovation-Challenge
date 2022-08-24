import React, { useEffect, useRef, useState } from 'react';
import { Modal, Space, Image } from 'antd';
import styles from './styles.less';
import classNames from 'classnames';
import ReactPlayer from 'react-player/lazy';
import { MediaItem } from '../../index';
import lodash from 'lodash';
import moment from 'moment';
import { Line } from 'rc-progress';
import {
  FileTypeEnum,
  getFileNameForUrl,
  getFileTypeForContentType,
} from './MediaWrap';
import { useTimeoutFn } from 'react-use';

export interface Props {
  isNotStopBtn?: boolean;
  data: MediaItem | undefined;
  onPlayTip?: (conf: any) => Promise<boolean>;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: () => void;
}
export default function AudioPlayer(props: Props) {
  const [loading, setLoading] = useState(true);
  const [pause, setPause] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);

  const audioPlayer = useRef<ReactPlayer>();

  const showFile = props?.data;
  if (!props?.data) {
    return null;
  }
  const showFileName = showFile?.name || getFileNameForUrl(showFile?.url);
  const showFileType: FileTypeEnum = getFileTypeForContentType(
    showFile?.contentType,
  );
  useTimeoutFn(() => {
    setLoading(false);
  }, 6000);

  useEffect(() => {
    return () => {};
  }, [props?.data?.playCount]);

  return (
    <div className={styles.AudioPlayer}>
      <div className={styles.main}>
        <ReactPlayer
          pip={false}
          playing={!pause}
          config={{
            file: {
              forceAudio: true,
            },
          }}
          controls={false}
          url={showFile?.url}
          onReady={() => {
            setLoading(false);
          }}
          onStart={() => {
            setLoading(false);
            setPause(false);
            props?.onPlay && props?.onPlay();
          }}
          onPause={() => {
            setLoading(false);
            setPause(true);
            props?.onPause && props?.onPause();
          }}
          onEnded={() => {
            setLoading(false);
            setPause(true);
            props?.onEnded && props?.onEnded();
          }}
          onError={() => {
            setLoading(false);
            setPause(true);
            props?.onError && props?.onError();
          }}
          onProgress={({ played, playedSeconds }) => {
            setProgress(played);
            setPlayedSeconds(playedSeconds);
          }}
          onDuration={(duration) => {
            setDuration(duration);
            console.log('duration', duration);
          }}
        />
      </div>
      <div className={styles.playerControlsWrap}>
        <div
          onClick={async () => {
            if (props.onPlayTip) {
              if (pause) {
                await props.onPlayTip({
                  onOk: () => {
                    setPause(false);
                  },
                });
              }
            } else {
              setPause(!pause);
            }
          }}
          className={classNames(
            styles.playerBtn,
            pause ? styles.start : styles.stop,
            !pause && props.isNotStopBtn ? styles.notStopBtn : '',
          )}
        ></div>
        <div className={styles.playerProgress}>
          <Line
            percent={progress * 100}
            strokeWidth={3}
            strokeColor="#2E5BE6"
          />
        </div>
        <div className={styles.playerTime}>
          {getTime(playedSeconds)}/{getTime(duration)}
        </div>
      </div>
      {loading && (
        <div className={styles.loadingWrap}>
          <div className={styles.ldsEllipsis}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      )}
    </div>
  );
}

function getTime(duration: number) {
  const time = [];
  var h = Math.floor(duration / 3600);
  h > 0 && time.push(`${h}`.padStart(2, '0'));
  var m = Math.floor((duration / 60) % 60);
  time.push(`${m}`.padStart(2, '0'));
  var s = Math.floor(duration % 60);
  time.push(`${s}`.padStart(2, '0'));
  return time.join(':');
}
