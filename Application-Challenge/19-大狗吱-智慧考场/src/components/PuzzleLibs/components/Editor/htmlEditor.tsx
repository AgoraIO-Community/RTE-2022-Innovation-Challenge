import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import styles from './index.less';
import md5 from 'md5';
import { useWindowSize } from 'react-use';
import {
  message,
  Button,
  Space,
  Checkbox,
  Input,
  Divider,
  Card,
  Dropdown,
  Menu,
  Modal,
  Form,
  Table,
  Tabs,
  Pagination,
  Affix,
  Rate,
  Badge,
  Spin,
  Select,
  InputNumber,
  Tooltip,
  Empty,
} from 'antd';
import {
  DeleteOutlined,
  DownCircleOutlined,
  EditOutlined,
  PlusOutlined,
  PlusSquareOutlined,
  UpCircleOutlined,
} from '@ant-design/icons';
import {
  number2text,
  requestJSONFile,
  swapArrPlaces,
} from '../../utils';
import {
  BiG_QUESTION_TYPE,
  HTML_DATA_TYPE,
  QuestionsEnum,
  SubItem,
} from '../htmlPaper';
import {
  CheckBoxQuestions,
  CompositeQuestions,
  InputQuestions,
  ON_EDITOR_TYPE,
  RadioQuestions,
  RenderQ,
} from '../htmlPaper/libs';
import lodash from 'lodash';
import Scrollbars from 'react-custom-scrollbars';
import delay from 'delay';
import { useImmer } from 'use-immer';
import EditorQ from './libs';
import { UP_CONFIG } from './libs/upFiles';
import { useDebounceFn } from 'ahooks';

const CheckboxGroup = Checkbox.Group;

export enum PaperSortEnum {
  '试题乱序' = 'questionOrder',
  '选项乱序' = 'optionOrder',
}

export enum AddMinQEnum {
  '手动添加' = 1,
  '从题库选择' = 2,
}

export type PAPER_DATA = {
  id: string;
  name: string;
  status: number;
  score: number;
  /**
   * [1] 有序
   * [2] 无序
   */
  questionOrder: 1 | 2;
  /**
   * [1] 有序
   * [2] 无序
   */
  optionOrder: 1 | 2;
  url?: string;
  answerSheetUrl?: string;
  list: HTML_DATA_TYPE['list'];
};

