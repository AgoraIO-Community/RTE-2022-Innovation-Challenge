import { Button, Radio, Space, Tag, Checkbox } from 'antd';
import React, { useEffect, useState } from 'react';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/index.css';
import { BigQuestionsType, HTML_MIN_QUESTIONS, A_Z } from '../../../../types';
import styles from './styles.less';
import classNames from 'classnames';
import lodash from 'lodash';
import { Observer, useLocalStore } from 'mobx-react';
import { store } from '../../../../store';

export interface QadioQuestionsProps {
  readonly?: boolean;
  data: HTML_MIN_QUESTIONS;
  onChange: (data: HTML_MIN_QUESTIONS) => void;
}
export function RadioQuestions(props: QadioQuestionsProps) {
  const localStore = useLocalStore(() => store);
  const { data, onChange } = props;
  const { options, respond = [] } = data || {};
  const value = lodash.get(respond, '[0]');
  const readOnly = props.readonly || localStore.readOnly;
  return (
    <Observer>
      {() => {
        return (
          <div className={styles.radioQuestionsWrap}>
            <Space className={styles.spaceWrap} align="start">
              <Button size="small" ghost type="primary">
                {BigQuestionsType[data.type]}
              </Button>
              <div>
                <div className={styles.titleWrap}>
                  <span
                    className={styles.htmlRenderWrap}
                    dangerouslySetInnerHTML={{ __html: data?.description }}
                  />
                  {data.answerType === 1 && `(必答题 ${data.score && `${data.score}分`})`}
                  {data.answerType !== 1 && `(${data.score}分`}
                </div>
                <div className={styles.answerWrap}>
                  <Radio.Group
                    value={value}
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
                      data['respond'] = lodash.uniq([e.target.value]);
                      onChange(data);
                    }}
                  >
                    <Space direction="vertical">
                      {options &&
                        options.map((item, index) => {
                          return (
                            <Radio value={A_Z[index]}>
                              <span
                                className={styles.htmlRenderWrap}
                                dangerouslySetInnerHTML={{ __html: item?.desc }}
                              />
                            </Radio>
                          );
                        })}
                    </Space>
                  </Radio.Group>
                </div>
              </div>
            </Space>
          </div>
        );
      }}
    </Observer>
  );
}

export interface CheckBoxQuestionsProps {
  readonly?: boolean;
  data: HTML_MIN_QUESTIONS;
  onChange: (data: HTML_MIN_QUESTIONS) => void;
}
export function CheckBoxQuestions(props: CheckBoxQuestionsProps) {
  const localStore = useLocalStore(() => store);
  const { data, onChange } = props;
  const { options, respond = [] } = data || {};
  const value = respond;
  const readOnly = props.readonly || localStore.readOnly;
  return (
    <Observer>
      {() => {
        return (
          <div className={styles.checkBoxQuestionsWrap}>
            <Space className={styles.spaceWrap} align="start">
              <Button size="small" ghost type="primary">
                {BigQuestionsType[data.type]}
              </Button>
              <div>
                <div className={styles.titleWrap}>
                  <span
                    className={styles.htmlRenderWrap}
                    dangerouslySetInnerHTML={{ __html: data?.description }}
                  />
                  {data.answerType === 1 && `(必答题 ${data.score && `${data.score}分`})`}
                  {data.answerType !== 1 && `(${data.score}分`}
                </div>
                <div className={styles.answerWrap}>
                  <Checkbox.Group
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
                      console.log(lodash.uniq(value.map((i) => `${i}`)));
                      data['respond'] = lodash.uniq(value.map((i) => `${i}`));
                      onChange(data);
                    }}
                  >
                    <Space direction="vertical">
                      {options &&
                        options.map((item, index) => {
                          return (
                            <Checkbox value={A_Z[index]}>
                              <span
                                className={styles.htmlRenderWrap}
                                dangerouslySetInnerHTML={{ __html: item?.desc }}
                              />
                            </Checkbox>
                          );
                        })}
                    </Space>
                  </Checkbox.Group>
                </div>
              </div>
            </Space>
          </div>
        );
      }}
    </Observer>
  );
}

export interface InputQuestionsProps {
  readonly?: boolean;
  data: HTML_MIN_QUESTIONS;
  onChange: (data: HTML_MIN_QUESTIONS) => void;
}
export function InputQuestions(props: InputQuestionsProps) {
  const localStore = useLocalStore(() => store);
  const { data, onChange } = props;
  const { respond } = data || {};
  const [editorState, setEditorState] = useState(
    BraftEditor.createEditorState(lodash.get(respond, '[0]')),
  );

  useEffect(() => {
    setEditorState(BraftEditor.createEditorState(lodash.get(respond, '[0]')));
  }, [data?.id]);
  const handleEditorChange = (editorState: any) => {
    try {
      setEditorState(editorState);
      const htmlContent = editorState.toHTML();
      console.log(htmlContent);
      console.log(editorState.toText());
      if (editorState.toText()) {
        data['respond'] = lodash.uniq([htmlContent]);
      } else {
        data['respond'] = [];
      }
      onChange(data);
      console.log(editorState.toText())
    } catch (err) {}
  };
  const submitContent = () => {
    try {
      const htmlContent = editorState.toHTML();
      console.log(htmlContent);
      console.log(editorState.toText());
      if (editorState.toText()) {
        data['respond'] = lodash.uniq([htmlContent]);
      } else {
        data['respond'] = [];
      }
      onChange(data);
    } catch (err) {}
  };
  const readOnly = props.readonly || localStore.readOnly;
  console.log('data.answerType', data.answerType)
  return (
    <Observer>
      {() => {
        return (
          <div className={styles.inputQuestionsWrap}>
            <Space className={styles.spaceWrap} align="start">
              <Button size="small" ghost type="primary">
                {BigQuestionsType[data.type]}
              </Button>
              <div>
                <div className={styles.titleWrap}>
                  <span
                    className={styles.htmlRenderWrap}
                    dangerouslySetInnerHTML={{ __html: data?.description }}
                  />
                  {data.answerType === 1 && `(必答题 ${data.score && `${data.score}分`})`}
                  {data.answerType !== 1 && `(${data.score}分`}
                </div>
                {!readOnly && (
                  <div
                    className={classNames(styles.answerWrap, styles.editorWrap)}
                  >
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
              </div>
            </Space>
          </div>
        );
      }}
    </Observer>
  );
}
