import React, { ReactNode, useEffect, useState } from 'react';
import {
  Upload,
  message,
  Button,
  Space,
  Tooltip,
  FormInstance,
  Form,
  UploadProps,
  Modal,
  Select,
} from 'antd';
import {
  RcFile as OriRcFile,
  UploadRequestOption as RcCustomRequestOptions,
} from 'rc-upload/lib/interface';
import {
  AudioOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import MediaWrap, {
  ON_EDITOR_TYPE,
} from '../../htmlPaper/libs/FilesPlayer/MediaWrap';
import { MediaItem, SubItem } from '../../htmlPaper';

import styles from './styles.less';
import lodash from 'lodash';
import {
  cosHandleUpload,
  ossHandleUpload,
  swapArrPlaces,
} from '../../../utils';
import { useImmer } from 'use-immer';
import { useDebounceFn } from 'ahooks';

export type UP_CONFIG = {
  type: 'COS' | 'OSS';
  ossCof?: {
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
    stsToken: string;
    cname: boolean;
    endpoint: string;
    /**
     * 文件上传路径前缀
     */
    prefix: string;
  };
  cosCof?: {
    bucket: string;
    region: string;
    startTime: number;
    expiredTime: number;
    /**
     * 文件上传路径前缀
     */
    prefix: string;
    tmpSecretKey: string;
    tmpSecretId: string;
    sessionToken: string;
  };
};

export type UP_TYPES = 'audio' | 'video' | 'image';
export interface Props {
  form: FormInstance;
  upTypes?: UP_TYPES[];
  upIcons?: { [key: 'audio' | 'video' | 'image' | string]: ReactNode };
  data?: SubItem;
  upConfig: UP_CONFIG;
  maxCount?: number;
}
export default function UpFiles(props: Props) {
  const [onlineFiles, setOnlineFiles] = useImmer<MediaItem[]>([]);
  const form = props.form;
  const upIcons = props.upIcons;
  const { run: onEditorFiles } = useDebounceFn(
    (changeData: {
      type: ON_EDITOR_TYPE['type'] | 'add';
      data: ON_EDITOR_TYPE['data'];
    }) => {
      setOnlineFiles((_onlineFiles) => {
        const url = changeData?.data?.url;
        let newMedia = lodash.cloneDeep(_onlineFiles) || [];
        const index = newMedia?.findIndex((i) => i.url === url);
        if (newMedia && lodash.isNumber(index)) {
          if (changeData.type === 'delete') {
            newMedia?.splice(index, 1);
          }
          if (changeData.type === 'up') {
            if (lodash.isNumber(index) && index - 1 >= 0) {
              swapArrPlaces(newMedia, index, index - 1);
            }
          }
          if (changeData.type === 'down') {
            if (
              lodash.isNumber(index) &&
              newMedia?.length &&
              index + 1 < newMedia?.length
            ) {
              swapArrPlaces(newMedia, index, index + 1);
            }
          }
          if (changeData.type === 'add') {
            if (index > 0) {
              lodash.set(newMedia, `[${index}]`, {
                ...lodash.get(newMedia, `[${index}]`, {}),
                ...changeData.data,
              });
            } else {
              newMedia.push({
                name: '',
                url: '',
                contentType: '',
                /**
                 * 播放次数
                 */
                playCount: 0,
                ...changeData.data,
              });
            }
          }
        }
        try {
          if (props.form) {
            // if (props.maxCount && newMedia?.length) {
            //   newMedia = newMedia?.splice(0, props.maxCount)
            // }
            props.form.setFieldsValue({
              media: newMedia?.filter((i) => validateUrl(i.url)),
            });
            props?.form?.validateFields(['media']);
          }
        } catch (err) {}
        return newMedia;
      });
    },
    {
      wait: 10,
    },
  );

  useEffect(() => {
    setOnlineFiles(props?.data?.media || []);
    return () => {};
  }, [props?.data?.media]);
  const checkShowUpType = (type: UP_TYPES): boolean => {
    return !props.upTypes || props.upTypes?.indexOf(`${type}`) > -1;
  };
  const onChange: UploadProps['onChange'] = ({ file, fileList }) => {
    const list: MediaItem[] = fileList?.map((item) => {
      return {
        id: item.uid,
        name: item.name,
        url: `${item.uid}/${item.name}`,
        contentType: item?.originFileObj?.type || '',
        playCount: 0,
        status: item.status,
      };
    });

    const fileItem: MediaItem = {
      id: file.uid,
      name: file.name,
      url: file?.response || `${file.uid}/${file.name}`,
      contentType: file?.originFileObj?.type || '',
      playCount: 0,
      status: file.status,
    };

    setOnlineFiles((_onlineFiles) => {
      const index = _onlineFiles.findIndex((i) => i.id && i.id === fileItem.id);
      if (index > -1) {
        _onlineFiles[index] = {
          ..._onlineFiles[index],
          ...fileItem,
        };
      } else {
        _onlineFiles.push(fileItem);
      }
      if (
        props.form &&
        fileItem.status === 'done' &&
        validateUrl(fileItem.url)
      ) {
        const _media = lodash.cloneDeep(form.getFieldValue('media')) || [];
        _media.push({
          ...fileItem,
          // id: undefined,
          status: undefined,
        });
        props.form.setFieldsValue({
          media: _media,
        });
        props.form.validateFields(['media']);
      }

      return _onlineFiles;
    });
    console.log('Upload: ', list);
  };
  let customRequest:
    | ((options: RcCustomRequestOptions<any>, upConfig: UP_CONFIG) => void)
    | undefined;
  if (props.upConfig.type === 'COS') {
    customRequest = cosHandleUpload;
  }
  if (props.upConfig.type === 'OSS') {
    customRequest = ossHandleUpload;
  }
  const isMaxCount = props.maxCount && onlineFiles.length >= props.maxCount;
  const maxFun = () => {
    Modal.warn({
      title: `文件最大上传数为: ${props.maxCount}`,
      content: '如要更换，请先删除之前文件，再上传',
    });
    return false;
  };
  return (
    <div className={styles.UpFilesWrap}>
      <Space size={20}>
        {checkShowUpType('audio') && (
          <Tooltip title="上传音频">
            <div className={isMaxCount ? styles.hideFormItem : ''}>
              <Upload
                beforeUpload={beforeUploadForAudio}
                customRequest={(options) => {
                  customRequest && customRequest(options, props.upConfig);
                }}
                accept={okAudioFileTypes.join(',')}
                showUploadList={false}
                onChange={onChange}
              >
                {upIcons?.audio ? upIcons?.audio : <AudioOutlined />}
              </Upload>
            </div>
            {isMaxCount && (
              <>
                {upIcons?.audio ? (
                  <span onClick={maxFun}>{upIcons?.audio}</span>
                ) : (
                  <AudioOutlined onClick={maxFun} />
                )}
              </>
            )}
          </Tooltip>
        )}
        {checkShowUpType('video') && (
          <Tooltip title="上传视频">
            <div className={isMaxCount ? styles.hideFormItem : ''}>
              <Upload
                beforeUpload={beforeUploadForVideo}
                customRequest={(options) => {
                  customRequest && customRequest(options, props.upConfig);
                }}
                accept={okVideoFileTypes.join(',')}
                showUploadList={false}
                onChange={onChange}
              >
                {upIcons?.video ? upIcons?.video : <VideoCameraOutlined />}
              </Upload>
            </div>
            {isMaxCount && (
              <>
                {upIcons?.video ? (
                  <span onClick={maxFun}>{upIcons?.video}</span>
                ) : (
                  <VideoCameraOutlined onClick={maxFun} />
                )}
              </>
            )}
          </Tooltip>
        )}
        {checkShowUpType('image') && (
          <Tooltip title="上传图片">
            <div className={isMaxCount ? styles.hideFormItem : ''}>
              <Upload
                beforeUpload={beforeUploadForImage}
                customRequest={(options) => {
                  customRequest && customRequest(options, props.upConfig);
                }}
                accept={okImageFileTypes.join(',')}
                showUploadList={false}
                onChange={onChange}
              >
                {upIcons?.image ? upIcons?.image : <FileImageOutlined />}
              </Upload>
            </div>
            {isMaxCount && (
              <>
                {upIcons?.image ? (
                  <span onClick={maxFun}>{upIcons?.image}</span>
                ) : (
                  <FileImageOutlined onClick={maxFun} />
                )}
              </>
            )}
          </Tooltip>
        )}
      </Space>
      <div className={styles.hideFormItem}>
        <Form.Item name="media" noStyle>
          <div />
        </Form.Item>
      </div>
      {onlineFiles && onlineFiles.length ? (
        <div className={styles.mediaWrap}>
          <MediaWrap
            isEditor={true}
            data={[...onlineFiles]}
            onEditor={(data) => {
              onEditorFiles(data);
            }}
          />
        </div>
      ) : undefined}
    </div>
  );
}
const okAudioFileTypes = ['audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/wav'];
// const okAudioFileTypes = ['audio/mp3'];

export function beforeUploadForAudio(file: OriRcFile) {
  const _maxSize = 100;
  const maxSize = file.size / 1024 / 1024 < _maxSize;
  const isOkFile = okAudioFileTypes.indexOf(`${file.type}`.toLowerCase()) > -1;
  if (!isOkFile) {
    // message.error(`只可上传的[ ${okAudioFileTypes.join(',')} ]文件!`);
    message.error(`只可上传的[ mp3 ]文件!`);
  }
  if (!maxSize) {
    message.error(`文件最大为${_maxSize}MB!`);
  }
  const isT = isOkFile && maxSize;
  if (!isT) {
    return Upload.LIST_IGNORE;
  }
  return isOkFile && maxSize;
}

const okVideoFileTypes = ['video/mp4', 'video/webm', 'video/ogg'];
export function beforeUploadForVideo(file: OriRcFile) {
  const _maxSize = 100;
  const maxSize = file.size / 1024 / 1024 < _maxSize;
  const isOkFile = okVideoFileTypes.indexOf(`${file.type}`.toLowerCase()) > -1;
  if (!isOkFile) {
    message.error(`只可上传的[ ${okVideoFileTypes.join(',')} ]文件!`);
  }
  if (!maxSize) {
    message.error(`文件最大为${_maxSize}MB!`);
  }
  const isT = isOkFile && maxSize;
  if (!isT) {
    return Upload.LIST_IGNORE;
  }
  return isOkFile && maxSize;
}

const okImageFileTypes = [
  'image/apng',
  'image/avif',
  'image/bmp',
  'image/gif',
  'image/x-icon',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/tiff',
  'image/webp',
];
export function beforeUploadForImage(file: OriRcFile) {
  const _maxSize = 100;
  const maxSize = file.size / 1024 / 1024 < _maxSize;
  const isOkFile = okImageFileTypes.indexOf(`${file.type}`.toLowerCase()) > -1;
  if (!isOkFile) {
    message.error(`只可上传的[ ${okImageFileTypes.join(',')} ]文件!`);
  }
  if (!maxSize) {
    message.error(`文件最大为${_maxSize}MB!`);
  }
  const isT = isOkFile && maxSize;
  if (!isT) {
    return Upload.LIST_IGNORE;
  }
  return isOkFile && maxSize;
}

function validateUrl(value: string) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
    value,
  );
}