export interface Props {
  upConfig?: UP_CONFIG;
  initData?: PAPER_DATA;
  onChagne?: (data: HTML_DATA_TYPE) => void;
  /**
   * 获取题库列表
   */
  getTopicList?: QSearchProps['onGetData'];
  onTopicTags?: QSearchProps['onTopicTags'];
}
export default function PaperEditor(props: Props) {
  const [explainID, setExplainID] = useState<string | undefined>();
  const [manualAddQForBID, setManualAddQForBID] = useState<
    string | undefined
  >();
  const [QSearchTypeForBigQID, setQSearchTypeForBigQID] = useState<
    string | undefined
  >();
  const [list, setList] = useState<HTML_DATA_TYPE['list']>();
  const [allNum, setAllNum] = useState<number>(0);
  const [allScore, setAllScore] = useState<number>(0);
  const [title, setTitle] = useState<string>();
  const [sortArray, setSortArray] = useState<PaperSortEnum[]>([]);
  const windowSize = useWindowSize();
  const leftScrollRef = useRef<Scrollbars>();
  const rightScrollRef = useRef<Scrollbars>();

  const [explainForm] = Form.useForm();

  useEffect(() => {
    const demoData = props.initData;
    setTitle(demoData?.name || '');
    setList(demoData?.list || []);
    setSortArray(
      lodash.compact([
        demoData?.optionOrder === 2 ? PaperSortEnum.选项乱序 : undefined,
        demoData?.questionOrder === 2 ? PaperSortEnum.试题乱序 : undefined,
      ]),
    );
  }, [props.initData]);

  useEffect(() => {
    let _allNum = 0;
    let _allScore = 0;
    if (list) {
      list.forEach((item) => {
        item.subs.forEach((subItem) => {
          _allNum += 1;
          _allScore += subItem.score;
        });
      });
      setAllNum(_allNum);
      setAllScore(_allScore);
    }
  }, [list]);

  useEffect(() => {
    const data = handleSave();
    props.onChagne && props.onChagne(data);
  }, [list, sortArray, title]);

  const handlePreview = (): HTML_DATA_TYPE => {
    return handleSave();
  };

  const handleSave = (): HTML_DATA_TYPE => {
    console.log(sortArray);
    const data: HTML_DATA_TYPE = {
      name: title || '',
      score: 0,
      status: 1,
      questionOrder: sortArray.indexOf(PaperSortEnum.试题乱序) > -1 ? 2 : 1,
      optionOrder: sortArray.indexOf(PaperSortEnum.选项乱序) > -1 ? 2 : 1,
      list: list || [],
    };
    return data;
    // return await postPuzzlesPaper({
    //   name: data.name,
    //   tags: ['test'],
    //   sourceData: data,
    // });
  };

  /**
   * 添加大题
   * @param type QuestionsEnum
   */
  const addBigQ = async (type: QuestionsEnum) => {
    const newBigQ = {
      id: md5(`type_${type}_${new Date().toISOString()}`),
      type: type,
      title: QuestionsEnum[type],
      /**
       * 大题说明
       */
      explain: '',
      subs: [],
    };
    setList((_list) => {
      const newList = lodash.cloneDeep(_list);
      newList?.push(newBigQ);
      return newList;
    });
    await delay(300);
    leftScrollRef.current?.scrollToBottom();
    rightScrollRef.current?.scrollToBottom();
  };

  /**
   * 添加小题
   * @param id
   * @param data
   */
  const addBigQMinQ = async (id: string, data: SubItem[]) => {
    setList((_list) => {
      const newList = lodash.cloneDeep(_list) || [];
      const index = newList?.findIndex((item) => item.id === id);
      if (lodash.isNumber(index) && newList[index]) {
        newList[index].subs.push(...data);
      }
      return newList;
    });
  };
  /**
   * 大题描述
   * @param id
   */
  const explainModal = async (id: string) => {
    const item = id && list?.find((i) => i.id === id);
    if (item) {
      setExplainID(id);
      explainForm.setFieldsValue({
        explain: item.explain,
      });
    }
  };

  /**
   * 编辑大题
   * @param bigQID
   * @param changeData
   */
  const onEditorQBig = (
    bigQID: string,
    changeData: {
      type: ON_EDITOR_TYPE['type'] | 'addSubs';
      data: Partial<Omit<BiG_QUESTION_TYPE, 'subs' | 'id' | 'type'>> | SubItem;
    },
  ) => {
    // if ('subs' in changeData) {
    //   throw '修改小题请调用 [ onEditorQMin ]';
    // }
    setList((_list) => {
      let newList = lodash.cloneDeep(_list);
      const index = newList?.findIndex((i) => i.id === bigQID);
      if (newList && lodash.isNumber(index)) {
        if (changeData.type === 'delete') {
          newList?.splice(index, 1);
        }
        if (changeData.type === 'addSubs') {
          const _subs = lodash.get(newList, `[${index}].subs`, []);
          _subs.push(changeData.data);
          lodash.set(newList, `[${index}].subs`, _subs);
        }
        if (changeData.type === 'change') {
          lodash.set(newList, `[${index}]`, {
            ...lodash.get(newList, `[${index}]`, {}),
            ...changeData?.data,
          });
        }
        if (changeData.type === 'up') {
          if (lodash.isNumber(index) && index - 1 >= 0) {
            swapArrPlaces(newList, index, index - 1);
          }
        }
        if (changeData.type === 'down') {
          if (
            lodash.isNumber(index) &&
            newList?.length &&
            index + 1 < newList?.length
          ) {
            swapArrPlaces(newList, index, index + 1);
          }
        }
      }
      return newList;
    });
  };

  /**
   * 编辑小题
   * @param bigQID
   * @param minQID
   * @param changeData
   */
  const { run: onEditorQMin } = useDebounceFn(
    async (
      bigQID: string,
      minQID: string,
      changeData: {
        type: ON_EDITOR_TYPE['type'];
        data: Partial<Omit<SubItem, 'id'>>;
      },
    ) => {
      const subs = changeData?.data?.subs || [];
      setList((_list) => {
        const newList = lodash.cloneDeep(_list);
        const index = newList?.findIndex((i) => i.id === bigQID);
        if (newList && lodash.isNumber(index)) {
          const subIndex = lodash
            .get(newList, `[${index}].subs`, [])
            ?.findIndex((i: SubItem) => i.id === minQID);
          if (changeData.type === 'delete') {
            newList[index]?.subs?.splice(subIndex, 1);
          }
          if (changeData.type === 'change') {
            try {
              const item = lodash.get(
                newList,
                `[${index}].subs[${subIndex}]`,
                {},
              );
              delete item.subs;
              lodash.set(newList, `[${index}].subs[${subIndex}]`, {
                ...item,
                // ...lodash.get(newList, `[${index}].subs[${subIndex}]`, {}),
                // ...changeData?.data,
              });
            } catch (error) {}
            return newList;
          }
          if (changeData.type === 'up') {
            if (lodash.isNumber(subIndex) && subIndex - 1 >= 0) {
              swapArrPlaces(newList[index]?.subs, subIndex, subIndex - 1);
            }
          }
          if (changeData.type === 'down') {
            if (
              lodash.isNumber(subIndex) &&
              newList[index]?.subs?.length &&
              subIndex + 1 < newList[index]?.subs?.length
            ) {
              swapArrPlaces(newList[index]?.subs, subIndex, subIndex + 1);
            }
          }
        }
        return newList;
      });
      delay(300);
      /**
       * fix bug 有时间解决
       */
      setList((_list) => {
        const newList = lodash.cloneDeep(_list);
        const index = newList?.findIndex((i) => i.id === bigQID);
        if (newList && lodash.isNumber(index)) {
          const subIndex = lodash
            .get(newList, `[${index}].subs`, [])
            ?.findIndex((i: SubItem) => i.id === minQID);
          if (changeData.type === 'change') {
            try {
              const item = lodash.get(
                newList,
                `[${index}].subs[${subIndex}]`,
                {},
              );
              delete item.subs;
              lodash.set(newList, `[${index}].subs[${subIndex}]`, {
                ...item,
                ...changeData?.data,
              });
            } catch (error) {}
            return newList;
          }
        }
        return newList;
      });
    },
    { wait: 100 },
  );

  return (
    <div className={styles.page}>
      <div className={styles.body}>
        <div className={styles.leftWrap}>
          <div className={styles.bodyHeaderWrap}>
            <div>
              <Input
                maxLength={20}
                className={styles.titleInput}
                placeholder="试卷名称"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
              />
            </div>
            <div>
              <CheckboxGroup
                value={sortArray}
                onChange={(e: any) => {
                  console.log();
                  setSortArray([...e]);
                }}
              >
                <Checkbox value={PaperSortEnum.试题乱序}>试题乱序</Checkbox>
                <Checkbox value={PaperSortEnum.选项乱序}>选项乱序</Checkbox>
              </CheckboxGroup>
            </div>
          </div>
          <div className={styles.leftBody}>
            <Scrollbars ref={leftScrollRef as any}>
              <div className={styles.scroolBody}>
                {list?.length ? (
                  list?.map((item, index) => {
                    const subs = item?.subs?.map((selectQuestion) => {
                      const answerDataObj = {};
                      const showTip = true;
                      const readonly = true;
                      const onChagne = () => {};
                      return (
                        <div
                          key={selectQuestion.id}
                          className={styles.subsItemWrap}
                        >
                          <RenderQ
                            type={selectQuestion.type}
                            data={selectQuestion}
                            readonly={readonly}
                            showTip={showTip}
                            isEditor
                            onEditor={(data) => {
                              if (
                                data?.data?.media &&
                                data?.data?.media.length
                              ) {
                                lodash.set(
                                  data,
                                  'data.media',
                                  data?.data?.media.map((item) => {
                                    return {
                                      ...item,
                                      playCount: data?.data?.playCount || 0,
                                    };
                                  }),
                                );
                              }
                              onEditorQMin(item.id, selectQuestion.id, data);
                            }}
                            upConfig={props.upConfig}
                            onGetMediaPlayNum={async () => {
                              return 1;
                            }}
                            onMediaPlay={async () => {
                              return true;
                            }}
                          />
                        </div>
                      );
                    });
                    return (
                      <Card
                        key={item?.id}
                        className={styles.bigQuestionItemCard}
                        title={
                          <h3 className={styles.bigQTitle}>
                            {number2text(index + 1)}、
                            <div className={styles.iptWrap}>
                              <Input
                                maxLength={10}
                                className={styles.bigQNameInput}
                                placeholder="大题名称"
                                value={item?.title}
                                onChange={(e) => {
                                  onEditorQBig(item?.id, {
                                    type: 'change',
                                    data: {
                                      title: e.target.value,
                                    },
                                  });
                                }}
                              />
                            </div>
                            {item.explain && (
                              <Tooltip title={`${item?.explain}`}>
                                <div className={styles.explainWrap}>
                                  <span>{`(${item?.explain})`}</span>
                                </div>
                              </Tooltip>
                            )}
                          </h3>
                        }
                        extra={
                          <div>
                            <Space>
                              {/* <a className={styles.toolsItem}>
                              <EditOutlined /> 批量修改分值
                            </a> */}
                              <Dropdown
                                trigger={['click']}
                                overlay={
                                  <Menu onClick={({ key }) => {}}>
                                    <Menu.Item key={`${AddMinQEnum.手动添加}`}>
                                      <a
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setManualAddQForBID(item.id);
                                        }}
                                      >
                                        手动添加
                                      </a>
                                    </Menu.Item>
                                    {props.getTopicList && (
                                      <Menu.Item
                                        key={`${AddMinQEnum.从题库选择}`}
                                      >
                                        <a
                                          onClick={(e) => {
                                            e.preventDefault();
                                            setQSearchTypeForBigQID(item?.id);
                                          }}
                                        >
                                          从题库选择
                                        </a>
                                      </Menu.Item>
                                    )}
                                  </Menu>
                                }
                                placement="bottomCenter"
                                arrow
                              >
                                <a className={styles.toolsItem}>
                                  <PlusSquareOutlined /> 添加题目
                                </a>
                              </Dropdown>
                            </Space>
                          </div>
                        }
                      >
                        {subs}
                      </Card>
                    );
                  })
                ) : (
                  <Empty />
                )}
              </div>
            </Scrollbars>
          </div>
        </div>
        <div className={styles.rightWrap}>
          <div className={styles.bodyHeaderWrap}>
            <div>
              <h3 className={styles.title}>大题列表</h3>
            </div>
          </div>
          <div className={styles.rightBody}>
            <div className={styles.top}>
              <div className={styles.scoreWrap}>
                <strong
                  style={{
                    textAlign: 'left',
                  }}
                >
                  总题数：<a>{lodash.toInteger(allNum || 0)}</a> 题
                </strong>
                <Divider style={{ margin: 0 }} type="vertical" />
                <strong
                  style={{
                    textAlign: 'right',
                  }}
                >
                  总分数：<a>{lodash.toNumber(allScore || 0).toFixed(2)}</a> 分
                </strong>
              </div>
              <Dropdown
                overlay={
                  <Menu
                    onClick={({ key }) => {
                      // @ts-ignore
                      addBigQ(QuestionsEnum[key]);
                    }}
                  >
                    {Object.keys(QuestionsEnum)
                      .filter((i) => !/^\d/g.test(i))
                      .filter((i) => {
                        return (
                          i !== '录音题' && i !== '录像题' && i !== '复合题'
                        );
                      })
                      .map((item) => {
                        return (
                          <Menu.Item key={`${item}`}>
                            <a
                              onClick={(e) => {
                                e.preventDefault();
                              }}
                            >
                              {item}
                            </a>
                          </Menu.Item>
                        );
                      })}
                  </Menu>
                }
                placement="bottomCenter"
                arrow
              >
                <Button className={styles.addBtn} type="primary">
                  <PlusOutlined /> 添加大题
                </Button>
              </Dropdown>
            </div>
            <div className={styles.bigQuestionWrap}>
              <Scrollbars ref={rightScrollRef as any}>
                <div className={styles.scroolBody}>
                  {list?.map((item, index) => {
                    const id = item?.id;
                    const length = lodash.get(item, 'subs', [])?.length;
                    let score = 0;
                    lodash.get(item, 'subs', [])?.forEach((element) => {
                      score += lodash.toNumber(lodash.get(element, 'score', 0));
                    });
                    return (
                      <div
                        key={`bigQuestionWrap_${id}`}
                        className={styles.bigQuestionItemWrap}
                      >
                        <div className={styles.bigQuestionItemHeader}>
                          <h4>
                            {number2text(index + 1)}、{item.title}
                          </h4>
                          <a
                            className={styles.toolsBtn}
                            onClick={(e) => {
                              e.preventDefault();
                              explainModal(id);
                            }}
                          >
                            {item.explain ? '修改' : '添加'}大题描述
                          </a>
                        </div>
                        <div className={styles.bigQuestionItemTools}>
                          <strong>
                            共<a>{length || 0}</a>题 / 共
                            <a>{score?.toFixed(2)}</a>分
                          </strong>
                          <Space>
                            <a
                              className={classNames(
                                styles.toolsBtn,
                                index <= 0 && styles.disable,
                              )}
                              onClick={(e) => {
                                e.preventDefault();
                                onEditorQBig(id, {
                                  type: 'up',
                                  data: {},
                                });
                              }}
                            >
                              <UpCircleOutlined />
                            </a>
                            <a
                              className={classNames(
                                styles.toolsBtn,
                                index === list.length - 1 && styles.disable,
                              )}
                              onClick={(e) => {
                                e.preventDefault();
                                onEditorQBig(id, {
                                  type: 'down',
                                  data: {},
                                });
                              }}
                            >
                              <DownCircleOutlined />
                            </a>
                            <a
                              className={styles.toolsBtn}
                              onClick={(e) => {
                                e.preventDefault();
                                Modal.confirm({
                                  title: '确定是否删除该大题？',
                                  content: '确定后会将该大题内所有题目删除',
                                  onOk: () => {
                                    // 删除
                                    onEditorQBig(id, {
                                      type: 'delete',
                                      data: {},
                                    });
                                  },
                                });
                              }}
                            >
                              <DeleteOutlined />
                            </a>
                          </Space>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Scrollbars>
            </div>
          </div>
        </div>
      </div>
      <Modal
        title="添加大题描述"
        closable
        width={560}
        visible={!!explainID}
        onCancel={() => {
          setExplainID(undefined);
        }}
        destroyOnClose
        cancelText="关闭"
        okText="保存"
        afterClose={() => {
          explainForm.resetFields();
        }}
        onOk={() => {
          const values = explainForm.getFieldsValue();
          if (explainID) {
            onEditorQBig(explainID, {
              type: 'change',
              data: {
                explain: values.explain,
              },
            });
            setExplainID(undefined);
          } else {
            message.error('未查到大题id');
          }
        }}
      >
        <div className={styles.explainModalWrap}>
          <div className={styles.tip}>请输入大题描述</div>
          <div>
            <Form form={explainForm}>
              <Form.Item name="explain" rules={[{ required: false }]}>
                <Input.TextArea
                  className={styles.textAreaWrap}
                  placeholder="请输入"
                  rows={4}
                  showCount
                  maxLength={999}
                />
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>
      <Modal
        title="添加题目"
        closable
        width={560}
        centered
        visible={!!QSearchTypeForBigQID}
        wrapClassName={styles.addQMinModalWrap}
        className={styles.addQMinModalContent}
        onCancel={() => {
          setQSearchTypeForBigQID(undefined);
        }}
        afterClose={() => {
          setQSearchTypeForBigQID(undefined);
        }}
        destroyOnClose
        cancelText="关闭"
        okText="确定"
        footer={false}
      >
        <div className={styles.body}>
          {props.getTopicList && (
            <QSearch
              onGetData={props.getTopicList}
              onTopicTags={props.onTopicTags}
              type={
                QSearchTypeForBigQID
                  ? list?.find((i) => i.id === QSearchTypeForBigQID)?.type
                  : undefined
              }
              onOk={(data) => {
                if (QSearchTypeForBigQID) {
                  addBigQMinQ(QSearchTypeForBigQID, data || []);
                }
                setQSearchTypeForBigQID(undefined);
              }}
              onCancel={() => {
                setQSearchTypeForBigQID(undefined);
              }}
            />
          )}
        </div>
      </Modal>
      <Modal
        title="手动添加题目"
        closable
        width={560}
        centered
        visible={!!manualAddQForBID}
        wrapClassName={styles.addQMinModalWrap}
        className={styles.addQMinModalContent}
        onCancel={() => {
          setManualAddQForBID(undefined);
        }}
        afterClose={() => {
          setManualAddQForBID(undefined);
        }}
        destroyOnClose
        cancelText="关闭"
        okText="确定"
        footer={false}
      >
        <div className={styles.body}>
          <EditorQ
            upConfig={props.upConfig}
            bigQType={
              manualAddQForBID
                ? lodash.find(list, (i) => i.id === manualAddQForBID)?.type
                : undefined
            }
            onOk={(data) => {
              setManualAddQForBID(undefined);
              if (manualAddQForBID) {
                onEditorQBig(manualAddQForBID, {
                  type: 'addSubs',
                  data: data,
                });
              }
            }}
            onCancel={() => {
              setManualAddQForBID(undefined);
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

interface QSearchProps {
  type?: QuestionsEnum;
  onOk?: (data: SubItem[] | undefined) => void;
  onCancel?: () => void;
  onGetData: (
    page: number,
    pageSize: number,
    obj?: any,
  ) => Promise<QSearchData>;
  onTopicTags?: (
    page: number,
    pageSize: number,
    obj?: any,
  ) => Promise<QSearchData>;
}
export type QSearchDataItem = {
  id: string;
  name: string;
  sourceData?: SubItem;
  sourceUrl?: string;
};
export type QSearchData = {
  page: number;
  list: QSearchDataItem[];
  total: number;
  pageSize: number;
};
function QSearch(props: QSearchProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useImmer<QSearchData>({
    page: 1,
    list: [],
    total: 0,
    pageSize: 10,
  });
  const [tagsList, setTagsList] = useImmer<QSearchData>({
    page: 1,
    list: [],
    total: 0,
    pageSize: 10,
  });
  const [selectListObj, setSelectListObj] = useImmer<{
    [key: number]: QSearchDataItem[];
  }>({});
  const [selectList, setSelectList] = useImmer<QSearchDataItem[]>([]);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    onTopicList();
  }, []);

  useEffect(() => {
    const _selectList = [];
    for (const key in selectListObj) {
      const element = selectListObj[key];
      _selectList.push(...element);
    }
    setSelectList(_selectList);
  }, [selectListObj]);

  const columns = [
    {
      title: '题库',
      dataIndex: 'tags',
      key: 'tags',
      render: (v) => {
        return <div>{v.join(' , ')}</div>;
      },
    },
    {
      title: '题型',
      dataIndex: 'type',
      key: 'type',
      render: (v: QuestionsEnum) => {
        return QuestionsEnum[`${v}`];
      },
    },
    {
      title: '题目名称',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => {
        return name || record.description;
      },
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (v) => {
        return <Rate disabled defaultValue={v} />;
      },
    },
    {
      title: '分数',
      dataIndex: 'score',
      key: 'score',
    },
  ];

  const rowSelection = {
    onChange: (
      selectedRowKeys: React.Key[],
      selectedRows: QSearchDataItem[],
    ) => {
      setSelectListObj((_selectListObj) => {
        const _pageSelectList: any[] = [];
        if (lodash.isArray(selectedRows) && !lodash.isEmpty(selectedRows)) {
          selectedRows.forEach((item) => {
            _pageSelectList.push(item);
          });
        }
        _selectListObj[list.page] = _pageSelectList;
        return _selectListObj;
      });
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        'selectedRows: ',
        selectedRows,
      );
    },
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      const okList: SubItem[] = [];
      const _okList = lodash.uniqBy(selectList, 'id');
      for (let index = 0; index < _okList.length; index++) {
        const item: QSearchDataItem = _okList[index] as QSearchDataItem;
        /**
         * 生成唯一id
         */
        const keyId = md5(
          `${JSON.stringify(item)}_${new Date().toISOString()}_${index}`,
        );
        if (lodash.isEmpty(item.sourceData) && item.sourceUrl) {
          const data = await requestJSONFile({ url: item.sourceUrl });
          okList.push({
            ...data,
            id: keyId,
          });
        }
        if (!lodash.isEmpty(item.sourceData) && item.sourceData) {
          okList.push({
            ...item.sourceData,
            id: keyId,
          });
        }
      }
      props?.onOk && props.onOk(okList);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onFocus = () => {};

  const onBlur = () => {};

  const { run: onTopicList } = useDebounceFn(
    async () => {
      if (props.onGetData && typeof props.onGetData === 'function') {
        try {
          setLoading(true);
          if (props.onGetData) {
            const fromdata = form.getFieldsValue();
            const data = await props.onGetData(
              fromdata.page || 1,
              // fromdata.pageSize || 10,
              10,
              {
                type: props.type || undefined,
                name: fromdata.name || undefined,
                bank_id: fromdata.bank_id || undefined,
                difficulty: fromdata.difficulty || undefined,
              },
            );
            setList({
              page: data?.page || 1,
              total: data?.total || 0,
              // pageSize: data?.pageSize || 10,
              pageSize: 10,
              list: data?.list || [],
            });
          }
        } catch (err) {
        } finally {
          setLoading(false);
        }
      }
    },
    {
      wait: 500,
    },
  );

  const { run: onTopicTags } = useDebounceFn(
    async (name) => {
      debugger;
      if (props.onTopicTags && typeof props.onTopicTags === 'function') {
        const data = await props.onTopicTags(1, 1000, {
          name: name,
        });
        setTagsList({
          page: data.page,
          list: data.list,
          total: data.total,
          pageSize: data.pageSize,
        });
      }
    },
    {
      wait: 500,
    },
  );

  return (
    <Form
      form={form}
      className={styles.QSearchWrap}
      onFinish={() => {
        form.setFieldsValue({
          page: 1,
          pageSize: 10,
        });
        onTopicList();
      }}
      onReset={() => {
        form.setFieldsValue({
          page: 1,
          pageSize: 10,
        });
        onTopicList();
      }}
    >
      <div className={styles.searchWrap}>
        <Space size={24}>
          <div
            style={{
              width: 0,
              height: 0,
              overflow: 'hidden',
              position: 'absolute',
              zIndex: -100,
            }}
          >
            <Form.Item name="page">
              <InputNumber placeholder="请输入第几页" />
            </Form.Item>
            <Form.Item name="pageSize">
              <InputNumber placeholder="请输入数量" />
            </Form.Item>
          </div>
          <Form.Item name="name">
            <Input placeholder="请输入题目名称" />
          </Form.Item>
          {props.onTopicTags && (
            <Form.Item name="bank_id">
              <Select
                showSearch
                style={{ width: 200 }}
                placeholder={'请选择题库'}
                defaultActiveFirstOption={false}
                showArrow={true}
                filterOption={false}
                onSearch={onTopicTags}
                onFocus={onTopicTags}
                notFoundContent={null}
              >
                {tagsList?.list?.map((d) => (
                  <Select.Option value={d?.bank_id} key={d?.id}>
                    {d?.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Form.Item name="difficulty">
            <Select placeholder="请选择难度" style={{ width: 200 }}>
              <Select.Option value="1">1星</Select.Option>
              <Select.Option value="2">2星</Select.Option>
              <Select.Option value="3">3星</Select.Option>
              <Select.Option value="4">4星</Select.Option>
              <Select.Option value="5">5星</Select.Option>
              <Select.Option value="-1">全部难度</Select.Option>
            </Select>
          </Form.Item>
          <Space>
            <Form.Item>
              <Button htmlType="reset">重置</Button>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                搜索
              </Button>
            </Form.Item>
          </Space>
        </Space>
      </div>
      <div ref={setContainer} className={styles.containerbody}>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="题目列表" key="1">
            <Table
              loading={loading}
              rowKey={(i) => i.id}
              rowSelection={{
                type: 'checkbox',
                ...rowSelection,
              }}
              expandable={{
                expandedRowRender: (
                  record: QSearchDataItem,
                  index,
                  indent,
                  expanded,
                ) => {
                  if (!expanded) {
                    return <div />;
                  }
                  return (
                    <div>
                      {(record.sourceData || record.sourceUrl) && (
                        <ExpandedRowRenderQ
                          data={record.sourceData || record.sourceUrl}
                        />
                      )}
                    </div>
                  );
                },
              }}
              pagination={false}
              columns={columns}
              dataSource={lodash.get(list, 'list', [])}
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={<Badge count={selectList?.length}>已选题目</Badge>}
            key="2"
          >
            <Table
              rowKey={(i) => i.id}
              expandable={{
                expandedRowRender: (
                  record: QSearchDataItem,
                  index,
                  indent,
                  expanded,
                ) => {
                  if (!expanded) {
                    return <div />;
                  }
                  if (record.sourceData) {
                    return <ExpandedRowRenderQ data={record.sourceData} />;
                  }
                  if (record.sourceUrl) {
                    return <ExpandedRowRenderQ data={record.sourceUrl} />;
                  }
                  return (
                    <div>
                      <ExpandedRowRenderQ data={record} />
                    </div>
                  );
                },
              }}
              pagination={false}
              columns={columns}
              dataSource={selectList || []}
            />
          </Tabs.TabPane>
        </Tabs>
      </div>
      <div className={styles.paginationWrap}>
        <Pagination
          total={list?.total || 0}
          pageSize={list?.pageSize || 10}
          current={list?.page || 1}
          onChange={(page, pageSize) => {
            form.setFieldsValue({
              page,
              pageSize,
            });
            onTopicList();
          }}
        />
      </div>
      <div className={styles.footer}>
        <Space>
          <Button
            onClick={() => {
              props?.onCancel && props.onCancel();
            }}
          >
            取消
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() => {
              onSubmit();
            }}
          >
            确定
          </Button>
        </Space>
      </div>
    </Form>
  );
}

export function ExpandedRowRenderQ(props: { data?: SubItem | string }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [sourceData, setSourceData] = useState<SubItem>();
  const getJson = async (jsonURL: string) => {
    try {
      setLoading(true);
      const data = await requestJSONFile({ url: jsonURL });
      setSourceData(data);
      return data;
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (lodash.isString(props.data)) {
      getJson(props.data);
    } else {
      setSourceData(props.data);
    }
  }, []);
  return (
    <div>
      <Spin spinning={loading}>
        {sourceData && !lodash.isEmpty(sourceData) && (
          <RenderQ
            type={sourceData.type}
            data={sourceData}
            readonly
            showTip
            onGetMediaPlayNum={async () => {
              return 1;
            }}
            onMediaPlay={async () => {
              return true;
            }}
          />
        )}
      </Spin>
    </div>
  );
}
