import { Button } from 'antd';
import classNames from 'classnames';
import delay from 'delay';
import React, { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import RecordRTCPromisesHandler from 'recordrtc';

import styles from './styles.less';

export interface Props {}

export function RecordAudio(props: Props) {
  const [start, setStart] = useState(false);
  const [localURL, setLocalURL] = useState<string>();
  const playerNode = useRef<HTMLAudioElement>();
  const streamRef = useRef<MediaStream>();
  const recorderRef = useRef<RecordRTCPromisesHandler>();
  const recordStart = async () => {
    try {
      setLocalURL('');
      setStart(true);
      if (!playerNode.current) {
        throw '未发现audio';
      }
      let stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      streamRef.current = stream;
      let recorder = new RecordRTCPromisesHandler(stream, {
        type: 'audio',
      });
      recorderRef.current = recorder;
      playerNode.current.srcObject = stream;
      playerNode.current.play();
      recorder.startRecording();
      // await delay(3000);

      // recorder.stopRecording(async () => {
      //   let blobUrl = recorder.toURL();
      //   console.log('blob', blobUrl);
      //   stream?.getTracks()?.forEach(function (track) {
      //     track.stop();
      //   });
      //   if (blobUrl) {
      //     setLocalURL(blobUrl);
      //   }
      // });
    } catch (error) {
      console.error(error);
    } finally {
      // setStart(false);
    }
  };
  const recordStop = async () => {
    try {
      setLocalURL('');
      setStart(false);
      const recorder = recorderRef.current;
      const stream = streamRef.current;
      if (recorder) {
        recorder.stopRecording(async () => {
          let blobUrl = recorder.toURL();
          console.log('blob', blobUrl);
          if (stream) {
            stream?.getTracks()?.forEach(function (track) {
              track.stop();
            });
          }
          if (blobUrl) {
            setLocalURL(blobUrl);
          }
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setStart(false);
    }
  };
  return (
    <div className={classNames(styles.RecordWrap)}>
      <div
        className={classNames(
          styles.previewWrap,
          localURL && styles.hideObjPlayer,
        )}
      >
        <audio
          className={styles.objPlayer}
          controls={false}
          width={300}
          playsInline
          autoPlay
          muted
          ref={playerNode}
        />
        {localURL && (
          <div>
            <ReactPlayer
              controls
              url={localURL}
              config={{
                file: {
                  forceAudio: true,
                },
              }}
            />
          </div>
        )}
      </div>
      <Button
        onClick={() => {
          if (!start) {
            recordStart();
          } else {
            recordStop();
          }
        }}
      >
        {!start ? '开始录制' : '结束录制'}
      </Button>
    </div>
  );
}

export function RecordVideo(props: Props) {
  const [start, setStart] = useState(false);
  const [localURL, setLocalURL] = useState<string>();
  const playerNode = useRef<HTMLAudioElement>();
  const streamRef = useRef<MediaStream>();
  const recorderRef = useRef<RecordRTCPromisesHandler>();
  const recordStart = async () => {
    try {
      setLocalURL('');
      setStart(true);
      if (!playerNode.current) {
        throw '未发现audio';
      }
      let stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      let recorder = new RecordRTCPromisesHandler(stream, {
        type: 'video',
      });
      recorderRef.current = recorder;
      recorder.startRecording();
      // setVideoUrl(window.URL.createObjectURL(stream));
      playerNode.current.srcObject = stream;
      playerNode.current.play();
      // await delay(3000);

      // recorder.stopRecording(async () => {
      //   let blobUrl = recorder.toURL();
      //   console.log('blob', blobUrl);
      //   stream?.getTracks()?.forEach(function (track) {
      //     track.stop();
      //   });
      //   if (blobUrl) {
      //     setLocalURL(blobUrl);
      //   }
      // });
    } catch (error) {
      console.error(error);
    } finally {
      // setStart(false);
    }
  };
  const recordStop = async () => {
    try {
      setLocalURL('');
      setStart(false);
      const recorder = recorderRef.current;
      const stream = streamRef.current;
      if (recorder) {
        recorder.stopRecording(async () => {
          let blobUrl = recorder.toURL();
          console.log('blob', blobUrl);
          if (stream) {
            stream?.getTracks()?.forEach(function (track) {
              track.stop();
            });
          }
          if (blobUrl) {
            setLocalURL(blobUrl);
          }
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setStart(false);
    }
  };
  return (
    <div className={classNames(styles.RecordWrap)}>
      <div
        className={classNames(
          styles.previewWrap,
          localURL && styles.hideObjPlayer,
        )}
      >
        <video
          className={styles.objPlayer}
          controls={false}
          width={300}
          playsInline
          autoPlay
          muted
          ref={playerNode}
        />
        {localURL && (
          <div>
            <ReactPlayer controls url={localURL} />
          </div>
        )}
      </div>
      <Button
        onClick={() => {
          if (!start) {
            recordStart();
          } else {
            recordStop();
          }
        }}
      >
        {!start ? '开始录制' : '结束录制'}
      </Button>
    </div>
  );
}
