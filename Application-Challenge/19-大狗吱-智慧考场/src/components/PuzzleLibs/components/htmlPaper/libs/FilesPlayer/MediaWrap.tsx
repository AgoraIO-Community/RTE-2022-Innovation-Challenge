import React, { useEffect, useState } from 'react';
import { Space, Image, Tooltip } from 'antd';
import styles from './styles.less';
import classNames from 'classnames';
import ReactPlayer from 'react-player/lazy';
import { MediaItem } from '../..';
import lodash from 'lodash';
import ImagePlayer from './ImagePlayer';
import AudioPlayer from './AudioPlayer';
import VideoPlayer from './VideoPlayer';
import FilePlayer from './FilePlayer';
import { useWindowSize } from 'react-use';
import Modal from 'react-modal';
import {
  DeleteOutlined,
  LeftCircleOutlined,
  RightCircleOutlined,
} from '@ant-design/icons';

/**
 * 修改文件 type
 */
export type ON_EDITOR_TYPE = {
  /**
   * change : 修改数据
   * delete ： 删除
   * up     ： 上移
   * down   ： 下移
   */
  type: 'change' | 'delete' | 'up' | 'down';
  data: Partial<MediaItem>;
};
export interface Props {
  data: MediaItem[];
  isEditor?: boolean;
  onEditor?: (data: ON_EDITOR_TYPE) => void;
}
export default function MediaWrap(props: Props) {
  const windowSize = useWindowSize();
  const [transform, setTransform] = useState<number>(1);
  const [rotate, setRotate] = useState<number>(0);
  const [showFile, setShowFile] = useState<MediaItem | undefined>();
  if (props?.data?.length <= 0) {
    return null;
  }
  useEffect(() => {
    if (!showFile) {
      setTransform(1);
      setRotate(0);
    }
    return () => {};
  }, [showFile]);
  const showFileName = showFile?.name || getFileNameForUrl(showFile?.url);
  const showFileType: FileTypeEnum = getFileTypeForContentType(
    showFile?.contentType,
  );
  return (
    <div>
      <div className={styles.assetsWrap}>
        {props?.data?.map((item) => {
          const { contentType } = item;
          const type: FileTypeEnum = getFileTypeForContentType(
            item?.contentType,
          );
          const name = item?.name || getFileNameForUrl(item?.url);
          let typeClassName = styles.mediaItemUnknown;
          if (type === FileTypeEnum.image) {
            typeClassName = styles.mediaItemImage;
          }
          if (type === FileTypeEnum.video) {
            typeClassName = styles.mediaItemVideo;
          }
          if (type === FileTypeEnum.audio) {
            typeClassName = styles.mediaItemAudio;
          }
          const nameArray = name?.split('.');
          const status = item?.status;
          let statusStyleName = '';
          if (status) {
            statusStyleName = styles[`statusStyleName_${status}`];
          }
          return (
            <div
              key={`${item.id}_${item?.url}`}
              className={classNames(
                styles.mediaItemWrap,
                typeClassName,
                statusStyleName,
              )}
            >
              <div
                className={styles.icon}
                onClick={() => {
                  setShowFile(item);
                }}
              />
              <div className={styles.bodyWrap}>
                <div
                  className={styles.name}
                  onClick={() => {
                    setShowFile(item);
                  }}
                >
                  <span className={styles.nameBase}>
                    {nameArray.length >= 2 ? nameArray[0] : name}
                  </span>
                  <span className={styles.nameExtension}>
                    {nameArray.length >= 2 ? nameArray.pop() : ''}
                  </span>
                </div>
                {!props.isEditor ? (
                  <span
                    onClick={() => {
                      setShowFile(item);
                    }}
                    className={styles.tipText}
                  >
                    点击查看详情
                  </span>
                ) : undefined}
                {props.isEditor && (
                  <div className={styles.mediaWrapToolsWrap}>
                    <Space>
                      {status && (
                        <div className={styles.statusText}>
                          {status === 'success' && '上传成功'}
                          {status === 'error' && '上传失败'}
                          {status === 'done' && '上传成功'}
                          {status === 'uploading' && '上传中...'}
                          {status === 'removed' && '己删除'}
                        </div>
                      )}
                      <Tooltip mouseEnterDelay={0.3} title="左移">
                        <a
                          className={styles.toolsItem}
                          onClick={(e) => {
                            e.preventDefault();
                            // 左移
                            // upOptions(optionItem.id);
                            props.onEditor &&
                              props.onEditor({
                                type: 'up',
                                data: item,
                              });
                          }}
                        >
                          <LeftCircleOutlined />
                        </a>
                      </Tooltip>
                      <Tooltip mouseEnterDelay={0.3} title="右移">
                        <a
                          className={styles.toolsItem}
                          onClick={(e) => {
                            e.preventDefault();
                            // 右移
                            props.onEditor &&
                              props.onEditor({
                                type: 'down',
                                data: item,
                              });
                          }}
                        >
                          <RightCircleOutlined />
                        </a>
                      </Tooltip>
                      <Tooltip mouseEnterDelay={0.3} title="删除">
                        <a
                          className={styles.toolsItem}
                          onClick={(e) => {
                            e.preventDefault();
                            // 删除
                            // delOptions(optionItem.id);
                            props.onEditor &&
                              props.onEditor({
                                type: 'delete',
                                data: item,
                              });
                          }}
                        >
                          <DeleteOutlined />
                        </a>
                      </Tooltip>
                    </Space>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <Modal
        className={styles.MediaWrapModal}
        isOpen={!!showFile}
        onAfterOpen={() => {}}
        onRequestClose={() => {}}
        style={{
          overlay: {
            background: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1000,
          },
          content: {
            display: 'flex',
            flexDirection: 'column',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            padding: '0',
            marginRight: 'auto',
            background: 'transparent',
          },
        }}
      >
        <div className={styles.showFileHeader}>
          <div className={styles.title}>{showFileName}</div>
          <div className={styles.toolsWrap}>
            <div
              className={classNames(styles.toolsItem, styles.toolsZoomOut)}
              onClick={() => {
                setTransform((_transform) => {
                  return _transform - 1 <= 1 ? 1 : (_transform -= 1);
                });
              }}
            />
            <div
              className={classNames(styles.toolsItem, styles.toolsZoomIn)}
              onClick={() => {
                setTransform((_transform) => {
                  return (_transform += 1);
                });
              }}
            />
            <div
              className={classNames(styles.toolsItem, styles.toolsClose)}
              onClick={() => {
                setShowFile(undefined);
              }}
            />
          </div>
        </div>
        <div className={styles.showFileBody}>
          <div className={styles.playerWrap}>
            {showFileType === 'video' && (
              <div
                className={styles.playerWrapBody}
                style={{
                  transform: `scale3d(${transform}, ${transform}, 1)`,
                  rotate: `(${rotate}deg)`,
                }}
              >
                <VideoPlayer data={showFile} />
              </div>
            )}
            {showFileType === 'audio' && (
              <div
                className={styles.playerWrapBody}
                style={{
                  transform: `scale3d(${transform}, ${transform}, 1)`,
                  rotate: `(${rotate}deg)`,
                }}
              >
                <AudioPlayer data={showFile} />
              </div>
            )}
            {showFileType === 'image' && (
              <div
                className={classNames(
                  styles.playerWrapBody,
                  styles.playerForImage,
                )}
                style={{
                  transform: `scale3d(${transform}, ${transform}, 1)`,
                  rotate: `(${rotate}deg)`,
                }}
              >
                <ImagePlayer data={showFile} />
              </div>
            )}
            {showFileType === 'unknown' && (
              <div
                className={styles.playerWrapBody}
                style={{
                  transform: `scale3d(${transform}, ${transform}, 1)`,
                  rotate: `(${rotate}deg)`,
                }}
              >
                <FilePlayer data={showFile} />
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export enum FileTypeEnum {
  'image' = 'image',
  'video' = 'video',
  'audio' = 'audio',
  'unknown' = 'unknown',
}
export function getFileTypeForContentType(contentType?: string): FileTypeEnum {
  const showFileType = contentType?.replace(/\/.*/gi, '') as FileTypeEnum;
  return showFileType in FileTypeEnum ? showFileType : FileTypeEnum.unknown;
}

export function getFileNameForUrl(url?: string) {
  const showFileName = url?.split('/')?.pop()?.replace(/\?.*/gi, '');
  return decodeURIComponent(`${showFileName}`);
}
