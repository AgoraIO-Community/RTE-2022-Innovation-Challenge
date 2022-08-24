import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.less';
import { Scrollbars } from 'react-custom-scrollbars';
import { Button, Card, Modal, Radio, Space, Table, Tooltip } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import classNames from 'classnames';
import lodash from 'lodash';
import { useImmer } from 'use-immer';

import { RenderQ } from './libs';
import MyIcon from '../../MyIconfont';
import { OnChangePapers, PAPER_DATA } from '../..';
import { number2text } from '../../utils';
import { useDebounce, useInterval } from 'react-use';

export type MediaItem = {
  id?: string;
  name: string;
  url: string;
  contentType: string;
  /**
   * 播放次数
   */
  playCount: number;
  /**
   * 已播次数
   */
  hasPlayCount?: number;
  status?: 'error' | 'success' | 'done' | 'uploading' | 'removed';
};
export type SubItem = {
  id: string;
  type: QuestionsEnum;
  /**
   * 题库id
   */
  databaseId?: string;
  /**
   * 题库名称
   */
  databaseName?: string;
  /**
   * 难度 1 - 5 星
   */
  difficulty: 1 | 2 | 3 | 4 | 5 | number;
  description: string;
  score: number | undefined;
  scoreRule?: {
    /**
     * 多选题计分规则
     *  [1] 多选少选均不得分
     *  [2] 少选得分
     *  [3] 选项单独计分
     */
    type: 1 | 2 | 3;
    score: number;
  };
  media?: MediaItem[];
  options?: {
    id: string;
    description: string;
    isRight: boolean;
    score: number;
  }[];
  /**
   * 录制时长 （秒）
   */
  recordDuration?: number;
  /**
   * 录制次数 -1 代表不限次数
   */
  recordCount?: number;
  /**
   * 播放次数 -1 代表不限次数
   */
  playCount?: number;
  /**
   * [1] 必答
   * [2] 选答
   */
  answerType?: 1 | 2;
  subs?: SubItem[];
  /**
   * 参考答案
   */
  referenceVersion?: string[];
  /**
   * 用户答案
   */
  userValue?: string[];
  /**
   * 标记
   */
  sign?: boolean;
};

export type BiG_QUESTION_TYPE = {
  id: string;
  type: QuestionsEnum;
  title: string;
  /**
   * 大题说明
   */
  explain: string;
  subs: SubItem[];
};

export type HTML_DATA_TYPE = {
  id?: string;
  name: string;
  startTime?: number;
  endTime?: number;
  /**
   * 试卷状态
   * [1] 发布
   * [2] 未发布
   */
  status: 1 | 2;
  /**
   * 总分
   */
  score: number;
  /**
   * 试题乱序
   * [1] 未乱
   * [2] 乱
   */
  questionOrder: 1 | 2;
  /**
   * 选项乱序
   * [1] 未乱
   * [2] 乱
   */
  optionOrder: 1 | 2;
  list: BiG_QUESTION_TYPE[];
};

/**
 * 答案
 */
export type AnswerDataItem = {
  questionsId: string;
  value: string[];
};

export interface HtmlPaperProps {
  onBack?: () => void;
  data?: PAPER_DATA;
  answerData: AnswerDataItem[];
  onChange?: OnChangePapers;
  readonly?: boolean;
  showTip?: boolean;
  onGetMediaPlayNum?: (qId: string, mediaItem: MediaItem) => Promise<number>;
  onMediaPlay?: (
    bigId: string,
    qId: string[],
    mediaItem: MediaItem,
  ) => Promise<boolean>;
  timingConfig?: {
    time: number;
    onChange: (value: any, paperInfo: any) => void;
  };
}

enum Status {
  '标记' = 1,
  '已答' = 2,
  '未答' = 3,
}

export enum QuestionsEnum {
  '单选题' = 1,
  '多选题' = 2,
  '判断题' = 3,
  '问答题' = 4,
  // '不定项选择题' = 5,
  // '填空题' = 6,
  '录音题' = 7,
  '录像题' = 8,
  '听力题' = 9,
  '复合题' = 10,
}

export type AnswerDataObjType = {
  [questionsId: string]: {
    flag: boolean;
    value: string[] | { [questionsId: string]: string[] };
  };
};

