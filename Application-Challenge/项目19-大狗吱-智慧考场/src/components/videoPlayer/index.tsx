import React from 'react';
import ReactPlayer from 'react-player';
import styles from './styles.less';

export type Props = {
  url: string;
};
function VideoPlayerWrap(props: Props) {
  return (
    <div className={styles.videoPlayerWrap}>
      <ReactPlayer
        url={props.url}
        playing
        controls
        config={{
          file: {
            forceHLS: true,
          },
        }}
      />
    </div>
  );
}

export default VideoPlayerWrap;
