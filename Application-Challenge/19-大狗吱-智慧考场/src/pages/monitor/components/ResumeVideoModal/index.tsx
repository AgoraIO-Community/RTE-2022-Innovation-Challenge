import { Modal } from 'antd';
import React from 'react';
import ReactPlayer from 'react-player';
import styles from './styles.less';

export const resumeVideo = (url: string) => {
  return Modal.success({
    title: '视频简历',
    okText: '关闭',
    icon: false,
    width: 600,
    content: (
      <div
        style={{
          width: '100%',
        }}
      >
        <ReactPlayer width="100%" url={url} controls />
      </div>
    ),
  });
};