function HtmlPaper(props: HtmlPaperProps) {
  const [data, setData] = useState<PAPER_DATA>();
  const [answerDataObj, setAnswerDataObj] = useImmer<
    AnswerDataObjType | undefined
  >(undefined);
  const [questionsObj, setQuestionsObj] = useState<any>();
  const [questionsArray, setQuestionsArray] = useState<any[]>();
  const [selectItem, setSelectItem] = useState<string>();

  const [selectTip, setSelectTip] = useState('');

  useEffect(() => {
    if (props.initValue) {
      setAnswerDataObj({
        ...props.initValue,
      });
    }
  }, []);

  useEffect(() => {
    const _data = lodash.cloneDeep(props?.data);

    let _questionsArray = [];
    let _questionsObj = {};
    let _questionsCheckObj = {};

    lodash.get(_data, 'list', [])?.forEach((item: any) => {
      lodash.get(item, 'subs', [])?.forEach((subItem: any) => {
        _questionsArray.push(subItem);
        _questionsObj[subItem.id] = {
          ...subItem,
          __bigID__: item.id,
        };
        _questionsCheckObj[subItem.id] = lodash.get(subItem, 'flag', false);
      });
    });

    if (!selectItem) {
      const _selectItemId = lodash.get(_data, `list[0].subs[0].id`);
      setSelectItem(_selectItemId);
    }
    setData(_data);
    setQuestionsObj(_questionsObj);
    setQuestionsArray(_questionsArray);
    return () => {};
  }, [props?.data]);

  useInterval(() => {
    const _data = lodash.cloneDeep(props?.data);
    const _answerDataObj = lodash.cloneDeep(answerDataObj);
    if (!lodash.isEmpty(_answerDataObj)) {
      if (typeof props?.timingConfig?.onChange === 'function') {
        props?.timingConfig?.onChange(_answerDataObj, _data);
      }
    }
  }, props?.timingConfig?.time || 1000);

  const onCheckTag = (questionsId: string) => {
    setAnswerDataObj((_answerDataObj: any) => {
      const isCheck = lodash.get(_answerDataObj, `${questionsId}`)?.flag;
      const newAnswerDataObj = {
        ..._answerDataObj,
        [questionsId]: {
          ...lodash.get(_answerDataObj, `${questionsId}`, {}),
          flag: !isCheck,
        },
      };
      return newAnswerDataObj;
    });
  };

  const onSetSelectTip = (item: string) => {
    setSelectTip(item);
  };

  const onSelectItem = (id: string) => {
    if (selectTip) {
      Modal.confirm({
        title: '提示',
        content: `${selectTip}`,
        onCancel: () => {},
        onOk: () => {
          setSelectTip('');
          setSelectItem(id);
        },
      });
    } else {
      setSelectItem(id);
    }
  };
  const onChagne = (
    questionsId: string,
    value: string[] | AnswerDataObjType,
  ) => {
    setAnswerDataObj((_answerDataObj: any) => {
      const newAnswerDataObj = {
        ..._answerDataObj,
        [questionsId]: {
          ...lodash.get(_answerDataObj, `${questionsId}`, {}),
          value,
        },
      };
      return newAnswerDataObj;
    });
  };

  useDebounce(
    () => {
      if (props.onChange && typeof props.onChange === 'function') {
        props.onChange(answerDataObj, selectItem);
      }
      if (
        questionsArray &&
        questionsArray.length &&
        !questionsArray?.find((i) => i?.id === selectItem)
      ) {
        setSelectItem(questionsArray[0].id);
      }
      console.log('answerDataObj: ', answerDataObj);
    },
    600,
    [questionsArray, answerDataObj, selectItem],
  );

  const cIndex = questionsArray?.findIndex((i) => i?.id === selectItem) || 0;
  const selectQuestion = lodash.get(questionsObj, `${selectItem}`);
  const list = lodash.get(props.data, 'list', []);
  const selectFlag =
    selectItem && !!lodash.get(answerDataObj, `${selectItem}`)?.flag;
  console.log(
    'RenderQ: ',
    answerDataObj,
    selectQuestion?.id,
    lodash.get(answerDataObj, `${selectQuestion?.id}.value`),
  );
  const bigQIndex = list.findIndex((i) => i.id === selectQuestion?.__bigID__);
  const bigQExplain = lodash.get(list, `[${bigQIndex}].explain`);
  const bigQTitle = lodash.get(list, `[${bigQIndex}].title`);
  return (
    <div className={styles.testWrap}>
      <div className={styles.testWrap}>
        <div className={styles.leftWrap}>
          <div className={styles.leftBody}>
            <div className={styles.bigHeaderWrap}>
              <h2>
                {number2text(bigQIndex + 1)}、{bigQTitle}
              </h2>
              {bigQExplain && (
                <Tooltip title={`${bigQExplain}`}>
                  <div className={styles.explainWrap}>({bigQExplain})</div>
                </Tooltip>
              )}
            </div>
            <div className={styles.scrollWrap}>
              <Scrollbars>
                {selectQuestion?.type && (
                  <RenderQ
                    label={`${cIndex + 1}、`}
                    type={selectQuestion.type}
                    showTip={props?.showTip}
                    readonly={!!props?.readonly}
                    data={selectQuestion}
                    value={
                      lodash.get(
                        answerDataObj,
                        `${selectQuestion?.id}.value`,
                      ) as any
                    }
                    onChange={onChagne}
                    onSetSelectTip={onSetSelectTip}
                    onGetMediaPlayNum={async (data) => {
                      let num = 1;
                      if (props.onGetMediaPlayNum) {
                        num = await props.onGetMediaPlayNum(
                          selectQuestion.id,
                          data,
                        );
                      }
                      return num;
                    }}
                    onMediaPlay={async (data) => {
                      if (props.onMediaPlay) {
                        selectQuestion?.__bigID__;
                        return await props.onMediaPlay(
                          `${selectQuestion?.__bigID__}`,
                          [selectQuestion.id],
                          data,
                        );
                      }
                      return true;
                    }}
                  />
                )}
              </Scrollbars>
            </div>
          </div>
          <div className={styles.leftFooter}>
            {!props?.readonly && (
              <Button
                className={styles.btnItem}
                type={selectFlag ? 'primary' : 'ghost'}
                onClick={() => {
                  if (selectItem) {
                    onCheckTag(selectItem);
                  }
                }}
              >
                <Space>
                  <MyIcon type="icon-mark" />
                  {selectFlag ? '取消标记' : '标记'}
                </Space>
              </Button>
            )}
            <Button
              className={styles.btnItem}
              ghost
              type="primary"
              disabled={cIndex <= 0}
              onClick={() => {
                if (cIndex - 1 >= 0) {
                  onSelectItem(
                    lodash.get(questionsArray, `[${cIndex - 1}].id`, ''),
                  );
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
              disabled={questionsArray && cIndex >= questionsArray?.length - 1}
              onClick={() => {
                if (questionsArray && cIndex + 1 <= questionsArray.length) {
                  onSelectItem(
                    lodash.get(questionsArray, `[${cIndex + 1}].id`, ''),
                  );
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
            <div className={styles.headerWrap}>题目列表</div>
            <Scrollbars>
              {list?.map((item: any, index: number) => {
                const { questions = [], type } = item;
                let allScore = 0;
                const QuestionsList = lodash
                  .get(item, 'subs', [])
                  ?.map((subItem: SubItem, index: number) => {
                    const { id, score, type } = subItem;
                    allScore += lodash.toNumber(score);
                    const flag = !!lodash.get(answerDataObj, `${id}`)?.flag;
                    let isOk = !lodash.isEmpty(
                      lodash.get(answerDataObj, `[${id}]`)?.value,
                    );
                    if (
                      type === QuestionsEnum.听力题 ||
                      type === QuestionsEnum.复合题
                    ) {
                      isOk = true;
                      subItem?.subs?.forEach((item: SubItem) => {
                        const itemValue = lodash.get(
                          answerDataObj,
                          `${subItem.id}.value.${item.id}.value`,
                          [],
                        );
                        if (lodash.isEmpty(itemValue)) {
                          isOk = false;
                        }
                      });
                    }
                    return (
                      <div
                        key={id}
                        className={classNames(
                          styles.itemSelect,
                          selectItem && id === selectItem && styles.on,
                          flag && styles.onSign,
                          isOk && styles.ok,
                        )}
                        onClick={() => {
                          onSelectItem(id);
                        }}
                      >
                        {flag ? <MyIcon type="icon-mark" /> : index + 1}
                      </div>
                    );
                  });
                return (
                  <div className={styles.itemWrap}>
                    <div className={styles.itemHeader}>
                      <strong>
                        {number2text(index + 1)}、{QuestionsEnum[type]}
                      </strong>
                      <span>
                        共{QuestionsList?.length}题/
                        {lodash.floor(allScore, 2).toFixed(2)}分
                      </span>
                    </div>
                    <div className={styles.itemBody}>{QuestionsList}</div>
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
                      console.log('pageInfo: ', props.data);
                      console.log('answerDataObj: ', answerDataObj);
                      props?.onChange(answerDataObj);
                    }}
                  >
                    保存答卷
                  </Button>
                )}
                {props?.onBack && (
                  <Button
                    className={styles.btn}
                    onClick={async () => {
                      await props?.onChange(answerDataObj);
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
}

export default HtmlPaper;
