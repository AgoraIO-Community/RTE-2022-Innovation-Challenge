import React, { useRef, useState } from 'react';
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
  data: MediaItem | undefined;
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
  return (
    <div className={styles.VideoPlayer}>
      <div className={styles.main}>
        <ReactPlayer
          pip={false}
          playing={!pause}
          config={{}}
          controls={false}
          url={showFile?.url}
          onReady={() => {
            setLoading(false);
          }}
          onStart={() => {
            setLoading(false);
            setPause(false);
          }}
          onPause={() => {
            setLoading(false);
            setPause(true);
          }}
          onEnded={() => {
            setLoading(false);
            setPause(true);
          }}
          onError={() => {
            setLoading(false);
            setPause(true);
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
      <div className={styles.controlsWrap}>
        <div
          className={styles.playerBigBtn}
          onClick={() => {
            setPause(!pause);
          }}
        >
          {pause && (
            <div
              className={classNames(
                styles.playerBtn,
                styles.bigBtn,
                pause ? styles.start : styles.stop,
              )}
            ></div>
          )}
        </div>
        {playedSeconds > 0 && (
          <div className={styles.playerControlsWrap}>
            <div
              onClick={() => {
                setPause(!pause);
              }}
              className={classNames(
                styles.playerBtn,
                pause ? styles.start : styles.stop,
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
        )}
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
