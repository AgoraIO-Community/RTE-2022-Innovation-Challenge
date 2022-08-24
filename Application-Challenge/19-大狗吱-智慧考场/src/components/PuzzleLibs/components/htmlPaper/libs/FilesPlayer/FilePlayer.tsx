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
export default function FilesPlayer(props: Props) {
  const showFile = props?.data;
  if (!props?.data) {
    return null;
  }
  const showFileName = showFile?.name || getFileNameForUrl(showFile?.url);
  const showFileType: FileTypeEnum = getFileTypeForContentType(
    showFile?.contentType,
  );
  return (
    <div className={styles.FilesPlayer}>
      <div className={styles.icon} />
      {showFileName}
    </div>
  );
}
