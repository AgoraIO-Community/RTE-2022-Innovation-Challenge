import React, { useEffect, useState } from 'react';
import styles from './styles.less';
import { Scrollbars } from 'react-custom-scrollbars';
import 'react-custom-scroll/dist/customScroll.css';
import { Button, Card, Radio, Space, Table } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import classNames from 'classnames';
import lodash from 'lodash';
import { useImmer } from 'use-immer';
import {
  HTML_PAPER_DATA,
  HTML_MIN_QUESTIONS,
  BigQuestionsType,
  OnChangePapers,
  ChangePapersEvent,
} from '../../../types';

import { RadioQuestions, CheckBoxQuestions, InputQuestions } from './libs';
import { Observer, useLocalStore } from 'mobx-react';
import { store } from '../../../store';
import MyIcon from '@/components/MyIconfont';
export interface Props {
  onBack?: () => void;
  data: HTML_PAPER_DATA;
  onChangePapers: OnChangePapers;
  readonly?: boolean;
}

enum Status {
  '标记' = 1,
  '已答' = 2,
  '未答' = 3,
}

function HtmlPaper(props: Props) {
  const localStore = useLocalStore(() => store);
  const [data, setData] = useState<HTML_PAPER_DATA>();
  const [questionsObj, setQuestionsObj] =
    useState<{ [key: string]: HTML_MIN_QUESTIONS }>();
  const [questionsArray, setQuestionsArray] = useState<HTML_MIN_QUESTIONS[]>();
  const [selectItem, setSelectItem] = useState<HTML_MIN_QUESTIONS>();
  useEffect(() => {
    const _data = lodash.cloneDeep(props?.data);
    setData(_data);

    if (!selectItem) {
      const _selectItem = lodash.get(_data, `bigQuestions[0].questions[0]`);
      setSelectItem(_selectItem);
    }

    const _questionsObj: { [key: string]: HTML_MIN_QUESTIONS } = {};
    const _questionsArray: HTML_MIN_QUESTIONS[] = [];
    _data?.bigQuestions &&
      _data?.bigQuestions?.forEach((item) => {
        const { questions = [], type } = item;
        questions?.forEach((item) => {
          _questionsArray.push(item);
          _questionsObj[item.id] = item;
        });
      });
    setQuestionsObj(_questionsObj);
    setQuestionsArray(_questionsArray);

    return () => {};
  }, [props?.data]);

  const onCheckTag = (item: HTML_MIN_QUESTIONS) => {
    const flag = !!lodash.get(item, `flag`);
    if (flag) {
      item['flag'] = false;
    } else {
      item['flag'] = true;
    }
    localStore.changeHtmlQuestion(item);
    const _data = lodash.get(questionsObj, `${item?.id}`);
    props?.onChangePapers(
      ChangePapersEvent.更新标记,
      localStore.paperData,
      data?.id,
    );
  };
  const onSelectItem = (item: HTML_MIN_QUESTIONS) => {
    const _data = lodash.get(questionsObj, `${item?.id}`);
    console.log(questionsObj, _data, 'data', item);
    setSelectItem(_data);
    props?.onChangePapers(
      ChangePapersEvent.更新答案,
      localStore.paperData,
      data?.id,
    );
  };

  const cIndex =
    questionsArray?.findIndex((i) => i?.id === selectItem?.id) || 0;
  const onChagne = (data) => {
    localStore.changeHtmlQuestion(data);
  };
  return (
    <Observer>
      {() => {
        return (
          <div className={styles.testWrap}>
            <div className={styles.testWrap}>
              <div className={styles.leftWrap}>
                <div className={styles.leftBody}>
                  <div className={styles.scrollWrap}>
                    <Scrollbars>
                      {BigQuestionsType.单选 === selectItem?.type && (
                        <RadioQuestions
                          readonly={!!props?.readonly}
                          data={selectItem}
                          onChange={onChagne}
                        />
                      )}
                      {BigQuestionsType.多选 === selectItem?.type && (
                        <CheckBoxQuestions
                          data={selectItem}
                          onChange={onChagne}
                          readonly={!!props?.readonly}
                        />
                      )}
                      {BigQuestionsType.判断 === selectItem?.type && (
                        <RadioQuestions
                          readonly={!!props?.readonly}
                          data={selectItem}
                          onChange={onChagne}
                        />
                      )}
                      {BigQuestionsType.问答 === selectItem?.type && (
                        <InputQuestions
                          readonly={!!props?.readonly}
                          data={selectItem}
                          onChange={onChagne}
                        />
                      )}
                    </Scrollbars>
                  </div>
                </div>
                <div className={styles.leftFooter}>
                  {!props?.readonly && (
                    <Button
                      className={styles.btnItem}
                      type="ghost"
                      onClick={() => {
                        if (selectItem) {
                          onCheckTag(selectItem);
                        }
                      }}
                    >
                      <Space>
                        <WarningOutlined />
                        {selectItem && lodash.get(selectItem, 'flag', false)
                          ? '取消标记'
                          : '标记'}
                      </Space>
                    </Button>
                  )}
                  <Button
                    className={styles.btnItem}
                    ghost
                    type="primary"
                    disabled={questionsArray && cIndex <= 0}
                    onClick={() => {
                      if (questionsArray && cIndex - 1 >= 0) {
                        onSelectItem(questionsArray[cIndex - 1]);
                      }
                    }}
                  >
                    <Space>
                      <LeftOutlined />
                      上一题
                    </Space>
                  </Button>
                  <Button
                    className={styles.btnItem}
                    ghost
                    type="primary"
                    disabled={
                      questionsArray && cIndex >= questionsArray?.length - 1
                    }
                    onClick={() => {
                      if (
                        questionsArray &&
                        cIndex + 1 <= questionsArray.length
                      ) {
                        onSelectItem(questionsArray[cIndex + 1]);
                      }
                    }}
                  >
                    <Space>
                      下一题
                      <RightOutlined />
                    </Space>
                  </Button>
                </div>
              </div>
              <div className={styles.rightWrap}>
                <div className={styles.scrollWrap}>
                  <div className={styles.headerWrap}>答题卡</div>
                  <Scrollbars>
                    {data?.bigQuestions &&
                      data?.bigQuestions?.map((item) => {
                        const { questions = [], type } = item;
                        let allScore = 0;
                        const QuestionsList = questions?.map((item, index) => {
                          const { id, score, respond } = item;
                          allScore += lodash.toNumber(score);
                          const flag = lodash.get(
                            questionsObj,
                            `${id}.flag`,
                            false,
                          );
                          let isOk = !!lodash.get(respond, '[0]');
                          if (type === BigQuestionsType.问答) {
                            if (lodash.get(respond, '[0]', '')!?.replaceAll(/\<[^>]*>/gi,"")!?.replaceAll(/\s+/gi,"")) {
                              isOk = true;
                            } else {
                              isOk = false;
                            }
                          }
                          return (
                            <div
                              key={id}
                              className={classNames(
                                styles.itemSelect,
                                selectItem &&
                                  id === selectItem?.id &&
                                  styles.on,
                                flag && styles.onSign,
                                isOk && styles.ok,
                              )}
                              onClick={() => {
                                onSelectItem(item);
                              }}
                            >
                              {flag ? <MyIcon type="icon-mark" /> : index + 1}
                            </div>
                          );
                        });
                        return (
                          <div className={styles.itemWrap}>
                            <div className={styles.itemHeader}>
                              <strong>{BigQuestionsType[type]}</strong>
                              <span>
                                共{questions?.length}题/{allScore!?.toFixed(2)}
                                分
                              </span>
                            </div>
                            <div className={styles.itemBody}>
                              {QuestionsList}
                            </div>
                          </div>
                        );
                      })}
                  </Scrollbars>
                </div>
                {!props?.readonly && (
                  <div className={styles.footerWrap}>
                    <div className={styles.tagWrap}>
                      <div className={styles.tagItem}>
                        <span
                          className={classNames(styles.tagColor, styles.color1)}
                        ></span>
                        <strong>当前</strong>
                      </div>
                      <div className={styles.tagItem}>
                        <span
                          className={classNames(styles.tagColor, styles.color2)}
                        ></span>
                        <strong>未答</strong>
                      </div>
                      <div className={styles.tagItem}>
                        <span
                          className={classNames(styles.tagColor, styles.color3)}
                        ></span>
                        <strong>已答</strong>
                      </div>
                      <div className={styles.tagItem}>
                        <span
                          className={classNames(styles.tagColor, styles.color4)}
                        ></span>
                        <strong>标记</strong>
                      </div>
                    </div>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {!props?.readonly && (
                        <Button
                          className={styles.btn}
                          type="primary"
                          onClick={() => {
                            props?.onChangePapers(
                              ChangePapersEvent.更新答案,
                              localStore.paperData,
                              data?.id,
                            );
                          }}
                        >
                          保存答卷
                        </Button>
                      )}
                      {props?.onBack && (
                        <Button
                          className={styles.btn}
                          onClick={() => {
                            props?.onBack && props?.onBack();
                          }}
                          type="default"
                        >
                          返回试卷列表(去交卷)
                        </Button>
                      )}
                    </Space>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }}
    </Observer>
  );
}

export default HtmlPaper;
