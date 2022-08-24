import React, { useState } from 'react';
import { Modal, Space, Image } from 'antd';
import styles from './styles.less';
import classNames from 'classnames';
import ReactPlayer from 'react-player/lazy';
import { MediaItem } from '../../index';
import lodash from 'lodash';
import {
  FileTypeEnum,
  getFileNameForUrl,
  getFileTypeForContentType,
} from './MediaWrap';

export interface Props {
  data: MediaItem | undefined;
}
export default function ImagePlayer(props: Props) {
  const showFile = props?.data;
  if (!props?.data) {
    return null;
  }
  const showFileName = showFile?.name || getFileNameForUrl(showFile?.url);
  const showFileType: FileTypeEnum = getFileTypeForContentType(
    showFile?.contentType,
  );
  return (
    <div className={styles.ImagePlayer}>
      <img
        className={styles.image}
        style={{ maxHeight: '100%', maxWidth: '100%' }}
        src={showFile?.url}
      />
    </div>
  );
}
