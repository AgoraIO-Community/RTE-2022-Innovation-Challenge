import {
  Button,
  Radio,
  Space,
  Tag,
  Checkbox,
  Card,
  Input,
  InputNumber,
  Rate,
  Modal,
  Tooltip,
  Divider,
  message,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/index.css';
import styles from './styles.less';
import classNames from 'classnames';
import lodash from 'lodash';
import { MediaItem, QuestionsEnum, SubItem } from '..';
import MediaWrap from './FilesPlayer/MediaWrap';
import ReactPlayer from 'react-player';
import AudioPlayer from './FilesPlayer/AudioPlayer';
import { A_Z, swapArrPlaces } from '../../../utils';
import {
  DeleteOutlined,
  DownCircleOutlined,
  EditOutlined,
  UpCircleOutlined,
} from '@ant-design/icons';
import EditorQ, { RadioQForEditorProps } from '../../Editor/libs';
import { UP_CONFIG } from '../../Editor/libs/upFiles';
import delay from 'delay';
import { RecordAudio, RecordVideo } from './Record';

/**
 * 修改题目数据 type
 */
export type ON_EDITOR_TYPE = {
  /**
   * change : 修改数据
   * delete ： 删除
   * up     ： 上移
   * down   ： 下移
   */
  type: 'change' | 'delete' | 'up' | 'down';
  data: Partial<Omit<SubItem, 'id'>>;
};

export interface RadioQuestionsProps {
  /**
   * 是否子题
   */
  isSubQ?: boolean;
  label?: string;
  showTip?: boolean;
  readonly?: boolean;
  data: SubItem;
  value?: string[];
  onChange?: (questionsId: string, value: string[]) => void;
  isEditor?: boolean;
  onEditor?: (data: ON_EDITOR_TYPE) => void;
  upConfig?: UP_CONFIG;
  onSetSelectTip?: (data: string) => void;
  onGetMediaPlayNum?: (data: MediaItem) => Promise<number>;
  onMediaPlay?: (item: MediaItem) => Promise<boolean>;
}
export function RadioQuestions(props: RadioQuestionsProps) {
  const { data, onChange, value } = props;
  const { options, referenceVersion } = data || {};
  const readOnly = props.readonly;
  const correctValue = '';
  useEffect(() => {
    console.log(value);
  }, []);
  return (
    <div className={styles.radioQuestionsWrap}>
      <Space className={styles.spaceWrap} align="start">
        <Button size="small" ghost type="primary">
          单选
        </Button>
        <div>
          <div className={styles.titleWrap}>
            <Space>
              {props.label && (
                <span className={styles.htmlRenderWrap}>{props.label}</span>
              )}

              <span
                className={styles.htmlRenderWrap}
                dangerouslySetInnerHTML={{ __html: data?.description }}
              />
              <span>
                {`(${data.answerType === 1 ? '必答题 ' : ''}${lodash
                  .toNumber(data.score || 0)
                  .toFixed(2)}分)`}
              </span>
            </Space>
          </div>
          <MediaWrap data={data?.media} />
          <div className={styles.answerWrap}>
            <Radio.Group
              name={`radio_${data.id}`}
              value={lodash.get(value, '[0]')}
              disabled={readOnly}
              onChange={(e) => {
                // data['options'] = options.map((item) => {
                //   item.is_right = false;
                //   if (item.desc === e.target.value) {
                //     item.is_right = true;
                //   }
                //   return item;
                // });
                // console.log('data', data);
                onChange && onChange(data.id, [e.target.value]);
              }}
            >
              <Space direction="vertical">
                {options?.map((item, index) => {
                  return (
                    <Radio key={item?.id} value={item?.id}>
                      <Space>
                        <span className={styles.htmlRenderWrap}>
                          {A_Z[index]}:
                        </span>
                        <span
                          className={styles.htmlRenderWrap}
                          dangerouslySetInnerHTML={{
                            __html: item?.description,
                          }}
                        />
                      </Space>
                    </Radio>
                  );
                })}
              </Space>
            </Radio.Group>
          </div>
          {props.showTip && (
            <TipRender
              isSubQ={props?.isSubQ}
              data={data}
              type={QuestionsEnum.单选题}
              value={correctValue}
              isEditor={props?.isEditor}
              onEditor={props?.onEditor}
              upConfig={props?.upConfig}
            />
          )}
        </div>
      </Space>
    </div>
  );
}

export interface YesNoQuestionsProps {
  /**
   * 是否子题
   */
  isSubQ?: boolean;
  label?: string;
  showTip?: boolean;
  readonly?: boolean;
  data: SubItem;
  value?: string[];
  onChange?: (questionsId: string, value: string[]) => void;
  isEditor?: boolean;
  onEditor?: (data: ON_EDITOR_TYPE) => void;
  upConfig?: UP_CONFIG;
  onSetSelectTip?: (data: string) => void;
  onGetMediaPlayNum?: (data: MediaItem) => Promise<number>;
  onMediaPlay?: (item: MediaItem) => Promise<boolean>;
}
export function YesNoQuestions(props: YesNoQuestionsProps) {
  const { data, onChange, value } = props;
  const { options, referenceVersion } = data || {};
  const readOnly = props.readonly;
  const correctValue = '';
  useEffect(() => {
    console.log(value);
  }, []);
  return (
    <div className={styles.radioQuestionsWrap}>
      <Space className={styles.spaceWrap} align="start">
        <Button size="small" ghost type="primary">
          判断
        </Button>
        <div>
          <div className={styles.titleWrap}>
            <Space>
              {props.label && (
                <span className={styles.htmlRenderWrap}>{props.label}</span>
              )}

              <span
                className={styles.htmlRenderWrap}
                dangerouslySetInnerHTML={{ __html: data?.description }}
              />
              <span>
                {`(${data.answerType === 1 ? '必答题 ' : ''}${lodash
                  .toNumber(data.score || 0)
                  .toFixed(2)}分)`}
              </span>
            </Space>
          </div>
          <MediaWrap data={data?.media} />
          <div className={styles.answerWrap}>
            <Radio.Group
              name={`radio_${data.id}`}
              value={lodash.get(value, '[0]')}
              disabled={readOnly}
              onChange={(e) => {
                // data['options'] = options.map((item) => {
                //   item.is_right = false;
                //   if (item.desc === e.target.value) {
                //     item.is_right = true;
                //   }
                //   return item;
                // });
                // console.log('data', data);
                onChange && onChange(data.id, [e.target.value]);
              }}
            >
              <Space direction="vertical">
                {options?.map((item, index) => {
                  return (
                    <Radio key={item?.id} value={item?.id}>
                      <Space>
                        <span className={styles.htmlRenderWrap}>
                          {A_Z[index]}:
                        </span>
                        <span
                          className={styles.htmlRenderWrap}
                          dangerouslySetInnerHTML={{
                            __html: item?.description,
                          }}
                        />
                      </Space>
                    </Radio>
                  );
                })}
              </Space>
            </Radio.Group>
          </div>
          {props.showTip && (
            <TipRender
              isSubQ={props?.isSubQ}
              data={data}
              type={QuestionsEnum.判断题}
              value={correctValue}
              isEditor={props?.isEditor}
              onEditor={props?.onEditor}
              upConfig={props?.upConfig}
            />
          )}
        </div>
      </Space>
    </div>
  );
}
export interface CheckBoxQuestionsProps {
  /**
   * 是否子题
   */
  isSubQ?: boolean;
  label?: string;
  showTip?: boolean;
  readonly?: boolean;
  data: SubItem;
  value?: string[];
  onChange?: (questionsId: string, value: string[]) => void;
  isEditor?: boolean;
  onEditor?: (data: ON_EDITOR_TYPE) => void;
  upConfig?: UP_CONFIG;
  onSetSelectTip?: (data: string) => void;
  onGetMediaPlayNum?: (data: MediaItem) => Promise<number>;
  onMediaPlay?: (item: MediaItem) => Promise<boolean>;
}
export function CheckBoxQuestions(props: CheckBoxQuestionsProps) {
  const { data, onChange, value } = props;
  const { options, respond = [] } = data || {};
  const readOnly = props.readonly;
  const correctValue = undefined;
  return (
    <div className={styles.checkBoxQuestionsWrap}>
      <Space className={styles.spaceWrap} align="start">
        <Button size="small" ghost type="primary">
          多选
        </Button>
        <div>
          <div className={styles.titleWrap}>
            <Space>
              {props.label && (
                <span className={styles.htmlRenderWrap}>{props.label}</span>
              )}

              <span
                className={styles.htmlRenderWrap}
                dangerouslySetInnerHTML={{ __html: data?.description }}
              />
              <span>
                {`(${data.answerType === 1 ? '必答题 ' : ''}${lodash
                  .toNumber(data.score || 0)
                  .toFixed(2)}分)`}
              </span>
            </Space>
          </div>
          <MediaWrap data={data?.media} />
          <div className={styles.answerWrap}>
            <Checkbox.Group
              name={`checkbox_${data.id}`}
              disabled={readOnly}
              value={value}
              onChange={(value) => {
                // data['options'] = options.map((item) => {
                //   item.is_right = false;
                //   const check = !value.find((i) => i === item.desc);
                //   if (check) {
                //     item.is_right = false;
                //   } else {
                //     item.is_right = true;
                //   }
                //   return item;
                // });
                // console.log('data', value, data);
                const _value = lodash.uniq(value.map((i) => `${i}`));
                onChange && onChange(data.id, [..._value]);
              }}
            >
              <Space direction="vertical">
                {options &&
                  options.map((item, index) => {
                    return (
                      <Checkbox key={item.id} value={item.id}>
                        <Space>
                          <span>{A_Z[index]}:</span>
                          <span
                            className={styles.htmlRenderWrap}
                            dangerouslySetInnerHTML={{
                              __html: item?.description,
                            }}
                          />
                        </Space>
                      </Checkbox>
                    );
                  })}
              </Space>
            </Checkbox.Group>
          </div>
          {props.showTip && (
            <TipRender
              isSubQ={props?.isSubQ}
              data={data}
              type={QuestionsEnum.多选题}
              value={correctValue}
              isEditor={props?.isEditor}
              onEditor={props?.onEditor}
              upConfig={props?.upConfig}
            />
          )}
        </div>
      </Space>
    </div>
  );
}

export interface InputQuestionsProps {
  /**
   * 是否子题
   */
  isSubQ?: boolean;
  label?: string;
  showTip?: boolean;
  readonly?: boolean;
  data: SubItem;
  value?: string[];
  onChange?: (questionsId: string, value: string[]) => void;
  isEditor?: boolean;
  onEditor?: (data: ON_EDITOR_TYPE) => void;
  upConfig?: UP_CONFIG;
  onSetSelectTip?: (data: string) => void;
  onGetMediaPlayNum?: (data: MediaItem) => Promise<number>;
  onMediaPlay?: (item: MediaItem) => Promise<boolean>;
}
export function InputQuestions(props: InputQuestionsProps) {
  const { data, onChange, value } = props;
  const { respond } = data || {};
  const [editorState, setEditorState] = useState(
    BraftEditor.createEditorState(lodash.get(respond, '[0]')),
  );

  useEffect(() => {
    setEditorState(BraftEditor.createEditorState(lodash.get(value, '[0]')));
  }, [data?.id]);
  const handleEditorChange = (editorState: any) => {
    try {
      setEditorState(editorState);
      const htmlContent = editorState.toHTML();
      console.log(htmlContent);
      console.log(editorState.toText());
      props?.onChange &&
        props.onChange(data.id, editorState.toText() ? [htmlContent] : []);
    } catch (err) {}
  };
  const submitContent = () => {
    try {
      const htmlContent = editorState.toHTML();
      console.log(htmlContent);
      console.log(editorState.toText());
      props?.onChange &&
        props.onChange(data.id, editorState.toText() ? [htmlContent] : []);
    } catch (err) {}
  };
  const readOnly = props.readonly;

  const correctValue = undefined;
  return (
    <div className={styles.inputQuestionsWrap}>
      <Space className={styles.spaceWrap} align="start">
        <Button size="small" ghost type="primary">
          问答
        </Button>
        <div>
          <div className={styles.titleWrap}>
            <Space>
              {props.label && (
                <span className={styles.htmlRenderWrap}>{props.label}</span>
              )}

              <span
                className={styles.htmlRenderWrap}
                dangerouslySetInnerHTML={{ __html: data?.description }}
              />
              <span>
                {`(${data.answerType === 1 ? '必答题 ' : ''}${lodash
                  .toNumber(data.score || 0)
                  .toFixed(2)}分)`}
              </span>
            </Space>
          </div>
          <MediaWrap data={data?.media} />
          {!readOnly && (
            <div className={classNames(styles.answerWrap, styles.editorWrap)}>
              <BraftEditor
                controls={[
                  'undo',
                  'redo',
                  'separator',
                  'text-color',
                  'bold',
                  'italic',
                  'underline',
                  'strike-through',
                  'separator',
                  'clear',
                ]}
                value={editorState}
                onChange={handleEditorChange}
                onSave={submitContent}
              />
            </div>
          )}
          {props.showTip && (
            <TipRender
              isSubQ={props?.isSubQ}
              data={data}
              type={QuestionsEnum.问答题}
              value={correctValue}
              isEditor={props?.isEditor}
              onEditor={props?.onEditor}
              upConfig={props?.upConfig}
            />
          )}
        </div>
      </Space>
    </div>
  );
}
export interface RecordAudioQuestionsProps {
  /**
   * 是否子题
   */
  isSubQ?: boolean;
  label?: string;
  showTip?: boolean;
  readonly?: boolean;
  data: SubItem;
  value?: string[];
  onChange?: (questionsId: string, value: string[]) => void;
  isEditor?: boolean;
  onEditor?: (data: ON_EDITOR_TYPE) => void;
  upConfig?: UP_CONFIG;
  onSetSelectTip?: (data: string) => void;
  onGetMediaPlayNum?: (data: MediaItem) => Promise<number>;
  onMediaPlay?: (item: MediaItem) => Promise<boolean>;
}
export function RecordAudioQuestions(props: RecordAudioQuestionsProps) {
  const { data, onChange, value } = props;
  const readOnly = props.readonly;
  const correctValue = undefined;
  const videoNode = useRef<HTMLDivElement>();
  console.log(data);
  useEffect(() => {
    let player: any;
    if (data && videoNode?.current) {
    }
    return () => {
      player?.dispose();
    };
  }, [data, videoNode]);
  return (
    <div className={styles.AudioQuestionsWrap}>
      <Space className={styles.spaceWrap} align="start">
        <Button size="small" ghost type="primary">
          录音
        </Button>
        <div>
          <div className={styles.titleWrap}>
            <Space>
              {props.label && (
                <span className={styles.htmlRenderWrap}>{props.label}</span>
              )}

              <span
                className={styles.htmlRenderWrap}
                dangerouslySetInnerHTML={{ __html: data?.description }}
              />
              <span>
                {`(${data.answerType === 1 ? '必答题 ' : ''}${lodash
                  .toNumber(data.score || 0)
                  .toFixed(2)}分)`}
              </span>
            </Space>
          </div>
          <MediaWrap data={data?.media} />
          <div className={styles.answerWrap}>
            <div>
              <RecordAudio onChange={() => {}} />
            </div>
          </div>
          {props.showTip && (
            <TipRender
              isSubQ={props?.isSubQ}
              data={data}
              type={QuestionsEnum.录音题}
              value={correctValue}
              isEditor={props?.isEditor}
              onEditor={props?.onEditor}
              upConfig={props?.upConfig}
            />
          )}
        </div>
      </Space>
    </div>
  );
}
export interface RecordVideoQuestionsProps {
  /**
   * 是否子题
   */
  isSubQ?: boolean;
  label?: string;
  showTip?: boolean;
  readonly?: boolean;
  data: SubItem;
  value?: string[];
  onChange?: (questionsId: string, value: string[]) => void;
  isEditor?: boolean;
  onEditor?: (data: ON_EDITOR_TYPE) => void;
  upConfig?: UP_CONFIG;
  onSetSelectTip?: (data: string) => void;
  onGetMediaPlayNum?: (data: MediaItem) => Promise<number>;
  onMediaPlay?: (item: MediaItem) => Promise<boolean>;
}
export function RecordVideoQuestions(props: RecordVideoQuestionsProps) {
  const { data, onChange, value } = props;
  const { options, respond = [] } = data || {};
  const [videoUrl, setVideoUrl] = useState<string>();
  const readOnly = props.readonly;
  console.log(data);
  const correctValue = undefined;
  const videoNode = useRef<HTMLElement>();

  useEffect(() => {
    let player: any;
    if (videoNode && videoNode.current) {
    }
    return () => {
      if (player) {
      }
    };
  }, [data, videoNode]);
  return (
    <div className={styles.VideoQuestionsWrap}>
      <Space className={styles.spaceWrap} align="start">
        <Button size="small" ghost type="primary">
          录像
        </Button>
        <div>
          <div className={styles.titleWrap}>
            <Space>
              {props.label && (
                <span className={styles.htmlRenderWrap}>{props.label}</span>
              )}

              <span
                className={styles.htmlRenderWrap}
                dangerouslySetInnerHTML={{ __html: data?.description }}
              />
              <span>
                {`(${data.answerType === 1 ? '必答题 ' : ''}${lodash
                  .toNumber(data.score || 0)
                  .toFixed(2)}分)`}
              </span>
            </Space>
          </div>
          <MediaWrap data={data?.media} />
          <div className={styles.answerWrap}>
            <div>
              <RecordVideo onChange={() => {}} />
            </div>
          </div>
          {props.showTip && (
            <TipRender
              isSubQ={props?.isSubQ}
              data={data}
              type={QuestionsEnum.录像题}
              value={correctValue}
              isEditor={props?.isEditor}
              onEditor={props?.onEditor}
              upConfig={props?.upConfig}
            />
          )}
        </div>
      </Space>
    </div>
  );
}

export interface HearingQuestionsProps {
  /**
   * 是否子题
   */
  isSubQ?: boolean;
  label?: string;
  type: QuestionsEnum;
  showTip?: boolean;
  readonly?: boolean;
  data: SubItem;
  value?: { [questionsId: string]: string[] };
  onChange?: (
    questionsId: string,
    value: { [questionsId: string]: string[] },
  ) => void;
  isEditor?: boolean;
  onEditor?: (data: ON_EDITOR_TYPE) => void;
  upConfig?: UP_CONFIG;
  onSetSelectTip?: (data: string) => void;
  onGetMediaPlayNum?: (data: MediaItem) => Promise<number>;
  onMediaPlay?: (item: MediaItem) => Promise<boolean>;
}
export function HearingQuestions(props: HearingQuestionsProps) {
  const [playNumObj, setPlayNumObj] = useState<{ [key: string]: number }>({});
  const { data, onChange, value } = props;
  const { options, respond = [] } = data || {};
  const readOnly = props.readonly;
  console.log('HearingQuestions', data);
  const correctValue = undefined;
  const onChagne = (id: string, minQValue: string[]) => {
    props?.onChange &&
      props.onChange(data.id, {
        ...(value || {}),
        [id]: {
          ...lodash.get(value, `${id}`, {}),
          value: minQValue,
        },
      });
  };
  let onEditor: (
    id: string,
    data: { type: ON_EDITOR_TYPE['type']; data: Partial<Omit<SubItem, 'id'>> },
  ) => void;
  onEditor = (id, changeData) => {
    if (props?.onEditor) {
      const subs = lodash.cloneDeep(data?.subs);
      const index = subs?.findIndex((i) => i.id === id);
      if (subs && lodash.isNumber(index)) {
        if (changeData.type === 'delete') {
          subs?.splice(index, 1);
        }
        if (changeData.type === 'change') {
          lodash.set(subs, `[${index}]`, {
            ...lodash.get(subs, `[${index}]`, {}),
            ...changeData?.data,
          });
        }
        if (changeData.type === 'up') {
          if (lodash.isNumber(index) && index - 1 >= 0) {
            swapArrPlaces(subs, index, index - 1);
          }
        }
        if (changeData.type === 'down') {
          if (
            lodash.isNumber(index) &&
            subs?.length &&
            index + 1 < subs?.length
          ) {
            swapArrPlaces(subs, index, index + 1);
          }
        }
      }
      let _score = 0;
      if (subs && subs.length) {
        subs.forEach((item) => {
          _score += lodash.toNumber(lodash.get(item, 'score', 0));
        });
      }
      props?.onEditor({
        type: 'change',
        data: {
          score: _score,
          subs: subs,
        },
      });
    }
  };

  useEffect(() => {
    const _playNumObj: any = {};
    data?.media?.forEach((item) => {
      const localhasPlayCount = sessionStorage.getItem(
        `${item.id}_${item.url}`,
      );
      if (localhasPlayCount) {
        const i = lodash.toNumber(localhasPlayCount || 0);
        _playNumObj[`${item.id}_${item.url}`] = i <= 0 ? 0 : i;
      } else {
        const i = item.playCount - (item?.hasPlayCount || 0);
        _playNumObj[`${item.id}_${item.url}`] = i <= 0 ? 0 : i;
      }
    });
    setPlayNumObj(_playNumObj);
  }, [data?.media]);
  return (
    <div className={styles.CompositeQuestionsWrap}>
      <Space className={styles.spaceWrap} align="start">
        <Button size="small" ghost type="primary">
          听力
        </Button>
        <div>
          <div className={styles.titleWrap}>
            <Space>
              {props.label && (
                <span className={styles.htmlRenderWrap}>{props.label}</span>
              )}

              <span
                className={styles.htmlRenderWrap}
                dangerouslySetInnerHTML={{ __html: data?.description }}
              />
              <span>
                {`(${data.answerType === 1 ? '必答题 ' : ''}${lodash
                  .toNumber(data.score || 0)
                  .toFixed(2)}分)`}
              </span>
            </Space>
          </div>
          <div className={styles.audioPlayerWrap}>
            {data?.media?.map((item) => {
              let _playNum = lodash.get(
                playNumObj,
                `${item.id}_${item.url}`,
                0,
              );
              _playNum = _playNum <= 0 ? 0 : _playNum;
              return (
                <div
                  className={styles.playerItemWrap}
                  key={`${data.id}_${item.id}_${item.url}`}
                >
                  <AudioPlayer
                    data={item}
                    isNotStopBtn={true}
                    playsInline
                    onPlayTip={
                      !props?.showTip && item.playCount !== 0
                        ? async (conf: any) => {
                            Modal.confirm({
                              title: '确认开始播放听力音频',
                              content: '播放不可暂停，且会扣减一次播放次数',
                              onOk: async () => {
                                return new Promise<void>(
                                  async (resolve, reject) => {
                                    const loading = message.loading(
                                      {
                                        content: 'loading',
                                        key: 'global_player_audio_number',
                                      },
                                      0,
                                    );
                                    try {
                                      await delay(500);
                                      let num: number = 1;
                                      if (props.onGetMediaPlayNum) {
                                        num = await props.onGetMediaPlayNum(
                                          item,
                                        );
                                      }
                                      if (num > 0) {
                                        let isOkUPServer = false;
                                        try {
                                          if (props?.onMediaPlay) {
                                            isOkUPServer =
                                              await props?.onMediaPlay(item);
                                          }
                                          if (isOkUPServer && conf.onOk) {
                                            setPlayNumObj((_playNumObj) => {
                                              const cNum = lodash.get(
                                                _playNumObj,
                                                `${item.id}_${item.url}`,
                                                0,
                                              );
                                              if (cNum <= 0) {
                                                Modal.warn({
                                                  title: '音频播放次数已用完',
                                                });
                                                _playNumObj[
                                                  `${item.id}_${item.url}`
                                                ] = 0;
                                              } else {
                                                conf.onOk();
                                                const _cNum = cNum - 1;
                                                lodash.set(
                                                  _playNumObj,
                                                  `${item.url}`,
                                                  _cNum,
                                                );
                                                sessionStorage.setItem(
                                                  `${item.id}_${item.url}`,
                                                  `${_cNum}`,
                                                );
                                                _playNumObj[
                                                  `${item.id}_${item.url}`
                                                ] = _cNum;
                                              }
                                              return _playNumObj;
                                            });
                                          } else {
                                            throw new Error('上报播放次数失败');
                                          }
                                        } catch (error) {
                                          console.error(error);
                                          Modal.warn({
                                            title: '播放异常, 请重试',
                                          });
                                        }
                                      } else {
                                        Modal.warn({
                                          title: '音频播放次数已用完',
                                        });
                                      }
                                      resolve();
                                    } catch (error) {
                                      reject();
                                    } finally {
                                      loading();
                                    }
                                  },
                                );
                              },
                            });
                            return true;
                          }
                        : async (conf: any) => {
                            if (conf.onOk) {
                              conf.onOk();
                            }
                            return true;
                          }
                    }
                    onPlay={() => {
                      props?.onSetSelectTip &&
                        props?.onSetSelectTip(
                          '当前正在播放听力，确认切换该页面',
                        );
                    }}
                    onPause={() => {
                      props?.onSetSelectTip && props?.onSetSelectTip('');
                    }}
                    onEnded={() => {
                      props?.onSetSelectTip && props?.onSetSelectTip('');
                    }}
                    onError={() => {
                      props?.onSetSelectTip && props?.onSetSelectTip('');
                    }}
                  />
                  <div className={styles.playCountWrap}>
                    可播放次数：{item.playCount == 0 ? '不限' : _playNum}次
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles.answerWrap}>
            {data?.subs && (
              <Card>
                <div className={styles.subsWrap}>
                  {data?.subs.map((item, index) => {
                    return (
                      <div className={styles.subsItem} key={item.id}>
                        <RenderQ
                          isSubQ={true}
                          label={`${index + 1}、`}
                          type={item.type}
                          showTip={props?.showTip}
                          readonly={!!props?.readonly}
                          data={item}
                          value={lodash.get(value, `[${item.id}].value`)}
                          onChange={onChagne}
                          isEditor={props?.isEditor}
                          onEditor={(data) => {
                            onEditor(item.id, data);
                          }}
                          upConfig={props?.upConfig}
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
          {props.showTip && (
            <TipRender
              isSubQ={props?.isSubQ}
              data={data}
              type={QuestionsEnum.听力题}
              value={correctValue}
              isEditor={props?.isEditor}
              onEditor={props?.onEditor}
              upConfig={props?.upConfig}
            />
          )}
        </div>
      </Space>
    </div>
  );
}
export interface CompositeQuestionsProps {
  /**
   * 是否子题
   */
  isSubQ?: boolean;
  label?: string;
  type: QuestionsEnum;
  showTip?: boolean;
  readonly?: boolean;
  data: SubItem;
  value?: { [questionsId: string]: string[] };
  onChange?: (
    questionsId: string,
    value: { [questionsId: string]: string[] },
  ) => void;
  isEditor?: boolean;
  onEditor?: (data: ON_EDITOR_TYPE) => void;
  upConfig?: UP_CONFIG;
  onSetSelectTip?: (data: string) => void;
  onGetMediaPlayNum?: (data: MediaItem) => Promise<number>;
  onMediaPlay?: (item: MediaItem) => Promise<boolean>;
}
export function CompositeQuestions(props: CompositeQuestionsProps) {
  const { data, onChange, value } = props;
  const readOnly = props.readonly;
  const correctValue = undefined;
  const onChagne = (id: string, minQValue: string[]) => {
    props?.onChange &&
      props.onChange(data.id, {
        ...(value || {}),
        [id]: {
          ...lodash.get(value, `${id}`, {}),
          value: minQValue,
        },
      });
  };
  let onEditor: (
    id: string,
    data: { type: ON_EDITOR_TYPE['type']; data: Partial<Omit<SubItem, 'id'>> },
  ) => void;
  onEditor = (id, changeData) => {
    if (props?.onEditor) {
      const subs = lodash.cloneDeep(data?.subs);
      const index = subs?.findIndex((i) => i.id === id);
      if (subs && lodash.isNumber(index)) {
        if (changeData.type === 'delete') {
          subs?.splice(index, 1);
        }
        if (changeData.type === 'change') {
          lodash.set(subs, `[${index}]`, {
            ...lodash.get(subs, `[${index}]`, {}),
            ...changeData?.data,
          });
        }
        if (changeData.type === 'up') {
          if (lodash.isNumber(index) && index - 1 >= 0) {
            swapArrPlaces(subs, index, index - 1);
          }
        }
        if (changeData.type === 'down') {
          if (
            lodash.isNumber(index) &&
            subs?.length &&
            index + 1 < subs?.length
          ) {
            swapArrPlaces(subs, index, index + 1);
          }
        }
      }
      let _score = 0;
      if (subs && subs.length) {
        subs.forEach((item) => {
          _score += lodash.toNumber(lodash.get(item, 'score', 0));
        });
      }
      props?.onEditor({
        type: 'change',
        data: {
          score: _score,
          subs: subs,
        },
      });
    }
  };
  return (
    <div className={styles.CompositeQuestionsWrap}>
      <Space className={styles.spaceWrap} align="start">
        <Button size="small" ghost type="primary">
          复合
        </Button>
        <div>
          <div className={styles.titleWrap}>
            <Space>
              {props.label && (
                <span className={styles.htmlRenderWrap}>{props.label}</span>
              )}

              <span
                className={styles.htmlRenderWrap}
                dangerouslySetInnerHTML={{ __html: data?.description }}
              />
              <span>
                {`(${data.answerType === 1 ? '必答题 ' : ''}${lodash
                  .toNumber(data.score || 0)
                  .toFixed(2)}分)`}
              </span>
            </Space>
          </div>
          <MediaWrap data={data?.media} />
          <div className={styles.answerWrap}>
            {data?.subs && (
              <Card>
                <div className={styles.subsWrap}>
                  {data?.subs.map((item, index) => {
                    return (
                      <div className={styles.subsItem} key={item.id}>
                        <RenderQ
                          isSubQ={true}
                          label={`${index + 1}、`}
                          type={item.type}
                          showTip={props?.showTip}
                          readonly={!!props?.readonly}
                          data={item}
                          value={lodash.get(value, `[${item.id}].value`)}
                          onChange={onChagne}
                          isEditor={props?.isEditor}
                          onEditor={(data) => {
                            onEditor(item.id, data);
                          }}
                          upConfig={props?.upConfig}
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
          {props.showTip && (
            <TipRender
              isSubQ={props?.isSubQ}
              data={data}
              type={QuestionsEnum.听力题}
              value={correctValue}
              isEditor={props?.isEditor}
              onEditor={props?.onEditor}
              upConfig={props?.upConfig}
            />
          )}
        </div>
      </Space>
    </div>
  );
}

function TipRender(props: {
  /**
   * 是否子题
   */
  isSubQ?: boolean;
  data: SubItem;
  type: QuestionsEnum;
  value?: string[] | { [questionsId: string]: string[] };
  isEditor?: boolean;
  onEditor?: (data: ON_EDITOR_TYPE) => void;
  upConfig?: UP_CONFIG;
}) {
  const [isEditor, setIsEditor] = useState(props.isEditor);
  const [isOpenEditorModal, openEditorModal] = useState<boolean>(false);
  const data = props?.data;
  const type = props?.type;
  const value = props?.value;
  const onEditor: (data: {
    type: ON_EDITOR_TYPE['type'];
    data: Partial<Omit<SubItem, 'id'>>;
  }) => void = (data) => {
    props?.onEditor && props.onEditor(data);
  };
  return (
    <div className={styles.answerTipWrap}>
      <div className={styles.tipLeft}>
        {QuestionsEnum.听力题 !== type && QuestionsEnum.复合题 !== type ? (
          <div className={styles.tipItem}>
            <span className={styles.lable}>题目分数：</span>
            {props.isEditor && props.isSubQ !== true ? (
              <InputNumber
                max={999.99}
                min={0.01}
                precision={2}
                value={data.score || 0}
                onChange={(e) => {
                  onEditor({
                    type: 'change',
                    data: {
                      score: e,
                    },
                  });
                }}
                addonAfter="分"
              />
            ) : (
              <strong>
                {`${lodash.toNumber(data.score || 0).toFixed(2)}`}分
              </strong>
            )}
          </div>
        ) : undefined}
        {(QuestionsEnum.判断题 === type ||
          QuestionsEnum.单选题 === type ||
          QuestionsEnum.多选题 === type) && (
          <div className={styles.tipItem}>
            <span className={styles.lable}>正确答案：</span>
            <strong>
              <Space split={<Divider type="vertical" />}>
                {data?.options && Array.isArray(data?.options)
                  ? data?.options.map((item, index) => {
                      if (!item.isRight) {
                        return undefined;
                      }
                      return (
                        <Space key={item.id}>
                          <span>{A_Z[index]}</span>
                        </Space>
                      );
                    })
                  : '无'}
              </Space>
            </strong>
          </div>
        )}
        {!props.isSubQ && (
          <div className={styles.tipItem}>
            <span className={styles.lable}>题目难度：</span>
            <strong>
              <Rate
                allowClear={false}
                disabled={!props.isEditor}
                value={data.difficulty || 1}
                onChange={(e) => {
                  onEditor({
                    type: 'change',
                    data: {
                      difficulty: e,
                    },
                  });
                }}
              />
            </strong>
          </div>
        )}
        {(type === QuestionsEnum.录音题 || type === QuestionsEnum.录像题) && (
          <>
            <div className={styles.tipItem}>
              <span className={styles.lable}>单次最长录制时间：</span>
              {props.isEditor ? (
                <InputNumber
                  value={data.recordDuration}
                  onChange={(e) => {
                    onEditor({
                      type: 'change',
                      data: {
                        recordDuration: e,
                      },
                    });
                  }}
                  addonAfter="秒"
                />
              ) : (
                <strong>{`${data.recordDuration}`}秒</strong>
              )}
            </div>
            <div className={styles.tipItem}>
              <span className={styles.lable}>可录制次数：</span>
              {props.isEditor ? (
                <InputNumber
                  value={data.recordCount}
                  onChange={(e) => {
                    onEditor({
                      type: 'change',
                      data: {
                        recordCount: e,
                      },
                    });
                  }}
                  addonAfter="次"
                />
              ) : (
                <strong>{`${data.recordCount}`}次</strong>
              )}
            </div>
          </>
        )}
      </div>

      <div className={styles.tipRight}>
        {props.isEditor && props.isSubQ !== true && (
          <div className={styles.tipToolsWrap}>
            <Space>
              <Tooltip mouseEnterDelay={0.3} title="编辑">
                <a
                  className={styles.toolsItem}
                  onClick={(e) => {
                    e.preventDefault();
                    // 是否编辑
                    // onEditor({}, true);
                    openEditorModal(true);
                  }}
                >
                  <EditOutlined />
                </a>
              </Tooltip>
              <Tooltip mouseEnterDelay={0.3} title="上移">
                <a
                  className={styles.toolsItem}
                  onClick={(e) => {
                    e.preventDefault();
                    // 上移
                    onEditor({
                      type: 'up',
                      data: data,
                    });
                  }}
                >
                  <UpCircleOutlined />
                </a>
              </Tooltip>
              <Tooltip mouseEnterDelay={0.3} title="下移">
                <a
                  className={styles.toolsItem}
                  onClick={(e) => {
                    e.preventDefault();
                    // 下移
                    onEditor({
                      type: 'down',
                      data: data,
                    });
                  }}
                >
                  <DownCircleOutlined />
                </a>
              </Tooltip>
              <Tooltip mouseEnterDelay={0.3} title="删除">
                <a
                  className={styles.toolsItem}
                  onClick={(e) => {
                    e.preventDefault();
                    // 删除
                    onEditor({
                      type: 'delete',
                      data: data,
                    });
                  }}
                >
                  <DeleteOutlined />
                </a>
              </Tooltip>
            </Space>
          </div>
        )}
        <div className={styles.answerTypeWrap}>
          {QuestionsEnum.听力题 !== type && QuestionsEnum.复合题 !== type && (
            <Checkbox
              checked={data.answerType === 1}
              onChange={() => {
                if (data.answerType === 1) {
                  onEditor({
                    type: 'change',
                    data: {
                      answerType: 2,
                    },
                  });
                } else {
                  onEditor({
                    type: 'change',
                    data: {
                      answerType: 1,
                    },
                  });
                }
              }}
            >
              必答题
            </Checkbox>
          )}
        </div>
      </div>
      <Modal
        // title={`修改题目${
        //   data?.id ? ` (${data.id}) - ${QuestionsEnum[data.type]}` : ''
        // }`}
        title={'编辑题目'}
        closable
        width={560}
        centered
        visible={!!isOpenEditorModal}
        wrapClassName={styles.changeQMinModalWrap}
        className={styles.changeQMinModalContent}
        onCancel={() => {
          openEditorModal(false);
        }}
        afterClose={() => {
          openEditorModal(false);
        }}
        destroyOnClose
        cancelText="关闭"
        okText="确定"
        footer={false}
      >
        <div className={styles.body}>
          <EditorQ
            bigQType={undefined}
            upConfig={props.upConfig}
            data={data}
            onOk={(data) => {
              onEditor({
                type: 'change',
                data: data,
              });
              openEditorModal(false);
            }}
            onCancel={() => {
              openEditorModal(false);
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

interface ReadQProps {
  /**
   * 是否子题
   */
  isSubQ?: boolean;
  label?: string;
  type: QuestionsEnum;
  data: SubItem;
  showTip?: boolean;
  readonly?: boolean;
  value?: string[] | { [questionsId: string]: string[] };
  onChange?: (
    questionsId: string,
    value: string[] | { [questionsId: string]: string[] },
  ) => void;
  isEditor?: boolean;
  onEditor?: (data: ON_EDITOR_TYPE) => void;
  upConfig?: UP_CONFIG;
  onSetSelectTip?: (data: string) => void;
  onGetMediaPlayNum?: (data: MediaItem) => Promise<number>;
  onMediaPlay?: (item: MediaItem) => Promise<boolean>;
}
export function RenderQ(props: ReadQProps) {
  const { type, data, onChange } = props;
  useEffect(() => {}, []);
  console.log('RenderQ: ', props);
  return (
    <div>
      {QuestionsEnum.单选题 === type && (
        <RadioQuestions
          isSubQ={props?.isSubQ}
          label={props?.label}
          showTip={props?.showTip}
          readonly={!!props?.readonly}
          data={data}
          value={props?.value as RadioQuestionsProps['value']}
          onChange={onChange}
          isEditor={props?.isEditor}
          onEditor={props?.onEditor}
          upConfig={props?.upConfig}
          onSetSelectTip={props?.onSetSelectTip}
        />
      )}
      {QuestionsEnum.多选题 === type && (
        <CheckBoxQuestions
          isSubQ={props?.isSubQ}
          label={props?.label}
          showTip={props?.showTip}
          readonly={!!props?.readonly}
          data={data}
          value={props?.value as CheckBoxQuestionsProps['value']}
          onChange={onChange}
          isEditor={props?.isEditor}
          onEditor={props?.onEditor}
          upConfig={props?.upConfig}
          onSetSelectTip={props?.onSetSelectTip}
        />
      )}
      {QuestionsEnum.判断题 === type && (
        <YesNoQuestions
          isSubQ={props?.isSubQ}
          label={props?.label}
          showTip={props?.showTip}
          readonly={!!props?.readonly}
          data={data}
          value={props?.value as YesNoQuestionsProps['value']}
          onChange={onChange}
          isEditor={props?.isEditor}
          onEditor={props?.onEditor}
          upConfig={props?.upConfig}
          onSetSelectTip={props?.onSetSelectTip}
        />
      )}
      {QuestionsEnum.问答题 === type && (
        <InputQuestions
          isSubQ={props?.isSubQ}
          label={props?.label}
          showTip={props?.showTip}
          readonly={!!props?.readonly}
          data={data}
          value={props?.value as InputQuestionsProps['value']}
          onChange={onChange}
          isEditor={props?.isEditor}
          onEditor={props?.onEditor}
          upConfig={props?.upConfig}
          onSetSelectTip={props?.onSetSelectTip}
        />
      )}
      {QuestionsEnum.录音题 === type && (
        <RecordAudioQuestions
          isSubQ={props?.isSubQ}
          label={props?.label}
          showTip={props?.showTip}
          readonly={!!props?.readonly}
          data={data}
          value={props?.value as RecordAudioQuestionsProps['value']}
          onChange={onChange}
          isEditor={props?.isEditor}
          onEditor={props?.onEditor}
          upConfig={props?.upConfig}
          onSetSelectTip={props?.onSetSelectTip}
        />
      )}
      {QuestionsEnum.录像题 === type && (
        <RecordVideoQuestions
          isSubQ={props?.isSubQ}
          label={props?.label}
          showTip={props?.showTip}
          readonly={!!props?.readonly}
          data={data}
          value={props?.value as RecordVideoQuestionsProps['value']}
          onChange={onChange}
          isEditor={props?.isEditor}
          onEditor={props?.onEditor}
          upConfig={props?.upConfig}
          onSetSelectTip={props?.onSetSelectTip}
        />
      )}
      {QuestionsEnum.听力题 === type && (
        <HearingQuestions
          isSubQ={props?.isSubQ}
          label={props?.label}
          showTip={props?.showTip}
          readonly={!!props?.readonly}
          data={data}
          value={props?.value as HearingQuestionsProps['value']}
          onChange={onChange}
          isEditor={props?.isEditor}
          onEditor={props?.onEditor}
          upConfig={props?.upConfig}
          onSetSelectTip={props?.onSetSelectTip}
          onGetMediaPlayNum={props?.onGetMediaPlayNum}
          onMediaPlay={props?.onMediaPlay}
        />
      )}
      {QuestionsEnum.复合题 === type && (
        <CompositeQuestions
          isSubQ={props?.isSubQ}
          label={props?.label}
          showTip={props?.showTip}
          readonly={!!props?.readonly}
          data={data}
          value={props?.value as CompositeQuestionsProps['value']}
          onChange={onChange}
          isEditor={props?.isEditor}
          onEditor={props?.onEditor}
          upConfig={props?.upConfig}
          onSetSelectTip={props?.onSetSelectTip}
        />
      )}
    </div>
  );
}
